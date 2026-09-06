'use client';
import * as React from "react";
import {ChangeEvent, useEffect, useState} from "react";
import {RotateOptions} from "@/app/_models/rotate-options";

export function RotateForm(props: {
    className?: string,
    initState: RotateOptions,
    onChange: (data: RotateOptions) => void
}) {
    const [state, setState] = useState<RotateOptions>(props.initState);
    useEffect(() => props.onChange(state), [state]);

    return (
        <div className={`flex flex-col gap-6 ${props.className ?? ''}`}>
            {/* Output filename */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                <input
                    type="text"
                    value={state.out_file_name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => ({ ...s, out_file_name: e.target.value.trim() }))}
                    className={`w-full px-2.5 py-1.5 rounded border text-sm outline-none transition-colors ${!state.out_file_name ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-50'}`}
                    placeholder="rotated-pdf"
                />
            </div>

            {/* Master angle */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Master angle <span className="text-slate-400 font-normal dark:text-slate-500">(applies to all pages)</span></label>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        value={state.file_angle}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => ({ ...s, file_angle: +e.target.value }))}
                        className="w-32 px-2.5 py-1.5 rounded border border-slate-200 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-50 dark:border-slate-700"
                    />
                    <span className="text-sm text-slate-500 dark:text-slate-400">degrees</span>
                    <div className="flex gap-2 ml-auto">
                        {[90, 180, 270].map(a => (
                            <button
                                key={a}
                                type="button"
                                onClick={() => setState(s => ({ ...s, file_angle: a }))}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${state.file_angle === a ? 'bg-pink-600 text-white border-pink-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                {a}°
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Maintain ratio */}
            <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-10 h-6 rounded-full relative transition-colors ${state.maintain_ratio ? 'bg-pink-500' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${state.maintain_ratio ? 'translate-x-5' : 'translate-x-1'}`} />
                    <input
                        type="checkbox"
                        className="sr-only"
                        checked={state.maintain_ratio}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => ({ ...s, maintain_ratio: e.target.checked }))}
                    />
                </div>
                <div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Maintain aspect ratio</span>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Scale content to fit within the original page bounds</p>
                </div>
            </label>

            {/* Per-page angles */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Per-page angles</label>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Override master angle for specific pages</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setState(s => {
                            const m = new Map(s.page_angles.entries());
                            m.set(m.size, 0);
                            return { ...s, page_angles: m };
                        })}
                        className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200 transition-colors font-medium dark:bg-pink-900/20 dark:text-pink-300 dark:hover:bg-pink-900/35 dark:border-pink-800"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add page
                    </button>
                </div>

                {state.page_angles.size > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {[...state.page_angles.entries()].map(([pageIdx, angle]) => (
                            <div key={pageIdx} className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                                <span className="text-xs text-slate-500 font-medium dark:text-slate-400">Page {+pageIdx + 1}</span>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        value={angle}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => {
                                            const m = new Map(s.page_angles.entries());
                                            m.set(+pageIdx, +e.target.value);
                                            return { ...s, page_angles: m };
                                        })}
                                        className="flex-1 min-w-0 px-2 py-1 rounded-lg border border-slate-200 text-sm outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100 dark:border-slate-700"
                                    />
                                    <span className="text-xs text-slate-400 dark:text-slate-500">°</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
