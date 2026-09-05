'use client';

import { useCallback, useRef, useState } from 'react';
import { getAccessToken, refreshAccessToken } from '@/app/_utils/auth';
import { filenameFrom, saveBlob } from '@/app/_utils/download';
import { MAX_FILE_BYTES, MAX_FILE_LABEL } from '@/app/_utils/config';

/** Where a run currently is, for the progress UI. */
export enum ToolStep {
    IDLE = 'idle',
    UPLOAD = 'upload',
    PROCESS = 'process',
    DOWNLOAD = 'download',
}

export interface RunOptions {
    /** Endpoint from `ToolsApi`. */
    url: string;
    /** Multipart body. */
    formData: FormData;
    /** Name used if the server sends no `Content-Disposition`. */
    fallbackFilename: string;
    /** Called with the response blob instead of downloading it (e.g. JSON-returning tools). */
    onBlob?: (blob: Blob, filename: string) => void;
}

/**
 * Runs a tool request: auth, upload/download progress, cancellation, typed errors, and
 * saving the result.
 *
 * This replaces ~36 near-identical copies of the same block across the tool pages. They
 * each carried the same defects — no `Authorization` header (so every call 401s against
 * the current API), one hardcoded error string regardless of status, an object URL
 * revoked before the download started, a naive filename parse, no size check and no way
 * to cancel. Fixing them in one place is the only way they stay fixed.
 */
export function useToolRequest() {
    const [step, setStep] = useState<ToolStep>(ToolStep.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const requestRef = useRef<XMLHttpRequest | null>(null);

    const cancel = useCallback(() => {
        requestRef.current?.abort();
        requestRef.current = null;
        setStep(ToolStep.IDLE);
        setProgress(0);
    }, []);

    const run = useCallback(async (options: RunOptions): Promise<boolean> => {
        const { url, formData, fallbackFilename, onBlob } = options;

        // Fail fast on something the server would only reject after a full upload.
        const oversized = oversizedFile(formData);
        if (oversized) {
            setError(`"${oversized}" is larger than the ${MAX_FILE_LABEL} limit. Try a smaller file.`);
            return false;
        }

        requestRef.current?.abort();
        setError(null);
        setProgress(0);

        // Retried once on 401 with a refreshed token: a guest session expires silently and
        // the user should never see that as a failure.
        const attempt = (token: string | null, allowRetry: boolean): Promise<boolean> =>
            new Promise((resolve) => {
                const xhr = new XMLHttpRequest();
                requestRef.current = xhr;
                xhr.open('POST', url, true);
                xhr.responseType = 'blob';
                if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                // Makes a retry of a request whose response was never seen safe: the server
                // charges the credit once per key, not once per delivery.
                xhr.setRequestHeader('Idempotency-Key', idempotencyKey());

                xhr.upload.addEventListener('progress', (event) => {
                    if (!event.lengthComputable) return;
                    setStep(ToolStep.UPLOAD);
                    setProgress((event.loaded / event.total) * 100);
                    if (event.loaded >= event.total) setStep(ToolStep.PROCESS);
                });

                xhr.onprogress = (event) => {
                    if (!event.lengthComputable) return;
                    setStep(ToolStep.DOWNLOAD);
                    setProgress((event.loaded / event.total) * 100);
                };

                xhr.onload = async () => {
                    requestRef.current = null;

                    if (xhr.status === 401 && allowRetry) {
                        const fresh = await refreshAccessToken();
                        resolve(await attempt(fresh, false));
                        return;
                    }

                    if (xhr.status < 200 || xhr.status >= 300) {
                        setError(await describeError(xhr));
                        setStep(ToolStep.IDLE);
                        resolve(false);
                        return;
                    }

                    const filename = filenameFrom(
                        xhr.getResponseHeader('Content-Disposition'), fallbackFilename);
                    if (onBlob) onBlob(xhr.response, filename);
                    else saveBlob(xhr.response, filename);

                    setStep(ToolStep.IDLE);
                    setProgress(0);
                    resolve(true);
                };

                xhr.onerror = () => {
                    requestRef.current = null;
                    setError('Could not reach the server. Check your connection and try again.');
                    setStep(ToolStep.IDLE);
                    resolve(false);
                };

                xhr.onabort = () => {
                    requestRef.current = null;
                    setStep(ToolStep.IDLE);
                    resolve(false);
                };

                xhr.send(formData);
            });

        return attempt(await getAccessToken(), true);
    }, []);

    return { step, progress, error, setError, run, cancel, isRunning: step !== ToolStep.IDLE };
}

/** @returns the name of the first file over the limit, or null. */
function oversizedFile(formData: FormData): string | null {
    for (const value of formData.values()) {
        if (value instanceof File && value.size > MAX_FILE_BYTES) return value.name;
    }
    return null;
}

function idempotencyKey(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Turns a failed response into something worth reading.
 *
 * The API returns a JSON envelope with a stable `code` and a human `message`; every tool
 * previously discarded it and showed one hardcoded string, so a user out of credits, a
 * file too large and a server fault all read identically.
 */
async function describeError(xhr: XMLHttpRequest): Promise<string> {
    try {
        const text = await (xhr.response as Blob).text();
        const body = JSON.parse(text);
        if (body?.message) return body.message;
    } catch {
        /* not our envelope — fall back to the status */
    }

    switch (xhr.status) {
        case 402: return "You're out of credits for this tool.";
        case 413: return `That file is larger than the ${MAX_FILE_LABEL} limit.`;
        case 415: return 'That file type is not supported by this tool.';
        case 422: return 'This file could not be processed. It may be corrupt or password-protected.';
        case 429: return 'Too many requests. Please wait a moment and try again.';
        case 503: return 'The server is busy right now. Please try again in a moment.';
        default: return 'Something went wrong. Please try again.';
    }
}
