import { ToolsApi } from "@/app/_utils/api";
import * as React from "react";
import { ChangeEvent, useState } from "react";
import { FileData } from "@/app/tool/merge-pdf/page";
import { runToolRequest } from '@/app/_hooks/use-tool-request';
import { ToolCostBadge } from '@/app/_components/tool-cost-badge';

enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

export function ImageToPdfProgress({ files }: { files: FileData[] }) {
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState('');

    async function startCreatingPdf() {
        const formData = new FormData();
        formData.append('image-to-pdf-info', new Blob([JSON.stringify({ out_file_name: fileName })], { type: 'application/json' }));
        for (const fd of files) formData.append('files', fd.file);

        await runToolRequest({
            url: ToolsApi.imagePdf,
            formData,
            fallbackFilename: 'image-to-pdf.pdf',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText = step === Step.UPLOAD ? 'Uploading images...' : step === Step.PROCESS ? 'Creating PDF...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-6 py-10 px-4">
            <ToolCostBadge toolId="image-to-pdf" file={files[0]?.file} />
            {step !== Step.IDLE && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-200">{statusText}</span>
                        {step !== Step.PROCESS && <span className="tabular-nums text-slate-400 dark:text-slate-500">{Math.round(progress)}%</span>}
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden dark:bg-slate-700">
                        {step === Step.PROCESS
                            ? <div className="h-full w-full bg-blue-500 animate-pulse" />
                            : <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />}
                    </div>
                </div>
            )}

            {error && (
                <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {step === Step.IDLE && (
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 dark:text-slate-200">Output file name</label>
                        <input
                            type="text"
                            value={fileName}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFileName(e.target.value.trim())}
                            placeholder="images"
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-700"
                        />
                    </div>
                    <button
                        disabled={!fileName.length}
                        onClick={startCreatingPdf}
                        className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        Create PDF
                    </button>
                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">Your PDF will download automatically</p>
                </div>
            )}
        </div>
    );
}
