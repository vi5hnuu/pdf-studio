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

export default function PdfToPptx() {
    const [activeStep, setActiveStep] = useState(0);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [outFileName, setOutFileName] = useState('');
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const steps = ['Select PDF', 'Convert & Download'];

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        setFileData({ id: generateId(32, 'FILE_'), file: f });
    }

    async function startConvert() {
        if (!fileData) return;
        const formData = new FormData();
        formData.append('pdf-to-office-info', new Blob([JSON.stringify({ out_file_name: outFileName || 'presentation' })], { type: 'application/json' }));
        formData.append('file', fileData.file);
        const xhr = new XMLHttpRequest();
        setError(null);
        xhr.open('POST', ToolsApi.pdfToPptx, true);
        xhr.responseType = 'blob';
        xhr.upload.addEventListener('progress', (ev) => { if (!ev.lengthComputable) return; setStep(Step.UPLOAD); setProgress((ev.loaded / ev.total) * 100); if (ev.loaded >= ev.total) setStep(Step.PROCESS); });
        xhr.onprogress = (ev) => { if (!ev.lengthComputable) return; setStep(Step.DOWNLOAD); setProgress((ev.loaded / ev.total) * 100); };
        xhr.onload = () => {
            if (xhr.status !== 200) { setError('Conversion failed. Please try again.'); setStep(Step.IDLE); return; }
            const disp = xhr.getResponseHeader('Content-Disposition') ?? '';
            const filename = disp.split('filename=')[1] ?? (outFileName || 'presentation') + '.pptx';
            const url = URL.createObjectURL(xhr.response);
            const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
            URL.revokeObjectURL(url); setStep(Step.IDLE);
        };
        xhr.onerror = () => { setError('Network error.'); setStep(Step.IDLE); };
        xhr.send(formData);
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Building slides...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0"><img src="/tools/pdf-to-pptx.svg" alt="" className="w-7 h-7" /></div>
                    <div className="flex-1 min-w-0"><h1 className="text-xl font-bold">PDF to PPTX</h1><p className="text-sm opacity-75 mt-0.5">Convert PDF pages into PowerPoint presentation slides</p></div>
                    <div className="hidden md:block text-sm opacity-60 flex-shrink-0">Step {activeStep + 1} / {steps.length}</div>
                </div>
            </div>
            <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex-shrink-0">
                <div className="max-w-5xl mx-auto"><ProgressStepper steps={steps} activeStepIndex={activeStep} /></div>
            </div>
            <div className="flex-1 overflow-auto px-6 md:px-10 py-8">
                <div className="max-w-5xl mx-auto">
                    {activeStep === 0 && (
                        <div className="space-y-4">
                            <ChooseFiles single accept={['application/pdf']} onChange={handleFile} />
                            {fileData && <p className="text-sm text-center text-slate-500">Selected: <strong>{fileData.file.name}</strong> ({(fileData.file.size / 1024 / 1024).toFixed(2)} MB)</p>}
                        </div>
                    )}
                    {activeStep === 1 && (
                        <div className="max-w-md mx-auto flex flex-col gap-6 py-8">
                            {step !== Step.IDLE && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm"><span className="font-medium text-slate-700">{statusText}</span>{step !== Step.PROCESS && <span className="text-slate-400 tabular-nums">{Math.round(progress)}%</span>}</div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">{step === Step.PROCESS ? <div className="h-full w-full bg-orange-500 animate-pulse" /> : <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${progress}%` }} />}</div>
                                </div>
                            )}
                            {error && <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
                            {step === Step.IDLE && (
                                <div className="flex flex-col gap-4">
                                    <div className="bg-orange-50 rounded-xl border border-orange-200 px-4 py-3 text-sm text-orange-800">Each PDF page becomes one <strong>.pptx</strong> slide with its extracted text content placed in a text box.</div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700">Output file name</label>
                                        <input type="text" value={outFileName} onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())} placeholder="presentation" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                                    </div>
                                    <button onClick={startConvert} className="w-full py-3.5 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors shadow-sm">Convert & Download .pptx</button>
                                    <p className="text-center text-xs text-slate-400">Your PowerPoint file will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}
                    <ToolSeoSection
                        toolPath="/tool/pdf-to-pptx"
                        toolName="PDF to PPTX"
                        about="PDF Studio's PDF to PPTX tool converts each page of your PDF into a PowerPoint slide. Text is extracted from the PDF and placed into text boxes on each slide. The output is a standard .pptx file that opens in PowerPoint, Google Slides, or Keynote."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-600"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>, title: 'One slide per page', description: 'Each PDF page maps to one slide in the PowerPoint presentation.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>, title: 'Editable .pptx output', description: 'Opens in PowerPoint, Google Slides, and LibreOffice Impress.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'No data retention', description: 'Files are deleted from our servers after conversion.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-600"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, title: 'Free to use', description: 'No subscription or account required.' },
                        ]}
                        faqs={[
                            { q: 'Will slide backgrounds and graphics be included?', a: 'No. This is a text-extraction conversion. Slide backgrounds, images, and graphical elements from the original PDF are not reproduced.' },
                            { q: 'Does each PDF page become one slide?', a: 'Yes — one page maps to exactly one slide. A 10-page PDF produces a 10-slide presentation.' },
                            { q: 'Can I convert a scanned PDF?', a: 'Scanned PDFs have no embedded text. The resulting slides will be blank. Run OCR first to embed text into the PDF.' },
                            { q: 'Are my files stored?', a: 'Files are deleted immediately after processing.' },
                        ]}
                    />
                </div>
            </div>
            <div className="flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button disabled={activeStep === 0} onClick={() => setActiveStep(a => a - 1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>Back</button>
                    <span className="text-xs text-slate-400">{activeStep + 1} / {steps.length}</span>
                    <button disabled={activeStep === 1 || !fileData} onClick={() => setActiveStep(a => a + 1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">Proceed<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg></button>
                </div>
            </div>
        </div>
    );
}
