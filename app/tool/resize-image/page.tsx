"use client";
import * as React from "react";
import { ChangeEvent, useState } from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { generateId } from "@/app/_utils/constants";
import { ToolsApi } from "@/app/_utils/api";
import { runToolRequest } from '@/app/_hooks/use-tool-request';
import { ImagePreview } from '@/app/_components/image-preview';
import { drawResized } from '@/app/_utils/image-ops';
import { ToolCostBadge } from '@/app/_components/tool-cost-badge';
import { useToolStep } from '@/app/_hooks/use-tool-step';

interface FileData { id: string; file: File; }
enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

export default function ResizeImage() {
    const steps = ['Select Image', 'Set Dimensions', 'Resize & Download'];

    // Mirrored into the URL so the browser Back button steps back rather than
    // leaving the tool and losing the file.
    const [activeStep, setActiveStep] = useToolStep(steps.length);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
    const [outFileName, setOutFileName] = useState('');
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        setFileData({ id: generateId(32, 'FILE_'), file: f });
    }

    async function startResize() {
        if (!fileData) return;
        const w = parseInt(width, 10) || undefined;
        const h = parseInt(height, 10) || undefined;
        if (!w && !h) { setError('Enter at least one dimension (width or height).'); return; }
        const body: Record<string, unknown> = {
            out_file_name: outFileName || 'resized',
            maintain_aspect_ratio: maintainAspectRatio,
        };
        if (w) body.width = w;
        if (h) body.height = h;

        const formData = new FormData();
        formData.append('resize-image-info', new Blob([JSON.stringify(body)], { type: 'application/json' }));
        formData.append('file', fileData.file);
        await runToolRequest({
            url: ToolsApi.resizeImage,
            formData,
            fallbackFilename: 'resize-image.png',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Resizing image...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    return (
        <div className="flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/resize-image.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Resize Image</h1>
                        <p className="text-sm opacity-75 mt-0.5">Change image dimensions to exact pixel values</p>
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
                        <div className="space-y-4 max-w-2xl mx-auto">
                            <ChooseFiles single accept={['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/gif']} onChange={handleFile} />
                            {fileData && <p className="text-sm text-center text-slate-500 dark:text-slate-400">Selected: <strong>{fileData.file.name}</strong> ({(fileData.file.size / 1024).toFixed(0)} KB)</p>}
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="max-w-sm mx-auto space-y-6 py-4">
                            {fileData && (
                                <ImagePreview
                                    file={fileData.file}
                                    approximate
                                    caption={`Output ${parseInt(width, 10) || 'auto'} \u00D7 ${parseInt(height, 10) || 'auto'} px`}
                                    draw={(canvas, image) =>
                                        drawResized(canvas, image,
                                            parseInt(width, 10) || undefined,
                                            parseInt(height, 10) || undefined)}
                                />
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Width <span className="text-slate-400 font-normal dark:text-slate-500">(px)</span></label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={width}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setWidth(e.target.value)}
                                        placeholder="e.g. 1920"
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 dark:border-slate-700"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Height <span className="text-slate-400 font-normal dark:text-slate-500">(px)</span></label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={height}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setHeight(e.target.value)}
                                        placeholder="e.g. 1080"
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 dark:border-slate-700"
                                    />
                                </div>
                            </div>

                            {/* Aspect ratio toggle */}
                            <button
                                type="button"
                                onClick={() => setMaintainAspectRatio(v => !v)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${maintainAspectRatio ? 'border-teal-500 bg-teal-50' : 'border-slate-200'}`}
                            >
                                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${maintainAspectRatio ? 'bg-teal-500' : 'bg-slate-200'}`}>
                                    {maintainAspectRatio && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                    )}
                                </div>
                                <div className="text-left">
                                    <p className={`text-sm font-medium ${maintainAspectRatio ? 'text-teal-700' : 'text-slate-600'}`}>Maintain aspect ratio</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">If enabled, set only one dimension — the other is calculated proportionally</p>
                                </div>
                            </button>

                            <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-xs text-teal-800">
                                {maintainAspectRatio
                                    ? 'Fill in one dimension and leave the other blank. The missing dimension will be computed to maintain the original aspect ratio.'
                                    : 'Both dimensions are required. The image will be stretched to exactly fit the specified size.'}
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
                                            ? <div className="h-full w-full bg-teal-500 animate-pulse" />
                                            : <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
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
                                    <ToolCostBadge toolId="resize-image" file={fileData?.file} />
                                    <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 space-y-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200">
                                        <p>Image: <strong>{fileData?.file.name}</strong></p>
                                        <p>Target: <strong>{width || '—'} × {height || '—'} px</strong></p>
                                        <p>Aspect ratio: <strong>{maintainAspectRatio ? 'Maintained' : 'Stretched'}</strong></p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                                        <input type="text" value={outFileName} onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())}
                                            placeholder="resized"
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 dark:border-slate-700" />
                                    </div>
                                    <button onClick={startResize}
                                        className="w-full py-3.5 rounded-xl bg-teal-500 text-white font-semibold text-sm hover:bg-teal-600 transition-colors shadow-sm">
                                        Resize & Download
                                    </button>
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">Your resized image will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}

                    <ToolSeoSection
                        toolPath="/tool/resize-image"
                        toolName="Resize Image"
                        about="Resize Image scales your image to the specified pixel dimensions. Enable aspect-ratio lock to specify only one dimension and have the other computed automatically, preventing distortion."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>, title: 'Exact pixel control', description: 'Specify exact width and/or height in pixels.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>, title: 'Aspect ratio lock', description: 'Provide one dimension to scale proportionally without distortion.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>, title: 'All common formats', description: 'Accepts JPEG, PNG, WebP, BMP, and GIF images.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'No data retention', description: 'Files are deleted from our servers after processing.' },
                        ]}
                        faqs={[
                            { q: 'Can I resize to a specific width without distorting the height?', a: 'Yes — enable "Maintain aspect ratio" and enter only the width. The height will be computed automatically to preserve the original proportions.' },
                            { q: 'What format is the output?', a: 'The output format mirrors the input format where possible. JPEG inputs produce JPEG output; PNG inputs produce PNG output.' },
                            { q: 'Will resizing to a larger size blur the image?', a: 'Upscaling (making the image larger than the original) uses bicubic interpolation which can appear slightly soft. Downscaling generally looks sharp.' },
                            { q: 'Are my files stored?', a: 'Files are deleted immediately after processing.' },
                        ]}
                    />
                </div>
            </div>

            <div className="sticky bottom-0 z-30 flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button disabled={activeStep === 0} onClick={() => setActiveStep(a => a - 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                        Back
                    </button>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{activeStep + 1} / {steps.length}</span>
                    <button disabled={activeStep === 2 || !fileData} onClick={() => setActiveStep(a => a + 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
