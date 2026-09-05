'use client';
import * as React from "react";
import {ChangeEvent, useEffect, useState} from "react";
import {SplitOptions, SplitType} from "@/app/_models/split-options";

const SPLIT_TYPES: { value: SplitType; label: string; hint: string }[] = [
    { value: SplitType.SPLIT_BY_RANGE, label: 'By Range', hint: 'Specify exact page ranges' },
    { value: SplitType.FIXED_RANGE, label: 'Fixed Range', hint: 'Split every N pages' },
    { value: SplitType.EXTRACT_ALL_PAGES, label: 'All Pages', hint: 'One file per page' },
    { value: SplitType.DELETE_PAGES, label: 'Delete Pages', hint: 'Remove page ranges' },
];

export function SplitForm(props: {
    className?: string,
    initState: SplitOptions,
    onChange: (data: SplitOptions) => void,
    /** Pages in the chosen document, so the settings can say what they will produce. */
    pageCount?: number | null,
}) {
    const [state, setState] = useState<SplitOptions>(props.initState);
    useEffect(() => props.onChange(state), [state]);

    const outcome = describeOutcome(state, props.pageCount ?? null);

    return (
        <div className={`flex flex-col gap-6 ${props.className ?? ''}`}>
            {/* Output filename */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                <input
                    type="text"
                    value={state.out_file_name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => ({ ...s, out_file_name: e.target.value.trim() }))}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${!state.out_file_name ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-50'}`}
                    placeholder="split-output"
                />
            </div>

            {/* Split type */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Split type</label>
                <div className="grid grid-cols-2 gap-2">
                    {SPLIT_TYPES.map(({ value, label, hint }) => (
                        <label
                            key={value}
                            className={`flex flex-col gap-0.5 p-3 rounded-xl border cursor-pointer transition-all ${state.type === value ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/25' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'}`}
                        >
                            <input type="radio" className="sr-only" checked={state.type === value} onChange={() => setState(s => ({ ...s, type: value }))} />
                            <span className={`text-sm font-medium ${state.type === value ? 'text-teal-700 dark:text-teal-300' : 'text-slate-700 dark:text-slate-200'}`}>{label}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">{hint}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Fixed value */}
            {state.type === SplitType.FIXED_RANGE && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Pages per split</label>
                    <input
                        type="number"
                        min={1}
                        value={state.fixed}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => ({ ...s, fixed: +e.target.value }))}
                        className={`w-40 px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${!state.fixed ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 dark:border-slate-700 focus:border-teal-400 focus:ring-2 focus:ring-teal-50 dark:focus:ring-teal-900'}`}
                    />
                </div>
            )}

            {/* What the current settings will actually produce. Splitting used to be a guess
                until the ZIP was downloaded and opened. */}
            {outcome && (
                <p className="text-sm rounded-xl border border-slate-200 dark:border-slate-700
                              bg-slate-50 dark:bg-slate-900 px-3 py-2 text-slate-600 dark:text-slate-300">
                    {outcome}
                </p>
            )}

            {/* Ranges */}
            {![SplitType.EXTRACT_ALL_PAGES, SplitType.FIXED_RANGE].includes(state.type) && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Page ranges</label>
                        <button
                            type="button"
                            onClick={() => setState(s => ({ ...s, ranges: [...s.ranges, { from: 0, to: 0 }] }))}
                            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors font-medium dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-300 dark:hover:bg-teal-900/35"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Add range
                        </button>
                    </div>
                    <div className="flex flex-col gap-2">
                        {state.ranges.map((range, index) => (
                            <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                                <span className="text-xs text-slate-400 font-medium w-6 text-center dark:text-slate-500">{index + 1}</span>
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="flex flex-col gap-0.5 flex-1">
                                        <label className="text-xs text-slate-500 dark:text-slate-400">From page</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={range.from}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => {
                                                const r = [...s.ranges];
                                                r[index] = { ...r[index], from: +e.target.value };
                                                return { ...s, ranges: r };
                                            })}
                                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 dark:border-slate-700"
                                        />
                                    </div>
                                    <span className="text-slate-400 mt-4 dark:text-slate-500">–</span>
                                    <div className="flex flex-col gap-0.5 flex-1">
                                        <label className="text-xs text-slate-500 dark:text-slate-400">To page</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={range.to}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => {
                                                const r = [...s.ranges];
                                                r[index] = { ...r[index], to: +e.target.value };
                                                return { ...s, ranges: r };
                                            })}
                                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 dark:border-slate-700"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setState(s => ({ ...s, ranges: s.ranges.filter((_, i) => i !== index) }))}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors dark:text-slate-500 dark:hover:bg-red-900/25"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>
                        ))}
                        {state.ranges.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-4 dark:text-slate-500">No ranges added yet. Click "Add range" to start.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/** Plain-language summary of what the chosen split settings will produce. */
function describeOutcome(state: SplitOptions, pageCount: number | null): string | null {
    if (!pageCount) return null;
    const files = (n: number) => `${n} file${n === 1 ? '' : 's'}`;

    switch (state.type) {
        case SplitType.FIXED_RANGE: {
            if (!state.fixed || state.fixed < 1) return null;
            return `${pageCount} pages, every ${state.fixed} → ${files(Math.ceil(pageCount / state.fixed))}.`;
        }
        case SplitType.EXTRACT_ALL_PAGES:
            return `${pageCount} pages → ${files(pageCount)}, one per page.`;
        case SplitType.SPLIT_BY_RANGE: {
            const ranges = state.ranges?.filter((r) => r.from && r.to) ?? [];
            if (!ranges.length) return `Add a range to split this ${pageCount}-page document.`;
            return `${files(ranges.length)}, one per range.`;
        }
        case SplitType.DELETE_PAGES: {
            const ranges = state.ranges?.filter((r) => r.from && r.to) ?? [];
            if (!ranges.length) return `Add a range to remove from this ${pageCount}-page document.`;
            const removed = ranges.reduce((sum, r) => sum + Math.max(0, r.to - r.from + 1), 0);
            return `Removing ${removed} page${removed === 1 ? '' : 's'} → one file of about ${Math.max(0, pageCount - removed)}.`;
        }
        default:
            return null;
    }
}
