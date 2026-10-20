import Link from 'next/link';
import * as React from 'react';

/**
 * Layout shared by the sign-in, register and password-reset pages.
 *
 * Mobile is single-column — a phone screen is where ~65% of auth happens and dividing a
 * cramped viewport only adds taps. Desktop splits into form on the left and a benefits panel
 * on the right (keyboard focus, screen-reader order, and semantic flow all stay on the form).
 * The panel is purely marketing, so it is {@code aria-hidden} and never steals focus; a user
 * on a reader hears the brand, the heading, the subtitle, then the form, which is the shape
 * that converts.
 */
export function AuthShell({
    title, subtitle, children, footer, promise,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    /**
     * Optional per-page override for the benefits panel copy. Each page can tune the
     * promise to the moment (sign-in vs register vs reset) so the sidebar is never generic.
     */
    promise?: Promise;
}) {
    return (
        <main className="min-h-dvh grid lg:grid-cols-2 bg-white dark:bg-slate-950">
            {/* ── Form column — stays single-column at every width ─────────────────── */}
            <section
                className="flex flex-col px-6 py-8 sm:px-10 sm:py-12 lg:px-16 lg:py-16
                           min-h-dvh lg:min-h-0"
                aria-labelledby="auth-title"
            >
                <Brand />

                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-sm">
                        <h1
                            id="auth-title"
                            className="text-2xl sm:text-3xl font-bold tracking-tight
                                       text-slate-900 dark:text-slate-50"
                        >
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="mt-2 text-[0.9375rem] text-slate-600 dark:text-slate-400">
                                {subtitle}
                            </p>
                        )}
                        <div className="mt-8">{children}</div>
                    </div>
                </div>

                {footer && (
                    <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        {footer}
                    </p>
                )}
            </section>

            {/* ── Benefits column — hidden on mobile; aria-hidden to keep focus on form ── */}
            <aside
                aria-hidden
                className="hidden lg:flex relative overflow-hidden
                           bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500
                           dark:from-indigo-900 dark:via-blue-900 dark:to-sky-900"
            >
                <BackgroundOrnament />
                <div className="relative z-10 flex flex-col justify-center gap-10 p-16 text-white">
                    <h2 className="text-3xl font-bold leading-tight max-w-md">
                        {promise?.heading ?? 'Every PDF tool you need. Nothing you don’t.'}
                    </h2>
                    <ul className="space-y-5 max-w-md">
                        {(promise?.bullets ?? defaultBullets).map((b) => (
                            <li key={b.title} className="flex gap-3">
                                <Check />
                                <div>
                                    <p className="font-semibold">{b.title}</p>
                                    <p className="mt-0.5 text-sm text-white/80">{b.body}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="pt-4 text-xs text-white/70 flex items-center gap-4">
                        <ShieldSmall />
                        <span>Encrypted in transit. Files deleted within minutes of processing.</span>
                    </div>
                </div>
            </aside>
        </main>
    );
}

type Promise = {
    heading: string;
    bullets: { title: string; body: string }[];
};

const defaultBullets: Promise['bullets'] = [
    {
        title: 'Merge, split, compress, convert',
        body: 'Fifty-plus tools covering every PDF task — all run from a single tab.',
    },
    {
        title: 'Private by default',
        body: 'Uploads go to a locked workspace, process in isolation, and are purged within minutes.',
    },
    {
        title: 'Same credits on web and mobile',
        body: 'Buy once in the Android app, use everywhere. Your balance follows you.',
    },
];

function Brand() {
    return (
        <Link
            href="/"
            className="inline-flex items-center gap-2.5 w-fit
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
        >
            <span className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                     fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"
                     strokeLinejoin="round" aria-hidden>
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                    <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                </svg>
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight text-lg">
                PDF Studio
            </span>
        </Link>
    );
}

function Check() {
    return (
        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                 strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-white">
                <path d="M20 6 9 17l-5-5"/>
            </svg>
        </span>
    );
}

function ShieldSmall() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0" aria-hidden>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
    );
}

/** Subtle gradient blobs behind the benefits panel. Decorative; no reader implications. */
function BackgroundOrnament() {
    return (
        <>
            <div
                className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl"
                aria-hidden
            />
            <div
                className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-indigo-300/20 blur-3xl"
                aria-hidden
            />
        </>
    );
}

/** Text input with a label, sized for touch. */
export function Field({
    id, label, type = 'text', value, onChange, autoComplete, required, placeholder, hint,
    trailing,
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
    /** Optional button rendered inside the input (e.g. show/hide password). */
    trailing?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    name={id}
                    type={type}
                    value={value}
                    required={required}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-11 px-3 rounded-md border border-slate-300 dark:border-slate-700
                               dark:bg-slate-900 dark:text-slate-100 text-[0.9375rem] outline-none
                               placeholder:text-slate-400 dark:placeholder:text-slate-500
                               focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15
                               dark:focus:ring-blue-400/20 transition-shadow"
                />
                {trailing && (
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">{trailing}</div>
                )}
            </div>
            {hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
        </div>
    );
}

/** Error and success banners, both announced. */
export function Banner({ kind, children }: { kind: 'error' | 'success'; children: React.ReactNode }) {
    const tone = kind === 'error'
        ? 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200'
        : 'border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-200';
    return (
        <div
            role="alert"
            className={`rounded-md border px-4 py-3 text-sm flex items-start gap-2.5 ${tone}`}
        >
            <span className="mt-0.5 flex-shrink-0" aria-hidden>
                {kind === 'error' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                )}
            </span>
            <span className="min-w-0">{children}</span>
        </div>
    );
}

/** Primary submit button with a pending state. */
export function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full h-11 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                       dark:bg-blue-500 dark:hover:bg-blue-400
                       text-white font-semibold text-sm shadow-sm
                       focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30
                       disabled:opacity-60 disabled:cursor-not-allowed
                       transition-colors inline-flex items-center justify-center gap-2"
        >
            {pending && (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
                    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3"
                          strokeLinecap="round"/>
                </svg>
            )}
            {pending ? 'Please wait…' : children}
        </button>
    );
}

/** Secondary ghost button; same height as SubmitButton so stacks sit flush. */
export function GhostButton({
    onClick, children, type = 'button', disabled,
}: {
    onClick?: () => void;
    children: React.ReactNode;
    type?: 'button' | 'submit';
    disabled?: boolean;
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className="w-full h-11 rounded-md border border-slate-300 dark:border-slate-700
                       bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100
                       hover:bg-slate-50 dark:hover:bg-slate-800
                       focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400/30
                       text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed
                       transition-colors inline-flex items-center justify-center gap-2"
        >
            {children}
        </button>
    );
}

/** A labeled horizontal rule — "or continue with" style — matched to the shell palette. */
export function Divider({ label }: { label: string }) {
    return (
        <div className="relative flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
            <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700"/>
            <span className="uppercase tracking-wider">{label}</span>
            <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700"/>
        </div>
    );
}
