import { ToolsApi } from "@/app/_utils/api";
import * as React from "react";
import { useState } from "react";
import { FileData } from "@/app/tool/merge-pdf/page";
import { UnprotectOptions } from "@/app/_models/unprotect-options";
import { runToolRequest } from '@/app/_hooks/use-tool-request';
import { ToolCostBadge } from '@/app/_components/tool-cost-badge';

enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

export function UnprotectProgress({ file, options }: { file: FileData; options: UnprotectOptions }) {
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    async function startUnProtect() {
        const formData = new FormData();
        formData.append('unprotect-pdf-info', new Blob([JSON.stringify(options)], { type: 'application/json' }));
        formData.append('file', file.file);

        await runToolRequest({
            url: ToolsApi.unprotectPdf,
            formData,
            fallbackFilename: 'unprotect-pdf.pdf',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText = step === Step.UPLOAD ? 'Uploading file...' : step === Step.PROCESS ? 'Processing...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-6 py-10 px-4">
            <ToolCostBadge toolId="unprotect-pdf" file={file.file} />
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
                    <button onClick={startUnProtect} className="w-full py-3.5 rounded-xl bg-yellow-500 text-white font-semibold text-sm hover:bg-yellow-600 active:bg-yellow-700 transition-colors shadow-sm">
                        Unlock PDF
                    </button>
                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">Your unlocked file will download automatically</p>
                </div>
            )}
        </div>
    );
}
