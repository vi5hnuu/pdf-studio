import Link from 'next/link';
import * as React from 'react';

/**
 * Layout shared by the sign-in, register and password-reset pages.
 *
 * Single column at every width — auth forms are the one place a multi-column layout only
 * adds ways to go wrong on a phone.
 */
export function AuthShell({
    title, subtitle, children, footer,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}) {
    return (
        <main className="min-h-dvh flex flex-col items-center justify-center gap-6 px-4 py-10
                         bg-slate-50 dark:bg-slate-900">
            <Link href="/" className="flex items-center gap-2">
                <span className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                         fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    </svg>
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">PDF Studio</span>
            </Link>

            <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-700
                            bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-sm">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
                {subtitle && (
                    <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
                )}
                <div className="mt-6">{children}</div>
            </div>

            {footer && (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">{footer}</p>
            )}
        </main>
    );
}

/** Text input with a label, sized for touch. */
export function Field({
    id, label, type = 'text', value, onChange, autoComplete, required, placeholder, hint,
}: {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    autoComplete?: string;
    required?: boolean;
    placeholder?: string;
    hint?: string;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {label}
            </label>
            <input
                id={id}
                name={id}
                type={type}
                value={value}
                required={required}
                placeholder={placeholder}
                autoComplete={autoComplete}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700
                           dark:bg-slate-900 dark:text-slate-100 text-base sm:text-sm outline-none
                           focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
            />
            {hint && <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
        </div>
    );
}

/** Error and success banners, both announced. */
export function Banner({ kind, children }: { kind: 'error' | 'success'; children: React.ReactNode }) {
    const tone = kind === 'error'
        ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
        : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
    return (
        <div role="alert" className={`rounded-xl border px-4 py-3 text-sm ${tone}`}>
            {children}
        </div>
    );
}

/** Primary submit button with a pending state. */
export function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold
                       text-sm disabled:opacity-50 transition-colors"
        >
            {pending ? 'Please wait…' : children}
        </button>
    );
}
