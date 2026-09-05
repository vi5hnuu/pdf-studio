'use client';
import * as React from "react";
import {ChangeEvent, useEffect, useState} from "react";
import {UserPermission, userPermissions} from "@/app/_utils/constants";
import {ProtectOptions} from "@/app/_models/protect-options";

const PERMISSION_LABELS: Record<UserPermission, string> = {
    [UserPermission.PRINT]: 'Print',
    [UserPermission.MODIFICATION]: 'Modify content',
    [UserPermission.EXTRACT]: 'Extract content',
    [UserPermission.MODIFY_ANNOTATIONS]: 'Modify annotations',
    [UserPermission.FILL_IN_FORM]: 'Fill in forms',
    [UserPermission.EXTRACT_FOR_ACCESSIBILITY]: 'Extract for accessibility',
    [UserPermission.ASSEMBLE_DOCUMENT]: 'Assemble document',
    [UserPermission.FAITHFUL_PRINT]: 'High-quality print',
    [UserPermission.READ_ONLY]: 'Read only',
};

export function ProtectForm(props: {
    className?: string,
    initState: ProtectOptions,
    onChange: (data: ProtectOptions) => void
}) {
    const [state, setState] = useState<ProtectOptions>(props.initState);
    const [showOwner, setShowOwner] = useState(false);
    const [showUser, setShowUser] = useState(false);
    useEffect(() => props.onChange(state), [state]);

    function updatePermission(permission: UserPermission, add: boolean) {
        setState(s => {
            const p = new Set(s.userAccess_permissions);
            if (add) p.add(permission); else p.delete(permission);
            return { ...s, userAccess_permissions: p };
        });
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
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${!state.out_file_name ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-50'}`}
                    placeholder="protected-pdf"
                />
            </div>

            {/* Owner password */}
            <div className="flex flex-col gap-1.5">
                <label htmlFor="owner-password" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Owner password
                </label>
                <p className="text-xs text-slate-400 dark:text-slate-500 -mt-1">
                    Lets you change the permissions below or remove the protection later. Keep it to yourself.
                </p>
                <div className="relative">
                    <input
                        id="owner-password"
                        type={showOwner ? 'text' : 'password'}
                        value={state.owner_password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => ({ ...s, owner_password: e.target.value.trim() }))}
                        className={`w-full px-3 py-2.5 pr-10 rounded-xl border text-sm outline-none transition-colors ${!state.owner_password ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-50'}`}
                        placeholder="Enter owner password"
                    />
                    <button type="button" onClick={() => setShowOwner(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500">
                        {showOwner
                            ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                    </button>
                </div>
            </div>

            {/* User password */}
            <div className="flex flex-col gap-1.5">
                <label htmlFor="user-password" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    User password
                </label>
                <p className="text-xs text-slate-400 dark:text-slate-500 -mt-1">
                    Asked for every time the file is opened. Share this one with the people who should read it.
                </p>
                <div className="relative">
                    <input
                        id="user-password"
                        type={showUser ? 'text' : 'password'}
                        value={state.user_password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setState(s => ({ ...s, user_password: e.target.value.trim() }))}
                        className={`w-full px-3 py-2.5 pr-10 rounded-xl border text-sm outline-none transition-colors ${!state.user_password ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-50'}`}
                        placeholder="Enter user password"
                    />
                    <button type="button" onClick={() => setShowUser(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500">
                        {showUser
                            ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                    </button>
                </div>
            </div>

            {/* Permissions */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">User permissions</label>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                    Tick what someone opening with the user password is allowed to do. Anything left
                    unticked is blocked.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                    {userPermissions.map((perm) => (
                        <label key={perm} className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors dark:border-slate-700 dark:hover:bg-slate-700">
                            <div className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${state.userAccess_permissions.has(perm) ? 'bg-red-500 border-red-500' : 'border-slate-300'}`}>
                                {state.userAccess_permissions.has(perm) && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                                )}
                                <input type="checkbox" className="sr-only" checked={state.userAccess_permissions.has(perm)} onChange={(e: ChangeEvent<HTMLInputElement>) => updatePermission(perm, e.target.checked)} />
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-300">{PERMISSION_LABELS[perm]}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
