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

type OutputFormat = 'PNG' | 'BMP';

export default function ConvertFromJpg() {
    const [activeStep, setActiveStep] = useState(0);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [format, setFormat] = useState<OutputFormat>('PNG');
    const [outFileName, setOutFileName] = useState('');
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const steps = ['Select Image', 'Choose Format', 'Convert & Download'];

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        setFileData({ id: generateId(32, 'FILE_'), file: f });
    }

    function startConvert() {
        if (!fileData) return;
        const body = { out_file_name: outFileName || 'image', format };
        const formData = new FormData();
        formData.append('convert-from-jpg-info', new Blob([JSON.stringify(body)], { type: 'application/json' }));
        formData.append('file', fileData.file);
        const xhr = new XMLHttpRequest();
        setError(null);
        xhr.open('POST', ToolsApi.convertFromJpg, true);
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
            if (xhr.status !== 200) { setError('Conversion failed. Please try again.'); setStep(Step.IDLE); return; }
            const disp = xhr.getResponseHeader('Content-Disposition') ?? '';
            const ext = format.toLowerCase();
            const filename = disp.split('filename=')[1] ?? (outFileName || 'image') + '.' + ext;
            const url = URL.createObjectURL(xhr.response);
            const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
            URL.revokeObjectURL(url); setStep(Step.IDLE);
        };
        xhr.onerror = () => { setError('Network error. Please check your connection.'); setStep(Step.IDLE); };
        xhr.send(formData);
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? `Converting to ${format}...` : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    const formatInfo = {
        PNG: { label: 'PNG', hint: 'Lossless with transparency support', accent: 'rose' },
        BMP: { label: 'BMP', hint: 'Uncompressed — exact pixel data', accent: 'rose' },
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/convert-from-jpg.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">JPG to PNG / BMP</h1>
                        <p className="text-sm opacity-75 mt-0.5">Convert JPEG images to PNG or BMP format</p>
                    </div>
                    <div className="hidden md:block text-sm opacity-60 flex-shrink-0">Step {activeStep + 1} / {steps.length}</div>
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
                        <div className="space-y-4 max-w-2xl mx-auto">
                            <ChooseFiles single accept={['image/jpeg', 'image/jpg']} onChange={handleFile} />
                            {fileData && <p className="text-sm text-center text-slate-500">Selected: <strong>{fileData.file.name}</strong> ({(fileData.file.size / 1024).toFixed(0)} KB)</p>}
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="max-w-sm mx-auto space-y-6 py-4">
                            <p className="text-sm font-semibold text-slate-700">Output format</p>
                            <div className="grid grid-cols-2 gap-4">
                                {(['PNG', 'BMP'] as OutputFormat[]).map(fmt => (
                                    <button
                                        key={fmt}
                                        type="button"
                                        onClick={() => setFormat(fmt)}
                                        className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${format === fmt ? 'border-rose-500 bg-rose-50' : 'border-slate-200 hover:border-slate-300'}`}
                                    >
                                        <span className={`text-lg font-bold ${format === fmt ? 'text-rose-600' : 'text-slate-700'}`}>.{fmt.toLowerCase()}</span>
                                        <span className="text-xs text-slate-500 text-center">{formatInfo[fmt].hint}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-xs text-rose-700">
                                {format === 'PNG' ? 'PNG supports full transparency and lossless compression — ideal for graphics, screenshots, and images with sharp edges.' : 'BMP is uncompressed and produces large files, but preserves exact pixel data without any encoding artifacts.'}
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
                                            ? <div className="h-full w-full bg-rose-500 animate-pulse" />
                                            : <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
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
                                        <p>Image: <strong>{fileData?.file.name}</strong></p>
                                        <p>Output format: <strong>.{format.toLowerCase()}</strong></p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700">Output file name</label>
                                        <input type="text" value={outFileName} onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())}
                                            placeholder="image"
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50" />
                                    </div>
                                    <button onClick={startConvert}
                                        className="w-full py-3.5 rounded-xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 transition-colors shadow-sm">
                                        Convert & Download .{format.toLowerCase()}
                                    </button>
                                    <p className="text-center text-xs text-slate-400">Your converted image will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}

                    <ToolSeoSection
                        toolPath="/tool/convert-from-jpg"
                        toolName="JPG to PNG/BMP"
                        about="JPG to PNG / BMP converts JPEG images to either PNG or BMP format. Use PNG for a lossless output with transparency support; use BMP for uncompressed pixel data. The conversion is lossless from JPEG — the JPEG pixel values are decoded and re-encoded in the chosen format."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-600"><path d="M5 12h14M12 5l7 7-7 7"/></svg>, title: 'JPG → PNG or BMP', description: 'Choose between lossless PNG (with transparency) or uncompressed BMP.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-600"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>, title: 'No quality loss on decode', description: 'The JPEG is fully decoded before re-encoding — no additional lossy step.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'No data retention', description: 'Files are deleted from our servers after conversion.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-600"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, title: 'Free to use', description: 'No subscription or account required.' },
                        ]}
                        faqs={[
                            { q: 'Which format should I choose — PNG or BMP?', a: 'PNG is almost always the better choice: it is lossless, supports transparency, and compresses well. BMP is uncompressed and produces much larger files; use it only when software explicitly requires raw BMP input.' },
                            { q: 'Will the conversion add transparency to the image?', a: 'No. A JPEG does not carry transparency information. The PNG output will have the same pixels as the JPEG — a fully opaque image.' },
                            { q: 'Is there any quality loss during conversion?', a: 'No. The JPEG is decoded first, then re-encoded as PNG or BMP — both of which are lossless formats. The only quality already lost is the original JPEG compression from when the JPEG was created.' },
                            { q: 'Are my files stored?', a: 'Files are deleted immediately after processing.' },
                        ]}
                    />
                </div>
            </div>

            <div className="flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button disabled={activeStep === 0} onClick={() => setActiveStep(a => a - 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                        Back
                    </button>
                    <span className="text-xs text-slate-400">{activeStep + 1} / {steps.length}</span>
                    <button disabled={activeStep === 2 || !fileData} onClick={() => setActiveStep(a => a + 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
