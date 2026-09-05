'use client';

import * as React from 'react';
import { ChangeEvent, useState } from 'react';
import { ChooseFiles } from '@/app/_components/choose_files';
import { ProgressStepper } from '@/app/_components/progress-stepper';
import { ToolSeoSection } from '@/app/_components/tool-seo-section';
import { Box, PageMetrics, PdfPageCanvas } from '@/app/_components/pdf-page-canvas';
import { ToolsApi } from '@/app/_utils/api';
import { runToolRequest } from '@/app/_hooks/use-tool-request';

enum Step { IDLE = 'idle', UPLOAD = 'upload', PROCESS = 'process', DOWNLOAD = 'download' }

/**
 * Redaction, driven by drawing on the page.
 *
 * This tool used to ask for each region as four numbers — x, y, width and height in PDF
 * points — with no preview of the document at all. Nobody can supply those accurately, and
 * getting them wrong on a redaction tool means either covering the wrong thing or leaving
 * the sensitive content visible. Regions are now drawn directly on the rendered page and
 * converted to points here.
 */
export default function RedactPdf() {
    const [activeStep, setActiveStep] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [boxes, setBoxes] = useState<Box[]>([]);
    const [metrics, setMetrics] = useState<PageMetrics | null>(null);
    const [outFileName, setOutFileName] = useState('');
    const [step, setStep] = useState<Step>(Step.IDLE);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const steps = ['Select File', 'Mark Areas', 'Redact'];

    function handleFile(event: ChangeEvent<HTMLInputElement>) {
        const chosen = (Object.values(event.target.files ?? {}) as File[])[0];
        if (!chosen) return;
        setFile(chosen);
        setBoxes([]);
    }

    async function redact() {
        if (!file || boxes.length === 0 || !metrics) return;

        // The endpoint works in PDF points with a top-left origin (it inverts Y itself),
        // which is exactly what the canvas produces once scaled by the page size.
        const regions = boxes.map((box) => ({
            page: box.page,
            x: Math.round(box.x * metrics.pointWidth),
            y: Math.round(box.y * metrics.pointHeight),
            width: Math.round(box.width * metrics.pointWidth),
            height: Math.round(box.height * metrics.pointHeight),
        }));

        const formData = new FormData();
        formData.append('redact-pdf-info', new Blob(
            [JSON.stringify({ out_file_name: outFileName || 'redacted', regions })],
            { type: 'application/json' }));
        formData.append('file', file);

        await runToolRequest({
            url: ToolsApi.redactPdf,
            formData,
            fallbackFilename: `${outFileName || 'redacted'}.pdf`,
            onStep: (s) => setStep(s as Step),
            onProgress: setProgress,
            onError: setError,
        });
    }

    const statusText =
        step === Step.UPLOAD ? 'Uploading…' :
        step === Step.PROCESS ? 'Applying redactions…' :
        step === Step.DOWNLOAD ? 'Preparing download…' : '';

    return (
        <div className="flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-zinc-700 to-zinc-900 text-white px-6 md:px-10 py-5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <img src="/tools/redact-pdf.svg" alt="" width={28} height={28} className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">Redact PDF</h1>
                        <p className="text-sm opacity-75 mt-0.5">Draw over anything you need to black out</p>
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
                            <ChooseFiles single accept={['application/pdf']} onChange={handleFile} />
                            {file && (
                                <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                                    Selected: <strong>{file.name}</strong>
                                </p>
                            )}
                        </div>
                    )}

                    {activeStep === 1 && file && (
                        <div className="space-y-4">
                            <PdfPageCanvas
                                file={file}
                                boxes={boxes}
                                onChange={setBoxes}
                                onMetrics={setMetrics}
                                boxClassName="bg-black/80 border-black"
                                hint="Drag across anything you want blacked out. Draw as many areas as you need, on any page."
                            />
                            {boxes.length > 0 && (
                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setBoxes([])}
                                        className="text-sm text-slate-500 dark:text-slate-400 underline hover:text-red-600"
                                    >
                                        Clear all {boxes.length} area{boxes.length === 1 ? '' : 's'}
                                    </button>
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
                                        {step !== Step.PROCESS && (
                                            <span className="text-slate-400 dark:text-slate-500 tabular-nums">
                                                {Math.round(progress)}%
                                            </span>
                                        )}
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        {step === Step.PROCESS
                                            ? <div className="h-full w-full bg-zinc-600 animate-pulse" />
                                            : <div className="h-full bg-zinc-800 rounded-full transition-all"
                                                   style={{ width: `${progress}%` }} />}
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div role="alert" className="flex gap-3 rounded-xl border border-red-200 dark:border-red-800
                                                bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                                    {error}
                                </div>
                            )}

                            {step === Step.IDLE && (
                                <div className="flex flex-col gap-4">
                                    <div className="rounded-xl border border-slate-200 dark:border-slate-700
                                                    bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm
                                                    text-slate-600 dark:text-slate-300">
                                        {boxes.length} area{boxes.length === 1 ? '' : 's'} will be permanently
                                        blacked out across {new Set(boxes.map((b) => b.page)).size} page
                                        {new Set(boxes.map((b) => b.page)).size === 1 ? '' : 's'}.
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="out-name" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                            Output file name
                                        </label>
                                        <input
                                            id="out-name"
                                            type="text"
                                            value={outFileName}
                                            onChange={(e) => setOutFileName(e.target.value.trim())}
                                            placeholder="redacted"
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200
                                                       dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100
                                                       text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                                        />
                                    </div>

                                    <button
                                        onClick={redact}
                                        disabled={boxes.length === 0}
                                        className="w-full py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-900 text-white
                                                   font-semibold text-sm disabled:opacity-40 transition-colors shadow-sm"
                                    >
                                        Redact & Download
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <ToolSeoSection
                        toolPath="/tool/redact-pdf"
                        toolName="Redact PDF"
                        about="Permanently blacks out areas of a PDF. Draw over whatever needs to go — names, account numbers, signatures — on any page, and the marked areas are filled in the output. Unlike drawing a black shape in a viewer and saving, this produces a file where the covered area is painted over in the page content."
                        features={[
                            { icon: <Check />, title: 'Draw, do not measure', description: 'Mark areas directly on the page instead of entering coordinates.' },
                            { icon: <Check />, title: 'Any number of areas', description: 'Redact as many regions as you need, across as many pages.' },
                            { icon: <Check />, title: 'Adjustable', description: 'Move or resize an area after drawing it, or remove it and start again.' },
                            { icon: <Check />, title: 'Private', description: 'The file is sent over HTTPS and removed from the server after processing.' },
                        ]}
                        faqs={[
                            { q: 'Is the text underneath really gone?', a: 'The marked area is filled with opaque black in the page content, so the region is covered in the output file. For the strongest guarantee on a highly sensitive document, follow redaction with the Flatten or Grayscale tool, which rasterizes the page so no original text objects remain at all.' },
                            { q: 'Can I redact on more than one page?', a: 'Yes. Move between pages with the arrows above the preview; areas are remembered per page and all are applied together.' },
                            { q: 'How do I remove an area I drew by mistake?', a: 'Click the × on its corner, or use "Clear all" to start over.' },
                            { q: 'Why was I asked for coordinates before?', a: 'An earlier version of this tool took raw numbers. It now renders the page so you can mark areas by eye, which is both faster and far less error-prone.' },
                        ]}
                    />
                </div>
            </div>

            <div className="flex-shrink-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        disabled={activeStep === 0}
                        onClick={() => setActiveStep((a) => a - 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200
                                   dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300
                                   hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
                    >
                        Back
                    </button>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{activeStep + 1} / {steps.length}</span>
                    <button
                        disabled={activeStep === 2 || (activeStep === 0 && !file) || (activeStep === 1 && boxes.length === 0)}
                        onClick={() => setActiveStep((a) => a + 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-900
                                   text-white text-sm font-semibold disabled:opacity-40 transition-colors shadow-sm"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

const Check = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" className="text-zinc-700">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
