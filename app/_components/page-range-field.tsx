'use client';

import * as React from 'react';
import { useState } from 'react';
import { PagePicker } from '@/app/_components/page-picker';

/**
 * Chooses which pages a tool applies to, by clicking thumbnails.
 *
 * Tools that act on a page range asked for it as two numbers, so restricting an operation to
 * "pages 4 to 9" meant opening the document elsewhere and counting. Selection is 1-based on
 * screen; the caller converts to whatever its endpoint expects.
 *
 * Collapsed by default, because applying to the whole document is the common case and should
 * not require a decision.
 */
export function PageRangeField({
    file, selected, onChange, accentRing,
}: {
    file: File;
    /** 0-indexed page numbers; empty means every page. */
    selected: number[];
    onChange: (pages: number[]) => void;
    accentRing?: string;
}) {
    const [open, setOpen] = useState(selected.length > 0);

    const summary = selected.length === 0
        ? 'All pages'
        : selected.length === 1
            ? `Page ${selected[0] + 1}`
            : `Pages ${selected[0] + 1}–${selected[selected.length - 1] + 1}`;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Apply to
                </span>
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    aria-expanded={open}
                >
                    {summary} · {open ? 'done' : 'change'}
                </button>
            </div>

            {open && (
                <div className="space-y-2">
                    <PagePicker
                        file={file}
                        mode="range"
                        selected={selected}
                        onChange={onChange}
                        accentRing={accentRing}
                        hint="Click the first page, then the last. Clear the selection to apply to every page."
                    />
                    {selected.length > 0 && (
                        <button
                            type="button"
                            onClick={() => onChange([])}
                            className="text-xs text-slate-500 dark:text-slate-400 underline hover:text-blue-600"
                        >
                            Apply to all pages instead
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
