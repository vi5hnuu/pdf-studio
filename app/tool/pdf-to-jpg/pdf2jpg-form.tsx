'use client';
import * as React from "react";
import {ChangeEvent, useEffect, useState} from "react";
import {Pdf2JpgOptions} from "@/app/_models/pdf-to-jpg-options";

const QUALITY_OPTIONS = [
    { value: 'LOW', label: 'Low', dpi: '72 DPI', hint: 'Smallest file size' },
    { value: 'MEDIUM', label: 'Medium', dpi: '150 DPI', hint: 'Balanced quality' },
    { value: 'HIGH', label: 'High', dpi: '300 DPI', hint: 'Best quality' },
];

export function Pdf2jpgForm(props: { className?: string, initState: Pdf2JpgOptions, onChange: (data: Pdf2JpgOptions) => void }) {
    const [state, setState] = useState<Pdf2JpgOptions>(props.initState);
    useEffect(() => props.onChange(state), [state]);

    return (
        <div className={`flex flex-col gap-6 ${props.className ?? ''}`}>
            {/* Output filename */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                <input
                    type="text"
                    value={state.fileName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => ({ ...s, fileName: e.target.value.trim() }))}
                    className={`w-full px-2.5 py-1.5 rounded border text-sm outline-none transition-colors ${!state.fileName ? 'border-red-300' : 'border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-50'}`}
                    placeholder="output-image"
                />
            </div>

            {/* Quality */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Image quality</label>
                <div className="grid grid-cols-3 gap-2">
                    {QUALITY_OPTIONS.map(({ value, label, dpi, hint }) => (
                        <label key={value} className={`flex flex-col gap-1 p-3 rounded-xl border cursor-pointer transition-all ${state.quality === value ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/25' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                            <input type="radio" className="sr-only" checked={state.quality === value} onChange={() => setState(s => ({ ...s, quality: value }))} />
                            <span className={`text-sm font-semibold ${state.quality === value ? 'text-orange-700 dark:text-orange-300' : 'text-slate-700 dark:text-slate-200'}`}>{label}</span>
                            <span className={`text-xs font-medium ${state.quality === value ? 'text-orange-600' : 'text-slate-500'}`}>{dpi}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">{hint}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Single image toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-10 h-6 rounded-full relative transition-colors ${state.single ? 'bg-orange-500' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${state.single ? 'translate-x-5' : 'translate-x-1'}`} />
                    <input
                        type="checkbox"
                        className="sr-only"
                        checked={state.single}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => ({ ...s, single: e.target.checked }))}
                    />
                </div>
                <div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Join all pages into one image</span>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Off = separate JPG per page (downloaded as ZIP)</p>
                </div>
            </label>

            {/* Direction & gap (only when single) */}
            {state.single && (
                <div className="flex flex-col gap-4 pl-4 border-l-2 border-orange-200 dark:border-orange-800">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Join direction</label>
                        <div className="flex gap-2">
                            {[{ value: 'VERTICAL', label: 'Vertical', icon: '↕' }, { value: 'HORIZONTAL', label: 'Horizontal', icon: '↔' }].map(({ value, label, icon }) => (
                                <label key={value} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all ${state.direction === value ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/25 text-orange-700 dark:text-orange-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}>
                                    <input type="radio" className="sr-only" checked={state.direction === value} onChange={() => setState(s => ({ ...s, direction: value }))} />
                                    <span className="text-lg">{icon}</span>
                                    <span className="text-sm font-medium">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Page gap <span className="text-slate-400 font-normal dark:text-slate-500">(px)</span></label>
                        <input
                            type="number"
                            min={0}
                            value={state.pageGap}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => ({ ...s, pageGap: +e.target.value }))}
                            className="w-32 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-50 dark:border-slate-700"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
