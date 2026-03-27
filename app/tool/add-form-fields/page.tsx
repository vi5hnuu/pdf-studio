"use client";

import * as React from "react";
import { ChangeEvent, useState } from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { generateId } from "@/app/_utils/constants";
import { ToolsApi } from "@/app/_utils/api";

interface FileData { id: string; file: File; }

interface FieldDef {
    id: string;
    type: 'TEXT' | 'CHECKBOX';
    name: string;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    multiline: boolean;
    defaultValue: string;
}

enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

function newField(): FieldDef {
    return { id: Math.random().toString(36).slice(2), type: 'TEXT', name: '', page: 0, x: 50, y: 700, width: 200, height: 20, multiline: false, defaultValue: '' };
}

export default function AddFormFields() {
    const [activeStep, setActiveStep] = useState(0);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [fields, setFields] = useState<FieldDef[]>([newField()]);
    const [outFileName, setOutFileName] = useState('');
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const steps = ['Select File', 'Define Fields', 'Create'];

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        setFileData({ id: generateId(32, 'FILE_'), file: f });
    }

    function updateField(id: string, patch: Partial<FieldDef>) {
        setFields(fs => fs.map(f => f.id === id ? { ...f, ...patch } : f));
    }

    function removeField(id: string) {
        setFields(fs => fs.filter(f => f.id !== id));
    }

    async function startCreate() {
        if (!fileData || fields.length === 0) return;
        const body = {
            out_file_name: outFileName || 'form-pdf',
            fields: fields.map(f => ({
                type: f.type,
                name: f.name || undefined,
                page: f.page,
                x: f.x,
                y: f.y,
                width: f.width,
                height: f.height,
                multiline: f.multiline,
                default_value: f.defaultValue || undefined,
            })),
        };
        const formData = new FormData();
        formData.append('add-form-fields-info', new Blob([JSON.stringify(body)], { type: 'application/json' }));
        formData.append('file', fileData.file);

        const xhr = new XMLHttpRequest();
        setError(null);
        xhr.open('POST', ToolsApi.addFormFields, true);
        xhr.responseType = 'blob';
        xhr.upload.addEventListener('progress', (ev) => {
            if (!ev.lengthComputable) return;
            setStep(Step.UPLOAD); setProgress((ev.loaded / ev.total) * 100);
            if (ev.loaded >= ev.total) setStep(Step.PROCESS);
        });
        xhr.onprogress = (ev) => {
            if (!ev.lengthComputable) return;
            setStep(Step.DOWNLOAD); setProgress((ev.loaded / ev.total) * 100);
        };
        xhr.onload = () => {
            if (xhr.status !== 200) { setError('Failed to add form fields. Please try again.'); setStep(Step.IDLE); return; }
            const disp = xhr.getResponseHeader('Content-Disposition') ?? '';
            const filename = disp.split('filename=')[1] ?? (outFileName || 'form-pdf') + '.pdf';
            const url = URL.createObjectURL(xhr.response);
            const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
            URL.revokeObjectURL(url); setStep(Step.IDLE);
        };
        xhr.onerror = () => { setError('Network error. Please check your connection.'); setStep(Step.IDLE); };
        xhr.send(formData);
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Adding form fields...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/add-form-fields.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Add Form Fields</h1>
                        <p className="text-sm opacity-75 mt-0.5">Add editable text fields and checkboxes to any PDF</p>
                    </div>
                    <div className="hidden md:block text-sm opacity-60 flex-shrink-0">Step {activeStep + 1} / {steps.length}</div>
                </div>
            </div>

            <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex-shrink-0">
                <div className="max-w-5xl mx-auto">
                    <ProgressStepper steps={steps} activeStepIndex={activeStep} />
                </div>
            </div>

            <div className="flex-1 overflow-auto px-6 md:px-10 py-8">
                <div className="max-w-5xl mx-auto">
                    {activeStep === 0 && (
                        <div className="space-y-4">
                            <ChooseFiles single accept={['application/pdf']} onChange={handleFile} />
                            {fileData && (
                                <p className="text-sm text-center text-slate-500">
                                    Selected: <strong>{fileData.file.name}</strong> ({(fileData.file.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                            )}
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500">
                                    Define fields. Coordinates are in PDF points (72 pt = 1 inch), origin at bottom-left of page.
                                </p>
                                <button
                                    onClick={() => setFields(fs => [...fs, newField()])}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                    Add field
                                </button>
                            </div>

                            <div className="space-y-3">
                                {fields.map((f, i) => (
                                    <div key={f.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Field {i + 1}</span>
                                            <button
                                                onClick={() => removeField(f.id)}
                                                disabled={fields.length === 1}
                                                className="text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-medium text-slate-600">Type</label>
                                                <select
                                                    value={f.type}
                                                    onChange={e => updateField(f.id, { type: e.target.value as 'TEXT' | 'CHECKBOX' })}
                                                    className="px-2 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-teal-500"
                                                >
                                                    <option value="TEXT">Text</option>
                                                    <option value="CHECKBOX">Checkbox</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-medium text-slate-600">Name</label>
                                                <input
                                                    type="text"
                                                    value={f.name}
                                                    onChange={e => updateField(f.id, { name: e.target.value })}
                                                    placeholder={`field_${i + 1}`}
                                                    className="px-2 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-teal-500"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-medium text-slate-600">Page (0-indexed)</label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={f.page}
                                                    onChange={e => updateField(f.id, { page: Math.max(0, Number(e.target.value)) })}
                                                    className="px-2 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-teal-500"
                                                />
                                            </div>
                                            {f.type === 'TEXT' && (
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-xs font-medium text-slate-600">Default value</label>
                                                    <input
                                                        type="text"
                                                        value={f.defaultValue}
                                                        onChange={e => updateField(f.id, { defaultValue: e.target.value })}
                                                        placeholder="optional"
                                                        className="px-2 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-teal-500"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {(['x', 'y', 'width', 'height'] as const).map(prop => (
                                                <div key={prop} className="flex flex-col gap-1">
                                                    <label className="text-xs font-medium text-slate-600">{prop} (pts)</label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={f[prop]}
                                                        onChange={e => updateField(f.id, { [prop]: Math.max(0, Number(e.target.value)) })}
                                                        className="px-2 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-teal-500"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {f.type === 'TEXT' && (
                                            <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={f.multiline}
                                                    onChange={e => updateField(f.id, { multiline: e.target.checked })}
                                                    className="w-4 h-4 accent-teal-600"
                                                />
                                                Multiline text area
                                            </label>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-xs text-teal-800">
                                Tip: A4 page is 595 × 842 pts, Letter is 612 × 792 pts. Y=0 is the bottom of the page.
                            </div>
                        </div>
                    )}

                    {activeStep === 2 && (
                        <div className="max-w-md mx-auto flex flex-col gap-6 py-8">
                            {step !== Step.IDLE && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-slate-700">{statusText}</span>
                                        {step !== Step.PROCESS && <span className="text-slate-400 tabular-nums">{Math.round(progress)}%</span>}
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        {step === Step.PROCESS
                                            ? <div className="h-full w-full bg-teal-600 animate-pulse" />
                                            : <div className="h-full bg-teal-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                        }
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    {error}
                                </div>
                            )}
                            {step === Step.IDLE && (
                                <div className="flex flex-col gap-4">
                                    <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                                        Adding <strong>{fields.length}</strong> form {fields.length === 1 ? 'field' : 'fields'} ({fields.filter(f => f.type === 'TEXT').length} text, {fields.filter(f => f.type === 'CHECKBOX').length} checkbox) to <strong>{fileData?.file.name}</strong>.
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700">Output file name</label>
                                        <input
                                            type="text"
                                            value={outFileName}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())}
                                            placeholder="form-pdf"
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                        />
                                    </div>
                                    <button
                                        onClick={startCreate}
                                        className="w-full py-3.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 transition-colors shadow-sm"
                                    >
                                        Create Form PDF & Download
                                    </button>
                                    <p className="text-center text-xs text-slate-400">Your interactive PDF will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}

                    <ToolSeoSection
                        about="Add Form Fields lets you turn any static PDF into an interactive form by placing text fields and checkboxes at precise positions. Fields are stored as standard PDF AcroForm entries — compatible with Adobe Acrobat, Preview, Foxit, and all major PDF viewers."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600"><rect x="3" y="5" width="18" height="4" rx="1"/><rect x="3" y="14" width="10" height="4" rx="1"/></svg>, title: 'Text fields & checkboxes', description: 'Add single-line, multiline text fields, and checkboxes anywhere on the page.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'Precise positioning', description: 'Set exact x, y, width, and height in PDF points for pixel-perfect placement.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>, title: 'Standard AcroForm', description: 'Fields use PDF AcroForm — readable and fillable by all major viewers.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'Secure & private', description: 'Files are deleted immediately after processing.' },
                        ]}
                        faqs={[
                            { q: 'How do I know the right x/y coordinates?', a: 'Open your PDF in a viewer and check the cursor coordinates (shown in the status bar in Acrobat). PDF coordinates start at the bottom-left corner. A4 is 595×842 pts; Letter is 612×792 pts.' },
                            { q: 'Will the fields be visible in Adobe Acrobat?', a: 'Yes. The fields are standard PDF AcroForm fields and are fully compatible with Adobe Acrobat, Preview, Foxit Reader, and all compliant PDF viewers.' },
                            { q: 'Can I set a default value for text fields?', a: 'Yes — enter a default value in the "Default value" column. It will pre-fill the field when the form is opened.' },
                            { q: 'Are my files stored on your servers?', a: 'Files are automatically deleted after the operation completes. We do not retain your documents.' },
                        ]}
                    />
                </div>
            </div>

            <div className="flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        disabled={activeStep === 0}
                        onClick={() => setActiveStep(a => a - 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                        Back
                    </button>
                    <span className="text-xs text-slate-400">{activeStep + 1} / {steps.length}</span>
                    <button
                        disabled={activeStep === 2 || !fileData || fields.length === 0}
                        onClick={() => setActiveStep(a => a + 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
