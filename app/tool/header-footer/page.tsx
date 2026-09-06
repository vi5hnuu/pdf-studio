"use client";

import * as React from "react";
import { ChangeEvent, useState } from "react";
import { ChooseFiles } from "@/app/_components/choose_files";
import { ProgressStepper } from "@/app/_components/progress-stepper";
import { ToolSeoSection } from "@/app/_components/tool-seo-section";
import { generateId, hexToRGBA } from "@/app/_utils/constants";
import { ToolsApi } from "@/app/_utils/api";
import { runToolRequest } from '@/app/_hooks/use-tool-request';
import { PageRangeField } from '@/app/_components/page-range-field';
import { ToolCostBadge } from '@/app/_components/tool-cost-badge';
import { useToolStep } from '@/app/_hooks/use-tool-step';
import { formatBytes } from '@/app/_utils/format';
import { PdfPagePreview } from '@/app/_components/pdf-page-preview';
import { usePdfPageCount } from '@/app/_hooks/use-pdf-page-count';

interface FileData { id: string; file: File; }

enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

export default function HeaderFooter() {
    const steps = ['Select File', 'Configure', 'Apply'];

    // Mirrored into the URL so the browser Back button steps back rather than
    // leaving the tool and losing the file.
    const [activeStep, setActiveStep] = useToolStep(steps.length);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [headerText, setHeaderText] = useState('');
    const [footerText, setFooterText] = useState('');
    const [fontSize, setFontSize] = useState(12);
    const [color, setColor] = useState('#000000');
    const pageCount = usePdfPageCount(fileData?.file);
    // 0-indexed selection from the thumbnail picker; empty means every page.
    const [pages, setPages] = useState<number[]>([]);
    const [outFileName, setOutFileName] = useState('');
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);


    async function handleFile(e: ChangeEvent<HTMLInputElement>) {
        const f = (Object.values(e.target.files ?? {}) as File[])[0];
        if (!f) return;
        setFileData({ id: generateId(32, 'FILE_'), file: f });
    }

    async function startApply() {
        if (!fileData) return;
        const rgba = hexToRGBA(color, 1);
        const body = {
            out_file_name: outFileName || 'header-footer',
            header_text: headerText,
            footer_text: footerText,
            font_size: fontSize,
            color: { r: rgba.r, g: rgba.g, b: rgba.b, a: 1 },
            from_page: pages.length > 0 ? pages[0] : 0,
            to_page: pages.length > 0 ? pages[pages.length - 1] : null,
        };
        const formData = new FormData();
        formData.append('header-footer-info', new Blob([JSON.stringify(body)], { type: 'application/json' }));
        formData.append('file', fileData.file);

        await runToolRequest({
            url: ToolsApi.headerFooter,
            formData,
            fallbackFilename: 'header-footer.pdf',
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText = step === Step.UPLOAD ? 'Uploading...' : step === Step.PROCESS ? 'Applying header/footer...' : step === Step.DOWNLOAD ? 'Preparing download...' : '';

    return (
        <div className="flex-1 flex flex-col">
            {/* Hero */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/header-footer.svg" alt="" className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Header &amp; Footer</h1>
                        <p className="text-sm opacity-75 mt-0.5">Add custom header and footer text to every page</p>
                    </div>
                    <div className="hidden md:block text-sm opacity-60 flex-shrink-0">Step {activeStep + 1} / {steps.length}</div>
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
                            <ChooseFiles single accept={['application/pdf']} onChange={handleFile} />
                            {fileData && (
                                <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                                    Selected: <strong>{fileData.file.name}</strong> ({formatBytes(fileData.file.size)})
                                </p>
                            )}
                        </div>
                    )}

                    {activeStep === 1 && (
                        // Header and footer text was configured blind: size, colour and the
                        // dynamic tokens were all numbers and placeholders with no way to see
                        // what landed on the page until the file came back.
                        <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
                            {fileData && (
                                <div className="lg:sticky lg:top-4 min-w-0">
                                    <PdfPagePreview
                                        file={fileData.file}
                                        caption="Approximate placement on page 1 — font metrics differ slightly from the output"
                                        overlay={(renderedWidth) => {
                                            // The server centres both lines and measures the
                                            // padding in points from the page edge, so scale by
                                            // the rendered width against a 595pt page.
                                            const scale = renderedWidth / 595;
                                            const size = fontSize * scale;
                                            const inset = 10 * scale;
                                            const line = (text: string, edge: 'top' | 'bottom') => (
                                                <span
                                                    className="absolute left-0 right-0 text-center whitespace-nowrap
                                                               select-none pointer-events-none"
                                                    style={{
                                                        [edge]: `${inset}px`,
                                                        fontSize: `${size}px`,
                                                        lineHeight: 1,
                                                        color,
                                                    }}
                                                >
                                                    {resolveTokens(text, 1, pageCount ?? 1)}
                                                </span>
                                            );
                                            return (
                                                <div className="absolute inset-0 pointer-events-none">
                                                    {headerText.trim() && line(headerText, 'top')}
                                                    {footerText.trim() && line(footerText, 'bottom')}
                                                </div>
                                            );
                                        }}
                                    />
                                </div>
                            )}

                            <div className="flex flex-col gap-4 min-w-0">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Configure the header and footer text. Leave either blank to skip it.</p>

                            {/* DSL token chips */}
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 space-y-2 dark:bg-emerald-900/20 dark:border-emerald-800">
                                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Dynamic tokens — click to copy:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {[
                                        { token: '{{page}}', hint: 'Current page number' },
                                        { token: '{{total}}', hint: 'Total page count' },
                                        { token: '{{page_of_total}}', hint: 'e.g. "3 of 10"' },
                                        { token: '{{page/total}}', hint: 'e.g. "3/10"' },
                                        { token: '{{roman}}', hint: 'Lowercase roman (i, ii…)' },
                                        { token: '{{ROMAN}}', hint: 'Uppercase roman (I, II…)' },
                                    ].map(({ token, hint }) => (
                                        <button
                                            key={token}
                                            title={hint}
                                            onClick={() => navigator.clipboard?.writeText(token)}
                                            className="px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-xs font-mono text-emerald-700 hover:bg-emerald-100 transition-colors dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-emerald-900/35"
                                        >
                                            {token}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400">Paste a token into any text field below.</p>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Header text <span className="text-slate-400 font-normal dark:text-slate-500">(empty = no header)</span></label>
                                <input
                                    type="text"
                                    value={headerText}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setHeaderText(e.target.value)}
                                    placeholder="e.g. Confidential"
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Footer text <span className="text-slate-400 font-normal dark:text-slate-500">(empty = no footer)</span></label>
                                <input
                                    type="text"
                                    value={footerText}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFooterText(e.target.value)}
                                    placeholder="e.g. Page {{page_of_total}}"
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Font size</label>
                                    <input
                                        type="number"
                                        min={6}
                                        max={72}
                                        value={fontSize}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFontSize(Math.max(6, Math.min(72, Number(e.target.value))))}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={color}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setColor(e.target.value)}
                                            className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5 dark:border-slate-700"
                                        />
                                        <span className="text-sm text-slate-600 font-mono dark:text-slate-300">{color}</span>
                                    </div>
                                </div>
                            </div>
                            {fileData && (
                                <PageRangeField
                                    file={fileData.file}
                                    selected={pages}
                                    onChange={setPages}
                                    accentRing="ring-emerald-500 border-emerald-500"
                                />
                            )}
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
                                            ? <div className="h-full w-full bg-emerald-600 animate-pulse" />
                                            : <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
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
                                    <ToolCostBadge toolId="header-footer" file={fileData?.file} />
                                    <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 space-y-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200">
                                        {headerText && <p>Header: <strong>{headerText}</strong></p>}
                                        {footerText && <p>Footer: <strong>{footerText}</strong></p>}
                                        <p>Font size: <strong>{fontSize}pt</strong> &bull; Color: <span className="font-mono">{color}</span></p>
                                        <p>Pages: <strong>{pages.length === 0 ? 'all' : `${pages[0] + 1}\u2013${pages[pages.length - 1] + 1}`}</strong></p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                                        <input
                                            type="text"
                                            value={outFileName}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setOutFileName(e.target.value.trim())}
                                            placeholder="header-footer"
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700"
                                        />
                                    </div>
                                    <button
                                        onClick={startApply}
                                        className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
                                    >
                                        Apply &amp; Download
                                    </button>
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-500">Your updated PDF will download automatically</p>
                                </div>
                            )}
                        </div>
                    )}

                    <ToolSeoSection
                        toolPath="/tool/header-footer"
                        toolName="Header & Footer"
                        about="PDF Studio's free Header & Footer tool lets you stamp custom text at the top and bottom of every page in your PDF. Control the font size, color, and the range of pages to apply the text to — ideal for adding document titles, confidentiality notices, or page references."
                        features={[
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="17" x2="21" y2="17"/></svg>, title: 'Header and footer', description: 'Add text to the top, bottom, or both edges simultaneously.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400"><circle cx="13" cy="6" r="3"/><path d="M3 20a9 9 0 0 1 9-9 9 9 0 0 1 9 9"/></svg>, title: 'Color & size control', description: 'Pick any text color and font size for your header or footer.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>, title: 'Secure & private', description: 'Files are transferred over HTTPS and deleted after processing.' },
                            { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>, title: 'Page range', description: 'Apply header/footer to all pages or a specific range.' },
                        ]}
                        faqs={[
                            { q: 'What dynamic tokens are available?', a: '{{page}} inserts the current page number, {{total}} inserts the total page count, {{page_of_total}} produces "3 of 10", {{page/total}} produces "3/10", {{roman}} inserts a lowercase roman numeral, and {{ROMAN}} inserts uppercase.' },
                            { q: 'Can I combine tokens with static text?', a: 'Yes — for example "Page {{page}} of {{total}}" or "Confidential — {{page_of_total}}" both work fine.' },
                            { q: 'What happens if I leave the header or footer blank?', a: 'If you leave a field empty, that element is simply not added. You can add only a header, only a footer, or both.' },
                            { q: 'What page range should I use to cover all pages?', a: 'Leave "To page" at 9999 — the tool will apply text up to the last page of your PDF.' },
                            { q: 'Are my files stored on your servers?', a: 'Files are automatically deleted after the operation completes. We do not retain your documents.' },
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                        Back
                    </button>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{activeStep + 1} / {steps.length}</span>
                    <button
                        disabled={activeStep === 2 || !fileData}
                        onClick={() => setActiveStep(a => a + 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {activeStep === steps.length - 2 ? 'Proceed' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Substitutes the dynamic tokens the server understands, so the preview reads the way the
 * finished page will rather than showing the raw `{{page}}` placeholders.
 */
function resolveTokens(text: string, page: number, total: number): string {
    const roman = (n: number) => {
        const table: [number, string][] = [
            [1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'], [100, 'c'], [90, 'xc'],
            [50, 'l'], [40, 'xl'], [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i'],
        ];
        let rest = n, out = '';
        for (const [value, numeral] of table) {
            while (rest >= value) { out += numeral; rest -= value; }
        }
        return out;
    };

    return text
        .replace(/\{\{page_of_total\}\}/g, `${page} of ${total}`)
        .replace(/\{\{page\/total\}\}/g, `${page}/${total}`)
        .replace(/\{\{page\}\}/g, String(page))
        .replace(/\{\{total\}\}/g, String(total))
        .replace(/\{\{ROMAN\}\}/g, roman(page).toUpperCase())
        .replace(/\{\{roman\}\}/g, roman(page));
}
