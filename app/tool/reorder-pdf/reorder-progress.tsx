import { ToolsApi } from "@/app/_utils/api";
import * as React from "react";
import { ChangeEvent, useState } from "react";
import { FileData } from "@/app/tool/merge-pdf/page";

enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

export function ReorderProgress({ file, order }: { file: FileData; order: number[] }) {
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [req, setReq] = useState<XMLHttpRequest | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState('');

    async function startReorder() {
        req?.abort();
        const formData = new FormData();
        formData.append('reorder-pdf-info', new Blob([JSON.stringify({ out_file_name: fileName, order })], { type: 'application/json' }));
        formData.append('file', file.file);

        const xhr = new XMLHttpRequest();
        setReq(xhr); setError(null);
        xhr.open('POST', ToolsApi.reorderPdf, true);
        xhr.responseType = 'blob';
        xhr.onprogress = (event) => {
            if (!event.lengthComputable) return;
            step !== Step.DOWNLOAD && setStep(Step.DOWNLOAD);
            const pct = (event.loaded / event.total) * 100;
            if (pct >= 100) setStep(Step.IDLE);
            setProgress(pct);
        };
        xhr.upload.addEventListener('progress', (event) => {
            if (!event.lengthComputable) return;
            step !== Step.UPLOAD && setStep(Step.UPLOAD);
            const pct = (event.loaded / event.total) * 100;
            if (pct >= 100) setStep(Step.PROCESS);
            setProgress(pct);
        });
        xhr.onload = async () => {
            if (xhr.status !== 200) { setError('Failed to reorder PDF pages'); setStep(Step.IDLE); return; }
            const disposition = xhr.getResponseHeader('Content-Disposition') ?? '';
            const filename = disposition.split('filename=', 2)[1] ?? 'reordered.pdf';
            const url = URL.createObjectURL(xhr.response);
            const a = document.createElement('a');
            a.href = url; a.download = filename; a.click();
            URL.revokeObjectURL(url);
        };
        xhr.onerror = () => { setError('Failed to reorder PDF pages'); setStep(Step.IDLE); };
        xhr.onabort = () => console.error('request aborted');
        xhr.send(formData);
    }

    const statusText = step === Step.UPLOAD ? 'Uploading file...' : step === Step.PROCESS ? 'Processing...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-6 py-10 px-4">
            {step !== Step.IDLE && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{statusText}</span>
                        {step !== Step.PROCESS && <span className="tabular-nums text-slate-400">{Math.round(progress)}%</span>}
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        {step === Step.PROCESS
                            ? <div className="h-full w-full bg-blue-500 animate-pulse" />
                            : <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />}
                    </div>
                </div>
            )}

            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {step === Step.IDLE && (
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Output file name</label>
                        <input
                            type="text"
                            value={fileName}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFileName(e.target.value.trim())}
                            placeholder="reordered"
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        disabled={!fileName.length}
                        onClick={startReorder}
                        className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        Save Reordered PDF
                    </button>
                    <p className="text-center text-xs text-slate-400">Your reordered PDF will download automatically</p>
                </div>
            )}
        </div>
    );
}
