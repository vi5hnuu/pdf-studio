"use client";

import * as React from "react";
import { ChangeEvent, useState } from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { PdfView } from "@/app/_components/pdf-view";
import { generateId } from "@/app/_utils/constants";
import { SplitProgress } from "@/app/tool/split-pdf/split-progress";
import { SplitOptions, SplitType } from "@/app/_models/split-options";
import { SplitForm } from "@/app/tool/split-pdf/split-form";
import { usePdfPageCount } from '@/app/_hooks/use-pdf-page-count';
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { useToolStep } from '@/app/_hooks/use-tool-step';

const initOptionsState: SplitOptions = { out_file_name: '', type: SplitType.FIXED_RANGE, fixed: 2, ranges: [] };

export interface FileData {
    id: string;
    file: File;
}

export default function Home() {
    const steps = ['Select File', 'Set Options', 'Split'];

    // Mirrored into the URL so the browser Back button steps back rather than
    // leaving the tool and losing the file.
    const [activeStep, setActiveStep] = useToolStep(steps.length);
    const [file, setFile] = useState<FileData | null>(null);
    const pageCount = usePdfPageCount(file?.file);
    const [options, setOptions] = useState<SplitOptions>(initOptionsState);
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
            <div className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-4 md:px-8 py-2.5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center flex-shrink-0">
                        <img src="/tools/split-pdf.svg" alt="" className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base font-semibold leading-tight">Split PDF</h1>
                        <p className="text-xs opacity-75 leading-tight">Split PDFs by ranges, groups, or individual pages</p>
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
                                        <span className="text-sm">Upload a PDF file to split</span>
                                    </div>
                                ) : (
                                    <PdfView className="!w-44 aspect-[1/1.41] hover:scale-105 z-50 transition-all duration-300" key={file.id} file={file.file} />
                                )}
                            </div>
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="relative w-full flex flex-col md:flex-row gap-6">
                            <SplitForm className="mx-auto mb-8 max-w-[30rem] flex-1 p-4" initState={initOptionsState}
                                       onChange={setOptions} pageCount={pageCount} />
                            <PdfView
                                showAllPages={options.type === SplitType.EXTRACT_ALL_PAGES ? 'grid' : 'range'}
                                pageClassName="aspect-[1/1.41]"
                                className="mx-auto max-h-[52rem] max-w-[20rem]"
                                file={file!.file}
                            />
                        </div>
                    )}

                    {activeStep === 2 && <SplitProgress options={options} file={file!} />}

                    <ToolSeoSection
                        toolPath="/tool/split-pdf"
                        toolName="Split pdf"
                        about="Split any PDF into multiple documents using flexible options. Choose a fixed page count per file, define custom page ranges, or extract every page as its own PDF — all in a few clicks, completely free."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>, title: 'Multiple split modes', description: 'Split by fixed range, custom ranges, or extract every individual page.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>, title: 'Visual page preview', description: 'See pages before splitting so you can configure ranges correctly.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>, title: 'ZIP download', description: 'Multiple output files are packed into a ZIP for easy downloading.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'No registration', description: 'Split your PDFs immediately — no account or sign-up required.' },
                        ]}
                        faqs={[
                            { q: 'What split modes are available?', a: 'You can split by fixed page count (e.g. every 2 pages), by custom ranges (e.g. 1-3, 4-7), or extract every single page as its own PDF.' },
                            { q: 'Will I receive multiple files?', a: 'Yes. Multiple output files are automatically zipped together and downloaded as a single ZIP archive.' },
                            { q: 'Does splitting reduce PDF quality?', a: 'No. Pages are extracted without re-encoding, so the original quality is fully preserved.' },
                            { q: 'Can I split a password-protected PDF?', a: 'You will need to unlock the PDF first using our Unlock PDF tool, then split it.' },
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
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
