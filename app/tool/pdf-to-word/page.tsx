"use client";
import * as React from "react";
import { ChangeEvent, useState } from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { generateId } from "@/app/_utils/constants";
import { ToolsApi } from "@/app/_utils/api";
import { runToolRequest } from '@/app/_hooks/use-tool-request';

interface FileData { id: string; file: File; }
enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

export default function PdfToWord() {
    const [activeStep, setActiveStep] = useState(0);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [outFileName, setOutFileName] = useState('');
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const steps = ['Select PDF', 'Convert & Download'];

    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        setFileData({ id: generateId(32, 'FILE_'), file: f });
    }

    async function startConvert() {
        if (!fileData) return;
        const formData = new FormData();
        formData.append('pdf-to-office-info', new Blob([JSON.stringify({ out_file_name: outFileName || 'document' })], { type: 'application/json' }));
        formData.append('file', fileData.file);
        await runToolRequest({
            url: ToolsApi.pdfToWord,
            formData,
            fallbackFilename: 'pdf-to-word.docx',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Converting to Word...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    return (
        <div className="flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0"><img src="/tools/pdf-to-word.svg" alt="" className="w-7 h-7" /></div>
                    <div className="flex-1 min-w-0"><h1 className="text-xl font-bold">PDF to Word</h1><p className="text-sm opacity-75 mt-0.5">Convert PDF text content to an editable Word document</p></div>
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
                            <ChooseFiles single accept={['application/pdf']} onChange={handleFile} />
                            {fileData && <p className="text-sm text-center text-slate-500 dark:text-slate-400">Selected: <strong>{fileData.file.name}</strong> ({(fileData.file.size / 1024 / 1024).toFixed(2)} MB)</p>}
                        </div>
                    )}
                    {activeStep === 1 && (
                        <div className="max-w-md mx-auto flex flex-col gap-6 py-8">
                            {step !== Step.IDLE && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm"><span className="font-medium text-slate-700 dark:text-slate-200">{statusText}</span>{step !== Step.PROCESS && <span className="text-slate-400 tabular-nums dark:text-slate-500">{Math.round(progress)}%</span>}</div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-700">{step === Step.PROCESS ? <div className="h-full w-full bg-blue-600 animate-pulse" /> : <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${progress}%` }} />}</div>
                                </div>
                            )}
                            {error && <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
                            {step === Step.IDLE && (
                                <div className="flex flex-col gap-4">
                                    <div className="bg-blue-50 rounded-xl border border-blue-200 px-4 py-3 text-sm text-blue-800">Text content is extracted and arranged into paragraphs inside a <strong>.docx</strong> file. Images and complex layouts are not preserved.</div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                                        <input type="text" value={outFileName} onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())} placeholder="document" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700" />
                                    </div>
                                    <button onClick={startConvert} className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm">Convert & Download .docx</button>
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">Your Word file will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}
                    <ToolSeoSection
                        toolPath="/tool/pdf-to-word"
                        toolName="PDF to Word"
                        about="PDF Studio's PDF to Word tool extracts all text content from your PDF and writes it into a structured .docx file. Each page's text is laid out as paragraphs, preserving the reading order. This is a text-extraction conversion — complex layouts, tables, and embedded images are not reproduced."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>, title: 'Editable .docx output', description: 'The resulting file opens in Microsoft Word, Google Docs, or any compatible editor.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>, title: 'Full text extraction', description: 'All text across every page is extracted and ordered by reading sequence.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'No data retention', description: 'Files are deleted from our servers after conversion.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, title: 'Free to use', description: 'No subscription or account required.' },
                        ]}
                        faqs={[
                            { q: 'Will images be included in the Word file?', a: 'No. This tool performs text extraction only. Embedded images, charts, and complex graphical elements are not reproduced in the .docx output.' },
                            { q: 'Will formatting like bold or italic be preserved?', a: 'Basic paragraph structure is preserved. Rich formatting like bold, italic, fonts, and column layouts may not be fully reproduced, as it depends on how the PDF stores its content.' },
                            { q: 'What if my PDF is scanned (image-based)?', a: 'Scanned PDFs contain no embedded text — the output will be an empty or near-empty Word file. Use an OCR tool first to make the PDF text-searchable before converting.' },
                            { q: 'Are my files stored?', a: 'Files are deleted immediately after processing. We do not retain your documents.' },
                        ]}
                    />
                </div>
            </div>
            <div className="flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button disabled={activeStep === 0} onClick={() => setActiveStep(a => a - 1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>Back</button>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{activeStep + 1} / {steps.length}</span>
                    <button disabled={activeStep === 1 || !fileData} onClick={() => setActiveStep(a => a + 1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">Proceed<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg></button>
                </div>
            </div>
        </div>
    );
}
