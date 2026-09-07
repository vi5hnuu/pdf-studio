"use client";

import * as React from "react";
import { ChangeEvent, useEffect, useState } from "react";
import { Document, Page } from 'react-pdf';
import { PdfPagePreview } from '@/app/_components/pdf-page-preview';
import { ChooseFiles } from "@/app/_components/choose_files";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { generateId } from "@/app/_utils/constants";
import { ToolsApi } from "@/app/_utils/api";
import { runToolRequest } from '@/app/_hooks/use-tool-request';
import { PageRangeField } from '@/app/_components/page-range-field';
import { ToolCostBadge } from '@/app/_components/tool-cost-badge';
import { useToolStep } from '@/app/_hooks/use-tool-step';
import { Box, PageMetrics, PdfPageCanvas } from '@/app/_components/pdf-page-canvas';

interface FileData { id: string; file: File; }

enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

export default function StampPdf() {
    const steps = ['Select Files', 'Configure', 'Stamp'];

    // Mirrored into the URL so the browser Back button steps back rather than
    // leaving the tool and losing the file.
    const [activeStep, setActiveStep] = useToolStep(steps.length);
    const [sourceFile, setSourceFile] = useState<FileData | null>(null);
    const [stampFile, setStampFile] = useState<FileData | null>(null);
    const [opacity, setOpacity] = useState(1.0);
    /**
     * Where the stamp goes. "natural" is the original behaviour — drawn at its own size at the
     * page origin — and sends no box at all, so nothing changes for anyone who does not ask.
     */
    const [placing, setPlacing] = useState<'natural' | 'custom'>('natural');
    const [box, setBox] = useState<Box>({ id: 'stamp', page: 0, x: 0.1, y: 0.1, width: 0.4, height: 0.2 });
    // 0-indexed selection from the thumbnail picker; empty means every page.
    const [pages, setPages] = useState<number[]>([]);
    const [outFileName, setOutFileName] = useState('');
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);


    /** True for an image stamp; a PDF stamp is previewed and measured differently. */
    const stampIsImage = !!stampFile && stampFile.file.type.startsWith('image/');

    // Object URL for the stamp preview, revoked when the stamp changes so picking repeatedly
    // does not leak.
    const [stampPreview, setStampPreview] = useState<string | null>(null);
    /** The stamp's own width/height, so resizing its box cannot squash it. */
    const [stampRatio, setStampRatio] = useState<number | null>(null);
    const [metrics, setMetrics] = useState<PageMetrics | null>(null);

    useEffect(() => {
        setStampRatio(null);
        if (!stampFile || !stampFile.file.type.startsWith('image/')) {
            setStampPreview(null);
            return;
        }
        const url = URL.createObjectURL(stampFile.file);
        setStampPreview(url);

        const probe = new Image();
        probe.onload = () => setStampRatio(probe.naturalHeight > 0
            ? probe.naturalWidth / probe.naturalHeight
            : null);
        probe.src = url;

        return () => URL.revokeObjectURL(url);
    }, [stampFile]);

    // The box is a fraction of the page, so the page's own proportions have to be divided out
    // before the stamp's ratio means anything in box units.
    const boxAspect = stampRatio && metrics && metrics.pointWidth > 0
        ? stampRatio * (metrics.pointHeight / metrics.pointWidth)
        : undefined;

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
        // The picker is 0-indexed, which is what the endpoint takes.
        if (pages.length > 0) {
            body.from_page = pages[0];
            body.to_page = pages[pages.length - 1];
        }
        // Sent only when a position was actually chosen; with no box the API draws the stamp at
        // its natural size, which is what this tool has always done.
        if (placing === 'custom') {
            body.x_frac = box.x;
            body.y_frac = box.y;
            body.width_frac = box.width;
            body.height_frac = box.height;
        }

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
            <div className="bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white px-4 md:px-8 py-2.5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white/20 rounded-sm flex items-center justify-center flex-shrink-0">
                        <img src="/tools/stamp-pdf.svg" alt="" className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base font-semibold leading-tight">Stamp PDF</h1>
                        <p className="text-xs opacity-75 leading-tight">Overlay a logo, signature or stamp onto the pages you choose</p>
                    </div>
                    <div className="hidden md:block text-xs opacity-60 flex-shrink-0">Step {activeStep + 1} / {steps.length}</div>
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
                        <div className="space-y-6 max-w-2xl mx-auto">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Source PDF <span className="text-slate-400 font-normal dark:text-slate-500">(the file to stamp)</span></p>
                                <ChooseFiles id="source-file-upload" single accept={['application/pdf']} onChange={handleSource} />
                                {sourceFile && <p className="text-sm text-center text-slate-500 dark:text-slate-400">Selected: <strong>{sourceFile.file.name}</strong></p>}
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Stamp <span className="text-slate-400 font-normal dark:text-slate-500">(an image, or a PDF whose first page is used)</span></p>
                                <ChooseFiles id="stamp-file-upload" single accept={['image/*', 'application/pdf']} onChange={handleStamp} />
                                {stampFile && <p className="text-sm text-center text-slate-500 dark:text-slate-400">Selected: <strong>{stampFile.file.name}</strong></p>}
                            </div>
                        </div>
                    )}

                    {activeStep === 1 && (
                        // Stamping is a purely visual operation, but it was configured blind:
                        // you set an opacity and only saw where the stamp landed, and whether
                        // it obscured the page, after downloading the result.
                        <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
                            {sourceFile && stampFile && (
                                <div className="lg:sticky lg:top-4 min-w-0">
                                    {placing === 'custom' ? (
                                        // Positioning happens on the real page at the real size,
                                        // rather than being described in numbers no one can judge.
                                        <PdfPageCanvas
                                            file={sourceFile.file}
                                            single
                                            boxes={[box]}
                                            onChange={(boxes) => { if (boxes[0]) setBox(boxes[0]); }}
                                            onMetrics={setMetrics}
                                            lockAspect={boxAspect}
                                            boxClassName="border-fuchsia-500 border-dashed bg-fuchsia-500/10"
                                            hint="Drag the stamp to move it, or its corner to resize. The same position is used on every page in the range."
                                            renderBoxContent={() => (
                                                <div className="w-full h-full" style={{ opacity }}>
                                                    {stampIsImage ? (
                                                        <img src={stampPreview ?? undefined} alt=""
                                                             className="w-full h-full object-contain pointer-events-none" />
                                                    ) : (
                                                        <div className="w-full h-full border border-fuchsia-400/60 bg-fuchsia-100/40
                                                                        flex items-center justify-center text-[10px]
                                                                        text-fuchsia-700 dark:text-fuchsia-300 pointer-events-none">
                                                            Stamp
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        />
                                    ) : (
                                        <PdfPagePreview
                                            file={sourceFile.file}
                                            caption="Page 1 with the stamp overlaid, at the chosen opacity"
                                            overlay={(renderedWidth) => (
                                                <div className="absolute inset-0 pointer-events-none flex items-start justify-start"
                                                     style={{ opacity }}>
                                                    {stampIsImage ? (
                                                        <img src={stampPreview ?? undefined} alt="" />
                                                    ) : (
                                                        <Document
                                                            file={stampFile.file}
                                                            loading={null}
                                                            className="hide-text-layer hide-annotation-layer"
                                                        >
                                                            <Page
                                                                pageNumber={1}
                                                                width={renderedWidth}
                                                                renderTextLayer={false}
                                                                renderAnnotationLayer={false}
                                                            />
                                                        </Document>
                                                    )}
                                                </div>
                                            )}
                                        />
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col gap-5 min-w-0">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    Opacity — <span className="text-fuchsia-600 font-semibold dark:text-fuchsia-400">{Math.round(opacity * 100)}%</span>
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
                            {sourceFile && (
                                <PageRangeField
                                    file={sourceFile.file}
                                    selected={pages}
                                    onChange={setPages}
                                    accentRing="ring-fuchsia-500 border-fuchsia-500"
                                />
                            )}
                            <div className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Position</span>
                                <div className="flex gap-2">
                                    {([
                                        { value: 'natural', label: 'Original size' },
                                        { value: 'custom', label: 'Place it myself' },
                                    ] as const).map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setPlacing(option.value)}
                                            aria-pressed={placing === option.value}
                                            className={`flex-1 px-3 py-1.5 rounded-sm border text-sm font-medium transition-colors ${
                                                placing === option.value
                                                    ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300'
                                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                    {placing === 'custom'
                                        ? `Drag the stamp on the page. It keeps its proportions, and covers ${Math.round(box.width * 100)}% × ${Math.round(box.height * 100)}% of the page.`
                                        : 'The stamp is drawn at its own size in the top-left corner.'}
                                </p>
                            </div>

                            <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-sm px-4 py-3 text-xs text-fuchsia-800 dark:bg-fuchsia-900/20 dark:border-fuchsia-800 dark:text-fuchsia-300">
                                Use an image (PNG with transparency works well for a logo or signature) or a PDF, whose first page becomes the stamp. Leave the page range blank to stamp every page.
                            </div>
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
                                    <ToolCostBadge toolId="stamp-pdf" file={sourceFile?.file} />
                                    <div className="bg-slate-50 rounded-sm border border-slate-200 px-4 py-3 text-sm text-slate-700 space-y-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200">
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
                                            className="w-full px-2.5 py-1.5 rounded-sm border border-slate-200 text-sm outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-100 dark:border-slate-700"
                                        />
                                    </div>
                                    <button
                                        onClick={startStamp}
                                        className="w-full py-2.5 rounded-sm bg-fuchsia-600 text-white font-semibold text-sm hover:bg-fuchsia-700 transition-colors shadow-sm"
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
                        about="Stamp PDF overlays an image or a one-page PDF onto every page of your document, or only the pages you choose. Use it for a logo, a scanned signature, a branded letterhead or an approval mark — dragged into position on the page itself, at whatever opacity you want, and without rasterizing the document underneath."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-fuchsia-600 dark:text-fuchsia-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, title: 'Images or PDFs', description: 'Use a PNG or JPG logo, or a one-page PDF that stays vector-sharp at any zoom.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-fuchsia-600 dark:text-fuchsia-400"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>, title: 'Opacity control', description: 'Set stamp transparency from 5% to 100% for subtle or full overlays.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-fuchsia-600 dark:text-fuchsia-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>, title: 'Place it where you want', description: 'Drag the stamp into position on the real page, over any range of pages, with its proportions kept.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-fuchsia-600 dark:text-fuchsia-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'Secure & private', description: 'Both files are deleted immediately after processing.' },
                        ]}
                        faqs={[
                            { q: 'What can I use as the stamp?', a: 'An image — PNG, JPG, GIF, BMP or WebP — or a PDF, in which case its first page is used. A PNG with a transparent background is usually the best choice for a logo or signature.' },
                            { q: 'Can I choose where the stamp goes?', a: 'Yes. Choose "Place it myself" and drag the stamp on the page preview to set its position and size. It keeps its own proportions, so it can never come out squashed. Leave it on "Original size" to draw it at its natural dimensions instead.' },
                            { q: 'Can I add a signature to every page?', a: 'Yes. Upload the signature as an image, position it once, and leave the page range blank to apply it throughout the document.' },
                            { q: 'Are my files stored on your servers?', a: 'Both uploaded files are deleted automatically after processing. We do not retain your documents.' },
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
                        disabled={activeStep === 2 || !sourceFile || !stampFile}
                        onClick={() => setActiveStep(a => a + 1)}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-fuchsia-600 text-white text-sm font-semibold hover:bg-fuchsia-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
