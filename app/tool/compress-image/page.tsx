"use client";
import * as React from "react";
import { ChangeEvent, useEffect, useState } from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { generateId } from "@/app/_utils/constants";
import { ToolsApi } from "@/app/_utils/api";
import { runToolRequest } from '@/app/_hooks/use-tool-request';

interface FileData { id: string; file: File; }
enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

export default function CompressImage() {
    const [activeStep, setActiveStep] = useState(0);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [quality, setQuality] = useState(75);
    const [outFileName, setOutFileName] = useState('');
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Re-encodes at the chosen quality so the size trade-off is visible before running the
    // tool; the browser's JPEG encoder is not byte-identical to the server's, so the figure
    // is labelled an estimate.
    const [estimatedSize, setEstimatedSize] = useState<string | null>(null);
    useEffect(() => {
        if (!fileData) { setEstimatedSize(null); return; }
        let cancelled = false;
        const url = URL.createObjectURL(fileData.file);
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if (!cancelled && blob) {
                    setEstimatedSize(blob.size < 1024 * 1024
                        ? `${Math.round(blob.size / 1024)} KB`
                        : `${(blob.size / (1024 * 1024)).toFixed(2)} MB`);
                }
            }, 'image/jpeg', quality / 100);
        };
        img.src = url;
        return () => { cancelled = true; URL.revokeObjectURL(url); };
    }, [fileData, quality]);
    const steps = ['Select Image', 'Set Quality', 'Compress & Download'];

    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        setFileData({ id: generateId(32, 'FILE_'), file: f });
    }

    async function startCompress() {
        if (!fileData) return;
        const formData = new FormData();
        formData.append('compress-image-info', new Blob([JSON.stringify({ out_file_name: outFileName || 'compressed', quality })], { type: 'application/json' }));
        formData.append('file', fileData.file);
        await runToolRequest({
            url: ToolsApi.compressImage,
            formData,
            fallbackFilename: 'compress-image.jpg',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const qualityLabel = quality >= 85 ? 'High quality' : quality >= 60 ? 'Balanced' : quality >= 40 ? 'Small file' : 'Maximum compression';
    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Compressing image...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    return (
        <div className="flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-sky-500 to-cyan-600 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0"><img src="/tools/compress-image.svg" alt="" className="w-7 h-7" /></div>
                    <div className="flex-1 min-w-0"><h1 className="text-xl font-bold">Compress Image</h1><p className="text-sm opacity-75 mt-0.5">Reduce image file size with adjustable JPEG quality</p></div>
                    <div className="hidden md:block text-sm opacity-60 flex-shrink-0">Step {activeStep + 1} / {steps.length}</div>
                </div>
            </div>
            <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex-shrink-0 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto"><ProgressStepper steps={steps} activeStepIndex={activeStep} /></div>
            </div>
            <div className="flex-1 px-6 md:px-10 py-8">
                <div className="max-w-5xl mx-auto">
                    {activeStep === 0 && (
                        <div className="space-y-4">
                            <ChooseFiles single accept={['image/jpeg','image/png','image/webp','image/bmp','image/gif']} onChange={handleFile} />
                            {fileData && <p className="text-sm text-center text-slate-500 dark:text-slate-400">Selected: <strong>{fileData.file.name}</strong> ({(fileData.file.size / 1024).toFixed(0)} KB)</p>}
                        </div>
                    )}
                    {activeStep === 1 && (
                        <div className="max-w-md mx-auto space-y-6 py-4">
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-baseline">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">JPEG Quality</label>
                                    <span className="text-sky-600 font-bold text-lg">{quality}</span>
                                </div>
                                <input aria-label="Quality" type="range" min={10} max={100} step={5} value={quality} onChange={(e: ChangeEvent<HTMLInputElement>) => setQuality(Number(e.target.value))} className="w-full accent-sky-500" />
                                {estimatedSize && (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                        Estimated output size: <strong>{estimatedSize}</strong> (was {(fileData!.file.size / 1024).toFixed(0)} KB)
                                    </p>
                                )}
                                <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500"><span>Smallest</span><span className="font-medium text-sky-600">{qualityLabel}</span><span>Best quality</span></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[{ q: 90, label: 'High', hint: 'Near lossless' }, { q: 75, label: 'Balanced', hint: 'Good for sharing' }, { q: 50, label: 'Small', hint: 'Noticeably compressed' }, { q: 30, label: 'Tiny', hint: 'Maximum reduction' }].map(p => (
                                    <button key={p.q} onClick={() => setQuality(p.q)} className={`px-3 py-2.5 rounded-xl border text-sm transition-all ${quality === p.q ? 'border-sky-500 bg-sky-50 text-sky-700 font-semibold' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                                        <p className="font-medium">{p.label} ({p.q})</p><p className="text-xs opacity-70 mt-0.5">{p.hint}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeStep === 2 && (
                        <div className="max-w-md mx-auto flex flex-col gap-6 py-8">
                            {step !== Step.IDLE && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm"><span className="font-medium text-slate-700 dark:text-slate-200">{statusText}</span>{step !== Step.PROCESS && <span className="text-slate-400 tabular-nums dark:text-slate-500">{Math.round(progress)}%</span>}</div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-700">{step === Step.PROCESS ? <div className="h-full w-full bg-sky-500 animate-pulse" /> : <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${progress}%` }} />}</div>
                                </div>
                            )}
                            {error && <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
                            {step === Step.IDLE && (
                                <div className="flex flex-col gap-4">
                                    <div className="bg-sky-50 rounded-xl border border-sky-200 px-4 py-3 text-sm text-sky-800">Compressing at <strong>quality {quality}</strong> ({qualityLabel}). Output is JPEG.</div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                                        <input type="text" value={outFileName} onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())} placeholder="compressed" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700" />
                                    </div>
                                    <button onClick={startCompress} className="w-full py-3.5 rounded-xl bg-sky-500 text-white font-semibold text-sm hover:bg-sky-600 transition-colors shadow-sm">Compress & Download</button>
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">Your compressed image will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}
                    <ToolSeoSection
                        toolPath="/tool/compress-image"
                        toolName="Compress Image"
                        about="Compress Image re-encodes your image as JPEG at the specified quality level. Lower quality means smaller file size with more visible compression artifacts. Quality 75 is the default and gives a good balance for most use cases."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sky-600"><path d="M12 2v6m0 0 3-3m-3 3-3-3"/><rect x="2" y="14" width="20" height="8" rx="2"/></svg>, title: 'Quality 10–100', description: 'Full control over the JPEG quality trade-off — from tiny files to near-lossless.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sky-600"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>, title: 'All common formats', description: 'Accepts JPEG, PNG, BMP, WebP, and GIF — all output as JPEG.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sky-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'No data retention', description: 'Files are deleted from our servers after processing.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sky-600"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, title: 'Free to use', description: 'No subscription or account required.' },
                        ]}
                        faqs={[
                            { q: 'What quality should I use?', a: 'Quality 75 is a good default for sharing. Use 90+ to preserve near-lossless quality. Use 50 or below for maximum compression where visual quality is less important.' },
                            { q: 'Will transparent PNGs keep their transparency?', a: 'No — JPEG does not support transparency. Any transparent areas will be rendered as white in the output.' },
                            { q: 'What formats are supported for input?', a: 'JPEG, PNG, WebP, BMP, and GIF images are all accepted. The output is always JPEG.' },
                            { q: 'Are my files stored?', a: 'Files are deleted immediately after processing.' },
                        ]}
                    />
                </div>
            </div>
            <div className="sticky bottom-0 z-30 flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button disabled={activeStep === 0} onClick={() => setActiveStep(a => a - 1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>Back</button>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{activeStep + 1} / {steps.length}</span>
                    <button disabled={activeStep === 2 || !fileData} onClick={() => setActiveStep(a => a + 1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">{activeStep === steps.length - 2 ? 'Proceed' : 'Next'}<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg></button>
                </div>
            </div>
        </div>
    );
}
