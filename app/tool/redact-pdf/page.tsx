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

interface Region {
    id: string;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

function newRegion(): Region {
    return { id: generateId(8, 'R_'), page: 0, x: 100, y: 100, width: 200, height: 30 };
}

export default function RedactPdf() {
    const [activeStep, setActiveStep] = useState(0);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [regions, setRegions] = useState<Region[]>([newRegion()]);
    const [outFileName, setOutFileName] = useState('');
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const steps = ['Select File', 'Mark Regions', 'Redact'];

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (f) setFileData({ id: generateId(32, 'FILE_'), file: f });
    }

    function addRegion() {
        setRegions(r => [...r, newRegion()]);
    }

    function removeRegion(id: string) {
        setRegions(r => r.filter(x => x.id !== id));
    }

    function updateRegion(id: string, field: keyof Omit<Region, 'id'>, value: number) {
        setRegions(r => r.map(x => x.id === id ? { ...x, [field]: value } : x));
    }

    async function startRedact() {
        if (!fileData || regions.length === 0) return;
        const body = {
            out_file_name: outFileName || 'redacted',
            regions: regions.map(({ page, x, y, width, height }) => ({ page, x, y, width, height })),
        };
        const formData = new FormData();
        formData.append('redact-pdf-info', new Blob([JSON.stringify(body)], { type: 'application/json' }));
        formData.append('file', fileData.file);

        await runToolRequest({
            url: ToolsApi.redactPdf,
            formData,
            fallbackFilename: 'redact-pdf.pdf',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Redacting...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';
    const canProceed = activeStep === 0 ? !!fileData : activeStep === 1 ? regions.length > 0 : false;

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-zinc-700 to-slate-800 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/redact-pdf.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Redact PDF</h1>
                        <p className="text-sm opacity-75 mt-0.5">Permanently black out sensitive regions on PDF pages</p>
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
                        <div className="space-y-4 max-w-2xl mx-auto">
                            <ChooseFiles single accept={['application/pdf']} onChange={handleFile} />
                            {fileData && <p className="text-sm text-center text-slate-500 dark:text-slate-400">Selected: <strong>{fileData.file.name}</strong></p>}
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="max-w-2xl mx-auto space-y-5">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 leading-relaxed">
                                <strong>Coordinate system:</strong> X and Y are in PDF points from the top-left corner of the page. A4 pages are approximately 595 × 842 pt; US Letter is approximately 612 × 792 pt. Use your PDF viewer's ruler or page info to find exact coordinates.
                            </div>

                            <div className="space-y-4">
                                {regions.map((region, idx) => (
                                    <div key={region.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 dark:bg-slate-800 dark:border-slate-700">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Region {idx + 1}</span>
                                            {regions.length > 1 && (
                                                <button type="button" onClick={() => removeRegion(region.id)}
                                                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Page <span className="text-slate-400 dark:text-slate-500">(0-indexed)</span></label>
                                                <input type="number" min={0} value={region.page}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateRegion(region.id, 'page', Math.max(0, parseInt(e.target.value) || 0))}
                                                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100 dark:border-slate-700" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">X <span className="text-slate-400 dark:text-slate-500">(pt)</span></label>
                                                <input type="number" min={0} value={region.x}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateRegion(region.id, 'x', parseFloat(e.target.value) || 0)}
                                                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100 dark:border-slate-700" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Y <span className="text-slate-400 dark:text-slate-500">(pt)</span></label>
                                                <input type="number" min={0} value={region.y}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateRegion(region.id, 'y', parseFloat(e.target.value) || 0)}
                                                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100 dark:border-slate-700" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Width <span className="text-slate-400 dark:text-slate-500">(pt)</span></label>
                                                <input type="number" min={1} value={region.width}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateRegion(region.id, 'width', Math.max(1, parseFloat(e.target.value) || 1))}
                                                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100 dark:border-slate-700" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Height <span className="text-slate-400 dark:text-slate-500">(pt)</span></label>
                                                <input type="number" min={1} value={region.height}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateRegion(region.id, 'height', Math.max(1, parseFloat(e.target.value) || 1))}
                                                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100 dark:border-slate-700" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button type="button" onClick={addRegion}
                                className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 text-sm font-medium hover:border-zinc-400 hover:text-zinc-700 transition-colors dark:border-slate-600 dark:text-slate-400">
                                + Add another region
                            </button>
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
                                            ? <div className="h-full w-full bg-zinc-700 animate-pulse" />
                                            : <div className="h-full bg-zinc-700 rounded-full transition-all" style={{ width: `${progress}%` }} />
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
                                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800 flex gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                        Redaction is permanent and cannot be undone. The blacked-out content is destroyed.
                                    </div>
                                    <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 space-y-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200">
                                        <p>File: <strong>{fileData?.file.name}</strong></p>
                                        <p>Regions: <strong>{regions.length}</strong></p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                                        <input type="text" value={outFileName} onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())}
                                            placeholder="redacted"
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100 dark:border-slate-700" />
                                    </div>
                                    <button onClick={startRedact}
                                        className="w-full py-3.5 rounded-xl bg-zinc-800 text-white font-semibold text-sm hover:bg-zinc-900 transition-colors shadow-sm">
                                        Redact & Download
                                    </button>
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">Your redacted PDF will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}

                    <ToolSeoSection
                        toolPath="/tool/redact-pdf"
                        toolName="Redact PDF"
                        about="Permanently remove sensitive content from PDF documents by blacking out rectangular regions on any page. Redaction destroys the underlying content — unlike a black annotation, the data cannot be recovered after processing."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-700"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>, title: 'True redaction', description: 'Content is permanently destroyed, not just covered — the data cannot be extracted.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-700"><path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>, title: 'Multiple regions', description: 'Mark as many redaction rectangles as needed across different pages in one pass.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-700"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, title: 'Any page', description: 'Redact regions on any page by specifying the 0-based page index.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-700"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'Secure processing', description: 'Files are processed in memory and never stored on our servers.' },
                        ]}
                        faqs={[
                            { q: 'Is the redaction really permanent?', a: 'Yes. The redaction burns black rectangles into the page content using PDF operators, overwriting the underlying data. The original content cannot be recovered from the output file.' },
                            { q: 'How do I find the coordinates of the area I want to redact?', a: 'Open the PDF in Adobe Acrobat Reader, enable the cursor position overlay, and note the X/Y coordinates in points. A4 pages are 595 × 842 pt; US Letter is 612 × 792 pt. The origin (0,0) is at the top-left.' },
                            { q: 'Can I redact text that appears on multiple pages at once?', a: 'Each region targets a specific page. Add one region per page for text that repeats (e.g., a footer). There is no automatic search-and-redact in this tool.' },
                            { q: 'What is the difference between Redact and Watermark?', a: 'A watermark overlays text on the page but does not remove content. Redaction replaces a rectangular area with solid black, permanently destroying any text or images underneath.' },
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
                        disabled={activeStep === 2 || !canProceed}
                        onClick={() => setActiveStep(a => a + 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 text-white text-sm font-semibold hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
