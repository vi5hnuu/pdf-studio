"use client";

import { ChangeEvent, useState } from "react";
import * as React from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { PdfView } from "@/app/_components/pdf-view";
import { DragDrop } from "@/app/_components/drag-drop";
import { MergeProgress } from "@/app/tool/merge-pdf/merge-progress";
import { generateId, swapItem } from "@/app/_utils/constants";
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
    const accept = ['application/pdf'];

    function handleFiles(e: ChangeEvent<HTMLInputElement>) {
        const newFiles = Object.values(e.target.files ?? {}) as File[];
        if (!newFiles.length) return;
        const newFilesData = newFiles.map(f => ({ id: generateId(32, 'FILE_'), file: f } as FileData));
        setFiles(fs => replace ? newFilesData : fs.concat(newFilesData));
    }

    function onReorder(pPos: number, curPos: number) {
        setFiles(fs => {
            const newOrder = [...fs];
            if (jumpReorder) { swapItem(newOrder, pPos, curPos); return newOrder; }
            for (let fNo = pPos; fNo < curPos; fNo++) swapItem(newOrder, fNo, fNo + 1);
            for (let fNo = pPos; fNo > curPos; fNo--) swapItem(newOrder, fNo, fNo - 1);
            return newOrder;
        });
    }

    const steps = ['Select Files', 'Arrange Order', 'Merge'];
    const nextDisabled = activeStep === 2 || files.length <= 1;

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Hero */}
            <div className="bg-gradient-to-r from-purple-600 to-violet-700 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/merge-pdf.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Merge PDF</h1>
                        <p className="text-sm opacity-75 mt-0.5">Combine multiple PDFs into one unified file</p>
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
            <div className="flex-1 overflow-auto px-6 md:px-10 py-8">
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
                                        className="w-4 h-4 rounded accent-purple-600"
                                    />
                                    Replace existing
                                </label>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 rounded-xl border border-slate-200 bg-slate-50 gap-4 p-6 min-h-[12rem] max-h-[36rem] overflow-auto dark:bg-slate-900 dark:border-slate-700">
                                {!files.length ? (
                                    <div className="col-span-5 flex flex-col items-center justify-center gap-2 py-12 text-slate-400 dark:text-slate-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                                        <span className="text-sm">Upload at least 2 PDF files to merge</span>
                                    </div>
                                ) : files.map((fd) => (
                                    <PdfView
                                        className="m-auto hover:scale-[1.02] aspect-[1/1.41] z-50 transition-all duration-300"
                                        key={fd.id} file={fd.file}
                                    />
                                ))}
                            </div>
                            {files.length > 0 && (
                                <p className="text-xs text-slate-400 text-center dark:text-slate-500">{files.length} file{files.length !== 1 ? 's' : ''} selected{files.length < 2 ? ' — add at least one more' : ' — ready to arrange'}</p>
                            )}
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-sm text-slate-500 font-medium dark:text-slate-400">Drag mode:</span>
                                <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm dark:border-slate-700">
                                    <label className={`px-4 py-1.5 cursor-pointer transition-colors ${jumpReorder ? 'bg-purple-600 text-white font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                                        <input type="radio" className="sr-only" checked={jumpReorder} onChange={() => setJumpReorder(true)} />
                                        Jump
                                    </label>
                                    <label className={`px-4 py-1.5 cursor-pointer border-l border-slate-200 transition-colors ${!jumpReorder ? 'bg-purple-600 text-white font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                                        <input type="radio" className="sr-only" checked={!jumpReorder} onChange={() => setJumpReorder(false)} />
                                        Slide
                                    </label>
                                </div>
                            </div>
                            <DragDrop onUpdateItemsOrder={onReorder}>
                                {files.map((fd) => (
                                    <PdfView
                                        className="m-auto hover:scale-105 z-50 aspect-[1/1.41] transition-all duration-300"
                                        key={fd.id} file={fd.file}
                                    />
                                ))}
                            </DragDrop>
                        </div>
                    )}

                    {activeStep === 2 && <MergeProgress files={files} />}

                    <ToolSeoSection
                        toolPath="/tool/merge-pdf"
                        toolName="Merge pdf"
                        about="PDF Studio's free Merge PDF tool lets you combine any number of PDF files into a single, unified document. Upload your files, drag them into the right order, and download the merged result in seconds — all without installing any software or creating an account."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M8 3H2v6"/><path d="M2 3l7 7"/><path d="M16 3h6v6"/><path d="M22 3l-7 7"/><path d="M8 21H2v-6"/><path d="M2 21l7-7"/><path d="M16 21h6v-6"/><path d="M22 21l-7-7"/></svg>, title: 'Unlimited files', description: 'Merge as many PDFs as you need in a single operation — no cap on file count.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, title: 'Drag-to-reorder', description: 'Arrange the order of your PDFs by dragging before merging.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'Secure & private', description: 'Files are transferred over HTTPS and deleted after processing.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>, title: 'Fast processing', description: 'Server-side merging delivers your combined PDF in seconds.' },
                        ]}
                        faqs={[
                            { q: 'How many PDFs can I merge at once?', a: 'There is no hard limit on the number of files. You can merge as many PDFs as you need in one go.' },
                            { q: 'Will the quality of my PDFs be reduced?', a: 'No. The merge process combines your files without re-encoding content, preserving the original quality.' },
                            { q: 'Can I change the order of pages after merging?', a: 'Use the Arrange Order step to drag files into the correct sequence before merging. For per-page reordering, use our Reorder PDF tool.' },
                            { q: 'Are my files stored on your servers?', a: 'Files are automatically deleted after the operation completes. We do not retain your documents.' },
                        ]}
                    />
                </div>
            </div>

            {/* Bottom action bar */}
            <div className="flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4 dark:bg-slate-800 dark:border-slate-700">
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
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
