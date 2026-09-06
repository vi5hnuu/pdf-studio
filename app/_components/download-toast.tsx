'use client';

import { useEffect, useState } from 'react';
import { DOWNLOAD_EVENT } from '@/app/_utils/download';

/**
 * Confirms that a file was saved.
 *
 * Tools end by triggering a browser download, which happens silently — the page does not
 * change, and on mobile there is often no visible indication at all, so it was genuinely
 * unclear whether the tool had worked. Listening for the download event covers every tool
 * from one place rather than adding a success state to each.
 */
export function DownloadToast() {
    const [filename, setFilename] = useState<string | null>(null);

    useEffect(() => {
        const onDownload = (event: Event) => {
            const name = (event as CustomEvent<{ filename: string }>).detail?.filename;
            setFilename(name ?? 'your file');
        };
        window.addEventListener(DOWNLOAD_EVENT, onDownload);
        return () => window.removeEventListener(DOWNLOAD_EVENT, onDownload);
    }, []);

    useEffect(() => {
        if (!filename) return;
        const timer = setTimeout(() => setFilename(null), 10000);
        return () => clearTimeout(timer);
    }, [filename]);

    if (!filename) return null;

    // Reloading the tool's own path is the reliable way to start clean: it clears the file
    // input, the settings and the step from the URL, none of which this component can reach
    // from the root layout. Only offered on a tool page, where "another file" makes sense.
    const onToolPage = typeof window !== 'undefined'
        && window.location.pathname.startsWith('/tool/');

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3
                       rounded-sm bg-slate-900 dark:bg-slate-100 px-4 py-3 shadow-lg
                       text-white dark:text-slate-900 max-w-[90vw]"
        >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </span>
            <div className="min-w-0">
                <p className="text-sm font-semibold">Saved to your downloads</p>
                <p className="text-xs opacity-70 truncate">{filename}</p>
            </div>
            {onToolPage && (
                <button
                    onClick={() => { window.location.href = window.location.pathname; }}
                    className="ml-1 flex-shrink-0 rounded-sm border border-white/30 dark:border-slate-900/30
                               px-2.5 py-1 text-xs font-medium hover:bg-white/10 dark:hover:bg-slate-900/10"
                >
                    Another file
                </button>
            )}
            <button
                onClick={() => setFilename(null)}
                aria-label="Dismiss"
                className="ml-1 flex-shrink-0 opacity-60 hover:opacity-100 text-lg leading-none"
            >
                ×
            </button>
        </div>
    );
}
