'use client';

import * as React from 'react';
import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { ChooseFiles } from '@/app/_components/choose_files';
import { ProgressStepper } from '@/app/_components/progress-stepper';
import { ToolsApi } from '@/app/_utils/api';
import { runToolRequest } from '@/app/_hooks/use-tool-request';
import { useToolStep } from '@/app/_hooks/use-tool-step';
import { formatBytes } from '@/app/_utils/format';
import { ToolCost, costForSize, fetchCosts } from '@/app/_utils/credits';

/**
 * The tools this can apply.
 *
 * Only tools that need no per-file configuration: a page range or a watermark position chosen
 * once cannot sensibly be applied to a set of documents that differ, whereas "compress all of
 * these" is exactly what people want to do to a folder. Mirrors the app's Batch Process screen.
 */
const BATCH_TOOLS = [
    { id: 'compress-pdf', label: 'Compress', url: ToolsApi.compressPdf, infoPart: 'compress-pdf-info', suffix: 'compressed' },
    { id: 'grayscale-pdf', label: 'Grayscale', url: ToolsApi.grayscalePdf, infoPart: 'grayscale-pdf-info', suffix: 'grayscale' },
    { id: 'optimize-pdf', label: 'Optimize', url: ToolsApi.optimizePdf, infoPart: 'optimize-pdf-info', suffix: 'optimized' },
    { id: 'repair-pdf', label: 'Repair', url: ToolsApi.repairPdf, infoPart: 'repair-pdf-info', suffix: 'repaired' },
    { id: 'flatten-pdf', label: 'Flatten', url: ToolsApi.flattenPdf, infoPart: 'flatten-pdf-info', suffix: 'flattened' },
    { id: 'remove-blank-pages', label: 'Remove blank pages', url: ToolsApi.removeBlankPages, infoPart: 'remove-blank-pages-info', suffix: 'cleaned' },
] as const;

type Status = 'pending' | 'running' | 'done' | 'error';

interface Item {
    id: string;
    file: File;
    status: Status;
    error?: string;
}

export function BatchRunner() {
    const steps = ['Select Files', 'Choose Tool', 'Run'];
    const [activeStep, setActiveStep] = useToolStep(steps.length);

    const [items, setItems] = useState<Item[]>([]);
    const [toolId, setToolId] = useState<string>(BATCH_TOOLS[0].id);
    const [running, setRunning] = useState(false);
    const [costs, setCosts] = useState<Record<string, ToolCost>>({});
    const cancelled = useRef(false);

    React.useEffect(() => { fetchCosts().then(setCosts); }, []);

    const tool = BATCH_TOOLS.find((t) => t.id === toolId) ?? BATCH_TOOLS[0];

    /**
     * What the whole run costs, not what one file costs.
     *
     * The app's batch screen documents the complaint this exists to prevent: a ten-file compress
     * quietly spending twenty credits, because the price shown was for a single file.
     */
    const totalCost = useMemo(() => {
        const cost = costs[toolId];
        if (!cost) return 0;
        return items.reduce((sum, item) => sum + costForSize(cost, item.file.size), 0);
    }, [costs, toolId, items]);

    function addFiles(event: ChangeEvent<HTMLInputElement>) {
        const chosen = Array.from(event.target.files ?? []);
        if (chosen.length === 0) return;
        setItems((current) => current.concat(chosen.map((file) => ({
            id: `${file.name}-${file.size}-${file.lastModified}`,
            file,
            status: 'pending' as Status,
        }))));
    }

    function removeItem(id: string) {
        setItems((current) => current.filter((item) => item.id !== id));
    }

    function setStatus(id: string, status: Status, error?: string) {
        setItems((current) => current.map((item) =>
            item.id === id ? { ...item, status, error } : item));
    }

    /**
     * Runs the tool once per file, in order.
     *
     * Sequential rather than parallel: each file is charged, and six uploads at once would
     * compete for the same connection and make the per-file progress meaningless. A failure on
     * one file is recorded against that file and the run continues — one corrupt document in a
     * folder of thirty should not cost the other twenty-nine.
     */
    async function run() {
        if (running || items.length === 0) return;
        setRunning(true);
        cancelled.current = false;
        setItems((current) => current.map((item) => ({ ...item, status: 'pending', error: undefined })));

        for (const item of items) {
            if (cancelled.current) break;
            setStatus(item.id, 'running');

            const formData = new FormData();
            const base = item.file.name.replace(/\.pdf$/i, '');
            formData.append(tool.infoPart,
                new Blob([JSON.stringify({ out_file_name: `${base}_${tool.suffix}` })],
                    { type: 'application/json' }));
            formData.append('file', item.file);

            let failure: string | null = null;
            const ok = await runToolRequest({
                url: tool.url,
                formData,
                fallbackFilename: `${base}_${tool.suffix}.pdf`,
                onError: (message) => { failure = message; },
            });

            setStatus(item.id, ok ? 'done' : 'error', ok ? undefined : (failure ?? 'Failed'));
        }

        setRunning(false);
    }

    const done = items.filter((i) => i.status === 'done').length;
    const failed = items.filter((i) => i.status === 'error').length;

    return (
        <div className="flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white px-4 md:px-8 py-2.5 flex-shrink-0">
                <div className="max-w-5xl mx-auto flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white/20 rounded-sm flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m12 2 8 4.5v9L12 20l-8-4.5v-9z" /><path d="M12 20V11" />
                            <path d="m4 6.5 8 4.5 8-4.5" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base font-semibold leading-tight">Batch Process</h1>
                        <p className="text-xs opacity-75 leading-tight">Apply one tool to many PDFs in a single run</p>
                    </div>
                    <div className="hidden md:block text-xs opacity-60 flex-shrink-0">
                        Step {activeStep + 1} / {steps.length}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-4 md:px-8 py-1.5 flex-shrink-0">
                <div className="max-w-5xl mx-auto">
                    <ProgressStepper steps={steps} activeStepIndex={activeStep} onStepClick={setActiveStep} />
                </div>
            </div>

            <div className="flex-1 px-4 md:px-8 py-5">
                <div className="max-w-3xl mx-auto space-y-4">
                    {activeStep === 0 && (
                        <>
                            <ChooseFiles accept={['application/pdf']} onChange={addFiles}
                                         title="Click to upload PDFs" />
                            {items.length > 0 && (
                                <ul className="divide-y divide-slate-100 dark:divide-slate-700 rounded-sm
                                               border border-slate-200 dark:border-slate-700">
                                    {items.map((item) => (
                                        <li key={item.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                                            <span className="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-200">
                                                {item.file.name}
                                            </span>
                                            <span className="flex-shrink-0 text-xs text-slate-400 dark:text-slate-500">
                                                {formatBytes(item.file.size)}
                                            </span>
                                            <button onClick={() => removeItem(item.id)}
                                                    aria-label={`Remove ${item.file.name}`}
                                                    className="flex-shrink-0 text-slate-400 hover:text-red-600 text-lg leading-none">
                                                ×
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}

                    {activeStep === 1 && (
                        <div className="space-y-4">
                            <div className="grid gap-2 sm:grid-cols-2">
                                {BATCH_TOOLS.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setToolId(option.id)}
                                        aria-pressed={toolId === option.id}
                                        className={`rounded-sm border px-3 py-2 text-left text-sm transition-colors ${
                                            toolId === option.id
                                                ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            {totalCost > 0 && (
                                <p className="rounded-sm border border-slate-200 dark:border-slate-700
                                              bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm
                                              text-slate-600 dark:text-slate-300">
                                    {items.length} file{items.length === 1 ? '' : 's'} ×{' '}
                                    {tool.label} — <strong>{totalCost} credit{totalCost === 1 ? '' : 's'}</strong> in total
                                </p>
                            )}
                        </div>
                    )}

                    {activeStep === 2 && (
                        <div className="space-y-4">
                            <ul className="divide-y divide-slate-100 dark:divide-slate-700 rounded-sm
                                           border border-slate-200 dark:border-slate-700">
                                {items.map((item) => (
                                    <li key={item.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                                        <StatusDot status={item.status} />
                                        <span className="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-200">
                                            {item.file.name}
                                        </span>
                                        <span className="flex-shrink-0 text-xs text-slate-400 dark:text-slate-500">
                                            {item.status === 'error' ? item.error : item.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={run}
                                disabled={running || items.length === 0}
                                className="w-full rounded-sm bg-amber-600 px-4 py-2.5 text-sm font-semibold
                                           text-white hover:bg-amber-700 disabled:opacity-40
                                           disabled:cursor-not-allowed transition-colors"
                            >
                                {running
                                    ? `Processing ${done + failed + 1} of ${items.length}…`
                                    : `Run ${tool.label} on ${items.length} file${items.length === 1 ? '' : 's'}`}
                            </button>

                            {running && (
                                <button onClick={() => { cancelled.current = true; }}
                                        className="w-full rounded-sm border border-slate-200 dark:border-slate-700
                                                   px-4 py-2 text-sm text-slate-600 dark:text-slate-300">
                                    Stop after this file
                                </button>
                            )}

                            {!running && done + failed > 0 && (
                                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                                    {done} saved{failed > 0 ? `, ${failed} failed` : ''}. Each file downloads as it finishes.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="sticky bottom-0 z-30 flex-shrink-0 bg-white dark:bg-slate-800 border-t
                            border-slate-200 dark:border-slate-700 px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <button
                        disabled={activeStep === 0 || running}
                        onClick={() => setActiveStep((step) => step - 1)}
                        className="rounded-sm border border-slate-200 dark:border-slate-700 px-3.5 py-1.5
                                   text-sm font-medium text-slate-600 dark:text-slate-300
                                   disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Back
                    </button>
                    <button
                        disabled={activeStep === 2 || items.length === 0}
                        onClick={() => setActiveStep((step) => step + 1)}
                        className="rounded-sm bg-amber-600 px-3.5 py-1.5 text-sm font-semibold text-white
                                   hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatusDot({ status }: { status: Status }) {
    const colour =
        status === 'done' ? 'bg-green-500'
            : status === 'error' ? 'bg-red-500'
                : status === 'running' ? 'bg-amber-500 animate-pulse'
                    : 'bg-slate-300 dark:bg-slate-600';
    return <span aria-hidden className={`h-2 w-2 flex-shrink-0 rounded-full ${colour}`} />;
}
