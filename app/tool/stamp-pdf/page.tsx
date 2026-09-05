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

export default function StampPdf() {
    const [activeStep, setActiveStep] = useState(0);
    const [sourceFile, setSourceFile] = useState<FileData | null>(null);
    const [stampFile, setStampFile] = useState<FileData | null>(null);
    const [opacity, setOpacity] = useState(1.0);
    const [fromPage, setFromPage] = useState('');
    const [toPage, setToPage] = useState('');
    const [outFileName, setOutFileName] = useState('');
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const steps = ['Select Files', 'Configure', 'Stamp'];

    function handleSource(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        setSourceFile({ id: generateId(32, 'FILE_'), file: f });
    }

    async function handleStamp(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        setStampFile({ id: generateId(32, 'FILE_'), file: f });
    }

    async function startStamp() {
        if (!sourceFile || !stampFile) return;
        const body: Record<string, unknown> = {
            out_file_name: outFileName || 'stamped',
            opacity,
        };
        // The endpoint is 0-indexed; the field is 1-based because that is how people count
        // pages. Converting here keeps the two from being confused.
        if (fromPage) body.from_page = Math.max(0, parseInt(fromPage, 10) - 1);
        if (toPage) body.to_page = Math.max(0, parseInt(toPage, 10) - 1);

        const formData = new FormData();
        formData.append('stamp-pdf-info', new Blob([JSON.stringify(body)], { type: 'application/json' }));
        formData.append('file', sourceFile.file);
        formData.append('stamp', stampFile.file);

        await runToolRequest({
            url: ToolsApi.stampPdf,
            formData,
            fallbackFilename: 'stamp-pdf.pdf',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Applying stamp...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    return (
        <div className="flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/stamp-pdf.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Stamp PDF</h1>
                        <p className="text-sm opacity-75 mt-0.5">Overlay a stamp PDF onto every page of another PDF</p>
                    </div>
                    <div className="hidden md:block text-sm opacity-60 flex-shrink-0">Step {activeStep + 1} / {steps.length}</div>
                </div>
            </div>

            <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex-shrink-0 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto">
                    <ProgressStepper steps={steps} activeStepIndex={activeStep} />
                </div>
            </div>

            <div className="flex-1 px-6 md:px-10 py-8">
                <div className="max-w-5xl mx-auto">
                    {activeStep === 0 && (
                        <div className="space-y-6 max-w-2xl mx-auto">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Source PDF <span className="text-slate-400 font-normal dark:text-slate-500">(the file to stamp)</span></p>
                                <ChooseFiles id="source-file-upload" single accept={['application/pdf']} onChange={handleSource} />
                                {sourceFile && <p className="text-sm text-center text-slate-500 dark:text-slate-400">Selected: <strong>{sourceFile.file.name}</strong></p>}
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Stamp PDF <span className="text-slate-400 font-normal dark:text-slate-500">(first page is used as the stamp)</span></p>
                                <ChooseFiles id="stamp-file-upload" single accept={['application/pdf']} onChange={handleStamp} />
                                {stampFile && <p className="text-sm text-center text-slate-500 dark:text-slate-400">Selected: <strong>{stampFile.file.name}</strong></p>}
                            </div>
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="max-w-md mx-auto space-y-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    Opacity — <span className="text-fuchsia-600 font-semibold">{Math.round(opacity * 100)}%</span>
                                </label>
                                <input
                                    type="range"
                                    min={0.05}
                                    max={1}
                                    step={0.05}
                                    value={opacity}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setOpacity(parseFloat(e.target.value))}
                                    className="w-full accent-fuchsia-600"
                                />
                                <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500"><span>5%</span><span>100%</span></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">From page <span className="text-slate-400 font-normal dark:text-slate-500">(optional)</span></label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={fromPage}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFromPage(e.target.value)}
                                        placeholder="0"
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-100 dark:border-slate-700"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">To page <span className="text-slate-400 font-normal dark:text-slate-500">(optional)</span></label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={toPage}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setToPage(e.target.value)}
                                        placeholder="last page"
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-100 dark:border-slate-700"
                                    />
                                </div>
                            </div>
                            <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-xl px-4 py-3 text-xs text-fuchsia-800">
                                The first page of the stamp PDF is overlaid at its original size. Leave page range blank to stamp all pages.
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
                                            ? <div className="h-full w-full bg-fuchsia-600 animate-pulse" />
                                            : <div className="h-full bg-fuchsia-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                        }
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    {error}
                                </div>
                            )}
                            {step === Step.IDLE && (
                                <div className="flex flex-col gap-4">
                                    <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 space-y-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200">
                                        <p>Source: <strong>{sourceFile?.file.name}</strong></p>
                                        <p>Stamp: <strong>{stampFile?.file.name}</strong></p>
                                        <p>Opacity: <strong>{Math.round(opacity * 100)}%</strong></p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                                        <input
                                            type="text"
                                            value={outFileName}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())}
                                            placeholder="stamped"
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-100 dark:border-slate-700"
                                        />
                                    </div>
                                    <button
                                        onClick={startStamp}
                                        className="w-full py-3.5 rounded-xl bg-fuchsia-600 text-white font-semibold text-sm hover:bg-fuchsia-700 transition-colors shadow-sm"
                                    >
                                        Apply Stamp & Download
                                    </button>
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">Your stamped PDF will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}

                    <ToolSeoSection
                        toolPath="/tool/stamp-pdf"
                        toolName="Stamp PDF"
                        about="Stamp PDF overlays the first page of a stamp PDF file onto every page (or a selected range) of your source PDF. Use this to add branded letterheads, logos, watermark graphics, or any vector content from a PDF file — at adjustable opacity and without rasterizing content."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-fuchsia-600"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, title: 'Vector-quality stamps', description: 'Stamp content stays sharp at any zoom since it uses the PDF page as a form XObject.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-fuchsia-600"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>, title: 'Opacity control', description: 'Set stamp transparency from 5% to 100% for subtle or full overlays.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-fuchsia-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>, title: 'Page range selection', description: 'Stamp a specific range of pages or all pages in one operation.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-fuchsia-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'Secure & private', description: 'Both files are deleted immediately after processing.' },
                        ]}
                        faqs={[
                            { q: 'What is used as the stamp?', a: 'Only the first page of the stamp PDF is used. It is imported as a PDF form XObject and overlaid on each target page at its original dimensions.' },
                            { q: 'Will the stamp be scaled to fit the page?', a: 'No — the stamp is drawn at its original size starting from the lower-left corner. Design your stamp PDF at the same dimensions as the source for best results.' },
                            { q: 'Can I use a logo or letterhead?', a: 'Yes. Export your logo or letterhead as a single-page PDF and use it as the stamp file.' },
                            { q: 'Are my files stored on your servers?', a: 'Both uploaded files are deleted automatically after processing. We do not retain your documents.' },
                        ]}
                    />
                </div>
            </div>

            <div className="flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4 dark:bg-slate-800 dark:border-slate-700">
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
                        disabled={activeStep === 2 || !sourceFile || !stampFile}
                        onClick={() => setActiveStep(a => a + 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-fuchsia-600 text-white text-sm font-semibold hover:bg-fuchsia-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
