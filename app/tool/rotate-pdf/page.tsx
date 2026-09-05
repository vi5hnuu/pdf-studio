"use client";

import * as React from "react";
import { ChangeEvent, useState } from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { PdfView } from "@/app/_components/pdf-view";
import { generateId } from "@/app/_utils/constants";
import { RotateOptions } from "@/app/_models/rotate-options";
import { RotateForm } from "@/app/tool/rotate-pdf/rotate-form";
import { RotateProgress } from "@/app/tool/rotate-pdf/rotate-progress";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";

const initOptionsState: RotateOptions = {
    out_file_name: 'rotated-file',
    file_angle: 0,
    page_angles: new Map<number, number>(),
    maintain_ratio: true,
};

export interface FileData {
    id: string;
    file: File;
}

export default function Home() {
    const [activeStep, setActiveStep] = useState(0);
    const [file, setFile] = useState<FileData | null>(null);
    const [options, setOptions] = useState<RotateOptions>(initOptionsState);
    const accept = ['application/pdf'];

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const newFiles = Object.values(e.target.files ?? {}) as File[];
        if (!newFiles.length || newFiles.length > 1) return;
        setFile({ id: generateId(32, 'FILE_'), file: newFiles[0] });
    }

    const steps = ['Select File', 'Set Rotation', 'Rotate'];
    const nextDisabled = activeStep === 2 || !file || (activeStep === 1 && !options.out_file_name.length);

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Hero */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/rotate-pdf.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Rotate PDF</h1>
                        <p className="text-sm opacity-75 mt-0.5">Rotate pages globally or individually with precision</p>
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
                                        <span className="text-sm">Upload a PDF file to rotate</span>
                                    </div>
                                ) : (
                                    <PdfView className="!w-44 aspect-[1/1.41] hover:scale-105 z-50 transition-all duration-300" key={file.id} file={file.file} />
                                )}
                            </div>
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="w-full gap-4 grid grid-cols-8">
                            <p className="col-span-8 text-center text-xs text-slate-400 -mb-4">
                                Preview shows angle reference — the actual output preserves the original aspect ratio.
                            </p>
                            <RotateForm className="mx-auto !w-full mb-8 col-span-5" initState={initOptionsState} onChange={setOptions} />
                            <PdfView
                                rotation={options.file_angle}
                                pageRotations={options.page_angles}
                                showAllPages="spread-vertical"
                                className="max-h-[52rem] col-span-3"
                                pageContainerClassName="scale-85"
                                pageClassName="!aspect-[1/1.41]"
                                file={file?.file!}
                            />
                        </div>
                    )}

                    {activeStep === 2 && <RotateProgress options={options} file={file!} />}

                    <ToolSeoSection
                        toolPath="/tool/rotate-pdf"
                        toolName="Rotate pdf"
                        about="Correct the orientation of any PDF page with our free Rotate PDF tool. Apply a global rotation to all pages or set individual angles per page — ideal for fixing scanned documents or landscape-orientation reports."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500"><path d="M21.5 2v6h-6"/><path d="M2.5 12a10 10 0 0 1 19-4.5"/><path d="M2.5 22v-6h6"/><path d="M21.5 12a10 10 0 0 1-19 4.5"/></svg>, title: 'Per-page control', description: 'Set a different rotation angle for individual pages within the same PDF.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 9 6 6"/><path d="m15 9-6 6"/></svg>, title: 'Any angle supported', description: 'Rotate by 90°, 180°, 270°, or custom angles to get the exact orientation.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>, title: 'Live preview', description: 'See how rotations look before downloading the final PDF.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'Quality preserved', description: 'Rotation is applied without re-rendering page content, maintaining full quality.' },
                        ]}
                        faqs={[
                            { q: 'Can I rotate only specific pages?', a: 'Yes. Use the per-page angle controls in the Set Rotation step to assign different angles to individual pages.' },
                            { q: 'Will rotating change the file size?', a: 'No. Rotation changes the page orientation metadata without re-encoding content, so file size stays the same.' },
                            { q: 'What angles can I rotate to?', a: 'You can rotate by 90°, 180°, 270°, or any custom degree value.' },
                            { q: 'Does it work on scanned PDFs?', a: 'Yes. Scanned PDFs (image-based) can be rotated just like text-based PDFs.' },
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
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 text-white text-sm font-semibold hover:bg-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
