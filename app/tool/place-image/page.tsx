"use client";

import * as React from "react";
import { ChangeEvent, useEffect, useState } from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { generateId } from "@/app/_utils/constants";
import { ToolsApi } from "@/app/_utils/api";
import { runToolRequest } from '@/app/_hooks/use-tool-request';
import { PdfPageCanvas } from '@/app/_components/pdf-page-canvas';
import { ToolCostBadge } from '@/app/_components/tool-cost-badge';

interface FileData { id: string; file: File; }

enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

interface PlaceConfig {
    page: number;
    xFrac: number;
    yFrac: number;
    widthFrac: number;
    heightFrac: number;
}

export default function PlaceImage() {
    const [activeStep, setActiveStep] = useState(0);
    const [pdfFile, setPdfFile] = useState<FileData | null>(null);
    const [imageFile, setImageFile] = useState<FileData | null>(null);
    const [config, setConfig] = useState<PlaceConfig>({ page: 0, xFrac: 0.1, yFrac: 0.1, widthFrac: 0.5, heightFrac: 0.3 });
    const [outFileName, setOutFileName] = useState('');
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const steps = ['Select Files', 'Position', 'Place'];

    // Object URL for the placement preview; revoked when the image changes or on unmount so
    // repeatedly picking images does not leak.
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    useEffect(() => {
        if (!imageFile) {
            setImagePreview(null);
            return;
        }
        const url = URL.createObjectURL(imageFile.file);
        setImagePreview(url);
        return () => URL.revokeObjectURL(url);
    }, [imageFile]);

    function upd<K extends keyof PlaceConfig>(key: K, value: PlaceConfig[K]) {
        setConfig(c => ({ ...c, [key]: value }));
    }

    function handlePdf(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (f) setPdfFile({ id: generateId(32, 'FILE_'), file: f });
    }

    function handleImage(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (f) setImageFile({ id: generateId(32, 'FILE_'), file: f });
    }

    async function startPlace() {
        if (!pdfFile || !imageFile) return;
        const body = {
            out_file_name: outFileName || 'image-placed',
            page: config.page,
            x_frac: config.xFrac,
            y_frac: config.yFrac,
            width_frac: config.widthFrac,
            height_frac: config.heightFrac,
        };
        const formData = new FormData();
        formData.append('place-image-info', new Blob([JSON.stringify(body)], { type: 'application/json' }));
        formData.append('file', pdfFile.file);
        formData.append('image', imageFile.file);

        await runToolRequest({
            url: ToolsApi.placeImage,
            formData,
            fallbackFilename: 'place-image.pdf',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Placing image...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    return (
        <div className="flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-teal-600 to-green-700 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/place-image.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Place Image</h1>
                        <p className="text-sm opacity-75 mt-0.5">Insert an image at a precise position on any PDF page</p>
                    </div>
                    <div className="hidden md:block text-sm opacity-60">Step {activeStep + 1} / {steps.length}</div>
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
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Source PDF</p>
                                <ChooseFiles id="pdf-upload" single accept={['application/pdf']} onChange={handlePdf} />
                                {pdfFile && <p className="text-sm text-center text-slate-500 dark:text-slate-400">Selected: <strong>{pdfFile.file.name}</strong></p>}
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Image to place <span className="text-slate-400 font-normal dark:text-slate-500">(PNG, JPEG, GIF)</span></p>
                                <ChooseFiles id="image-upload" single accept={['image/png', 'image/jpeg', 'image/gif', 'image/webp']} onChange={handleImage} />
                                {imageFile && <p className="text-sm text-center text-slate-500 dark:text-slate-400">Selected: <strong>{imageFile.file.name}</strong></p>}
                            </div>
                        </div>
                    )}

                    {activeStep === 1 && pdfFile && imageFile && (
                        <div className="max-w-3xl mx-auto space-y-4">
                            {/* The image is positioned on the real page, at the real size it
                                will occupy. The previous version drew a dashed box on a blank
                                rectangle, so you were placing it against nothing. */}
                            <PdfPageCanvas
                                file={pdfFile.file}
                                single
                                boxes={[{
                                    id: 'placement',
                                    page: config.page,
                                    x: config.xFrac,
                                    y: config.yFrac,
                                    width: config.widthFrac,
                                    height: config.heightFrac,
                                }]}
                                onChange={(boxes) => {
                                    const box = boxes[0];
                                    if (!box) return;
                                    setConfig({
                                        page: box.page,
                                        xFrac: box.x,
                                        yFrac: box.y,
                                        widthFrac: box.width,
                                        heightFrac: box.height,
                                    });
                                }}
                                boxClassName="border-teal-500 border-dashed bg-teal-500/10"
                                hint="Drag the image to move it, or its corner to resize. Use the arrows to place it on a different page."
                                renderBoxContent={() => (
                                    <img
                                        src={imagePreview ?? undefined}
                                        alt=""
                                        className="w-full h-full object-fill pointer-events-none"
                                    />
                                )}
                            />

                            <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                                Page {config.page + 1} · {Math.round(config.widthFrac * 100)}% ×{' '}
                                {Math.round(config.heightFrac * 100)}% of the page
                            </p>
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
                                            ? <div className="h-full w-full bg-teal-500 animate-pulse" />
                                            : <div className="h-full bg-teal-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                        }
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
                                    <ToolCostBadge toolId="place-image" file={pdfFile?.file} />
                                    <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 space-y-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200">
                                        <p>PDF: <strong>{pdfFile?.file.name}</strong></p>
                                        <p>Image: <strong>{imageFile?.file.name}</strong></p>
                                        <p>Page: <strong>{config.page}</strong> · Position: <strong>({Math.round(config.xFrac * 100)}%, {Math.round(config.yFrac * 100)}%)</strong></p>
                                        <p>Size: <strong>{Math.round(config.widthFrac * 100)}% × {Math.round(config.heightFrac * 100)}%</strong></p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                                        <input type="text" value={outFileName} onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())}
                                            placeholder="image-placed"
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 dark:border-slate-700" />
                                    </div>
                                    <button onClick={startPlace}
                                        className="w-full py-3.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 transition-colors shadow-sm">
                                        Place Image & Download
                                    </button>
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">Your modified PDF will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}

                    <ToolSeoSection
                        toolPath="/tool/place-image"
                        toolName="Place Image"
                        about="Place any image at a user-defined position on a specific PDF page. Specify the target page and the image's position and size as fractions of the page dimensions, so placement is consistent across any page size."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600"><path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5z"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>, title: 'Precise placement', description: 'Set image position and size as page fractions for resolution-independent accuracy.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>, title: 'Visual preview', description: 'See a real-time layout preview before processing to confirm placement.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, title: 'Any page', description: 'Move between pages in the preview and drop the image on the one you want.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'Secure processing', description: 'Files are processed in memory and never stored on our servers.' },
                        ]}
                        faqs={[
                            { q: 'What image formats are supported?', a: 'PNG, JPEG, GIF, and WebP images are supported. The image is embedded directly into the PDF page.' },
                            { q: 'How do position fractions work?', a: 'X=0, Y=0 is the top-left corner of the page. X=1, Y=1 is the bottom-right. So x_frac=0.5, y_frac=0.5 places the image\'s top-left corner at the center of the page.' },
                            { q: 'Will the image be scaled to fit?', a: 'The image is scaled to the width and height you specify (as fractions of the page). Aspect ratio is not automatically preserved — adjust width and height independently.' },
                            { q: 'Can I place images on multiple pages?', a: 'Currently one image placement per operation. Run the tool again on the output to add more images.' },
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
                        disabled={activeStep === 2 || !pdfFile || !imageFile}
                        onClick={() => setActiveStep(a => a + 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
