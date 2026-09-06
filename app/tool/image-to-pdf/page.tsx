"use client";

import { ChangeEvent, useState } from "react";
import * as React from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { DragDrop } from "@/app/_components/drag-drop";
import { ImageView } from "@/app/_components/image-view";
import { ImageToPdfProgress } from "@/app/tool/image-to-pdf/image-to-pdf-progress";
import { generateId } from "@/app/_utils/constants";
import { formatBytes } from '@/app/_utils/format';
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { useToolStep } from '@/app/_hooks/use-tool-step';

export interface FileData {
    id: string;
    file: File;
}

export default function Home() {
    const [jumpReorder, setJumpReorder] = useState<boolean>(true);
    const [replace, setReplace] = useState<boolean>(false);
    const steps = ['Select Images', 'Arrange Order', 'Create PDF'];

    // Mirrored into the URL so the browser Back button steps back rather than
    // leaving the tool and losing the file.
    const [activeStep, setActiveStep] = useToolStep(steps.length);
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

    function removeFile(id: string) {
        setFiles(fs => fs.filter(f => f.id !== id));
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

    const nextDisabled = activeStep === 2 || files.length < 1;

    return (
        <div className="flex-1 flex flex-col">
            {/* Hero */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 md:px-8 py-2.5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center flex-shrink-0">
                        <img src="/tools/image-to-pdf.svg" alt="" className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base font-semibold leading-tight">Image to PDF</h1>
                        <p className="text-xs opacity-75 leading-tight">Convert images into ordered, high-quality PDF documents</p>
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
                                ) : files.map((fd, index) => (
                                    // Photos from a camera all look alike as thumbnails, and the
                                    // order here becomes the page order — so each one has to say
                                    // which file it is and where it sits, and be removable alone.
                                    <div key={fd.id} className="group relative flex flex-col gap-1.5">
                                        <span className="absolute left-1 top-1 z-10 min-w-5 px-1.5 h-5 rounded-full
                                                         bg-slate-900/80 text-white text-[11px] font-semibold
                                                         flex items-center justify-center tabular-nums">
                                            {index + 1}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(fd.id)}
                                            aria-label={`Remove ${fd.file.name}`}
                                            title={`Remove ${fd.file.name}`}
                                            className="absolute right-1 top-1 z-10 w-6 h-6 rounded-full bg-white
                                                       dark:bg-slate-800 border border-slate-300 dark:border-slate-600
                                                       text-slate-500 dark:text-slate-300 text-sm leading-none shadow-sm
                                                       opacity-0 group-hover:opacity-100 focus:opacity-100
                                                       hover:text-red-600 hover:border-red-300
                                                       dark:hover:text-red-400 dark:hover:border-red-800 transition-opacity"
                                        >
                                            ×
                                        </button>
                                        <ImageView
                                            className="m-auto hover:scale-105 aspect-[1/1.41] transition-all duration-300"
                                            file={fd.file}
                                        />
                                        <p className="text-xs text-center text-slate-600 dark:text-slate-300 truncate"
                                           title={fd.file.name}>
                                            {fd.file.name}
                                        </p>
                                        <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
                                            {formatBytes(fd.file.size)}
                                        </p>
                                    </div>
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
                                    <label className={`px-4 py-1.5 cursor-pointer transition-colors ${jumpReorder ? 'bg-blue-600 text-white font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                        <input type="radio" className="sr-only" checked={jumpReorder} onChange={() => setJumpReorder(true)} />
                                        Jump
                                    </label>
                                    <label className={`px-4 py-1.5 cursor-pointer border-l border-slate-200 dark:border-slate-700 transition-colors ${!jumpReorder ? 'bg-blue-600 text-white font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                        <input type="radio" className="sr-only" checked={!jumpReorder} onChange={() => setJumpReorder(false)} />
                                        Slide
                                    </label>
                                </div>
                            </div>
                            <DragDrop onUpdateItemsOrder={onReorder}>
                                {files.map((fd) => (
                                    <div key={fd.id} className="flex flex-col gap-1.5">
                                        <ImageView
                                            className="m-auto hover:scale-105 aspect-[1/1.41] transition-all duration-300"
                                            file={fd.file}
                                        />
                                        <p className="text-xs text-center text-slate-600 dark:text-slate-300 truncate"
                                           title={fd.file.name}>
                                            {fd.file.name}
                                        </p>
                                    </div>
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
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Back
                    </button>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{activeStep + 1} / {steps.length}</span>
                    <button
                        disabled={nextDisabled}
                        onClick={() => setActiveStep(a => a + 1)}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
