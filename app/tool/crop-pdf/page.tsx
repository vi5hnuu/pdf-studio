"use client";

import * as React from "react";
import { ChangeEvent, useState } from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { generateId } from "@/app/_utils/constants";
import { ToolsApi } from "@/app/_utils/api";
import { runToolRequest } from '@/app/_hooks/use-tool-request';
import { PageMetrics, PdfPageCanvas } from '@/app/_components/pdf-page-canvas';

interface FileData { id: string; file: File; }

enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

export default function CropPdf() {
    const [activeStep, setActiveStep] = useState(0);
    const [fileData, setFileData] = useState<FileData | null>(null);
    // The area to keep, as a fraction of the page. Margins are derived from it, so the
    // preview and the values sent can never disagree.
    const [keepBox, setKeepBox] = useState({ x: 0, y: 0, width: 1, height: 1 });
    const [metrics, setMetrics] = useState<PageMetrics | null>(null);
    const [outFileName, setOutFileName] = useState('');
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const steps = ['Select File', 'Choose Area', 'Crop'];

    /** Kept area converted to the inward margins in points the endpoint expects. */
    const margins = {
        left: Math.round(keepBox.x * (metrics?.pointWidth ?? 0)),
        top: Math.round(keepBox.y * (metrics?.pointHeight ?? 0)),
        right: Math.round((1 - keepBox.x - keepBox.width) * (metrics?.pointWidth ?? 0)),
        bottom: Math.round((1 - keepBox.y - keepBox.height) * (metrics?.pointHeight ?? 0)),
    };

    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        setFileData({ id: generateId(32, 'FILE_'), file: f });
    }

    async function startCrop() {
        if (!fileData) return;
        const body = {
            out_file_name: outFileName || 'cropped',
            margin_left: margins.left,
            margin_bottom: margins.bottom,
            margin_right: margins.right,
            margin_top: margins.top,
        };
        const formData = new FormData();
        formData.append('crop-pdf-info', new Blob([JSON.stringify(body)], { type: 'application/json' }));
        formData.append('file', fileData.file);

        await runToolRequest({
            url: ToolsApi.cropPdf,
            formData,
            fallbackFilename: 'crop-pdf.pdf',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Cropping PDF...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    return (
        <div className="flex-1 flex flex-col">
            {/* Hero */}
            <div className="bg-gradient-to-r from-lime-600 to-green-700 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/crop-pdf.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Crop PDF</h1>
                        <p className="text-sm opacity-75 mt-0.5">Crop PDF pages by setting custom margins</p>
                    </div>
                    <div className="hidden md:block text-sm opacity-60 flex-shrink-0">Step {activeStep + 1} / {steps.length}</div>
                </div>
            </div>

            {/* Stepper */}
            <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex-shrink-0 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto">
                    <ProgressStepper steps={steps} activeStepIndex={activeStep} />
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 px-6 md:px-10 py-8">
                <div className="max-w-5xl mx-auto">
                    {activeStep === 0 && (
                        <div className="space-y-4">
                            <ChooseFiles single accept={['application/pdf']} onChange={handleFile} />
                            {fileData && (
                                <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                                    Selected: <strong>{fileData.file.name}</strong> ({(fileData.file.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                            )}
                        </div>
                    )}

                    {activeStep === 1 && fileData && (
                        <div className="max-w-3xl mx-auto space-y-4">
                            {/* Drag the area to KEEP. Asking for four margins in PDF points
                                meant converting from millimetres by hand and re-running the
                                tool to see whether the crop was right. */}
                            <PdfPageCanvas
                                file={fileData.file}
                                single
                                boxes={[{ id: 'crop', page: 0, ...keepBox }]}
                                onChange={(boxes) => {
                                    const box = boxes[0];
                                    if (box) setKeepBox({ x: box.x, y: box.y, width: box.width, height: box.height });
                                }}
                                onMetrics={setMetrics}
                                boxClassName="border-lime-500 border-solid bg-lime-400/10"
                                hint="Drag to mark the area you want to keep. Everything outside it is cropped from every page."
                            />

                            <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                                Keeping {Math.round(keepBox.width * 100)}% × {Math.round(keepBox.height * 100)}% of
                                each page · margins {margins.left}/{margins.top}/{margins.right}/{margins.bottom} pt
                                (L/T/R/B)
                            </p>

                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => setKeepBox({ x: 0, y: 0, width: 1, height: 1 })}
                                    className="text-sm text-slate-500 dark:text-slate-400 underline hover:text-lime-700"
                                >
                                    Reset to the full page
                                </button>
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
                                            ? <div className="h-full w-full bg-lime-600 animate-pulse" />
                                            : <div className="h-full bg-lime-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
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
                                        <p>Margins: Left <strong>{margins.left}</strong> pt, Right <strong>{margins.right}</strong> pt, Top <strong>{margins.top}</strong> pt, Bottom <strong>{margins.bottom}</strong> pt</p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                                        <input
                                            type="text"
                                            value={outFileName}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())}
                                            placeholder="cropped"
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100 dark:border-slate-700"
                                        />
                                    </div>
                                    <button
                                        onClick={startCrop}
                                        className="w-full py-3.5 rounded-xl bg-lime-600 text-white font-semibold text-sm hover:bg-lime-700 transition-colors shadow-sm"
                                    >
                                        Crop & Download
                                    </button>
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">Your cropped PDF will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}

                    <ToolSeoSection
                        toolPath="/tool/crop-pdf"
                        toolName="Crop PDF"
                        about="PDF Studio's free Crop PDF tool lets you trim the edges of every page in your PDF by specifying custom margins in points. Perfect for removing unwanted whitespace, borders, or scan artifacts from scanned documents without re-printing."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lime-600"><path d="M6 2v14h14"/><path d="M18 22V8H4"/></svg>, title: 'Per-edge control', description: 'Set independent margins for left, right, top, and bottom edges.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lime-600"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>, title: 'All pages at once', description: 'Margins are applied uniformly to every page in one operation.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lime-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'Secure & private', description: 'Files are transferred over HTTPS and deleted after processing.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lime-600"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>, title: 'Fast & free', description: 'No account required. Results download in seconds.' },
                        ]}
                        faqs={[
                            { q: 'Do I need to work out the margins myself?', a: 'No. Drag the area you want to keep on the page preview and the margins are calculated for you, in PDF points, and shown below the preview.' },
                            { q: 'Will cropping affect the page content?', a: 'Cropping moves the page crop box inward, hiding content outside the new boundaries. Content is not permanently erased — it can be recovered by expanding the crop box again with a PDF editor.' },
                            { q: 'Can I crop only specific pages?', a: 'Currently the tool applies the same margins to every page. For per-page cropping, use a desktop PDF editor.' },
                            { q: 'Are my files stored on your servers?', a: 'Files are automatically deleted after the operation completes. We do not retain your documents.' },
                        ]}
                    />
                </div>
            </div>

            {/* Bottom action bar */}
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
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-600 text-white text-sm font-semibold hover:bg-lime-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
