"use client";

import * as React from "react";
import { ChangeEvent, useState } from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { generateId } from "@/app/_utils/constants";
import { ToolsApi } from "@/app/_utils/api";
import { runToolRequest } from '@/app/_hooks/use-tool-request';

interface FileData { id: string; file: File; }

enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

export default function GrayscalePdf() {
    const [activeStep, setActiveStep] = useState(0);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [outFileName, setOutFileName] = useState('');

    const steps = ['Select File', 'Convert'];

    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        setFileData({ id: generateId(32, 'FILE_'), file: f });
    }

    async function startGrayscale() {
        if (!fileData) return;
        const formData = new FormData();
        if (outFileName) {
            formData.append('grayscale-pdf-info', new Blob([JSON.stringify({ out_file_name: outFileName })], { type: 'application/json' }));
        }
        formData.append('file', fileData.file);

        await runToolRequest({
            url: ToolsApi.grayscalePdf,
            formData,
            fallbackFilename: 'grayscale-pdf.pdf',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Converting to grayscale...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-zinc-600 to-zinc-800 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/grayscale-pdf.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Grayscale PDF</h1>
                        <p className="text-sm opacity-75 mt-0.5">Convert any color PDF to black and white grayscale</p>
                    </div>
                    <div className="hidden md:block text-sm opacity-60">Step {activeStep + 1} / {steps.length}</div>
                </div>
            </div>

            <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex-shrink-0 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto">
                    <ProgressStepper steps={steps} activeStepIndex={activeStep} />
                </div>
            </div>

            <div className="flex-1 overflow-auto px-6 md:px-10 py-8">
                <div className="max-w-5xl mx-auto">
                    {activeStep === 0 && (
                        <div className="space-y-4">
                            <ChooseFiles single accept={['application/pdf']} onChange={handleFile} />
                            {fileData && <p className="text-sm text-center text-slate-500 dark:text-slate-400">Selected: <strong>{fileData.file.name}</strong></p>}
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="max-w-md mx-auto flex flex-col gap-6 py-8">
                            {step !== Step.IDLE && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-slate-700 dark:text-slate-200">{statusText}</span>
                                        {step !== Step.PROCESS && <span className="text-slate-400 tabular-nums dark:text-slate-500">{Math.round(progress)}%</span>}
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-700">
                                        {step === Step.PROCESS
                                            ? <div className="h-full w-full bg-zinc-500 animate-pulse" />
                                            : <div className="h-full bg-zinc-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                        }
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    {error}
                                </div>
                            )}
                            {step === Step.IDLE && (
                                <div className="flex flex-col gap-4">
                                    {/* Warning */}
                                    <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700/50 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                        <span>Each page is rendered as an image — <strong>text will no longer be selectable</strong> in the output PDF. Bookmarks and hyperlinks will also be removed.</span>
                                    </div>
                                    {/* Visual indicator */}
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:border-slate-700">
                                        <div className="flex gap-2">
                                            <div className="w-8 h-10 rounded bg-gradient-to-b from-blue-400 to-red-400" />
                                            <div className="w-8 h-10 rounded bg-gradient-to-b from-green-400 to-yellow-400" />
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-500"><path d="m9 18 6-6-6-6"/></svg>
                                        <div className="flex gap-2">
                                            <div className="w-8 h-10 rounded bg-gradient-to-b from-gray-300 to-gray-700" />
                                            <div className="w-8 h-10 rounded bg-gradient-to-b from-gray-200 to-gray-500" />
                                        </div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">All colors → grayscale</span>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                                        <input type="text" value={outFileName} onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())} placeholder="grayscale" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-50 dark:border-slate-700" />
                                    </div>
                                    <button onClick={startGrayscale} className="w-full py-3.5 rounded-xl bg-zinc-700 text-white font-semibold text-sm hover:bg-zinc-800 transition-colors shadow-sm">
                                        Convert to Grayscale & Download
                                    </button>
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">Your grayscale PDF will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}

                    <ToolSeoSection
                        toolPath="/tool/grayscale-pdf"
                        toolName="Grayscale pdf"
                        about="Convert any color PDF to grayscale by rendering each page as a high-quality monochrome image. This guarantees that all color — including colored text, images, and vector graphics — is fully removed. The result is ideal for black-and-white printing. Note: because pages are rasterized, text will not be selectable in the output."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20z"/></svg>, title: 'Complete color removal', description: 'Every element — images, text, and vector graphics — is converted to grayscale.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>, title: 'Print optimized', description: 'Ideal for black-and-white printers — reduces ink usage and printing costs.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>, title: 'Works on all PDFs', description: 'Handles scanned documents, image-heavy PDFs, and typeset documents equally well.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'Secure & private', description: 'Files are processed securely and deleted immediately after download.' },
                        ]}
                        faqs={[
                            { q: 'Will text still be selectable after conversion?', a: 'No. Each page is rendered as an image, so the output is a raster PDF — text, bookmarks, and hyperlinks will not be present in the result.' },
                            { q: 'Will this work on scanned PDFs?', a: 'Yes. Scanned PDFs are already raster images, so grayscale conversion works perfectly on them.' },
                            { q: 'Why does the output look correct but text is not selectable?', a: 'The tool renders each page at 150 DPI to an image before converting to grayscale. This is the most reliable way to ensure all color is removed, but it produces a raster-only PDF.' },
                            { q: 'Will the file size change?', a: 'The file size may increase slightly compared to the original because each page becomes a lossless grayscale image. For scanned PDFs it is often similar or smaller.' },
                        ]}
                    />
                </div>
            </div>

            <div className="flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button disabled={activeStep === 0} onClick={() => setActiveStep(a => a - 1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                        Back
                    </button>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{activeStep + 1} / {steps.length}</span>
                    <button disabled={activeStep === 1 || !fileData} onClick={() => setActiveStep(a => a + 1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-700 text-white text-sm font-semibold hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
                        Next
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
