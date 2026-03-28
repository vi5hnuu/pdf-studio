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
    onChange: (data: SplitOptions) => void
}) {
    const [state, setState] = useState<SplitOptions>(props.initState);
    useEffect(() => props.onChange(state), [state]);

    return (
        <div className={`flex flex-col gap-6 ${props.className ?? ''}`}>
            {/* Output filename */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Output file name</label>
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
                <label className="text-sm font-medium text-slate-700">Split type</label>
                <div className="grid grid-cols-2 gap-2">
                    {SPLIT_TYPES.map(({ value, label, hint }) => (
                        <label
                            key={value}
                            className={`flex flex-col gap-0.5 p-3 rounded-xl border cursor-pointer transition-all ${state.type === value ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                        >
                            <input type="radio" className="sr-only" checked={state.type === value} onChange={() => setState(s => ({ ...s, type: value }))} />
                            <span className={`text-sm font-medium ${state.type === value ? 'text-teal-700' : 'text-slate-700'}`}>{label}</span>
                            <span className="text-xs text-slate-400">{hint}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Fixed value */}
            {state.type === SplitType.FIXED_RANGE && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Pages per split</label>
                    <input
                        type="number"
                        min={1}
                        value={state.fixed}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => ({ ...s, fixed: +e.target.value }))}
                        className={`w-40 px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${!state.fixed ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-50'}`}
                    />
                </div>
            )}

            {/* Ranges */}
            {![SplitType.EXTRACT_ALL_PAGES, SplitType.FIXED_RANGE].includes(state.type) && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-700">Page ranges</label>
                        <button
                            type="button"
                            onClick={() => setState(s => ({ ...s, ranges: [...s.ranges, { from: 0, to: 0 }] }))}
                            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Add range
                        </button>
                    </div>
                    <div className="flex flex-col gap-2">
                        {state.ranges.map((range, index) => (
                            <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <span className="text-xs text-slate-400 font-medium w-6 text-center">{index + 1}</span>
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="flex flex-col gap-0.5 flex-1">
                                        <label className="text-xs text-slate-500">From page</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={range.from}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => {
                                                const r = [...s.ranges];
                                                r[index] = { ...r[index], from: +e.target.value };
                                                return { ...s, ranges: r };
                                            })}
                                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                                        />
                                    </div>
                                    <span className="text-slate-400 mt-4">–</span>
                                    <div className="flex flex-col gap-0.5 flex-1">
                                        <label className="text-xs text-slate-500">To page</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={range.to}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => {
                                                const r = [...s.ranges];
                                                r[index] = { ...r[index], to: +e.target.value };
                                                return { ...s, ranges: r };
                                            })}
                                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setState(s => ({ ...s, ranges: s.ranges.filter((_, i) => i !== index) }))}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>
                        ))}
                        {state.ranges.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-4">No ranges added yet. Click "Add range" to start.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
