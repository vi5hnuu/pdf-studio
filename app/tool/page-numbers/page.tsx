"use client";

import * as React from "react";
import { ChangeEvent, useState } from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { PdfView } from "@/app/_components/pdf-view";
import { Font, generateId } from "@/app/_utils/constants";
import { PageNumbersForm } from "@/app/tool/page-numbers/page-numbers-form";
import { PageNumbersOptions } from "@/app/_models/page-numbers-options";
import { PagenoProgress } from "@/app/tool/page-numbers/pageno-progress";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";

const initOptionsState: PageNumbersOptions = {
    size: 14,
    out_file_name: 'page-numbers',
    fill_color: { r: 0, g: 0, b: 0, a: 1 },
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    font_name: Font.HELVETICA,
    from_page: 0,
    page_no_type: 'ONLY_X',
    horizontal_position: 'CENTER',
    vertical_position: 'START',
};

export interface FileData {
    id: string;
    file: File;
}

export default function Home() {
    const [activeStep, setActiveStep] = useState(0);
    const [file, setFile] = useState<FileData | null>(null);
    const [options, setOptions] = useState<PageNumbersOptions>(initOptionsState);
    const accept = ['application/pdf'];

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const newFiles = Object.values(e.target.files ?? {}) as File[];
        if (!newFiles.length || newFiles.length > 1) return;
        setFile({ id: generateId(32, 'FILE_'), file: newFiles[0] });
    }

    const steps = ['Select File', 'Set Options', 'Add Numbers'];
    const nextDisabled = activeStep === 2 || !file || (activeStep === 1 && !options.out_file_name.length);

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Hero */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/page-numbers.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Add Page Numbers</h1>
                        <p className="text-sm opacity-75 mt-0.5">Add customizable page numbers with full layout control</p>
                    </div>
                    <div className="hidden md:block text-sm opacity-60 flex-shrink-0">
                        Step {activeStep + 1} / {steps.length}
                    </div>
                </div>
            </div>

            {/* Stepper */}
            <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex-shrink-0">
                <div className="max-w-5xl mx-auto">
                    <ProgressStepper steps={steps} activeStepIndex={activeStep} />
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-auto px-6 md:px-10 py-8">
                <div className="max-w-5xl mx-auto">
                    {activeStep === 0 && (
                        <div className="space-y-4">
                            <ChooseFiles single accept={accept} onChange={handleFile} />
                            <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6 min-h-[12rem]">
                                {!file ? (
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                                        <span className="text-sm">Upload a PDF to add page numbers</span>
                                    </div>
                                ) : (
                                    <PdfView className="!w-44 aspect-[1/1.41] hover:scale-105 z-50 transition-all duration-300" key={file.id} file={file.file} />
                                )}
                            </div>
                        </div>
                    )}

                    {activeStep === 1 && (
                        <PageNumbersForm className="mx-auto mb-8" initState={initOptionsState} onChange={setOptions} />
                    )}

                    {activeStep === 2 && <PagenoProgress options={options} file={file!} />}

                    <ToolSeoSection
                        toolPath="/tool/page-numbers"
                        toolName="Page numbers"
                        about="Add professional page numbers to any PDF using our free online tool. Choose position (header/footer, left/center/right), font, size, color, and format — then download your numbered PDF instantly."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>, title: 'Full layout control', description: 'Set position, padding, horizontal and vertical alignment for page numbers.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>, title: 'Custom fonts & colors', description: 'Pick from standard PDF fonts and any text color for the page numbers.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>, title: 'Multiple formats', description: 'Display page number only, page of total, or custom format strings.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M8 3H2v6"/><path d="M2 3l7 7"/><path d="M16 3h6v6"/><path d="M22 3l-7 7"/></svg>, title: 'Skip first pages', description: 'Choose which page to start numbering from (e.g. skip the title page).' },
                        ]}
                        faqs={[
                            { q: 'Can I skip the first few pages?', a: 'Yes. The "from page" setting lets you start numbering from any page, so you can skip covers or title pages.' },
                            { q: 'What number formats are available?', a: 'You can display just the page number (e.g. "3"), page of total (e.g. "3 / 10"), or other format variants.' },
                            { q: 'Which fonts are supported?', a: 'Standard PDF fonts including Helvetica, Times Roman, and Courier families are supported.' },
                            { q: 'Can I position numbers at the top or bottom?', a: 'Yes. You can place page numbers in the header or footer, and choose left, center, or right alignment.' },
                        ]}
                    />
                </div>
            </div>

            {/* Bottom action bar */}
            <div className="flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        disabled={activeStep === 0}
                        onClick={() => setActiveStep(a => a - 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Back
                    </button>
                    <span className="text-xs text-slate-400">{activeStep + 1} / {steps.length}</span>
                    <button
                        disabled={nextDisabled}
                        onClick={() => setActiveStep(a => a + 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
