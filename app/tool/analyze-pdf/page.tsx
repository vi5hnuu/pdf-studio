'use client';

import * as React from 'react';
import { ChangeEvent, useState } from 'react';
import { ChooseFiles } from '@/app/_components/choose_files';
import { ToolSeoSection } from '@/app/_components/tool-seo-section';
import { ToolsApi } from '@/app/_utils/api';
import { runToolRequest } from '@/app/_hooks/use-tool-request';
import { formatBytes } from '@/app/_utils/format';

enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

/**
 * Unlike every other tool, this one renders its result rather than downloading it — the
 * endpoint returns a JSON report, so the response is read through `onBlob` instead of
 * being saved.
 */
export default function AnalyzePdf() {
    const [file, setFile] = useState<File | null>(null);
    const [report, setReport] = useState<Record<string, unknown> | null>(null);
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [error, setError] = useState<string | null>(null);

    function handleFile(event: ChangeEvent<HTMLInputElement>) {
        const chosen = (Object.values(event.target.files ?? {}) as File[])[0];
        if (!chosen) return;
        setFile(chosen);
        setReport(null);
    }

    async function analyze() {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);

        await runToolRequest({
            url: ToolsApi.analyzePdf,
            formData,
            fallbackFilename: 'analysis.json',
            onStep: (s) => setStep(s as Step),
            onError: setError,
            onBlob: async (blob) => {
                try {
                    setReport(JSON.parse(await blob.text()));
                } catch {
                    setError('The analysis could not be read.');
                }
            },
        });
    }

    return (
        <div className="flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white px-4 md:px-8 py-2.5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white/20 rounded-sm flex items-center justify-center flex-shrink-0">
                        <img src="/tools/analyze-pdf.svg" alt="" width={28} height={28} className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base font-semibold leading-tight">Analyze PDF</h1>
                        <p className="text-xs opacity-75 leading-tight">
                            Inspect pages, size, fonts, images, security and metadata
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-4 md:px-8 py-5">
                <div className="max-w-5xl mx-auto space-y-6">
                    <ChooseFiles single accept={['application/pdf']} onChange={handleFile} />

                    {file && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Selected: <strong>{file.name}</strong>
                            </p>
                            <button
                                onClick={analyze}
                                disabled={step !== Step.IDLE}
                                className="px-3.5 py-1.5 rounded-sm bg-emerald-700 hover:bg-emerald-800 text-white
                                           text-sm font-semibold disabled:opacity-40 transition-colors"
                            >
                                {step === Step.IDLE ? 'Analyze PDF' : 'Analyzing…'}
                            </button>
                        </div>
                    )}

                    {error && (
                        <div role="alert" className="max-w-md mx-auto flex gap-3 rounded-sm border border-red-200
                                        dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm
                                        text-red-700 dark:text-red-300">
                            {error}
                                    {/credits?/i.test(error) && (
                                        <a href="/account" className="underline font-medium whitespace-nowrap">
                                            Get credits
                                        </a>
                                    )}
                        </div>
                    )}

                    {report && (
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(report).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="rounded-sm border border-slate-100 dark:border-slate-700
                                               bg-white dark:bg-slate-800 px-4 py-3"
                                >
                                    <dt className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                        {humanise(key)}
                                    </dt>
                                    <dd className="text-sm font-medium text-slate-800 dark:text-slate-100 mt-0.5 break-words">
                                        {format(key, value)}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    )}

                    <ToolSeoSection
                        toolPath="/tool/analyze-pdf"
                        toolName="Analyze PDF"
                        about="Reports what a PDF actually contains: how many pages, its size on disk, page dimensions, which fonts are embedded, how many images it holds, whether it is encrypted, and its metadata. Useful for working out why a file is unexpectedly large, why it renders differently elsewhere, or whether it is protected."
                        features={[
                            { icon: <CheckIcon />, title: 'No download needed', description: 'The report is shown in the page rather than saved as a file.' },
                            { icon: <CheckIcon />, title: 'Explains file size', description: 'Image and font counts usually account for a PDF that is larger than expected.' },
                            { icon: <CheckIcon />, title: 'Shows security state', description: 'Tells you whether the document is encrypted before you try to edit it.' },
                            { icon: <CheckIcon />, title: 'Private', description: 'The file is sent over HTTPS and removed from the server after analysis.' },
                        ]}
                        faqs={[
                            { q: 'Does analyzing change my file?', a: 'No. The document is read only, and nothing is written back or returned to you as a file.' },
                            { q: 'Why is my PDF so large?', a: 'Usually embedded images, and sometimes fully embedded font families. The image count here is the first thing to check; Compress PDF or Optimize PDF can then reduce it.' },
                            { q: 'What does "encrypted" mean here?', a: 'The document has a password or permission restrictions. Use Unprotect PDF with the password to remove them before editing.' },
                            { q: 'Why do fonts matter?', a: 'A PDF that does not embed its fonts renders with substitutes on machines that lack them, which is the usual cause of a document looking different elsewhere.' },
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" className="text-emerald-600 dark:text-emerald-400">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

/** `fileSizeBytes` → `File size bytes`. */
function humanise(key: string): string {
    const spaced = key.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

function format(key: string, value: unknown): string {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number' && /size|bytes/i.test(key)) return formatBytes(value);
    if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

