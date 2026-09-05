'use client';

import { useCallback, useRef, useState } from 'react';
import { getAccessToken, refreshAccessToken } from '@/app/_utils/auth';
import { filenameFrom, saveBlob } from '@/app/_utils/download';
import { MAX_FILE_BYTES, MAX_FILE_LABEL } from '@/app/_utils/config';

/** Where a run currently is. The string values match the per-page `Step` enums. */
export type ToolStepValue = 'idle' | 'upload' | 'process' | 'download';

export enum ToolStep {
    IDLE = 'idle',
    UPLOAD = 'upload',
    PROCESS = 'process',
    DOWNLOAD = 'download',
}

export interface RunToolOptions {
    /** Endpoint from `ToolsApi`. */
    url: string;
    /** Multipart body. */
    formData: FormData;
    /** Name used if the server sends no usable `Content-Disposition`. */
    fallbackFilename: string;
    onStep?: (step: ToolStepValue) => void;
    onProgress?: (percent: number) => void;
    onError?: (message: string | null) => void;
    /** Receives the response instead of downloading it (for tools that render the result). */
    onBlob?: (blob: Blob, filename: string) => void;
    /** Holds the live request so a caller can abort it. */
    requestRef?: { current: XMLHttpRequest | null };
}

/**
 * Runs one tool request: authentication, progress, typed errors, and saving the result.
 *
 * This replaces 63 near-identical hand-rolled blocks across the tool pages, every one of
 * which shared the same defects — no `Authorization` header (so all of them 401 against
 * the current API), a single hardcoded error string regardless of status, an object URL
 * revoked before the download had started, a filename parse that kept the quotes, no
 * size check and no way to cancel. Centralising is the only way those stay fixed.
 *
 * Exposed as a plain function so existing components keep their own state and JSX; new
 * code can use {@link useToolRequest} instead.
 */
export async function runToolRequest(options: RunToolOptions): Promise<boolean> {
    const { url, formData, fallbackFilename, onStep, onProgress, onError, onBlob, requestRef } = options;

    const step = (value: ToolStepValue) => onStep?.(value);
    const fail = (message: string) => {
        onError?.(message);
        step('idle');
        return false;
    };

    // Fail fast on something the server would only reject after a full upload.
    const oversized = oversizedFile(formData);
    if (oversized) {
        return fail(`"${oversized}" is larger than the ${MAX_FILE_LABEL} limit. Try a smaller file.`);
    }

    requestRef?.current?.abort();
    onError?.(null);
    onProgress?.(0);

    // A guest session can expire silently; the user should never see that as a failure, so
    // a 401 is retried once with a fresh token.
    const attempt = (token: string | null, allowRetry: boolean): Promise<boolean> =>
        new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            if (requestRef) requestRef.current = xhr;

            xhr.open('POST', url, true);
            xhr.responseType = 'blob';
            if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            // Makes retrying a request whose response was never seen safe: the API charges
            // a credit once per key rather than once per delivery.
            xhr.setRequestHeader('Idempotency-Key', idempotencyKey());

            xhr.upload.addEventListener('progress', (event) => {
                if (!event.lengthComputable) return;
                step('upload');
                onProgress?.((event.loaded / event.total) * 100);
                if (event.loaded >= event.total) step('process');
            });

            xhr.onprogress = (event) => {
                if (!event.lengthComputable) return;
                step('download');
                onProgress?.((event.loaded / event.total) * 100);
            };

            xhr.onload = async () => {
                if (requestRef) requestRef.current = null;

                if (xhr.status === 401 && allowRetry) {
                    resolve(await attempt(await refreshAccessToken(), false));
                    return;
                }
                if (xhr.status < 200 || xhr.status >= 300) {
                    resolve(fail(await describeError(xhr)));
                    return;
                }

                const filename = filenameFrom(
                    xhr.getResponseHeader('Content-Disposition'), fallbackFilename);
                if (onBlob) onBlob(xhr.response, filename);
                else saveBlob(xhr.response, filename);

                step('idle');
                onProgress?.(0);
                resolve(true);
            };

            xhr.onerror = () => {
                if (requestRef) requestRef.current = null;
                resolve(fail('Could not reach the server. Check your connection and try again.'));
            };

            xhr.onabort = () => {
                if (requestRef) requestRef.current = null;
                step('idle');
                resolve(false);
            };

            xhr.send(formData);
        });

    return attempt(await getAccessToken(), true);
}

/** Hook form, for components that do not already manage their own progress state. */
export function useToolRequest() {
    const [step, setStep] = useState<ToolStepValue>('idle');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const requestRef = useRef<XMLHttpRequest | null>(null);

    const cancel = useCallback(() => {
        requestRef.current?.abort();
        requestRef.current = null;
    }, []);

    const run = useCallback(
        (options: Omit<RunToolOptions, 'onStep' | 'onProgress' | 'onError' | 'requestRef'>) =>
            runToolRequest({
                ...options,
                onStep: setStep,
                onProgress: setProgress,
                onError: setError,
                requestRef,
            }),
        [],
    );

    return { step, progress, error, setError, run, cancel, isRunning: step !== 'idle' };
}

/** @returns the name of the first file over the limit, or null. */
function oversizedFile(formData: FormData): string | null {
    for (const value of Array.from(formData.values())) {
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
 * The API returns a JSON envelope with a stable code and a human message; every tool
 * previously discarded it and showed one fixed string, so being out of credits, sending
 * too large a file, and a server fault all read identically.
 */
async function describeError(xhr: XMLHttpRequest): Promise<string> {
    try {
        const body = JSON.parse(await (xhr.response as Blob).text());
        if (body?.message) return body.message as string;
    } catch {
        /* not our envelope — fall back to the status */
    }

    switch (xhr.status) {
        case 401: return 'Your session expired. Please reload the page and try again.';
        case 402: return "You're out of credits for this tool.";
        case 413: return `That file is larger than the ${MAX_FILE_LABEL} limit.`;
        case 415: return 'That file type is not supported by this tool.';
        case 422: return 'This file could not be processed. It may be corrupt or password-protected.';
        case 429: return 'Too many requests. Please wait a moment and try again.';
        case 503: return 'The server is busy right now. Please try again in a moment.';
        default: return 'Something went wrong. Please try again.';
    }
}
