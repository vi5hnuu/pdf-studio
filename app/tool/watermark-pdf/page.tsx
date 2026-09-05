"use client";

import * as React from "react";
import { ChangeEvent, useState } from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { generateId, hexToRGBA } from "@/app/_utils/constants";
import { ToolsApi } from "@/app/_utils/api";
import { runToolRequest } from '@/app/_hooks/use-tool-request';

interface FileData { id: string; file: File; }

enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

interface WatermarkConfig {
    text: string;
    fontSize: number;
    opacity: number;
    angle: number;
    colorHex: string;
    verticalPosition: 'START' | 'CENTER' | 'END';
    horizontalPosition: 'START' | 'CENTER' | 'END';
}

export default function WatermarkPdf() {
    const [activeStep, setActiveStep] = useState(0);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [config, setConfig] = useState<WatermarkConfig>({
        text: 'CONFIDENTIAL',
        fontSize: 48,
        opacity: 0.3,
        angle: 45,
        colorHex: '#888888',
        verticalPosition: 'CENTER',
        horizontalPosition: 'CENTER',
    });
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [outFileName, setOutFileName] = useState('');

    const steps = ['Select File', 'Configure', 'Apply'];

    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        setFileData({ id: generateId(32, 'FILE_'), file: f });
    }

    function upd<K extends keyof WatermarkConfig>(key: K, value: WatermarkConfig[K]) {
        setConfig(c => ({ ...c, [key]: value }));
    }

    async function startWatermark() {
        if (!fileData) return;
        const { r, g, b } = hexToRGBA(config.colorHex);
        const body = {
            out_file_name: outFileName || 'watermarked',
            text: config.text,
            font_size: config.fontSize,
            color: { r, g, b, a: 1 },
            opacity: config.opacity,
            angle: config.angle,
            vertical_position: config.verticalPosition,
            horizontal_position: config.horizontalPosition,
        };
        const formData = new FormData();
        formData.append('watermark-pdf-info', new Blob([JSON.stringify(body)], { type: 'application/json' }));
        formData.append('file', fileData.file);

        await runToolRequest({
            url: ToolsApi.watermarkPdf,
            formData,
            fallbackFilename: 'watermark-pdf.pdf',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Applying watermark...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    const POS_LABELS = { START: 'Start', CENTER: 'Center', END: 'End' };
    const positions = ['START', 'CENTER', 'END'] as const;

    return (
        <div className="flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-cyan-600 to-teal-700 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/watermark-pdf.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Watermark PDF</h1>
                        <p className="text-sm opacity-75 mt-0.5">Stamp text watermarks with custom opacity and angle</p>
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
                        <div className="space-y-4">
                            <ChooseFiles single accept={['application/pdf']} onChange={handleFile} />
                            {fileData && <p className="text-sm text-center text-slate-500 dark:text-slate-400">Selected: <strong>{fileData.file.name}</strong></p>}
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            {/* Preview */}
                            <div className="relative h-36 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center dark:bg-slate-700 dark:border-slate-700">
                                <div
                                    className="text-center font-bold select-none pointer-events-none"
                                    style={{
                                        fontSize: `${Math.min(config.fontSize, 48)}px`,
                                        opacity: config.opacity,
                                        color: config.colorHex,
                                        transform: `rotate(-${config.angle}deg)`,
                                    }}
                                >
                                    {config.text || 'Preview'}
                                </div>
                                <span className="absolute bottom-2 right-3 text-xs text-slate-400 dark:text-slate-500">Preview</span>
                            </div>

                            {/* Text */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Watermark text</label>
                                <input
                                    type="text"
                                    value={config.text}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => upd('text', e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-50 dark:border-slate-700"
                                    placeholder="CONFIDENTIAL"
                                />
                            </div>

                            {/* Font size + opacity */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Font size <span className="text-slate-400 dark:text-slate-500">({config.fontSize}px)</span></label>
                                    <input type="range" min={12} max={120} value={config.fontSize} onChange={(e: ChangeEvent<HTMLInputElement>) => upd('fontSize', +e.target.value)} className="accent-cyan-600" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Opacity <span className="text-slate-400 dark:text-slate-500">({Math.round(config.opacity * 100)}%)</span></label>
                                    <input type="range" min={0.05} max={1} step={0.05} value={config.opacity} onChange={(e: ChangeEvent<HTMLInputElement>) => upd('opacity', +e.target.value)} className="accent-cyan-600" />
                                </div>
                            </div>

                            {/* Angle + Color */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Angle <span className="text-slate-400 dark:text-slate-500">({config.angle}°)</span></label>
                                    <input type="range" min={0} max={360} value={config.angle} onChange={(e: ChangeEvent<HTMLInputElement>) => upd('angle', +e.target.value)} className="accent-cyan-600" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Color</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={config.colorHex} onChange={(e: ChangeEvent<HTMLInputElement>) => upd('colorHex', e.target.value)} className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 dark:border-slate-700" />
                                        <span className="text-sm text-slate-500 font-mono dark:text-slate-400">{config.colorHex}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Position */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Vertical position</label>
                                    <div className="flex gap-1.5">
                                        {positions.map(p => (
                                            <button key={p} type="button" onClick={() => upd('verticalPosition', p)}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${config.verticalPosition === p ? 'bg-cyan-600 text-white border-cyan-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                                {POS_LABELS[p]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Horizontal position</label>
                                    <div className="flex gap-1.5">
                                        {positions.map(p => (
                                            <button key={p} type="button" onClick={() => upd('horizontalPosition', p)}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${config.horizontalPosition === p ? 'bg-cyan-600 text-white border-cyan-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                                {POS_LABELS[p]}
                                            </button>
                                        ))}
                                    </div>
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
                                            ? <div className="h-full w-full bg-cyan-500 animate-pulse" />
                                            : <div className="h-full bg-cyan-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
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
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                                        <input type="text" value={outFileName} onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())} placeholder="watermarked" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-50 dark:border-slate-700" />
                                    </div>
                                    <button onClick={startWatermark} className="w-full py-3.5 rounded-xl bg-cyan-600 text-white font-semibold text-sm hover:bg-cyan-700 transition-colors shadow-sm">
                                        Apply Watermark & Download
                                    </button>
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">Your watermarked PDF will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}

                    <ToolSeoSection
                        toolPath="/tool/watermark-pdf"
                        toolName="Watermark pdf"
                        about="Add professional text watermarks to any PDF with full control over the appearance. Set custom text, font size, color, opacity, angle, and position — then download your watermarked PDF instantly."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-600"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, title: 'Live preview', description: 'See your watermark text styled in real time before applying.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-600"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3"/></svg>, title: 'Full customization', description: 'Control text, font size, color, opacity, rotation angle, and position.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>, title: 'All pages stamped', description: 'Watermark is applied to every page of your PDF consistently.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'Secure processing', description: 'Your PDF is processed securely and never stored on our servers.' },
                        ]}
                        faqs={[
                            { q: 'Will the watermark be permanent?', a: 'Yes. The watermark is embedded into the PDF content and cannot be easily removed.' },
                            { q: 'Can I set the opacity of the watermark?', a: 'Yes — use the Opacity slider to set how transparent the watermark appears. 30% is a common setting for "CONFIDENTIAL" stamps.' },
                            { q: 'What fonts are used for the watermark?', a: 'The watermark uses Helvetica Bold for maximum legibility. Custom font selection may be added in a future update.' },
                            { q: 'Can I watermark only specific pages?', a: 'Currently the watermark is applied to all pages. Page-range control will be available in a future update.' },
                        ]}
                    />
                </div>
            </div>

            <div className="flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button disabled={activeStep === 0} onClick={() => setActiveStep(a => a - 1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                        Back
                    </button>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{activeStep + 1} / {steps.length}</span>
                    <button disabled={activeStep === 2 || !fileData} onClick={() => setActiveStep(a => a + 1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
