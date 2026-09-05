"use client";

import * as React from "react";
import { ChangeEvent, useState } from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { generateId } from "@/app/_utils/constants";
import { ToolsApi } from "@/app/_utils/api";
import { runToolRequest } from '@/app/_hooks/use-tool-request';
import { ToolCostBadge } from '@/app/_components/tool-cost-badge';
import { useToolStep } from '@/app/_hooks/use-tool-step';
import { formatBytes } from '@/app/_utils/format';

interface FileData { id: string; file: File; }

enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

const PAGE_SIZES: { label: string; width: number; height: number }[] = [
    { label: 'A4', width: 595.28, height: 841.89 },
    { label: 'Letter', width: 612, height: 792 },
    { label: 'A3', width: 841.89, height: 1190.55 },
    { label: 'Legal', width: 612, height: 1008 },
];

export default function AddBlankPages() {
    const steps = ['Select File', 'Configure', 'Add Pages'];

    // Mirrored into the URL so the browser Back button steps back rather than
    // leaving the tool and losing the file.
    const [activeStep, setActiveStep] = useToolStep(steps.length);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [positions, setPositions] = useState('');
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [outFileName, setOutFileName] = useState('');
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);


    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        setFileData({ id: generateId(32, 'FILE_'), file: f });
    }

    function parsePositions(): number[] {
        return positions
            .split(',')
            .map(s => parseInt(s.trim(), 10))
            .filter(n => !isNaN(n) && n >= 0);
    }

    async function startAdd() {
        if (!fileData) return;
        const body = {
            out_file_name: outFileName || 'pdf-with-blanks',
            // Fields are 1-based ("insert before page N"); the endpoint takes 0-based
            // insertion points.
            positions: parsePositions().map((p) => Math.max(0, p - 1)),
            page_width: pageSize.width,
            page_height: pageSize.height,
        };
        const formData = new FormData();
        formData.append('add-blank-pages-info', new Blob([JSON.stringify(body)], { type: 'application/json' }));
        formData.append('file', fileData.file);

        await runToolRequest({
            url: ToolsApi.addBlankPages,
            formData,
            fallbackFilename: 'add-blank-pages.pdf',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Adding blank pages...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    return (
        <div className="flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/add-blank-pages.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Add Blank Pages</h1>
                        <p className="text-sm opacity-75 mt-0.5">Insert blank pages at specific positions in your PDF</p>
                    </div>
                    <div className="hidden md:block text-sm opacity-60 flex-shrink-0">Step {activeStep + 1} / {steps.length}</div>
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
                            {fileData && (
                                <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                                    Selected: <strong>{fileData.file.name}</strong> ({formatBytes(fileData.file.size)})
                                </p>
                            )}
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="max-w-md mx-auto space-y-5">
                            <p className="text-sm text-slate-500 text-center dark:text-slate-400">Enter the page numbers to insert a blank page before, and choose the blank page size.</p>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Insert positions <span className="text-slate-400 font-normal dark:text-slate-500">(comma-separated, 0 = before page 1)</span></label>
                                <input
                                    type="text"
                                    value={positions}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPositions(e.target.value)}
                                    placeholder="e.g. 0, 2, 5"
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Blank page size</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {PAGE_SIZES.map(ps => (
                                        <button
                                            key={ps.label}
                                            onClick={() => setPageSize(ps)}
                                            className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${pageSize.label === ps.label ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                        >
                                            {ps.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {parsePositions().length > 0 && (
                                <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-xs text-indigo-800 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300">
                                    Will insert {parsePositions().length} blank {parsePositions().length === 1 ? 'page' : 'pages'} ({pageSize.label}) at position{parsePositions().length > 1 ? 's' : ''}: {parsePositions().join(', ')}
                                </div>
                            )}
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
                                            ? <div className="h-full w-full bg-indigo-600 animate-pulse" />
                                            : <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                        }
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    {error}
                                    {/credits?/i.test(error) && (
                                        <a href="/account" className="underline font-medium whitespace-nowrap">
                                            Get credits
                                        </a>
                                    )}
                                </div>
                            )}
                            {step === Step.IDLE && (
                                <div className="flex flex-col gap-4">
                                    <ToolCostBadge toolId="add-blank-pages" file={fileData?.file} />
                                    <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 space-y-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200">
                                        <p>Inserting <strong>{parsePositions().length}</strong> blank <strong>{pageSize.label}</strong> {parsePositions().length === 1 ? 'page' : 'pages'} at: <strong>{parsePositions().join(', ') || '—'}</strong></p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                                        <input
                                            type="text"
                                            value={outFileName}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())}
                                            placeholder="pdf-with-blanks"
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700"
                                        />
                                    </div>
                                    <button
                                        onClick={startAdd}
                                        disabled={parsePositions().length === 0}
                                        className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                                    >
                                        Add Blank Pages & Download
                                    </button>
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">Your PDF will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}

                    <ToolSeoSection
                        toolPath="/tool/add-blank-pages"
                        toolName="Add Blank Pages"
                        about="Insert blank pages at any position in your PDF — before the first page, between existing pages, or at the end. Choose from standard page sizes (A4, Letter, A3, Legal) for the inserted blanks. Perfect for adding separator pages or placeholders in multi-section documents."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>, title: 'Multi-position insertion', description: 'Insert blanks at multiple positions in a single operation.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>, title: 'Standard page sizes', description: 'A4, Letter, A3, and Legal sizes available for blank pages.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'Secure & private', description: 'Files are deleted immediately after processing.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>, title: 'Fast processing', description: 'Results are ready in seconds regardless of PDF length.' },
                        ]}
                        faqs={[
                            { q: 'How are positions numbered?', a: 'Enter the page number you want the blank inserted before, counting from 1. Entering 1 puts a blank before the first page; entering 3 puts one before the third.' },
                            { q: 'Can I insert multiple blank pages at the same position?', a: 'Yes — enter the same position multiple times (e.g. 2, 2) to insert two blanks at position 2.' },
                            { q: 'What if I enter a position larger than the number of pages?', a: 'Positions beyond the end of the document are clamped to the end, so blanks are appended after the last page.' },
                            { q: 'Are my files stored on your servers?', a: 'Files are automatically deleted after the operation completes. We do not retain your documents.' },
                        ]}
                    />
                </div>
            </div>

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
                        disabled={activeStep === 2 || !fileData}
                        onClick={() => setActiveStep(a => a + 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
