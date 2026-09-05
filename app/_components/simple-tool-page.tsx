'use client';

import * as React from 'react';
import { ChangeEvent, useState } from 'react';
import { ChooseFiles } from '@/app/_components/choose_files';
import { ProgressStepper } from '@/app/_components/progress-stepper';
import { ToolSeoSection } from '@/app/_components/tool-seo-section';
import { PagePicker } from '@/app/_components/page-picker';
import { generateId } from '@/app/_utils/constants';
import { runToolRequest } from '@/app/_hooks/use-tool-request';

/** One configurable option, rendered and serialised generically. */
export type ToolField =
    | { name: string; label: string; type: 'text'; placeholder?: string; default?: string; help?: string }
    | { name: string; label: string; type: 'number'; min?: number; max?: number; step?: number; default?: number; help?: string }
    | { name: string; label: string; type: 'select'; options: { value: string; label: string }[]; default?: string; help?: string }
    | { name: string; label: string; type: 'checkbox'; default?: boolean; help?: string }
    /**
     * A colour swatch. Held as `#rrggbb` and expanded into the `r`, `g`, `b` integers the
     * API expects; nobody picks a colour by typing three numbers from 0 to 255.
     */
    | { name: string; label: string; type: 'color'; default?: string; help?: string };

export interface SimpleToolPageProps {
    /** Route path, e.g. `/tool/sanitize-pdf`. Used for canonical, JSON-LD and related links. */
    path: string;
    title: string;
    subtitle: string;
    /** Icon file under `public/tools/`. */
    icon: string;
    /** Tailwind gradient for the hero, e.g. `from-green-600 to-green-800`. */
    gradient: string;
    /** Tailwind background for the primary button, e.g. `bg-green-700 hover:bg-green-800`. */
    accent: string;

    apiUrl: string;
    accept: string[];
    /** Name of the JSON metadata part, if the endpoint takes one. */
    infoPart?: string;
    /** A second required file, for tools that combine two documents. */
    secondFile?: { part: string; label: string; accept: string[] };
    fields?: ToolField[];
    /** Extension of the produced file, used for the fallback download name. */
    outputExt: string;
    defaultOutName: string;
    submitLabel: string;
    /** Include the standard out_file_name field. Off for tools that take no options. */
    nameable?: boolean;

    about: string;
    features: { icon: React.ReactNode; title: string; description: string }[];
    faqs: { q: string; a: string }[];
    toolName: string;

    /**
     * Renders a live preview of the result above the options, given the chosen file and the
     * current settings. Supplied by tools whose options are numbers whose effect is not
     * otherwise visible — a border width, a rotation, target dimensions.
     */
    renderPreview?: (file: File, values: Record<string, string | number | boolean>) => React.ReactNode;

    /**
     * Picks the tool's page argument(s) from thumbnails instead of typed numbers.
     *
     * Asking "insert after page" or "replace from/to" as text means opening the document
     * elsewhere and counting. The selection is 1-based on screen and converted to whatever
     * the endpoint expects here.
     */
    pagePicker?: {
        /** Field carrying the single page, or the start of the range. */
        field: string;
        /** Field carrying the end of the range, for `mode: 'range'`. */
        toField?: string;
        mode: 'single' | 'range' | 'multi';
        label: string;
        hint?: string;
        /** API page numbering. Defaults to 1-based. */
        zeroBased?: boolean;
    };
}

enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

/**
 * A complete tool page driven by a declaration.
 *
 * The 21 hand-written tool pages are ~250 lines each of near-identical stepper, upload,
 * progress, error and SEO markup, differing only in their options. Writing the remaining
 * tools that way would have meant another ~4,000 lines to keep in step every time the
 * layout, dark mode or request handling changed. Tools whose UI is genuinely bespoke
 * (page pickers, form builders, bookmark trees) still have their own pages.
 */
export function SimpleToolPage(props: SimpleToolPageProps) {
    const {
        path, title, subtitle, icon, gradient, accent, apiUrl, accept, infoPart,
        secondFile, fields = [], outputExt, defaultOutName, submitLabel, nameable = true,
        about, features, faqs, toolName, renderPreview, pagePicker,
    } = props;

    const [activeStep, setActiveStep] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [second, setSecond] = useState<File | null>(null);
    const [values, setValues] = useState<Record<string, string | number | boolean>>(() =>
        Object.fromEntries(fields.map((f) => [f.name, f.default ?? defaultFor(f)])));
    const [outFileName, setOutFileName] = useState('');
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const steps = ['Select File', fields.length || secondFile || pagePicker ? 'Options' : 'Run'];
    const ready = !!file && (!secondFile || !!second);

    function pick(setter: (f: File) => void) {
        return (event: ChangeEvent<HTMLInputElement>) => {
            const chosen = (Object.values(event.target.files ?? {}) as File[])[0];
            if (chosen) setter(chosen);
        };
    }

    async function run() {
        if (!file) return;
        const formData = new FormData();

        if (infoPart) {
            const body: Record<string, unknown> = { ...values };

            // Thumbnail selection is 0-indexed; most endpoints number pages from 1.
            if (pagePicker && selectedPages.length > 0) {
                const offset = pagePicker.zeroBased ? 0 : 1;
                body[pagePicker.field] = selectedPages[0] + offset;
                if (pagePicker.toField) {
                    body[pagePicker.toField] = selectedPages[selectedPages.length - 1] + offset;
                }
            }
            // Expand each colour swatch into the r/g/b channels the endpoint takes.
            for (const field of fields) {
                if (field.type !== 'color') continue;
                const hex = String(values[field.name] ?? '#000000');
                delete body[field.name];
                body.r = parseInt(hex.slice(1, 3), 16) || 0;
                body.g = parseInt(hex.slice(3, 5), 16) || 0;
                body.b = parseInt(hex.slice(5, 7), 16) || 0;
            }
            if (nameable) body.out_file_name = outFileName || defaultOutName;
            formData.append(infoPart, new Blob([JSON.stringify(body)], { type: 'application/json' }));
        }
        formData.append('file', file);
        if (secondFile && second) formData.append(secondFile.part, second);

        await runToolRequest({
            url: apiUrl,
            formData,
            fallbackFilename: `${outFileName || defaultOutName}.${outputExt}`,
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText =
        step === Step.UPLOAD ? 'Uploading…' :
        step === Step.PROCESS ? 'Processing…' :
        step === Step.DOWNLOAD ? 'Preparing download…' : '';

    return (
        <div className="flex-1 flex flex-col">
            <div className={`bg-gradient-to-r ${gradient} text-white px-6 md:px-10 py-5 flex-shrink-0`}>
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src={`/tools/${icon}`} alt="" width={28} height={28} className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">{title}</h1>
                        <p className="text-sm opacity-75 mt-0.5">{subtitle}</p>
                    </div>
                    <div className="hidden md:block text-sm opacity-60">
                        Step {activeStep + 1} / {steps.length}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-6 md:px-10 py-3 flex-shrink-0">
                <div className="max-w-5xl mx-auto">
                    <ProgressStepper steps={steps} activeStepIndex={activeStep} />
                </div>
            </div>

            <div className="flex-1 px-6 md:px-10 py-8">
                <div className="max-w-5xl mx-auto">
                    {activeStep === 0 && (
                        <div className="space-y-4">
                            <ChooseFiles single accept={accept} onChange={pick(setFile)} />
                            {file && (
                                <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                                    Selected: <strong>{file.name}</strong>
                                </p>
                            )}
                            {secondFile && (
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 text-center">
                                        {secondFile.label}
                                    </p>
                                    <ChooseFiles single accept={secondFile.accept} onChange={pick(setSecond)} />
                                    {second && (
                                        <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                                            Selected: <strong>{second.name}</strong>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className={`${renderPreview || pagePicker ? "max-w-3xl" : "max-w-md"} mx-auto flex flex-col gap-6 py-8`}>
                            {step !== Step.IDLE && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-slate-700 dark:text-slate-200">{statusText}</span>
                                        {step !== Step.PROCESS && (
                                            <span className="text-slate-400 dark:text-slate-500 tabular-nums">
                                                {Math.round(progress)}%
                                            </span>
                                        )}
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        {step === Step.PROCESS
                                            ? <div className={`h-full w-full ${accent.split(' ')[0]} animate-pulse`} />
                                            : <div className={`h-full ${accent.split(' ')[0]} rounded-full transition-all`}
                                                   style={{ width: `${progress}%` }} />}
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div role="alert" className="flex gap-3 rounded-xl border border-red-200 dark:border-red-800
                                                bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            {step === Step.IDLE && (
                                <div className="flex flex-col gap-4">
                                    {renderPreview && file && renderPreview(file, values)}

                                    {pagePicker && file && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                {pagePicker.label}
                                            </p>
                                            <PagePicker
                                                file={file}
                                                mode={pagePicker.mode}
                                                selected={selectedPages}
                                                onChange={setSelectedPages}
                                                hint={pagePicker.hint}
                                            />
                                        </div>
                                    )}
                                    {fields.map((field) => (
                                        <FieldInput
                                            key={field.name}
                                            field={field}
                                            value={values[field.name]}
                                            onChange={(v) => setValues((prev) => ({ ...prev, [field.name]: v }))}
                                        />
                                    ))}

                                    {nameable && infoPart && (
                                        <div className="flex flex-col gap-1.5">
                                            <label htmlFor="out-file-name"
                                                   className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                Output file name
                                            </label>
                                            <input
                                                id="out-file-name"
                                                type="text"
                                                value={outFileName}
                                                onChange={(e) => setOutFileName(e.target.value.trim())}
                                                placeholder={defaultOutName}
                                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200
                                                           dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100
                                                           text-sm outline-none focus:ring-2 focus:ring-blue-100
                                                           dark:focus:ring-blue-900"
                                            />
                                        </div>
                                    )}

                                    <button
                                        onClick={run}
                                        className={`w-full py-3.5 rounded-xl ${accent} text-white font-semibold
                                                    text-sm transition-colors shadow-sm`}
                                    >
                                        {submitLabel}
                                    </button>
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                                        Your file will download automatically
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <ToolSeoSection
                        toolPath={path}
                        toolName={toolName}
                        about={about}
                        features={features}
                        faqs={faqs}
                    />
                </div>
            </div>

            <div className="sticky bottom-0 z-30 flex-shrink-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        disabled={activeStep === 0}
                        onClick={() => setActiveStep((a) => a - 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200
                                   dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300
                                   hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40
                                   disabled:cursor-not-allowed transition-colors"
                    >
                        Back
                    </button>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                        {activeStep + 1} / {steps.length}
                    </span>
                    <button
                        disabled={activeStep === steps.length - 1 || !ready}
                        onClick={() => setActiveStep((a) => a + 1)}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl ${accent} text-white
                                    text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed
                                    transition-colors shadow-sm`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

function defaultFor(field: ToolField): string | number | boolean {
    switch (field.type) {
        case 'number': return 0;
        case 'checkbox': return false;
        case 'color': return field.default ?? '#000000';
        case 'select': return field.options[0]?.value ?? '';
        default: return '';
    }
}

function FieldInput({ field, value, onChange }: {
    field: ToolField;
    value: string | number | boolean;
    onChange: (value: string | number | boolean) => void;
}) {
    const inputClass = `w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700
                        dark:bg-slate-900 dark:text-slate-100 text-sm outline-none
                        focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900`;

    if (field.type === 'color') {
        return (
            <div className="flex flex-col gap-1.5">
                <label htmlFor={field.name} className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {field.label}
                </label>
                <div className="flex items-center gap-3">
                    <input
                        id={field.name}
                        type="color"
                        value={String(value)}
                        onChange={(e) => onChange(e.target.value)}
                        className="h-10 w-16 rounded-lg border border-slate-200 dark:border-slate-700
                                   bg-transparent cursor-pointer"
                    />
                    <span className="text-sm text-slate-500 dark:text-slate-400 tabular-nums uppercase">
                        {String(value)}
                    </span>
                </div>
                {field.help && <p className="text-xs text-slate-400 dark:text-slate-500">{field.help}</p>}
            </div>
        );
    }

    if (field.type === 'checkbox') {
        return (
            <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(e) => onChange(e.target.checked)}
                    className="w-4 h-4 rounded"
                />
                <span>
                    {field.label}
                    {field.help && (
                        <span className="block text-xs text-slate-400 dark:text-slate-500">{field.help}</span>
                    )}
                </span>
            </label>
        );
    }

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={field.name} className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {field.label}
            </label>
            {field.type === 'select' ? (
                <select id={field.name} value={String(value)} className={inputClass}
                        onChange={(e) => onChange(e.target.value)}>
                    {field.options.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            ) : (
                <input
                    id={field.name}
                    type={field.type}
                    value={String(value)}
                    min={field.type === 'number' ? field.min : undefined}
                    max={field.type === 'number' ? field.max : undefined}
                    step={field.type === 'number' ? field.step : undefined}
                    placeholder={field.type === 'text' ? field.placeholder : undefined}
                    className={inputClass}
                    onChange={(e) =>
                        onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
                />
            )}
            {field.help && <p className="text-xs text-slate-400 dark:text-slate-500">{field.help}</p>}
        </div>
    );
}
