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

type FilterType = 'GRAYSCALE' | 'SEPIA' | 'SHARPEN' | 'BRIGHTNESS' | 'CONTRAST' | 'VINTAGE';

interface FilterOption {
    type: FilterType;
    label: string;
    hint: string;
    hasIntensity: boolean;
    intensityLabel: string;
    intensityMin: number;
    intensityMax: number;
    intensityDefault: number;
}

const FILTERS: FilterOption[] = [
    { type: 'GRAYSCALE', label: 'Grayscale', hint: 'Convert to black & white', hasIntensity: true, intensityLabel: 'Strength', intensityMin: 0, intensityMax: 2, intensityDefault: 1.0 },
    { type: 'SEPIA', label: 'Sepia', hint: 'Warm vintage brown tone', hasIntensity: true, intensityLabel: 'Strength', intensityMin: 0, intensityMax: 2, intensityDefault: 1.0 },
    { type: 'SHARPEN', label: 'Sharpen', hint: 'Enhance edge clarity', hasIntensity: true, intensityLabel: 'Strength', intensityMin: 0, intensityMax: 2, intensityDefault: 1.0 },
    { type: 'BRIGHTNESS', label: 'Brightness', hint: 'Adjust overall lightness', hasIntensity: true, intensityLabel: 'Level (1.0 = original)', intensityMin: 0, intensityMax: 2, intensityDefault: 1.2 },
    { type: 'CONTRAST', label: 'Contrast', hint: 'Increase/decrease tonal range', hasIntensity: true, intensityLabel: 'Level (1.0 = original)', intensityMin: 0, intensityMax: 2, intensityDefault: 1.2 },
    { type: 'VINTAGE', label: 'Vintage', hint: 'Retro film-style effect', hasIntensity: true, intensityLabel: 'Strength', intensityMin: 0, intensityMax: 2, intensityDefault: 1.0 },
];

export default function FilterImage() {
    const [activeStep, setActiveStep] = useState(0);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [filterType, setFilterType] = useState<FilterType>('GRAYSCALE');
    const [intensity, setIntensity] = useState(1.0);
    const [outFileName, setOutFileName] = useState('');
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const steps = ['Select Image', 'Choose Filter', 'Apply & Download'];

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        setFileData({ id: generateId(32, 'FILE_'), file: f });
    }

    function selectFilter(ft: FilterType) {
        setFilterType(ft);
        const opt = FILTERS.find(f => f.type === ft);
        if (opt) setIntensity(opt.intensityDefault);
    }

    function startFilter() {
        if (!fileData) return;
        const body = {
            out_file_name: outFileName || 'filtered',
            filter_type: filterType,
            intensity,
        };
        const formData = new FormData();
        formData.append('filter-image-info', new Blob([JSON.stringify(body)], { type: 'application/json' }));
        formData.append('file', fileData.file);
        const xhr = new XMLHttpRequest();
        setError(null);
        xhr.open('POST', ToolsApi.filterImage, true);
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
            if (xhr.status !== 200) { setError('Filter failed. Please try again.'); setStep(Step.IDLE); return; }
            const disp = xhr.getResponseHeader('Content-Disposition') ?? '';
            const filename = disp.split('filename=')[1] ?? (outFileName || 'filtered') + '.jpg';
            const url = URL.createObjectURL(xhr.response);
            const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
            URL.revokeObjectURL(url); setStep(Step.IDLE);
        };
        xhr.onerror = () => { setError('Network error. Please check your connection.'); setStep(Step.IDLE); };
        xhr.send(formData);
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Applying filter...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';
    const activeFilter = FILTERS.find(f => f.type === filterType)!;

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-violet-700 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/filter-image.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Filter Image</h1>
                        <p className="text-sm opacity-75 mt-0.5">Apply grayscale, sepia, sharpen, vintage and other effects</p>
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
                            <ChooseFiles single accept={['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/gif']} onChange={handleFile} />
                            {fileData && <p className="text-sm text-center text-slate-500">Selected: <strong>{fileData.file.name}</strong> ({(fileData.file.size / 1024).toFixed(0)} KB)</p>}
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="max-w-xl mx-auto space-y-6 py-2">
                            {/* Filter grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {FILTERS.map(f => (
                                    <button
                                        key={f.type}
                                        type="button"
                                        onClick={() => selectFilter(f.type)}
                                        className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all text-center ${filterType === f.type ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-slate-300'}`}
                                    >
                                        <span className={`text-sm font-semibold ${filterType === f.type ? 'text-purple-700' : 'text-slate-700'}`}>{f.label}</span>
                                        <span className="text-xs text-slate-400 leading-snug">{f.hint}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Intensity slider */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-baseline">
                                    <label className="text-sm font-medium text-slate-700">{activeFilter.intensityLabel}</label>
                                    <span className="text-purple-600 font-semibold tabular-nums">{intensity.toFixed(2)}</span>
                                </div>
                                <input
                                    type="range"
                                    min={activeFilter.intensityMin}
                                    max={activeFilter.intensityMax}
                                    step={0.05}
                                    value={intensity}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setIntensity(parseFloat(e.target.value))}
                                    className="w-full accent-purple-600"
                                />
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>{activeFilter.intensityMin}</span>
                                    <span>{activeFilter.intensityMax}</span>
                                </div>
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
                                            ? <div className="h-full w-full bg-purple-600 animate-pulse" />
                                            : <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
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
                                        <p>Filter: <strong>{activeFilter.label}</strong> · Intensity: <strong>{intensity.toFixed(2)}</strong></p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700">Output file name</label>
                                        <input type="text" value={outFileName} onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())}
                                            placeholder="filtered"
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50" />
                                    </div>
                                    <button onClick={startFilter}
                                        className="w-full py-3.5 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition-colors shadow-sm">
                                        Apply Filter & Download
                                    </button>
                                    <p className="text-center text-xs text-slate-400">Your filtered image will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}

                    <ToolSeoSection
                        toolPath="/tool/filter-image"
                        toolName="Filter Image"
                        about="Filter Image applies visual effects to your image — grayscale, sepia, sharpen, brightness, contrast, and vintage. Each filter has an adjustable intensity from 0.0 (no effect) to 2.0 (maximum effect)."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83"/></svg>, title: '6 filter types', description: 'Grayscale, sepia, sharpen, brightness, contrast, and vintage effects.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>, title: 'Adjustable intensity', description: 'Fine-tune each effect from 0.0 (off) to 2.0 (maximum strength).' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>, title: 'All common formats', description: 'JPEG, PNG, WebP, BMP, and GIF images are all supported.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'No data retention', description: 'Files are deleted from our servers after processing.' },
                        ]}
                        faqs={[
                            { q: 'What does intensity 1.0 mean?', a: 'For most filters, intensity 1.0 applies the effect at its natural strength. Values below 1.0 reduce the effect; values above 1.0 increase it.' },
                            { q: 'For brightness/contrast, what is "no change"?', a: 'An intensity of 1.0 for both brightness and contrast means no change — the image stays identical. Values above 1.0 increase the effect; below 1.0 decrease it.' },
                            { q: 'What format is the output?', a: 'The output is a JPEG image regardless of input format.' },
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
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
