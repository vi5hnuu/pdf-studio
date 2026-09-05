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

// Threshold is the minimum whiteness ratio to be considered blank (0.85–0.99)
const SENSITIVITY_PRESETS = [
    { label: 'Strict', threshold: 0.99, hint: 'Only completely white pages are removed' },
    { label: 'Balanced', threshold: 0.98, hint: 'Removes pages with faint artifacts (recommended)', recommended: true },
    { label: 'Aggressive', threshold: 0.94, hint: 'Removes pages with light content or marks' },
    { label: 'Very Aggressive', threshold: 0.88, hint: 'Removes pages with sparse content' },
];

enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

export default function RemoveBlankPages() {
    const steps = ['Select File', 'Set Sensitivity', 'Remove & Download'];

    // Mirrored into the URL so the browser Back button steps back rather than
    // leaving the tool and losing the file.
    const [activeStep, setActiveStep] = useToolStep(steps.length);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [threshold, setThreshold] = useState(0.98);
    const [outFileName, setOutFileName] = useState('');
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);


    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        setFileData({ id: generateId(32, 'FILE_'), file: f });
    }

    async function startRemove() {
        if (!fileData) return;
        const body = { out_file_name: outFileName || 'cleaned', threshold };
        const formData = new FormData();
        formData.append('remove-blank-pages-info', new Blob([JSON.stringify(body)], { type: 'application/json' }));
        formData.append('file', fileData.file);

        await runToolRequest({
            url: ToolsApi.removeBlankPages,
            formData,
            fallbackFilename: 'remove-blank-pages.pdf',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Removing blank pages...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';
    const selectedPreset = SENSITIVITY_PRESETS.find(p => p.threshold === threshold);

    return (
        <div className="flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/remove-blank-pages.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Remove Blank Pages</h1>
                        <p className="text-sm opacity-75 mt-0.5">Automatically detect and remove empty pages from your PDF</p>
                    </div>
                    <div className="hidden md:block text-sm opacity-60 flex-shrink-0">Step {activeStep + 1} / {steps.length}</div>
                </div>
            </div>

            <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex-shrink-0 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto">
                    <ProgressStepper steps={steps} activeStepIndex={activeStep} onStepClick={setActiveStep} />
                </div>
            </div>

            <div className="flex-1 px-6 md:px-10 py-8">
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
                        <div className="max-w-2xl mx-auto space-y-6">
                            <p className="text-sm text-slate-500 text-center dark:text-slate-400">
                                Choose how aggressively to detect blank pages. Higher sensitivity removes more pages.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {SENSITIVITY_PRESETS.map(({ label, threshold: t, hint, recommended }) => (
                                    <label
                                        key={t}
                                        className={`relative flex flex-col gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all ${threshold === t ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/25 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'}`}
                                    >
                                        <input type="radio" className="sr-only" checked={threshold === t} onChange={() => setThreshold(t)} />
                                        {recommended && (
                                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs font-semibold bg-amber-500 text-white px-2.5 py-0.5 rounded-full whitespace-nowrap">Recommended</span>
                                        )}
                                        <p className="font-semibold text-slate-800 dark:text-slate-100">{label}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
                                        <p className="text-xs font-mono text-amber-700 dark:text-amber-300">threshold: {t}</p>
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
                                            ? <div className="h-full w-full bg-amber-500 animate-pulse" />
                                            : <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                        }
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
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
                                    <ToolCostBadge toolId="remove-blank-pages" file={fileData?.file} />
                                    <div className="bg-amber-50 rounded-xl border border-amber-200 px-4 py-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300">
                                        Using <strong>{selectedPreset?.label ?? 'Custom'}</strong> sensitivity (threshold: {threshold}). Blank pages are rendered at 72 DPI and analysed for whiteness.
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                                        <input
                                            type="text"
                                            value={outFileName}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())}
                                            placeholder="cleaned"
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:border-slate-700"
                                        />
                                    </div>
                                    <button
                                        onClick={startRemove}
                                        className="w-full py-3.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors shadow-sm"
                                    >
                                        Remove Blank Pages & Download
                                    </button>
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">Your cleaned PDF will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}

                    <ToolSeoSection
                        toolPath="/tool/remove-blank-pages"
                        toolName="Remove Blank Pages"
                        about="PDF Studio's Remove Blank Pages tool renders each page at 72 DPI and analyses the pixel content to detect near-white (blank) pages. You control the sensitivity threshold to decide how much whiteness a page must have before it is removed — from strictly empty to pages with faint marks."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 dark:text-amber-400"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>, title: 'Pixel-level detection', description: 'Each page is rendered and its whiteness ratio is measured precisely.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 dark:text-amber-400"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>, title: 'Adjustable sensitivity', description: 'Four presets from strict (fully white only) to aggressive (removes sparse pages).' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 dark:text-amber-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'Structure preserved', description: 'All text, images, bookmarks and links in non-blank pages are kept intact.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 dark:text-amber-400"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, title: 'Free to use', description: 'No account needed — just upload your PDF and download the result.' },
                        ]}
                        faqs={[
                            { q: 'How does blank page detection work?', a: 'Each page is rendered to a low-resolution image and the fraction of near-white pixels is measured. If it exceeds the threshold you set, the page is removed.' },
                            { q: 'Will pages with faint watermarks be removed?', a: 'At "Strict" sensitivity, only fully white pages are removed. At "Balanced" or higher, pages with very light content may also be removed — choose a higher threshold to be safe.' },
                            { q: 'What if all pages get removed?', a: 'If no pages pass the threshold, the server returns an error. In that case, try a stricter sensitivity preset.' },
                            { q: 'Are my files stored on your servers?', a: 'Files are deleted immediately after processing. We do not retain your documents.' },
                        ]}
                    />
                </div>
            </div>

            <div className="sticky bottom-0 z-30 flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        disabled={activeStep === 0}
                        onClick={() => setActiveStep(a => a - 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                        Back
                    </button>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{activeStep + 1} / {steps.length}</span>
                    <button
                        disabled={activeStep === 2 || !fileData}
                        onClick={() => setActiveStep(a => a + 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
