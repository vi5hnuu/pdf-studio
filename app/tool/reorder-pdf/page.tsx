"use client";

import { ChangeEvent, useState } from "react";
import * as React from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { PdfView } from "@/app/_components/pdf-view";
import { generateId } from "@/app/_utils/constants";
import { ReorderProgress } from "@/app/tool/reorder-pdf/reorder-progress";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { useToolStep } from '@/app/_hooks/use-tool-step';

export interface FileData {
    id: string;
    file: File;
}

export default function Home() {
    const steps = ['Select File', 'Arrange Pages', 'Save PDF'];

    // Mirrored into the URL so the browser Back button steps back rather than
    // leaving the tool and losing the file.
    const [activeStep, setActiveStep] = useToolStep(steps.length);
    const [file, setFile] = useState<FileData | null>(null);
    const [pageOrder, setPageOrder] = useState<number[]>([]);
    const accept = ['application/pdf'];

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const newFiles = Object.values(e.target.files ?? {}) as File[];
        if (!newFiles.length || newFiles.length > 1) return;
        setFile({ id: generateId(32, 'FILE_'), file: newFiles[0] });
    }

    const nextDisabled = activeStep === 2 || !file;

    return (
        <div className="flex-1 flex flex-col">
            {/* Hero */}
            <div className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 md:px-8 py-2.5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center flex-shrink-0">
                        <img src="/tools/reorder-pdf.svg" alt="" className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base font-semibold leading-tight">Reorder PDF</h1>
                        <p className="text-xs opacity-75 leading-tight">Rearrange PDF pages using visual drag-and-drop</p>
                    </div>
                    <div className="hidden md:block text-xs opacity-60 flex-shrink-0">
                        Step {activeStep + 1} / {steps.length}
                    </div>
                </div>
            </div>

            {/* Stepper */}
            <div className="bg-white border-b border-slate-100 px-4 md:px-8 py-1.5 flex-shrink-0 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto">
                    <ProgressStepper steps={steps} activeStepIndex={activeStep} onStepClick={setActiveStep} />
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 px-4 md:px-8 py-5">
                <div className="max-w-5xl mx-auto">
                    {activeStep === 0 && (
                        <div className="space-y-4">
                            <ChooseFiles single accept={accept} onChange={handleFile} />
                            <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6 min-h-[12rem] dark:bg-slate-900 dark:border-slate-700">
                                {!file ? (
                                    <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                                        <span className="text-sm">Upload a PDF to reorder its pages</span>
                                    </div>
                                ) : (
                                    <PdfView className="!w-44 aspect-[1/1.41] hover:scale-105 z-50 transition-all duration-300" key={file.id} file={file.file} />
                                )}
                            </div>
                        </div>
                    )}

                    {activeStep === 1 && file && (
                        <PdfView
                            allowReordering
                            onOrderUpdate={(order) => setPageOrder(order)}
                            showAllPages="grid"
                            className="m-auto z-50 aspect-[1/1.41] transition-all duration-300"
                            key={file.id} file={file.file}
                        />
                    )}

                    {activeStep === 2 && <ReorderProgress order={pageOrder} file={file!} />}

                    <ToolSeoSection
                        toolPath="/tool/reorder-pdf"
                        toolName="Reorder pdf"
                        about="Visually rearrange pages in any PDF using drag-and-drop. Upload your PDF, drag thumbnail cards into the order you want, then download the reordered result. Perfect for reorganising reports, presentations, or scanned documents."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, title: 'Visual drag-and-drop', description: 'See page thumbnails and drag them into the correct order before saving.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M8 3H2v6"/><path d="M2 3l7 7"/><path d="M16 3h6v6"/><path d="M22 3l-7 7"/></svg>, title: 'Jump or slide swap', description: 'Choose between jump-swap (two pages swap) or slide-shift (pages shift along) modes.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, title: 'Preserves content', description: 'Page content, fonts, images, and annotations are preserved exactly as-is.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'Instant download', description: 'The reordered PDF is ready to download immediately after processing.' },
                        ]}
                        faqs={[
                            { q: 'How do I reorder pages?', a: 'In the "Arrange Pages" step, page thumbnails are shown in a grid. Drag any card to a new position to change the order.' },
                            { q: 'What is the difference between Jump and Slide swap modes?', a: 'Jump mode directly swaps two pages. Slide mode shifts all pages between the source and destination positions by one step.' },
                            { q: 'Can I remove pages with this tool?', a: 'This tool reorders pages only. To delete specific pages, use our Split PDF tool to extract the pages you want to keep.' },
                            { q: 'Does reordering affect the original document quality?', a: 'No. Pages are moved by updating the PDF structure — no re-encoding happens, so quality is fully preserved.' },
                        ]}
                    />
                </div>
            </div>

            {/* Bottom action bar */}
            <div className="sticky bottom-0 z-30 flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        disabled={activeStep === 0}
                        onClick={() => setActiveStep(a => a - 1)}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Back
                    </button>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{activeStep + 1} / {steps.length}</span>
                    <button
                        disabled={nextDisabled}
                        onClick={() => setActiveStep(a => a + 1)}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
