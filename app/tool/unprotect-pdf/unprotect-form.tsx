'use client';
import * as React from "react";
import {ChangeEvent, useEffect, useState} from "react";
import {UnprotectOptions} from "@/app/_models/unprotect-options";

export function UnprotectForm(props: {
    className?: string,
    initState: UnprotectOptions,
    onChange: (data: UnprotectOptions) => void
}) {
    const [state, setState] = useState<UnprotectOptions>(props.initState);
    const [showPwd, setShowPwd] = useState(false);
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
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${!state.out_file_name ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-50'}`}
                    placeholder="unlocked-pdf"
                />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Owner password <span className="text-slate-400 text-xs font-normal">(master/owner)</span></label>
                <div className="relative">
                    <input
                        type={showPwd ? 'text' : 'password'}
                        value={state.password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => ({ ...s, password: e.target.value.trim() }))}
                        className={`w-full px-3 py-2.5 pr-10 rounded-xl border text-sm outline-none transition-colors ${!state.password ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-50'}`}
                        placeholder="Enter master password"
                    />
                    <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPwd
                            ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                    </button>
                </div>
                <p className="text-xs text-slate-400">You must provide the owner (master) password to remove encryption.</p>
            </div>
        </div>
    );
}
