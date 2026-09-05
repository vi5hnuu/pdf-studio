"use client";

import * as React from "react";
import { ChangeEvent, useState } from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { generateId } from "@/app/_utils/constants";
import { ToolsApi } from "@/app/_utils/api";
import { runToolRequest } from '@/app/_hooks/use-tool-request';
import { saveBlob } from '@/app/_utils/download';
import { useToolStep } from '@/app/_hooks/use-tool-step';

interface FileData { id: string; file: File; }

enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DONE = 'done' }

export default function ExtractText() {
    const steps = ['Select File', 'Extract Text'];

    // Mirrored into the URL so the browser Back button steps back rather than
    // leaving the tool and losing the file.
    const [activeStep, setActiveStep] = useToolStep(steps.length);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState<string | null>(null);
    const [outFileName, setOutFileName] = useState('');


    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        setFileData({ id: generateId(32, 'FILE_'), file: f });
        setExtractedText(null);
    }

    async function startExtract() {
        if (!fileData) return;
        const formData = new FormData();
        if (outFileName) {
            formData.append('extract-text-info', new Blob([JSON.stringify({ out_file_name: outFileName })], { type: 'application/json' }));
        }
        formData.append('file', fileData.file);

        await runToolRequest({
            url: ToolsApi.extractText,
            formData,
            fallbackFilename: (outFileName || 'extracted-text') + '.txt',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
            // Shown in the page rather than downloaded; the user saves it separately.
            onBlob: async (blob) => {
                setExtractedText(await blob.text());
                setStep(Step.DONE);
            },
        });
    }

    function downloadText() {
        if (!extractedText) return;
        saveBlob(new Blob([extractedText], { type: 'text/plain' }),
            (outFileName || 'extracted-text') + '.txt');
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Extracting text...' : '';

    return (
        <div className="flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/extract-text.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Extract Text</h1>
                        <p className="text-sm opacity-75 mt-0.5">Extract all text content from any PDF file</p>
                    </div>
                    <div className="hidden md:block text-sm opacity-60">Step {activeStep + 1} / {steps.length}</div>
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
                        <div className="space-y-4">
                            <ChooseFiles single accept={['application/pdf']} onChange={handleFile} />
                            {fileData && <p className="text-sm text-center text-slate-500 dark:text-slate-400">Selected: <strong>{fileData.file.name}</strong></p>}
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            {(step === Step.UPLOAD || step === Step.PROCESS) && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-slate-700 dark:text-slate-200">{statusText}</span>
                                        {step === Step.UPLOAD && <span className="text-slate-400 tabular-nums dark:text-slate-500">{Math.round(progress)}%</span>}
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-700">
                                        {step === Step.PROCESS
                                            ? <div className="h-full w-full bg-violet-500 animate-pulse" />
                                            : <div className="h-full bg-violet-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
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

                            {step === Step.IDLE && !extractedText && (
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                                        <input type="text" value={outFileName} onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())} placeholder="extracted-text" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 dark:border-slate-700" />
                                    </div>
                                    <button onClick={startExtract} className="w-full py-3.5 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 transition-colors shadow-sm">
                                        Extract Text
                                    </button>
                                </div>
                            )}

                            {step === Step.DONE && extractedText !== null && (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Extracted Text</h3>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">{extractedText.length.toLocaleString()} characters</p>
                                        </div>
                                        <button onClick={downloadText} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                            Download .txt
                                        </button>
                                    </div>
                                    <pre className="w-full max-h-96 overflow-auto bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200">
                                        {extractedText || '(No text found in this PDF)'}
                                    </pre>
                                    <button onClick={() => { setExtractedText(null); setStep(Step.IDLE); }} className="text-sm text-slate-400 hover:text-slate-600 underline self-start dark:text-slate-500">
                                        Extract again
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <ToolSeoSection
                        toolPath="/tool/extract-text"
                        toolName="Extract text"
                        about="Extract all readable text from any PDF in seconds. The extracted text is displayed directly in your browser and can be downloaded as a .txt file. Useful for copy-pasting content, creating searchable documents, or feeding text into other tools."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>, title: 'In-browser preview', description: 'See the extracted text immediately without downloading anything.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-600"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>, title: 'Download as .txt', description: 'Save the extracted content as a plain text file with one click.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-600"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>, title: 'Position-sorted', description: 'Text is extracted in reading order (left-to-right, top-to-bottom).' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-600"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'Instant results', description: 'Text extraction from most PDFs completes in under a second.' },
                        ]}
                        faqs={[
                            { q: 'What types of PDFs can be extracted?', a: 'Any PDF with embedded text content. Scanned PDFs (image-only) require OCR first — this tool extracts existing digital text.' },
                            { q: 'Will the formatting be preserved?', a: 'The text is extracted as plain text. Paragraph breaks and some spacing are preserved, but complex layouts like tables may not transfer perfectly.' },
                            { q: 'Can I extract text from a password-protected PDF?', a: 'Not directly. Use the Unlock PDF tool first to remove password protection, then extract the text.' },
                            { q: 'Is there a page limit?', a: 'No. The tool extracts text from all pages of the PDF.' },
                        ]}
                    />
                </div>
            </div>

            <div className="sticky bottom-0 z-30 flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button disabled={activeStep === 0} onClick={() => setActiveStep(a => a - 1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                        Back
                    </button>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{activeStep + 1} / {steps.length}</span>
                    <button disabled={activeStep === 1 || !fileData} onClick={() => setActiveStep(a => a + 1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">
                        Next
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
