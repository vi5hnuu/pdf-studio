"use client";

import { ChangeEvent, useState } from "react";
import * as React from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { DragDrop } from "@/app/_components/drag-drop";
import { ImageView } from "@/app/_components/image-view";
import { ImageToPdfProgress } from "@/app/tool/image-to-pdf/image-to-pdf-progress";
import { generateId } from "@/app/_utils/constants";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";

export interface FileData {
    id: string;
    file: File;
}

export default function Home() {
    const [jumpReorder, setJumpReorder] = useState<boolean>(true);
    const [replace, setReplace] = useState<boolean>(false);
    const [activeStep, setActiveStep] = useState(0);
    const [files, setFiles] = useState<FileData[]>([]);
    const accept = ['image/*'];

    function handleFiles(e: ChangeEvent<HTMLInputElement>) {
        const newFiles = Object.values(e.target.files ?? {}) as File[];
        if (!newFiles.length) return;
        const newFilesData = newFiles.map(f => ({ id: generateId(32, 'FILE_'), file: f } as FileData));
        setFiles(fs => replace ? newFilesData : fs.concat(newFilesData));
    }

    function _swapItem(items: any[], from: number, to: number) {
        if (from < 0 || from > items.length || to < 0 || to > items.length) throw new Error('invalid args');
        const item = items[from]; items[from] = items[to]; items[to] = item;
    }

    function onReorder(pPos: number, curPos: number) {
        setFiles(fs => {
            const newOrder = [...fs];
            if (jumpReorder) { _swapItem(newOrder, pPos, curPos); return newOrder; }
            for (let fNo = pPos; fNo < curPos; fNo++) _swapItem(newOrder, fNo, fNo + 1);
            for (let fNo = pPos; fNo > curPos; fNo--) _swapItem(newOrder, fNo, fNo - 1);
            return newOrder;
        });
    }

    const steps = ['Select Images', 'Arrange Order', 'Create PDF'];
    const nextDisabled = activeStep === 2 || files.length < 1;

    return (
        <div className="flex-1 flex flex-col">
            {/* Hero */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/image-to-pdf.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Image to PDF</h1>
                        <p className="text-sm opacity-75 mt-0.5">Convert images into ordered, high-quality PDF documents</p>
                    </div>
                    <div className="hidden md:block text-sm opacity-60 flex-shrink-0">
                        Step {activeStep + 1} / {steps.length}
                    </div>
                </div>
            </div>

            {/* Stepper */}
            <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex-shrink-0 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto">
                    <ProgressStepper steps={steps} activeStepIndex={activeStep} />
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 px-6 md:px-10 py-8">
                <div className="max-w-5xl mx-auto">
                    {activeStep === 0 && (
                        <div className="space-y-4">
                            <div className="relative">
                                <ChooseFiles accept={accept} onChange={handleFiles} />
                                <label className="absolute right-0 top-0 -translate-y-full pb-1.5 flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={replace}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setReplace(e.target.checked)}
                                        className="w-4 h-4 rounded accent-blue-600"
                                    />
                                    Replace existing
                                </label>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 rounded-xl border border-slate-200 bg-slate-50 gap-4 p-6 min-h-[12rem] max-h-[36rem] overflow-auto dark:bg-slate-900 dark:border-slate-700">
                                {!files.length ? (
                                    <div className="col-span-5 flex flex-col items-center justify-center gap-2 py-12 text-slate-400 dark:text-slate-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                                        <span className="text-sm">Upload images to convert to PDF</span>
                                    </div>
                                ) : files.map((fd) => (
                                    <ImageView
                                        className="m-auto hover:scale-105 aspect-[1/1.41] z-50 transition-all duration-300"
                                        key={fd.id} file={fd.file}
                                    />
                                ))}
                            </div>
                            {files.length > 0 && (
                                <p className="text-xs text-slate-400 text-center dark:text-slate-500">{files.length} image{files.length !== 1 ? 's' : ''} selected</p>
                            )}
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-sm text-slate-500 font-medium dark:text-slate-400">Drag mode:</span>
                                <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm dark:border-slate-700">
                                    <label className={`px-4 py-1.5 cursor-pointer transition-colors ${jumpReorder ? 'bg-blue-600 text-white font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                                        <input type="radio" className="sr-only" checked={jumpReorder} onChange={() => setJumpReorder(true)} />
                                        Jump
                                    </label>
                                    <label className={`px-4 py-1.5 cursor-pointer border-l border-slate-200 transition-colors ${!jumpReorder ? 'bg-blue-600 text-white font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                                        <input type="radio" className="sr-only" checked={!jumpReorder} onChange={() => setJumpReorder(false)} />
                                        Slide
                                    </label>
                                </div>
                            </div>
                            <DragDrop onUpdateItemsOrder={onReorder}>
                                {files.map((fd) => (
                                    <ImageView
                                        className="m-auto hover:scale-105 z-50 aspect-[1/1.41] transition-all duration-300"
                                        key={fd.id} file={fd.file}
                                    />
                                ))}
                            </DragDrop>
                        </div>
                    )}

                    {activeStep === 2 && <ImageToPdfProgress files={files} />}

                    <ToolSeoSection
                        toolPath="/tool/image-to-pdf"
                        toolName="Image to pdf"
                        about="Convert JPG, PNG, WebP, and other image formats into a professional PDF document. Upload multiple images, arrange them by dragging, and generate a single PDF — perfect for creating photo albums, reports, or document scans."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>, title: 'Multiple image formats', description: 'Supports JPG, PNG, WebP, BMP, GIF and most other common image formats.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, title: 'Drag-to-reorder', description: 'Arrange image order by dragging before converting to get the right page sequence.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M8 3H2v6"/><path d="M2 3l7 7"/><path d="M16 3h6v6"/><path d="M22 3l-7 7"/></svg>, title: 'Batch upload', description: 'Select and upload many images at once — no need to add them one by one.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'Fast conversion', description: 'Your PDF is generated server-side and ready to download within seconds.' },
                        ]}
                        faqs={[
                            { q: 'What image formats are supported?', a: 'JPG, PNG, WebP, BMP, and most other common image formats are accepted.' },
                            { q: 'Will each image become one page?', a: 'Yes. Each image is placed on its own page in the output PDF, in the order you arrange them.' },
                            { q: 'Is there a limit on how many images I can convert?', a: 'There is no hard limit. You can convert any number of images into a single PDF.' },
                            { q: 'Does the image quality change in the PDF?', a: 'Images are embedded directly into the PDF. Quality depends on the original image resolution you provide.' },
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
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Back
                    </button>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{activeStep + 1} / {steps.length}</span>
                    <button
                        disabled={nextDisabled}
                        onClick={() => setActiveStep(a => a + 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
