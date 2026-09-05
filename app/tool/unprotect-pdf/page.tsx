"use client";

import * as React from "react";
import { ChangeEvent, useState } from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { generateId } from "@/app/_utils/constants";
import { UnprotectOptions } from "@/app/_models/unprotect-options";
import { UnprotectForm } from "@/app/tool/unprotect-pdf/unprotect-form";
import { UnprotectProgress } from "@/app/tool/unprotect-pdf/unprotect-progress";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { useToolStep } from '@/app/_hooks/use-tool-step';

const initOptionsState: UnprotectOptions = { out_file_name: '', password: '' };

export interface FileData {
    id: string;
    file: File;
}

export default function Home() {
    const steps = ['Select File', 'Enter Password', 'Unlock'];

    // Mirrored into the URL so the browser Back button steps back rather than
    // leaving the tool and losing the file.
    const [activeStep, setActiveStep] = useToolStep(steps.length);
    const [file, setFile] = useState<FileData | null>(null);
    const [options, setOptions] = useState<UnprotectOptions>(initOptionsState);
    const accept = ['application/pdf'];

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const newFiles = Object.values(e.target.files ?? {}) as File[];
        if (!newFiles.length || newFiles.length > 1) return;
        setFile({ id: generateId(32, 'FILE_'), file: newFiles[0] });
    }

    const nextDisabled = activeStep === 2 || !file || (activeStep === 1 && (!options.out_file_name.length || !options.password.length));

    return (
        <div className="flex-1 flex flex-col">
            {/* Hero */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/unprotect-pdf.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Unlock PDF</h1>
                        <p className="text-sm opacity-75 mt-0.5">Remove PDF password protection using the master password</p>
                    </div>
                    <div className="hidden md:block text-sm opacity-60 flex-shrink-0">
                        Step {activeStep + 1} / {steps.length}
                    </div>
                </div>
            </div>

            {/* Stepper */}
            <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex-shrink-0 dark:bg-slate-800 dark:border-slate-700">
                <div className="max-w-5xl mx-auto">
                    <ProgressStepper steps={steps} activeStepIndex={activeStep} onStepClick={setActiveStep} />
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 px-6 md:px-10 py-8">
                <div className="max-w-5xl mx-auto">
                    {activeStep === 0 && (
                        <div className="space-y-4">
                            <ChooseFiles single accept={accept} onChange={handleFile} />
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 min-h-[8rem] flex items-center justify-center dark:bg-slate-900 dark:border-slate-700">
                                {!file ? (
                                    <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                        <span className="text-sm">Upload a password-protected PDF</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                                            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" />
                                        </svg>
                                        <span className="font-medium">{file.file.name}</span>
                                        <span className="text-slate-400 dark:text-slate-500">({(file.file.size / 1024).toFixed(0)} KB)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeStep === 1 && (
                        <UnprotectForm className="mx-auto mb-8" initState={initOptionsState} onChange={setOptions} />
                    )}

                    {activeStep === 2 && <UnprotectProgress options={options} file={file!} />}

                    <ToolSeoSection
                        toolPath="/tool/unprotect-pdf"
                        toolName="Unprotect pdf"
                        about="Remove password protection from a PDF file using our free Unlock PDF tool. Provide the authorized owner or user password and download the unlocked PDF instantly — no software needed."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>, title: 'Owner & user passwords', description: 'Works with both user-open passwords and owner/permission passwords.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>, title: 'Instant unlock', description: 'The unlocked PDF is ready to download in seconds after you enter the password.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'No password storage', description: 'Passwords are only used during processing and are never logged or stored.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'Fully free', description: 'No account, no subscription. Unlock your PDF for free anytime.' },
                        ]}
                        faqs={[
                            { q: 'Do I need the original password to unlock?', a: 'Yes. This tool decrypts PDFs using the authorized password. It does not bypass or crack passwords — you must provide the correct one.' },
                            { q: 'What if I have forgotten my password?', a: 'This tool cannot recover forgotten passwords. You will need to contact the document creator to obtain the original password.' },
                            { q: 'What is removed when I unlock a PDF?', a: 'The password protection and any permission restrictions (print, copy, edit locks) are removed, giving you full access to the document.' },
                            { q: 'Is it safe to upload my secured documents?', a: 'Files are transferred over HTTPS and deleted from our servers immediately after the operation completes.' },
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
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
