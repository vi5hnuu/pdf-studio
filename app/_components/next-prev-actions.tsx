import * as React from "react";

export function NextPrevActions({
    className,
    onPrev,
    onNext,
    prevDisabled,
    nextDisabled,
}: {
    onPrev: () => void;
    onNext: () => void;
    prevDisabled: boolean;
    nextDisabled: boolean;
    className?: string;
}) {
    return (
        <div className={`flex items-center gap-2 flex-shrink-0 ${className ?? ''}`}>
            <button
                onClick={onPrev}
                disabled={prevDisabled}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                </svg>
                <span className="hidden sm:inline">Back</span>
            </button>
            <button
                onClick={onNext}
                disabled={nextDisabled}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
                <span className="hidden sm:inline">Next</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                </svg>
            </button>
        </div>
    );
}
