"use client";
import * as React from "react";
import { ChangeEvent, useState } from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { generateId } from "@/app/_utils/constants";
import { ToolsApi } from "@/app/_utils/api";
import { runToolRequest } from '@/app/_hooks/use-tool-request';
import { PagePicker } from '@/app/_components/page-picker';
import { ToolCostBadge } from '@/app/_components/tool-cost-badge';
import { useToolStep } from '@/app/_hooks/use-tool-step';

interface FileData { id: string; file: File; }
enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

export default function DuplicatePages() {
    const steps = ['Select PDF', 'Choose Pages', 'Duplicate & Download'];

    // Mirrored into the URL so the browser Back button steps back rather than
    // leaving the tool and losing the file.
    const [activeStep, setActiveStep] = useToolStep(steps.length);
    const [fileData, setFileData] = useState<FileData | null>(null);
    // 0-indexed selection from the thumbnail picker; page numbers are shown from 1.
    const [pages, setPages] = useState<number[]>([]);
    const [count, setCount] = useState(1);
    const [outFileName, setOutFileName] = useState('');
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        setFileData({ id: generateId(32, 'FILE_'), file: f });
    }


    async function startDuplicate() {
        if (!fileData) return;
        if (pages.length === 0) { setError('Select at least one page to duplicate.'); return; }
        const formData = new FormData();
        formData.append('duplicate-pages-info', new Blob([JSON.stringify({ out_file_name: outFileName || 'duplicated', pages, count })], { type: 'application/json' }));
        formData.append('file', fileData.file);
        await runToolRequest({
            url: ToolsApi.duplicatePages,
            formData,
            fallbackFilename: 'duplicate-pages.pdf',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Duplicating pages...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    return (
        <div className="flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0"><img src="/tools/duplicate-pages.svg" alt="" className="w-7 h-7" /></div>
                    <div className="flex-1 min-w-0"><h1 className="text-xl font-bold">Duplicate Pages</h1><p className="text-sm opacity-75 mt-0.5">Insert copies of selected pages after each occurrence</p></div>
                    <div className="hidden md:block text-sm opacity-60 flex-shrink-0">Step {activeStep + 1} / {steps.length}</div>
                </div>
            </div>
            <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex-shrink-0 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto"><ProgressStepper steps={steps} activeStepIndex={activeStep} onStepClick={setActiveStep} /></div>
            </div>
            <div className="flex-1 px-6 md:px-10 py-8">
                <div className="max-w-5xl mx-auto">
                    {activeStep === 0 && (
                        <div className="space-y-4">
                            <ChooseFiles single accept={['application/pdf']} onChange={handleFile} />
                            {fileData && <p className="text-sm text-center text-slate-500 dark:text-slate-400">Selected: <strong>{fileData.file.name}</strong> ({(fileData.file.size / 1024 / 1024).toFixed(2)} MB)</p>}
                        </div>
                    )}
                    {activeStep === 1 && (
                        <div className="max-w-3xl mx-auto space-y-6 py-4">
                            {fileData && (
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        Pages to duplicate
                                    </p>
                                    <PagePicker
                                        file={fileData.file}
                                        selected={pages}
                                        onChange={setPages}
                                        accentRing="ring-indigo-500 border-indigo-500"
                                        hint="Click the pages you want to duplicate."
                                    />
                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                        Each selected page will have {count} cop{count === 1 ? 'y' : 'ies'} inserted
                                        immediately after it.
                                    </p>
                                </div>
                            )}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Number of copies</label>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setCount(c => Math.max(1, c - 1))} className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors text-lg font-bold dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">−</button>
                                    <span className="w-10 text-center font-semibold text-slate-800 text-lg dark:text-slate-100">{count}</span>
                                    <button onClick={() => setCount(c => Math.min(10, c + 1))} className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors text-lg font-bold dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">+</button>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeStep === 2 && (
                        <div className="max-w-md mx-auto flex flex-col gap-6 py-8">
                            {step !== Step.IDLE && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm"><span className="font-medium text-slate-700 dark:text-slate-200">{statusText}</span>{step !== Step.PROCESS && <span className="text-slate-400 tabular-nums dark:text-slate-500">{Math.round(progress)}%</span>}</div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-700">{step === Step.PROCESS ? <div className="h-full w-full bg-indigo-500 animate-pulse" /> : <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />}</div>
                                </div>
                            )}
                            {error && <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
                            {step === Step.IDLE && (
                                <div className="flex flex-col gap-4">
                                    <ToolCostBadge toolId="duplicate-pages" file={fileData?.file} />
                                    <div className="bg-indigo-50 rounded-xl border border-indigo-200 px-4 py-3 text-sm text-indigo-800">
                                        Duplicating {pages.length} page{pages.length !== 1 ? 's' : ''}{' '}
                                        (<strong>{pages.map((p) => p + 1).join(', ')}</strong>) — <strong>{count}</strong> cop{count === 1 ? 'y' : 'ies'} each.
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                                        <input type="text" value={outFileName} onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())} placeholder="duplicated" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700" />
                                    </div>
                                    <button onClick={startDuplicate} className="w-full py-3.5 rounded-xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 transition-colors shadow-sm">Duplicate & Download</button>
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">Your PDF will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}
                    <ToolSeoSection
                        toolPath="/tool/duplicate-pages"
                        toolName="Duplicate Pages"
                        about="Duplicate Pages inserts exact copies of specified pages immediately after each occurrence in the PDF. Specify page numbers as a comma-separated list and choose how many copies to insert. All page content, annotations, and links are preserved in the copies."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>, title: 'Exact page copies', description: 'Copies preserve all content — text, images, annotations, and links.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>, title: 'Multi-page selection', description: 'Specify any set of pages to duplicate in a single operation.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'No data retention', description: 'Files are deleted from our servers after processing.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, title: 'Free to use', description: 'No subscription or account required.' },
                        ]}
                        faqs={[
                            { q: 'Where are the copies inserted?', a: 'Each copy is inserted immediately after the original page. If you duplicate page 3 with 2 copies, the result is: ...page 3, copy 1, copy 2, page 4...' },
                            { q: 'Are page numbers 1-based?', a: 'Yes. Enter page numbers as you see them — page 1 is the first page.' },
                            { q: 'What is the maximum number of copies?', a: 'Up to 10 copies per page via the web interface.' },
                            { q: 'Are my files stored?', a: 'Files are deleted immediately after processing.' },
                        ]}
                    />
                </div>
            </div>
            <div className="sticky bottom-0 z-30 flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button disabled={activeStep === 0} onClick={() => setActiveStep(a => a - 1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>Back</button>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{activeStep + 1} / {steps.length}</span>
                    <button disabled={activeStep === 2 || !fileData} onClick={() => setActiveStep(a => a + 1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm">{activeStep === steps.length - 2 ? 'Proceed' : 'Next'}<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg></button>
                </div>
            </div>
        </div>
    );
}
