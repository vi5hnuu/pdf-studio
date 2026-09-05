"use client";

import * as React from "react";
import { ChangeEvent, useState } from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { generateId } from "@/app/_utils/constants";
import { ToolsApi } from "@/app/_utils/api";
import { runToolRequest } from '@/app/_hooks/use-tool-request';
import { authedFetch } from '@/app/_utils/auth';

interface FileData { id: string; file: File; }

enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

export default function EditMetadata() {
    const [activeStep, setActiveStep] = useState(0);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [fetching, setFetching] = useState(false);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [subject, setSubject] = useState('');
    const [keywords, setKeywords] = useState('');
    const [creator, setCreator] = useState('');
    const [producer, setProducer] = useState('');
    const [pageCount, setPageCount] = useState<string | null>(null);
    const [creationDate, setCreationDate] = useState<string | null>(null);
    const [outFileName, setOutFileName] = useState('');
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const steps = ['Select File', 'Edit Fields', 'Save'];

    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        const fd = { id: generateId(32, 'FILE_'), file: f };
        setFileData(fd);
        // Fetch existing metadata
        setFetching(true);
        try {
            const form = new FormData();
            form.append('file', f);
            const res = await authedFetch(ToolsApi.getMetadata, { method: 'POST', body: form });
            if (res.ok) {
                const data: Record<string, string> = await res.json();
                setTitle(data.title ?? '');
                setAuthor(data.author ?? '');
                setSubject(data.subject ?? '');
                setKeywords(data.keywords ?? '');
                setCreator(data.creator ?? '');
                setProducer(data.producer ?? '');
                setPageCount(data.page_count ?? null);
                setCreationDate(data.creation_date ?? null);
            }
        } catch { /* ignore — user can fill manually */ }
        setFetching(false);
    }

    async function startSave() {
        if (!fileData) return;
        const body = { out_file_name: outFileName || 'edited', title, author, subject, keywords, creator, producer };
        const formData = new FormData();
        formData.append('edit-metadata-info', new Blob([JSON.stringify(body)], { type: 'application/json' }));
        formData.append('file', fileData.file);

        await runToolRequest({
            url: ToolsApi.editMetadata,
            formData,
            fallbackFilename: 'edit-metadata.pdf',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Saving metadata...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    const editFields = [
        { label: 'Title', value: title, set: setTitle, placeholder: 'e.g. Annual Report 2024' },
        { label: 'Author', value: author, set: setAuthor, placeholder: 'e.g. Jane Smith' },
        { label: 'Subject', value: subject, set: setSubject, placeholder: 'e.g. Finance' },
        { label: 'Keywords', value: keywords, set: setKeywords, placeholder: 'e.g. report, finance, 2024' },
        { label: 'Creator', value: creator, set: setCreator, placeholder: 'e.g. Microsoft Word' },
        { label: 'Producer', value: producer, set: setProducer, placeholder: 'e.g. PDF Studio' },
    ] as const;

    return (
        <div className="flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/edit-metadata.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Edit Metadata</h1>
                        <p className="text-sm opacity-75 mt-0.5">View and edit PDF document properties</p>
                    </div>
                    <div className="hidden md:block text-sm opacity-60 flex-shrink-0">Step {activeStep + 1} / {steps.length}</div>
                </div>
            </div>

            <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex-shrink-0 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto">
                    <ProgressStepper steps={steps} activeStepIndex={activeStep} />
                </div>
            </div>

            <div className="flex-1 px-6 md:px-10 py-8">
                <div className="max-w-5xl mx-auto">
                    {activeStep === 0 && (
                        <div className="space-y-4">
                            <ChooseFiles single accept={['application/pdf']} onChange={handleFile} />
                            {fetching && (
                                <p className="text-sm text-center text-sky-600 animate-pulse">Reading metadata...</p>
                            )}
                            {fileData && !fetching && (
                                <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                                    Selected: <strong>{fileData.file.name}</strong>
                                    {pageCount && <span> · {pageCount} page{pageCount === '1' ? '' : 's'}</span>}
                                    {creationDate && <span> · Created: {new Date(creationDate).toLocaleDateString()}</span>}
                                </p>
                            )}
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="max-w-md mx-auto space-y-4">
                            <p className="text-sm text-slate-500 text-center dark:text-slate-400">
                                Existing values have been pre-filled. Edit any field — leave blank to clear it.
                            </p>
                            {editFields.map(({ label, value, set, placeholder }) => (
                                <div key={label} className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => set(e.target.value)}
                                        placeholder={placeholder}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700"
                                    />
                                </div>
                            ))}
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
                                            ? <div className="h-full w-full bg-sky-600 animate-pulse" />
                                            : <div className="h-full bg-sky-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                        }
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    {error}
                                </div>
                            )}
                            {step === Step.IDLE && (
                                <div className="flex flex-col gap-4">
                                    <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 space-y-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200">
                                        {[['Title', title], ['Author', author], ['Subject', subject], ['Keywords', keywords], ['Creator', creator], ['Producer', producer]].map(([k, v]) =>
                                            v ? <p key={k}>{k}: <strong>{v}</strong></p> : null
                                        )}
                                        {!title && !author && !subject && !keywords && !creator && !producer && (
                                            <p className="text-slate-400 italic dark:text-slate-500">All metadata fields will be cleared.</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                                        <input
                                            type="text"
                                            value={outFileName}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())}
                                            placeholder="edited"
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700"
                                        />
                                    </div>
                                    <button
                                        onClick={startSave}
                                        className="w-full py-3.5 rounded-xl bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700 transition-colors shadow-sm"
                                    >
                                        Save & Download
                                    </button>
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">Your updated PDF will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}

                    <ToolSeoSection
                        toolPath="/tool/edit-metadata"
                        toolName="Edit Metadata"
                        about="PDF Studio's Edit Metadata tool reads and displays your PDF's existing document properties — then lets you update title, author, subject, keywords, creator, and producer in one step. The PDF pages are never touched."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, title: 'Auto-read existing values', description: 'Existing metadata is fetched and pre-filled as soon as you upload.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>, title: 'Six editable fields', description: 'Title, author, subject, keywords, creator, and producer.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'Content untouched', description: 'Pages, fonts, and images are never modified.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>, title: 'Instant & free', description: 'No account required. Results download in seconds.' },
                        ]}
                        faqs={[
                            { q: 'What is PDF metadata?', a: 'PDF metadata is information stored inside the file about the document — title, author, subject, keywords, creator, and producer. It is not visible on any page but is readable by PDF viewers and search engines.' },
                            { q: 'Are existing values preserved if I leave a field blank?', a: 'No — blank fields overwrite the existing value with an empty string. The current values are pre-filled for you to edit, not to confirm.' },
                            { q: 'What is the difference between Creator and Producer?', a: 'Creator is the application that originally authored the document (e.g. Microsoft Word). Producer is the software that created the PDF file (e.g. Acrobat Distiller, PDF Studio).' },
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
                        disabled={activeStep === 2 || !fileData || fetching}
                        onClick={() => setActiveStep(a => a + 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
