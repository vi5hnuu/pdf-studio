"use client";

import * as React from "react";
import { ChangeEvent, useState } from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { generateId } from "@/app/_utils/constants";
import { ToolsApi } from "@/app/_utils/api";
import { runToolRequest } from '@/app/_hooks/use-tool-request';
import { ToolCostBadge } from '@/app/_components/tool-cost-badge';
import { useToolStep } from '@/app/_hooks/use-tool-step';
import { formatBytes } from '@/app/_utils/format';

interface FileData { id: string; file: File; }

const LEVELS: { value: string; label: string; quality: string; hint: string; recommended?: boolean }[] = [
    { value: 'EXTREME', label: 'Extreme', quality: '30%', hint: 'Maximum compression, lowest image quality' },
    { value: 'RECOMMENDED', label: 'Recommended', quality: '50%', hint: 'Best balance of size and quality', recommended: true },
    { value: 'LOW', label: 'Low', quality: '70%', hint: 'Minimal compression, near-original quality' },
];

type Level = typeof LEVELS[number]['value'];

enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

export default function CompressPdf() {
    const steps = ['Select File', 'Choose Level', 'Compress'];

    // Mirrored into the URL so the browser Back button steps back rather than
    // leaving the tool and losing the file.
    const [activeStep, setActiveStep] = useToolStep(steps.length);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [level, setLevel] = useState('RECOMMENDED');
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [outFileName, setOutFileName] = useState('');


    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        setFileData({ id: generateId(32, 'FILE_'), file: f });
    }

    async function startCompress() {
        if (!fileData) return;
        const body = { out_file_name: outFileName || 'compressed', level };
        const formData = new FormData();
        formData.append('compress-pdf-info', new Blob([JSON.stringify(body)], { type: 'application/json' }));
        formData.append('file', fileData.file);

        await runToolRequest({
            url: ToolsApi.compressPdf,
            formData,
            fallbackFilename: 'compress-pdf.pdf',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Compressing PDF...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    return (
        <div className="flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white px-4 md:px-8 py-2.5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white/20 rounded-sm flex items-center justify-center flex-shrink-0">
                        <img src="/tools/compress-pdf.svg" alt="" className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base font-semibold leading-tight">Compress PDF</h1>
                        <p className="text-xs opacity-75 leading-tight">Reduce PDF file size with smart image compression</p>
                    </div>
                    <div className="hidden md:block text-sm opacity-60">Step {activeStep + 1} / {steps.length}</div>
                </div>
            </div>

            <div className="bg-white border-b border-slate-100 px-4 md:px-8 py-1.5 flex-shrink-0 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto">
                    <ProgressStepper steps={steps} activeStepIndex={activeStep} onStepClick={setActiveStep} />
                </div>
            </div>

            <div className="flex-1 px-4 md:px-8 py-5">
                <div className="max-w-5xl mx-auto">
                    {activeStep === 0 && (
                        <div className="space-y-4">
                            <ChooseFiles single accept={['application/pdf']} onChange={handleFile} />
                            {fileData && (
                                <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                                    Selected: <strong>{fileData.file.name}</strong> ({formatBytes(fileData.file.size)})
                                </p>
                            )}
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="max-w-2xl mx-auto space-y-4">
                            <p className="text-sm text-slate-500 text-center dark:text-slate-400">Choose how aggressively to compress your PDF.</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {LEVELS.map(({ value, label, quality, hint, recommended }) => (
                                    <label
                                        key={value}
                                        className={`relative flex flex-col gap-3 p-5 rounded-sm border-2 cursor-pointer transition-all ${level === value ? 'border-slate-700 bg-slate-50 shadow-md' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                                    >
                                        <input type="radio" className="sr-only" checked={level === value} onChange={() => setLevel(value)} />
                                        {recommended && (
                                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs font-semibold bg-slate-700 text-white px-2.5 py-0.5 rounded-full">Recommended</span>
                                        )}
                                        <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${
                                            value === 'EXTREME' ? 'bg-red-100' : value === 'LOW' ? 'bg-green-100' : 'bg-slate-100'
                                        }`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={
                                                value === 'EXTREME' ? 'text-red-600' : value === 'LOW' ? 'text-green-600' : 'text-slate-600'
                                            }><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="12" y1="12" x2="12" y2="18"/><polyline points="9 15 12 18 15 15"/></svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-slate-100">{label}</p>
                                            <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">{hint}</p>
                                        </div>
                                        <div className="text-xs space-y-1">
                                            <div className="flex justify-between"><span className="text-slate-400 dark:text-slate-500">JPEG quality</span><span className="font-medium text-slate-700 dark:text-slate-200">{quality}</span></div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeStep === 2 && (
                        <div className="max-w-md mx-auto flex flex-col gap-6 py-8">
                            {step !== Step.IDLE && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-slate-700 dark:text-slate-200">{statusText}</span>
                                        {step !== Step.PROCESS && <span className="text-slate-400 tabular-nums dark:text-slate-500">{Math.round(progress)}%</span>}
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-700">
                                        {step === Step.PROCESS
                                            ? <div className="h-full w-full bg-slate-600 animate-pulse" />
                                            : <div className="h-full bg-slate-700 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                        }
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div role="alert" className="flex gap-3 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    {error}
                                    {/credits?/i.test(error) && (
                                        <a href="/account" className="underline font-medium whitespace-nowrap">
                                            Get credits
                                        </a>
                                    )}
                                </div>
                            )}
                            {step === Step.IDLE && (
                                <div className="flex flex-col gap-4">
                                    <ToolCostBadge toolId="compress-pdf" file={fileData?.file} />
                                    <div className="bg-slate-50 rounded-sm border border-slate-200 px-4 py-3 text-sm text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200">
                                        Compressing with <strong>{LEVELS.find(l => l.value === level)?.label}</strong> settings.
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                                        <input
                                            type="text"
                                            value={outFileName}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())}
                                            placeholder="compressed"
                                            className="w-full px-2.5 py-1.5 rounded-sm border border-slate-200 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-slate-700"
                                        />
                                    </div>
                                    <button
                                        onClick={startCompress}
                                        className="w-full py-2.5 rounded-sm bg-slate-700 text-white font-semibold text-sm hover:bg-slate-800 transition-colors shadow-sm"
                                    >
                                        Compress & Download
                                    </button>
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">Your compressed PDF will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}

                    <ToolSeoSection
                        toolPath="/tool/compress-pdf"
                        toolName="Compress pdf"
                        about="Reduce the size of any PDF file by compressing embedded images in-place. PDF Studio finds every image inside your PDF and re-encodes it at the selected JPEG quality — preserving all text, fonts, bookmarks, and document structure."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600 dark:text-slate-300"><path d="M12 2v6m0 0 3-3m-3 3-3-3"/><rect x="2" y="14" width="20" height="8" rx="2"/></svg>, title: 'Three compression levels', description: 'Extreme (30% quality) for email, Recommended (50%) for sharing, Low (70%) for near-lossless output.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600 dark:text-slate-300"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'Fast processing', description: 'Each page is rendered and re-encoded server-side in seconds.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600 dark:text-slate-300"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'No data retention', description: 'Files are deleted from our servers immediately after processing.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600 dark:text-slate-300"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, title: 'Free to use', description: 'No subscription, no account — just upload and compress.' },
                        ]}
                        faqs={[
                            { q: 'How much will my PDF shrink?', a: 'It depends on how many images the PDF contains and their original size. PDFs with many high-resolution images can shrink by 50–80%. Text-only PDFs may barely shrink since only images are compressed.' },
                            { q: 'Will text and bookmarks be preserved?', a: 'Yes — completely. Only the embedded images inside the PDF are modified. All text, fonts, links, bookmarks, and document structure remain fully intact.' },
                            { q: 'What is the difference between the compression levels?', a: 'Extreme uses 30% JPEG quality — smallest file, noticeable image quality loss. Recommended uses 50% — good balance for sharing. Low uses 70% — minimal loss, closest to original quality.' },
                            { q: 'Does this work on text-only PDFs?', a: 'Yes, but with little to no effect. The tool only compresses embedded image resources. If the PDF has no images, the output size will be nearly identical to the input.' },
                        ]}
                    />
                </div>
            </div>

            <div className="sticky bottom-0 z-30 flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        disabled={activeStep === 0}
                        onClick={() => setActiveStep(a => a - 1)}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                        Back
                    </button>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{activeStep + 1} / {steps.length}</span>
                    <button
                        disabled={activeStep === 2 || !fileData}
                        onClick={() => setActiveStep(a => a + 1)}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-slate-700 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
