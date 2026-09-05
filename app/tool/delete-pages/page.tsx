"use client";

import * as React from "react";
import { ChangeEvent, useState } from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { generateId } from "@/app/_utils/constants";
import { ToolsApi } from "@/app/_utils/api";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { runToolRequest } from '@/app/_hooks/use-tool-request';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.js",
    import.meta.url
).toString();

interface FileData { id: string; file: File; }

enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

export default function DeletePages() {
    const [activeStep, setActiveStep] = useState(0);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [outFileName, setOutFileName] = useState('');

    const steps = ['Select File', 'Mark Pages', 'Delete & Save'];

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        setFileData({ id: generateId(32, 'FILE_'), file: f });
        setSelectedPages(new Set());
        setTotalPages(0);
    }

    function togglePage(pageIdx: number) {
        setSelectedPages(prev => {
            const next = new Set(prev);
            if (next.has(pageIdx)) next.delete(pageIdx); else next.add(pageIdx);
            return next;
        });
    }

    async function buildRanges(pages: Set<number>) {
        return [...pages].sort((a, b) => a - b).map(p => ({ from: p, to: p }));
    }

    async function startDelete() {
        if (!fileData || selectedPages.size === 0) return;
        const ranges = buildRanges(selectedPages);
        const body = { out_file_name: outFileName || 'cleaned', type: 'DELETE_PAGES', ranges };

        const formData = new FormData();
        formData.append('split-pdf-info', new Blob([JSON.stringify(body)], { type: 'application/json' }));
        formData.append('file', fileData.file);

        await runToolRequest({
            url: ToolsApi.splitPdf,
            formData,
            fallbackFilename: 'delete-pages.pdf',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Deleting pages...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';
    const nextDisabled = (activeStep === 0 && !fileData) || (activeStep === 1 && selectedPages.size === 0) || activeStep === 2;

    return (
        <div className="flex-1 flex flex-col">
            {/* Hero */}
            <div className="bg-gradient-to-r from-rose-600 to-red-700 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/delete-pages.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Delete Pages</h1>
                        <p className="text-sm opacity-75 mt-0.5">Remove unwanted pages from any PDF visually</p>
                    </div>
                    <div className="hidden md:block text-sm opacity-60">Step {activeStep + 1} / {steps.length}</div>
                </div>
            </div>

            {/* Stepper */}
            <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex-shrink-0 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto">
                    <ProgressStepper steps={steps} activeStepIndex={activeStep} />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 md:px-10 py-8">
                <div className="max-w-5xl mx-auto">
                    {activeStep === 0 && (
                        <div className="space-y-4">
                            <ChooseFiles single accept={['application/pdf']} onChange={handleFile} />
                            {fileData && (
                                <p className="text-sm text-center text-slate-500 dark:text-slate-400">Selected: <strong>{fileData.file.name}</strong></p>
                            )}
                        </div>
                    )}

                    {activeStep === 1 && fileData && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-600 dark:text-slate-300">Click pages to <span className="text-rose-600 font-medium">mark for deletion</span>. Selected: <strong>{selectedPages.size}</strong> page{selectedPages.size !== 1 ? 's' : ''}</p>
                                {selectedPages.size > 0 && (
                                    <button onClick={() => setSelectedPages(new Set())} className="text-xs text-slate-400 hover:text-slate-600 underline dark:text-slate-500">Clear all</button>
                                )}
                            </div>
                            <Document
                                file={fileData.file}
                                onLoadSuccess={(doc) => setTotalPages(doc.numPages)}
                                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pdf-cover-parent hide-text-layer hide-annotation-layer"
                            >
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <div
                                        key={i}
                                        onClick={() => togglePage(i)}
                                        className={`relative cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${selectedPages.has(i) ? 'border-rose-500 ring-2 ring-rose-300' : 'border-slate-200 hover:border-slate-400'}`}
                                    >
                                        <Page pageNumber={i + 1} className="!w-full !h-auto" />
                                        {selectedPages.has(i) && (
                                            <div className="absolute inset-0 bg-rose-500/30 flex items-center justify-center">
                                                <div className="bg-rose-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs bg-slate-900/60 text-white px-2 py-0.5 rounded-full">
                                            {i + 1}
                                        </div>
                                    </div>
                                ))}
                            </Document>
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
                                            ? <div className="h-full w-full bg-rose-500 animate-pulse" />
                                            : <div className="h-full bg-rose-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
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
                                    <div className="bg-rose-50 rounded-xl border border-rose-200 px-4 py-3 text-sm text-rose-700">
                                        <strong>{selectedPages.size}</strong> page{selectedPages.size !== 1 ? 's' : ''} will be permanently deleted from the PDF.
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                                        <input
                                            type="text"
                                            value={outFileName}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())}
                                            placeholder="cleaned"
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50 dark:border-slate-700"
                                        />
                                    </div>
                                    <button
                                        onClick={startDelete}
                                        className="w-full py-3.5 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 transition-colors shadow-sm"
                                    >
                                        Delete {selectedPages.size} Page{selectedPages.size !== 1 ? 's' : ''} & Download
                                    </button>
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">The cleaned PDF will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}

                    <ToolSeoSection
                        toolPath="/tool/delete-pages"
                        toolName="Delete pages"
                        about="PDF Studio's Delete Pages tool lets you visually select which pages to remove from your PDF. Simply upload the file, click the pages you want to delete, and download the cleaned result — no software to install, no account needed."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="9 11 12 14 22 4"/></svg>, title: 'Visual selection', description: 'Click page thumbnails to mark them for deletion — no need to type page numbers.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>, title: 'Any PDF size', description: 'Works with PDFs of any length — from 2 pages to hundreds.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'Secure & private', description: 'Files are processed securely and deleted after the operation completes.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>, title: 'Instant result', description: 'Your cleaned PDF is ready for download in seconds.' },
                        ]}
                        faqs={[
                            { q: 'Can I delete multiple pages at once?', a: 'Yes — click as many page thumbnails as you want to mark them for deletion before downloading.' },
                            { q: 'Will the remaining pages keep their original quality?', a: 'Yes. Only the selected pages are removed; all other pages are preserved exactly as they are.' },
                            { q: 'What if I accidentally select the wrong page?', a: 'Click the page again to deselect it. You can also click "Clear all" to start over.' },
                            { q: 'Is there a limit on PDF size?', a: 'No hard limit. Performance depends on your internet connection for the upload step.' },
                        ]}
                    />
                </div>
            </div>

            {/* Action bar */}
            <div className="sticky bottom-0 z-30 flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        disabled={activeStep === 0}
                        onClick={() => setActiveStep(a => a - 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                        Back
                    </button>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{activeStep + 1} / {steps.length}</span>
                    <button
                        disabled={nextDisabled}
                        onClick={() => setActiveStep(a => a + 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
