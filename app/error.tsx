'use client';

import { useEffect } from 'react';

/**
 * Route-level error boundary. Without it, a render error showed Next's default screen with
 * no way back and no reset.
 */
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Unhandled error:', error);
    }, [error]);

    return (
        <main className="min-h-dvh flex flex-col items-center justify-center gap-5 px-6 text-center
                         bg-slate-50 dark:bg-slate-900">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Something went wrong
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                This page failed to load. Your files were not uploaded anywhere.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={reset}
                    className="rounded-sm bg-blue-600 px-5 py-2.5 text-sm font-medium text-white
                               hover:bg-blue-700 transition-colors"
                >
                    Try again
                </button>
                <a
                    href="/"
                    className="rounded-sm border border-slate-200 dark:border-slate-700 px-5 py-2.5
                               text-sm font-medium text-slate-700 dark:text-slate-200
                               hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    All tools
                </a>
            </div>
        </main>
    );
}
