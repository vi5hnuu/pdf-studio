"use client";

import * as React from "react";
import { ChangeEvent, useState } from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { generateId } from "@/app/_utils/constants";
import { ToolsApi } from "@/app/_utils/api";

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

    const steps = ['Select Files', 'Configure', 'Place'];

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

    function startPlace() {
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

        const xhr = new XMLHttpRequest();
        setError(null);
        xhr.open('POST', ToolsApi.placeImage, true);
        xhr.responseType = 'blob';
        xhr.upload.addEventListener('progress', (ev) => {
            if (!ev.lengthComputable) return;
            setStep(Step.UPLOAD); setProgress((ev.loaded / ev.total) * 100);
            if (ev.loaded >= ev.total) setStep(Step.PROCESS);
        });
        xhr.onprogress = (ev) => {
            if (!ev.lengthComputable) return;
            setStep(Step.DOWNLOAD); setProgress((ev.loaded / ev.total) * 100);
        };
        xhr.onload = () => {
            if (xhr.status !== 200) { setError('Place image failed. Please check your files and try again.'); setStep(Step.IDLE); return; }
            const disp = xhr.getResponseHeader('Content-Disposition') ?? '';
            const filename = disp.split('filename=')[1] ?? (outFileName || 'image-placed') + '.pdf';
            const url = URL.createObjectURL(xhr.response);
            const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
            URL.revokeObjectURL(url); setStep(Step.IDLE);
        };
        xhr.onerror = () => { setError('Network error. Please check your connection.'); setStep(Step.IDLE); };
        xhr.send(formData);
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Placing image...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
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

            <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex-shrink-0">
                <div className="max-w-5xl mx-auto">
                    <ProgressStepper steps={steps} activeStepIndex={activeStep} />
                </div>
            </div>

            <div className="flex-1 overflow-auto px-6 md:px-10 py-8">
                <div className="max-w-5xl mx-auto">

                    {activeStep === 0 && (
                        <div className="space-y-6 max-w-2xl mx-auto">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-700">Source PDF</p>
                                <ChooseFiles id="pdf-upload" single accept={['application/pdf']} onChange={handlePdf} />
                                {pdfFile && <p className="text-sm text-center text-slate-500">Selected: <strong>{pdfFile.file.name}</strong></p>}
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-700">Image to place <span className="text-slate-400 font-normal">(PNG, JPEG, GIF)</span></p>
                                <ChooseFiles id="image-upload" single accept={['image/png', 'image/jpeg', 'image/gif', 'image/webp']} onChange={handleImage} />
                                {imageFile && <p className="text-sm text-center text-slate-500">Selected: <strong>{imageFile.file.name}</strong></p>}
                            </div>
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="max-w-lg mx-auto space-y-6">
                            {/* Visual page preview showing image placement */}
                            <div className="relative bg-white border-2 border-slate-200 rounded-2xl overflow-hidden" style={{ paddingBottom: '141%' }}>
                                <div className="absolute inset-0 bg-slate-50 flex items-start justify-start">
                                    <div
                                        className="absolute bg-teal-500/20 border-2 border-dashed border-teal-500 rounded flex items-center justify-center"
                                        style={{
                                            left: `${config.xFrac * 100}%`,
                                            top: `${config.yFrac * 100}%`,
                                            width: `${config.widthFrac * 100}%`,
                                            height: `${config.heightFrac * 100}%`,
                                        }}
                                    >
                                        <span className="text-teal-700 text-[10px] font-semibold opacity-80 truncate px-1">Image</span>
                                    </div>
                                </div>
                                <span className="absolute bottom-2 right-3 text-xs text-slate-400 pointer-events-none">Page preview</span>
                            </div>

                            {/* Page number */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-700">
                                    Target page <span className="text-slate-400 font-normal">(0-indexed)</span>
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={config.page}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => upd('page', Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                                />
                            </div>

                            {/* Position sliders */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-slate-700">
                                        X position <span className="text-teal-600 font-semibold">({Math.round(config.xFrac * 100)}%)</span>
                                    </label>
                                    <input type="range" min={0} max={0.99} step={0.01} value={config.xFrac}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => upd('xFrac', parseFloat(e.target.value))}
                                        className="accent-teal-600" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-slate-700">
                                        Y position <span className="text-teal-600 font-semibold">({Math.round(config.yFrac * 100)}%)</span>
                                    </label>
                                    <input type="range" min={0} max={0.99} step={0.01} value={config.yFrac}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => upd('yFrac', parseFloat(e.target.value))}
                                        className="accent-teal-600" />
                                </div>
                            </div>

                            {/* Size sliders */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-slate-700">
                                        Width <span className="text-teal-600 font-semibold">({Math.round(config.widthFrac * 100)}%)</span>
                                    </label>
                                    <input type="range" min={0.01} max={1} step={0.01} value={config.widthFrac}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => upd('widthFrac', parseFloat(e.target.value))}
                                        className="accent-teal-600" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-slate-700">
                                        Height <span className="text-teal-600 font-semibold">({Math.round(config.heightFrac * 100)}%)</span>
                                    </label>
                                    <input type="range" min={0.01} max={1} step={0.01} value={config.heightFrac}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => upd('heightFrac', parseFloat(e.target.value))}
                                        className="accent-teal-600" />
                                </div>
                            </div>

                            <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-xs text-teal-800">
                                All values are fractions of the page size (0% = left/top edge, 100% = right/bottom edge). The preview above shows approximate placement.
                            </div>
                        </div>
                    )}

                    {activeStep === 2 && (
                        <div className="max-w-md mx-auto flex flex-col gap-6 py-8">
                            {step !== Step.IDLE && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-slate-700">{statusText}</span>
                                        {step !== Step.PROCESS && <span className="text-slate-400 tabular-nums">{Math.round(progress)}%</span>}
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        {step === Step.PROCESS
                                            ? <div className="h-full w-full bg-teal-500 animate-pulse" />
                                            : <div className="h-full bg-teal-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
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
                                    <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 space-y-1">
                                        <p>PDF: <strong>{pdfFile?.file.name}</strong></p>
                                        <p>Image: <strong>{imageFile?.file.name}</strong></p>
                                        <p>Page: <strong>{config.page}</strong> · Position: <strong>({Math.round(config.xFrac * 100)}%, {Math.round(config.yFrac * 100)}%)</strong></p>
                                        <p>Size: <strong>{Math.round(config.widthFrac * 100)}% × {Math.round(config.heightFrac * 100)}%</strong></p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700">Output file name</label>
                                        <input type="text" value={outFileName} onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())}
                                            placeholder="image-placed"
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50" />
                                    </div>
                                    <button onClick={startPlace}
                                        className="w-full py-3.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 transition-colors shadow-sm">
                                        Place Image & Download
                                    </button>
                                    <p className="text-center text-xs text-slate-400">Your modified PDF will download automatically</p>
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
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, title: 'Any page', description: 'Target any page in the PDF by its 0-based index.' },
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

            <div className="flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        disabled={activeStep === 0}
                        onClick={() => setActiveStep(a => a - 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                        Back
                    </button>
                    <span className="text-xs text-slate-400">{activeStep + 1} / {steps.length}</span>
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
