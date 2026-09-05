'use client';
import * as React from "react";
import {ChangeEvent, useEffect, useState} from "react";
import {Font, hexToRGBA} from "@/app/_utils/constants";
import {PageNumbersOptions} from "@/app/_models/page-numbers-options";

const fonts = [Font.TIMES_ROMAN, Font.TIMES_BOLD, Font.TIMES_ITALIC, Font.TIMES_BOLD_ITALIC, Font.HELVETICA, Font.HELVETICA_BOLD, Font.HELVETICA_OBLIQUE, Font.HELVETICA_BOLD_OBLIQUE, Font.COURIER, Font.COURIER_OBLIQUE, Font.COURIER_BOLD, Font.COURIER_BOLD_OBLIQUE, Font.SYMBOL, Font.ZAPF_DINGBATS];

const PAGE_NO_TYPES = [
    { value: 'ONLY_X', label: 'X', preview: '5' },
    { value: 'PAGE_X', label: 'Page X', preview: 'Page 5' },
    { value: 'PAGE_X_OF_Y', label: 'Page X of Y', preview: 'Page 5 of 12' },
];

const POSITIONS = ['START', 'CENTER', 'END'] as const;
type Pos = typeof POSITIONS[number];

export function PageNumbersForm(props: {
    className?: string,
    initState: PageNumbersOptions,
    onChange: (data: PageNumbersOptions) => void
}) {
    const [state, setState] = useState<PageNumbersOptions>(props.initState);
    useEffect(() => props.onChange(state), [state]);

    function posLabel(p: Pos, axis: 'h' | 'v') {
        if (axis === 'h') return { START: 'Left', CENTER: 'Center', END: 'Right' }[p];
        return { START: 'Top', CENTER: 'Middle', END: 'Bottom' }[p];
    }

    return (
        <div className={`flex flex-col gap-6 ${props.className ?? ''}`}>
            {/* Output filename */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Output file name</label>
                <input
                    type="text"
                    value={state.out_file_name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => ({ ...s, out_file_name: e.target.value.trim() }))}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${!state.out_file_name ? 'border-red-300' : 'border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-50'}`}
                    placeholder="numbered-pdf"
                />
            </div>

            {/* Page number format */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Number format</label>
                <div className="grid grid-cols-3 gap-2">
                    {PAGE_NO_TYPES.map(({ value, label, preview }) => (
                        <label key={value} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer transition-all ${state.page_no_type === value ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-slate-300'}`}>
                            <input type="radio" className="sr-only" checked={state.page_no_type === value} onChange={() => setState(s => ({ ...s, page_no_type: value }))} />
                            <span className={`text-base font-semibold ${state.page_no_type === value ? 'text-green-700' : 'text-slate-400'}`}>{preview}</span>
                            <span className={`text-xs ${state.page_no_type === value ? 'text-green-600' : 'text-slate-400'}`}>{label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Position grid */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Position</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 rounded-xl p-2 dark:bg-slate-700">
                    {(['START', 'CENTER', 'END'] as Pos[]).map(vp =>
                        (['START', 'CENTER', 'END'] as Pos[]).map(hp => {
                            const active = state.vertical_position === vp && state.horizontal_position === hp;
                            return (
                                <button
                                    key={`${vp}-${hp}`}
                                    type="button"
                                    onClick={() => setState(s => ({ ...s, vertical_position: vp, horizontal_position: hp }))}
                                    title={`${posLabel(vp, 'v')} ${posLabel(hp, 'h')}`}
                                    className={`h-10 rounded-lg text-xs font-medium transition-all ${active ? 'bg-green-500 text-white shadow' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-200'}`}
                                >
                                    {active ? '●' : '·'}
                                </button>
                            );
                        })
                    )}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                    Position: <strong className="text-slate-600 dark:text-slate-300">{posLabel(state.vertical_position as Pos, 'v')} {posLabel(state.horizontal_position as Pos, 'h')}</strong>
                </p>
            </div>

            {/* Font & Size */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Font</label>
                    <select
                        value={state.font_name}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setState(s => ({ ...s, font_name: e.target.value as Font }))}
                        className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 bg-white dark:bg-slate-800 dark:border-slate-700"
                    >
                        {fonts.map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Font size</label>
                    <input
                        type="number"
                        min={6}
                        max={72}
                        value={state.size}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => ({ ...s, size: +e.target.value }))}
                        className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 dark:border-slate-700"
                    />
                </div>
            </div>

            {/* Color */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Text color</label>
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        defaultValue="#000000"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => ({ ...s, fill_color: hexToRGBA(e.target.value) }))}
                        className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 dark:border-slate-700"
                    />
                    <span className="text-sm text-slate-500 dark:text-slate-400">Click to choose color</span>
                </div>
            </div>

            {/* Page range */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">From page</label>
                    <input
                        type="number"
                        min={0}
                        value={state.from_page}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => ({ ...s, from_page: +e.target.value }))}
                        className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 dark:border-slate-700"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">To page <span className="text-slate-400 font-normal dark:text-slate-500">(0 = last)</span></label>
                    <input
                        type="number"
                        min={0}
                        value={state.to_page ?? 0}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => ({ ...s, to_page: +e.target.value || undefined }))}
                        className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 dark:border-slate-700"
                    />
                </div>
            </div>

            {/* Padding */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Padding</label>
                <div className="grid grid-cols-4 gap-2">
                    {(['top', 'right', 'bottom', 'left'] as const).map(side => (
                        <div key={side} className="flex flex-col gap-1">
                            <label className="text-xs text-slate-500 capitalize dark:text-slate-400">{side}</label>
                            <input
                                type="number"
                                min={0}
                                value={state.padding?.[side] ?? 0}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => ({ ...s, padding: { ...s.padding, [side]: +e.target.value } }))}
                                className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-green-400 focus:ring-1 focus:ring-green-50 dark:border-slate-700"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
