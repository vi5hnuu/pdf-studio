'use client';

import { pdfjs, Document, Page } from 'react-pdf';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { DocumentCallback } from '@/node_modules/react-pdf/dist/cjs/shared/types';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { SortableGrid } from '@/app/_components/sortable-grid';
import { swapItem } from '@/app/_utils/constants';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
).toString();

export interface PdfViewInfo {
    className?: string;
    style?: React.CSSProperties;
    file: File;
    showAllPages?: 'grid' | 'spread-horizontal' | 'spread-vertical' | 'range';
    pageClassName?: string;
    pageContainerClassName?: string;
    pageClass?: { [key: number]: string };
    allowReordering?: boolean;
    onOrderUpdate?: (order: number[]) => void;
    pageRotations?: Map<number, number>;
    rotation?: number;
}

/**
 * How much a box must shrink for its rotated self to still fit inside its own layout box.
 *
 * A CSS rotation does not change an element's layout size, so a portrait page turned 90°
 * becomes wider than the column holding it and is simply clipped — the preview showed a
 * cropped page and lost its page-number badge. Scaling by the ratio between the rotated
 * bounding box and the original keeps the whole page visible at any angle.
 */
function fitScale(angleDeg: number, width: number, height: number): number {
    if (!width || !height || !angleDeg) return 1;
    const radians = (angleDeg * Math.PI) / 180;
    const cos = Math.abs(Math.cos(radians));
    const sin = Math.abs(Math.sin(radians));
    const rotatedWidth = width * cos + height * sin;
    const rotatedHeight = width * sin + height * cos;
    return Math.min(width / rotatedWidth, height / rotatedHeight, 1);
}

/** Rotates its children about the centre, shrinking them so nothing is cut off. */
function RotatedPage({ angle, children }: { angle: number; children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        // offsetWidth/Height are layout values, unaffected by the transform being applied,
        // so measuring here cannot feed back into itself.
        const measure = () => setScale(fitScale(angle, element.offsetWidth, element.offsetHeight));
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, [angle]);

    return (
        <div ref={ref} className="w-full h-full">
            <div
                className="w-full h-full transition-transform"
                style={{ transform: `rotateZ(-${angle}deg) scale(${scale})`, transformOrigin: 'center center' }}
            >
                {children}
            </div>
        </div>
    );
}

export function PdfView(props: PdfViewInfo) {
    const [totalPages, setTotalPages] = useState<number | null>(null);
    const [activePage, setActivePage] = useState<number>(1);
    const [pagesOrder, setPagesOrder] = useState<number[]>([0]);
    const [jumpReorder, setJumpReorder] = useState<boolean>(true);

    useEffect(() => {
        props.onOrderUpdate && props.onOrderUpdate(pagesOrder);
    }, [pagesOrder]);

    useEffect(() => {
        setPagesOrder(Array.from({ length: totalPages ?? 1 }).map((_, i) => i));
    }, [totalPages]);

    function onShowNextPage() {
        if (totalPages === null) return;
        setActivePage(p => Math.min(p + 1, totalPages));
    }

    function onShowPrevPage() {
        setActivePage(p => Math.max(p - 1, 1));
    }

    function onDocumentLoad(doc: DocumentCallback) {
        setTotalPages(doc.numPages);
    }

    function onReorder(from: number, to: number) {
        setPagesOrder(order => {
            const next = [...order];
            if (jumpReorder) {
                swapItem(next, from, to);
                return next;
            }
            for (let i = from; i < to; i++) swapItem(next, i, i + 1);
            for (let i = from; i > to; i--) swapItem(next, i, i - 1);
            return next;
        });
    }

    /* ── standard (non-reorder) viewer ──────────────────────────────── */
    // Page controls for the single-page viewer, rendered against the page itself.
    const pager = (
        <div className="absolute flex flex-nowrap items-center gap-0.5 bottom-1 left-1/2
        -translate-x-1/2 max-w-[calc(100%-0.5rem)] whitespace-nowrap
        bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200
        dark:border-slate-600 backdrop-blur-sm rounded-sm px-1 py-0.5 shadow-sm">
        <button
        disabled={totalPages == null || activePage === 1}
        onClick={onShowPrevPage}
        className="p-0.5 flex-shrink-0 rounded-sm disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
        aria-label="Previous page"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span className="text-[11px] leading-none text-slate-500 dark:text-slate-300 font-medium self-center px-0.5 tabular-nums whitespace-nowrap">
        {activePage} / {totalPages ?? '…'}
        </span>
        <button
        disabled={totalPages == null || activePage >= totalPages}
        onClick={onShowNextPage}
        className="p-0.5 flex-shrink-0 rounded-sm disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
        aria-label="Next page"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        </div>
    );

    if (!props.allowReordering) {
        return (
            <div className={`w-full h-full overflow-auto ${props.className ?? ''}`} style={props.style}>
                <div className="relative w-full h-full overflow-auto">
                    <Document
                        className={[
                            'w-full h-auto pdf-cover-parent hide-text-layer hide-annotation-layer',
                            props.showAllPages === 'grid' ? 'overflow-visible grid grid-cols-4 gap-6' :
                            props.showAllPages === 'spread-horizontal' ? 'flex gap-6 p-4 overflow-x-scroll' :
                            props.showAllPages === 'spread-vertical' ? 'flex p-4 flex-col gap-12 overflow-y-scroll' : '',
                        ].join(' ')}
                        file={props.file}
                        onLoadSuccess={onDocumentLoad}
                    >
                        {!props.showAllPages && (
                            <span className="relative inline-block align-top">
                                <Page className={props.pageClassName} pageNumber={activePage} />
                                {pager}
                            </span>
                        )}
                        {props.showAllPages && pagesOrder.map((pageNo, i) => (
                            <div
                                key={i}
                                style={{ marginBottom: i < pagesOrder.length - 1 ? '1.5rem' : '0' }}
                                className={`relative w-full h-auto group ${props.pageContainerClassName ?? ''}`}
                            >
                                <div className="absolute flex items-center justify-center right-1/2 translate-x-1/2 -translate-y-1/2 rounded-full top-0 p-2 size-8 text-sm bg-slate-200 dark:bg-slate-700 group-hover:bg-blue-300 dark:group-hover:bg-blue-800 transition-all text-slate-700 dark:text-slate-200 z-10">
                                    {pageNo + 1}
                                </div>
                                {props.showAllPages !== 'grid' && (
                                    <div className={`absolute group-last-of-type:hidden ${
                                        props.showAllPages === 'spread-horizontal'
                                            ? '-right-2 bottom-1/2 translate-x-1/2 translate-y-1/2'
                                            : 'right-1/2 translate-x-1/2 -bottom-6'
                                    } p-2 size-8 text-xl md:text-3xl z-10`}>
                                        {props.showAllPages === 'spread-horizontal' ? (
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M8 5v14l11-7z"/></svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M7 10l5 5 5-5z"/></svg>
                                        )}
                                    </div>
                                )}
                                <RotatedPage angle={props.pageRotations?.get(pageNo) ?? props.rotation ?? 0}>
                                    <Page
                                        className={[
                                            props.showAllPages ? '!bg-slate-100 group-hover:!bg-blue-100 transition-all p-2 rounded-sm' : '',
                                            props.showAllPages === 'spread-horizontal' ? '!w-24 md:!w-52 aspect-[1/1.41]' : '',
                                            props.pageClassName ?? '',
                                            (props.pageClass && props.pageClass[pageNo]) ?? '',
                                        ].join(' ')}
                                        pageNumber={pageNo + 1}
                                    />
                                </RotatedPage>
                            </div>
                        ))}
                    </Document>

                </div>
            </div>
        );
    }

    /* ── reorder mode ────────────────────────────────────────────────── */
    return (
        <div className={`w-full ${props.className ?? ''}`} style={props.style}>
            {/* Jump / Slide toggle */}
            <div className="flex items-center justify-end gap-3 mb-4">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">Swap mode</span>
                <div className="flex rounded-sm border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
                    {(['Jump', 'Slide'] as const).map((mode) => {
                        const active = mode === 'Jump' ? jumpReorder : !jumpReorder;
                        return (
                            <button
                                key={mode}
                                onClick={() => setJumpReorder(mode === 'Jump')}
                                className={`px-3 py-1.5 font-medium transition-colors ${
                                    active ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                {mode}
                            </button>
                        );
                    })}
                </div>
            </div>

            <Document
                className="pdf-cover-parent hide-text-layer hide-annotation-layer"
                file={props.file}
                onLoadSuccess={onDocumentLoad}
            >
                <SortableGrid
                    onReorder={onReorder}
                    getLabel={(i) => `Page ${pagesOrder[i] + 1}`}
                    hint="Drag pages to reorder"
                    columns={4}
                >
                    {pagesOrder.map((pageNo, i) => (
                        <div key={i} className="w-full aspect-[1/1.41] overflow-hidden">
                            <RotatedPage angle={props.pageRotations?.get(pageNo) ?? props.rotation ?? 0}>
                                <Page
                                    className="!w-full !h-full !bg-white"
                                    pageNumber={pageNo + 1}
                                />
                            </RotatedPage>
                        </div>
                    ))}
                </SortableGrid>
            </Document>
        </div>
    );
}
