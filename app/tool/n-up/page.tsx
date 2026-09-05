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

const LAYOUTS: { nUp: number; label: string; description: string; cols: number; rows: number }[] = [
    { nUp: 2, label: '2-Up', description: '2 pages side by side on a landscape A4 sheet', cols: 2, rows: 1 },
    { nUp: 4, label: '4-Up', description: '4 pages in a 2×2 grid on a portrait A4 sheet', cols: 2, rows: 2 },
];

enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

/** Mini visual preview of page layout */
function LayoutPreview({ cols, rows }: { cols: number; rows: number }) {
    const cells = Array.from({ length: cols * rows });
    return (
        <div
            className="border-2 border-slate-300 rounded-lg bg-white p-1.5 flex flex-col gap-1 dark:bg-slate-800 dark:border-slate-600"
            style={{ aspectRatio: cols > rows ? '1.41 / 1' : '1 / 1.41', width: 64 }}
        >
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="flex gap-1 flex-1">
                    {Array.from({ length: cols }).map((_, c) => (
                        <div key={c} className="flex-1 rounded bg-slate-100 border border-slate-200 dark:bg-slate-700 dark:border-slate-700" />
                    ))}
                </div>
            ))}
        </div>
    );
}

export default function NUpPdf() {
    const steps = ['Select File', 'Choose Layout', 'Convert & Download'];

    // Mirrored into the URL so the browser Back button steps back rather than
    // leaving the tool and losing the file.
    const [activeStep, setActiveStep] = useToolStep(steps.length);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [nUp, setNUp] = useState(2);
    const [outFileName, setOutFileName] = useState('');
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);


    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        setFileData({ id: generateId(32, 'FILE_'), file: f });
    }

    async function startConvert() {
        if (!fileData) return;
        const body = { out_file_name: outFileName || `${nUp}up`, n_up: nUp };
        const formData = new FormData();
        formData.append('n-up-info', new Blob([JSON.stringify(body)], { type: 'application/json' }));
        formData.append('file', fileData.file);

        await runToolRequest({
            url: ToolsApi.nUpPdf,
            formData,
            fallbackFilename: 'n-up.pdf',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Arranging pages...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';
    const selectedLayout = LAYOUTS.find(l => l.nUp === nUp)!;

    return (
        <div className="flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/n-up-pdf.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">N-Up Layout</h1>
                        <p className="text-sm opacity-75 mt-0.5">Arrange multiple PDF pages onto a single sheet</p>
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
                        <div className="max-w-xl mx-auto space-y-6">
                            <p className="text-sm text-slate-500 text-center dark:text-slate-400">Choose how many original pages to place on each output sheet.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {LAYOUTS.map(({ nUp: n, label, description, cols, rows }) => (
                                    <label
                                        key={n}
                                        className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${nUp === n ? 'border-violet-600 bg-violet-50 shadow-md' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                                    >
                                        <input type="radio" className="sr-only" checked={nUp === n} onChange={() => setNUp(n)} />
                                        <LayoutPreview cols={cols} rows={rows} />
                                        <div className="flex-1 min-w-0 pt-1">
                                            <p className="font-semibold text-slate-800 dark:text-slate-100">{label}</p>
                                            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">{description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
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
                                            ? <div className="h-full w-full bg-violet-600 animate-pulse" />
                                            : <div className="h-full bg-violet-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
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
                                    <ToolCostBadge toolId="n-up" file={fileData?.file} />
                                    <div className="bg-violet-50 rounded-xl border border-violet-200 px-4 py-3 text-sm text-violet-800 flex items-start gap-3">
                                        <LayoutPreview cols={selectedLayout.cols} rows={selectedLayout.rows} />
                                        <div>
                                            <p className="font-semibold">{selectedLayout.label} layout selected</p>
                                            <p className="text-xs mt-1 opacity-80">{selectedLayout.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                                        <input
                                            type="text"
                                            value={outFileName}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())}
                                            placeholder={`${nUp}up`}
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700"
                                        />
                                    </div>
                                    <button
                                        onClick={startConvert}
                                        className="w-full py-3.5 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 transition-colors shadow-sm"
                                    >
                                        Convert & Download
                                    </button>
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">Your N-up PDF will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}

                    <ToolSeoSection
                        toolPath="/tool/n-up"
                        toolName="N-Up Layout"
                        about="PDF Studio's N-Up Layout tool rasterizes each page at 150 DPI and arranges them onto new output sheets — 2 pages per landscape A4 for 2-up, or 4 pages in a 2×2 grid on portrait A4 for 4-up. Perfect for creating compact handouts, study notes, or paper-saving print layouts."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-600"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>, title: '2-up and 4-up layouts', description: '2 pages side-by-side on landscape A4, or 4 pages in a grid on portrait A4.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-600"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'Fast rasterization', description: 'Pages are rendered at 150 DPI for sharp output without huge file sizes.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-600"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>, title: 'Proportionally scaled', description: 'Each original page is proportionally scaled to fit its cell without cropping.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-600"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, title: 'Free to use', description: 'No subscription, no account — just upload and convert.' },
                        ]}
                        faqs={[
                            { q: 'What page size is the output?', a: '2-up produces landscape A4 (297×210 mm) sheets. 4-up produces portrait A4 (210×297 mm) sheets. Each original page is scaled to fit its cell proportionally.' },
                            { q: 'What if my PDF has an odd number of pages?', a: 'The last output sheet will have empty cells for any missing pages. The output is still valid — the remaining cells are simply white.' },
                            { q: 'Is the output text-searchable?', a: 'Since pages are rasterized to images and embedded, the text in the N-up output is not searchable. The tool prioritizes visual accuracy.' },
                            { q: 'Are my files stored on your servers?', a: 'Files are deleted immediately after processing. We do not retain your documents.' },
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
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
