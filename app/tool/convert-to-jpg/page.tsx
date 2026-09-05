"use client";
import * as React from "react";
import { ChangeEvent, useEffect, useState } from "react";
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
enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

export default function ConvertToJpg() {
    const steps = ['Select Image', 'Set Quality', 'Convert & Download'];

    // Mirrored into the URL so the browser Back button steps back rather than
    // leaving the tool and losing the file.
    const [activeStep, setActiveStep] = useToolStep(steps.length);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [quality, setQuality] = useState(90);
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
                    setEstimatedSize(formatBytes(blob.size));
                }
            }, 'image/jpeg', quality / 100);
        };
        img.src = url;
        return () => { cancelled = true; URL.revokeObjectURL(url); };
    }, [fileData, quality]);

    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        setFileData({ id: generateId(32, 'FILE_'), file: f });
    }

    async function startConvert() {
        if (!fileData) return;
        const formData = new FormData();
        formData.append('convert-to-jpg-info', new Blob([JSON.stringify({ out_file_name: outFileName || 'image', quality })], { type: 'application/json' }));
        formData.append('file', fileData.file);
        await runToolRequest({
            url: ToolsApi.convertToJpg,
            formData,
            fallbackFilename: 'convert-to-jpg.jpg',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Converting to JPG...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    return (
        <div className="flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0"><img src="/tools/convert-to-jpg.svg" alt="" className="w-7 h-7" /></div>
                    <div className="flex-1 min-w-0"><h1 className="text-xl font-bold">Image to JPG</h1><p className="text-sm opacity-75 mt-0.5">Convert PNG, BMP, WebP, or GIF to JPEG format</p></div>
                    <div className="hidden md:block text-sm opacity-60 flex-shrink-0">Step {activeStep + 1} / {steps.length}</div>
                </div>
            </div>
            <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex-shrink-0 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto"><ProgressStepper steps={steps} activeStepIndex={activeStep} onStepClick={setActiveStep} /></div>
            </div>
            <div className="flex-1 px-6 md:px-10 py-8">
                <div className="max-w-5xl mx-auto">
                    {activeStep === 0 && (
                        <div className="space-y-4">
                            <ChooseFiles single accept={['image/png','image/bmp','image/webp','image/gif']} onChange={handleFile} />
                            {fileData && <p className="text-sm text-center text-slate-500 dark:text-slate-400">Selected: <strong>{fileData.file.name}</strong> ({(fileData.file.size / 1024).toFixed(0)} KB)</p>}
                        </div>
                    )}
                    {activeStep === 1 && (
                        <div className="max-w-md mx-auto space-y-6 py-4">
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-baseline">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Output JPEG Quality</label>
                                    <span className="text-amber-600 font-bold text-lg dark:text-amber-400">{quality}</span>
                                </div>
                                <input aria-label="Quality" type="range" min={10} max={100} step={5} value={quality} onChange={(e: ChangeEvent<HTMLInputElement>) => setQuality(Number(e.target.value))} className="w-full accent-amber-500" />
                                {estimatedSize && (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                        Estimated output size: <strong>{estimatedSize}</strong> (was {formatBytes(fileData!.file.size)})
                                    </p>
                                )}
                                <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500"><span>Smallest</span><span>Best quality</span></div>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-500">Quality 90 is the default — recommended for high-fidelity output.</p>
                        </div>
                    )}
                    {activeStep === 2 && (
                        <div className="max-w-md mx-auto flex flex-col gap-6 py-8">
                            {step !== Step.IDLE && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm"><span className="font-medium text-slate-700 dark:text-slate-200">{statusText}</span>{step !== Step.PROCESS && <span className="text-slate-400 tabular-nums dark:text-slate-500">{Math.round(progress)}%</span>}</div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-700">{step === Step.PROCESS ? <div className="h-full w-full bg-amber-500 animate-pulse" /> : <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${progress}%` }} />}</div>
                                </div>
                            )}
                            {error && <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
                            {step === Step.IDLE && (
                                <div className="flex flex-col gap-4">
                                    <ToolCostBadge toolId="convert-to-jpg" file={fileData?.file} />
                                    <div className="bg-amber-50 rounded-xl border border-amber-200 px-4 py-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300">Converting to <strong>JPEG at quality {quality}</strong>. Transparent areas will be rendered as white.</div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                                        <input type="text" value={outFileName} onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())} placeholder="image" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:border-slate-700" />
                                    </div>
                                    <button onClick={startConvert} className="w-full py-3.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors shadow-sm">Convert & Download .jpg</button>
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">Your JPEG image will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}
                    <ToolSeoSection
                        toolPath="/tool/convert-to-jpg"
                        toolName="Image to JPG"
                        about="Image to JPG converts PNG, BMP, WebP, and GIF images to JPEG format at your chosen quality level. JPEG offers the widest compatibility and the smallest file sizes for photographic images."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 dark:text-amber-400"><path d="M5 12h14M12 5l7 7-7 7"/></svg>, title: 'PNG/BMP/WebP/GIF → JPG', description: 'Converts all common non-JPEG formats to the universally compatible JPEG.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 dark:text-amber-400"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>, title: 'Adjustable quality', description: 'Set quality 10–100 to balance file size and visual fidelity.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 dark:text-amber-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'No data retention', description: 'Files are deleted from our servers after conversion.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 dark:text-amber-400"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, title: 'Free to use', description: 'No subscription or account required.' },
                        ]}
                        faqs={[
                            { q: 'Will transparency be preserved?', a: 'No — JPEG does not support transparency. Transparent pixels in PNG images will be rendered as white.' },
                            { q: 'What quality should I use?', a: 'Quality 90 is the default for high-fidelity output. Use 70–80 for a balance of size and quality.' },
                            { q: 'Can I convert an existing JPEG?', a: 'Yes, but re-encoding a JPEG as another JPEG introduces additional quality loss. For existing JPEGs, use the Compress Image tool instead.' },
                            { q: 'Are my files stored?', a: 'Files are deleted immediately after processing.' },
                        ]}
                    />
                </div>
            </div>
            <div className="sticky bottom-0 z-30 flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button disabled={activeStep === 0} onClick={() => setActiveStep(a => a - 1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>Back</button>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{activeStep + 1} / {steps.length}</span>
                    <button disabled={activeStep === 2 || !fileData} onClick={() => setActiveStep(a => a + 1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">{activeStep === steps.length - 2 ? 'Proceed' : 'Next'}<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg></button>
                </div>
            </div>
        </div>
    );
}
