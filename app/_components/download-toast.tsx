'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DOWNLOAD_EVENT } from '@/app/_utils/download';
import { TOOL_GROUPS } from '@/app/_utils/tool-groups';
import { toolsInfo } from '@/app/_utils/constants';

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
    /** Whether the tool menu is open, for continuing straight into another tool. */
    const [choosing, setChoosing] = useState(false);

    useEffect(() => {
        const onDownload = (event: Event) => {
            const name = (event as CustomEvent<{ filename: string }>).detail?.filename;
            setFilename(name ?? 'your file');
            setChoosing(false);
        };
        window.addEventListener(DOWNLOAD_EVENT, onDownload);
        return () => window.removeEventListener(DOWNLOAD_EVENT, onDownload);
    }, []);

    useEffect(() => {
        if (!filename) return;
        // Held open while the tool list is showing — dismissing it mid-choice would be
        // infuriating, and the user is plainly still engaged.
        if (choosing) return;
        const timer = setTimeout(() => setFilename(null), 10000);
        return () => clearTimeout(timer);
    }, [filename, choosing]);

    if (!filename) return null;

    // Reloading the tool's own path is the reliable way to start clean: it clears the file
    // input, the settings and the step from the URL, none of which this component can reach
    // from the root layout. Only offered on a tool page, where "another file" makes sense.
    const currentPath = typeof window === 'undefined' ? '' : window.location.pathname;
    const onToolPage = currentPath.startsWith('/tool/');

    return (
        <>
        {choosing && (
            // The result is already held in memory, so the chosen tool finds it waiting in its
            // own file picker — no trip through the downloads folder.
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-h-[50vh] w-[min(90vw,32rem)]
                            overflow-y-auto rounded-sm border border-slate-200 dark:border-slate-700
                            bg-white dark:bg-slate-800 p-3 shadow-xl">
                <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide
                              text-slate-400 dark:text-slate-500">
                    Continue with
                </p>
                {TOOL_GROUPS.map((group) => (
                    <div key={group.id} className="mb-2 last:mb-0">
                        <p className="px-1 pb-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                            {group.label}
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {group.tools.map((tool) => {
                                const info = toolsInfo[tool];
                                if (!info || info.path === currentPath) return null;
                                return (
                                    <Link key={info.path} href={info.path}
                                          onClick={() => { setChoosing(false); setFilename(null); }}
                                          className="rounded-sm border border-slate-200 dark:border-slate-700
                                                     px-2 py-1 text-xs text-slate-600 dark:text-slate-300
                                                     hover:border-blue-400 hover:text-slate-900
                                                     dark:hover:text-slate-100 transition-colors">
                                        {info.title}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        )}
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
                    onClick={() => setChoosing((open) => !open)}
                    aria-expanded={choosing}
                    className="ml-1 flex-shrink-0 rounded-sm border border-white/30 dark:border-slate-900/30
                               px-2.5 py-1 text-xs font-medium hover:bg-white/10 dark:hover:bg-slate-900/10"
                >
                    Use in another tool
                </button>
            )}
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
        </>
    );
}
