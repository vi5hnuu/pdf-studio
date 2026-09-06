'use client';

import * as React from 'react';
import { useState } from 'react';
import { useContainerWidth } from '@/app/_hooks/use-container-width';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
).toString();

interface Props {
    file: File;
    /** Selected pages, 0-indexed. */
    selected: number[];
    onChange: (pages: number[]) => void;
    /**
     * `multi` toggles individual pages; `range` selects everything between two clicks;
     * `single` keeps one page selected at a time.
     */
    mode?: 'multi' | 'range' | 'single';
    hint?: string;
    /** Tailwind ring colour for a selected page. */
    accentRing?: string;
}

/**
 * Picks pages by clicking thumbnails.
 *
 * Tools that operate on specific pages asked for them as typed numbers — and several
 * counted from zero, which no reader does — so choosing a page meant opening the document
 * elsewhere, counting, and hoping the tool agreed about where counting starts. Page
 * numbers are shown from 1 here and converted at the boundary.
 */
export function PagePicker({
    file, selected, onChange, mode = 'multi', hint,
    accentRing = 'ring-blue-500 border-blue-500',
}: Props) {
    const [totalPages, setTotalPages] = useState(0);
    // Thumbnails are laid out 3-up on the narrowest screens, so each gets a third of the
    // container rather than a fixed width that overflows it.
    const { ref: sizerRef, width: containerWidth } = useContainerWidth<HTMLDivElement>(900);
    const thumbWidth = containerWidth ? Math.max(72, Math.floor(containerWidth / 3) - 16) : 96;
    const [rangeAnchor, setRangeAnchor] = useState<number | null>(null);

    function toggle(index: number) {
        if (mode === 'single') {
            onChange([index]);
            return;
        }
        if (mode === 'range') {
            if (rangeAnchor === null || selected.length !== 1) {
                setRangeAnchor(index);
                onChange([index]);
                return;
            }
            const [from, to] = [Math.min(rangeAnchor, index), Math.max(rangeAnchor, index)];
            onChange(Array.from({ length: to - from + 1 }, (_, i) => from + i));
            setRangeAnchor(null);
            return;
        }
        onChange(selected.includes(index)
            ? selected.filter((p) => p !== index)
            : [...selected, index].sort((a, b) => a - b));
    }

    const allSelected = totalPages > 0 && selected.length === totalPages;

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {hint ?? (mode === 'range'
                        ? 'Click the first page, then the last, to select a range.'
                        : mode === 'single'
                            ? 'Click a page to select it.'
                            : 'Click pages to select them.')}
                </p>
                {mode === 'multi' && totalPages > 0 && (
                    <button
                        type="button"
                        onClick={() => onChange(allSelected
                            ? []
                            : Array.from({ length: totalPages }, (_, i) => i))}
                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {allSelected ? 'Clear selection' : 'Select all pages'}
                    </button>
                )}
            </div>

            <div ref={sizerRef} className="w-full" />
            <Document
                file={file}
                onLoadSuccess={(doc) => setTotalPages(doc.numPages)}
                loading={<div className="h-40 animate-pulse rounded-sm bg-slate-100 dark:bg-slate-800" />}
                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 hide-text-layer hide-annotation-layer"
            >
                {Array.from({ length: totalPages }, (_, index) => {
                    const isSelected = selected.includes(index);
                    return (
                        <button
                            type="button"
                            key={index}
                            onClick={() => toggle(index)}
                            aria-pressed={isSelected}
                            aria-label={`Page ${index + 1}${isSelected ? ', selected' : ''}`}
                            className={`relative rounded-sm overflow-hidden border bg-white dark:bg-slate-800
                                        transition-all ${isSelected
                                            ? `ring-2 ${accentRing}`
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'}`}
                        >
                            <Page
                                pageNumber={index + 1}
                                width={thumbWidth}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                            />
                            <span className={`absolute top-1 left-1 min-w-5 h-5 px-1 rounded-sm text-[11px]
                                              font-semibold flex items-center justify-center ${isSelected
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-800/70 text-white'}`}>
                                {index + 1}
                            </span>
                            {isSelected && (
                                <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-blue-600
                                                 text-white flex items-center justify-center">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    );
                })}
            </Document>

            {selected.length > 0 && (
                <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                    {selected.length} page{selected.length === 1 ? '' : 's'} selected
                    {selected.length <= 12 && `: ${selected.map((p) => p + 1).join(', ')}`}
                </p>
            )}
        </div>
    );
}
