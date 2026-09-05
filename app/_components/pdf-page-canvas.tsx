'use client';

import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useContainerWidth } from '@/app/_hooks/use-container-width';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
).toString();

/**
 * A rectangle on a page, in normalised top-left coordinates (0–1 of the page).
 *
 * Normalised so the value is independent of the zoom the page happens to be rendered at,
 * and so each tool can convert to whatever its endpoint expects — points for redaction,
 * fractions for image placement — without the canvas knowing about either.
 */
export interface Box {
    id: string;
    page: number; // 0-indexed
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface PageMetrics {
    /** Page size in PDF points, needed by endpoints that work in points. */
    pointWidth: number;
    pointHeight: number;
    totalPages: number;
}

interface Props {
    file: File;
    boxes: Box[];
    onChange: (boxes: Box[]) => void;
    onMetrics?: (metrics: PageMetrics) => void;
    /** One box only — drawing a new one replaces the existing (image placement, cropping). */
    single?: boolean;
    /** Tailwind colour classes for the drawn rectangles. */
    boxClassName?: string;
    /** Rendered inside each box, e.g. a preview of the image being placed. */
    renderBoxContent?: (box: Box) => React.ReactNode;
    /** Disables drawing new boxes; existing ones can still be moved and resized. */
    drawDisabled?: boolean;
    hint?: string;
}

type Drag =
    /** `restore` is the box as it was before the draw, put back if the drag is too small to count. */
    | { kind: 'draw'; startX: number; startY: number; id: string; restore: Box[] }
    | { kind: 'move'; id: string; offsetX: number; offsetY: number }
    | { kind: 'resize'; id: string; anchorX: number; anchorY: number };

const MIN_SIZE = 0.01; // 1% of the page — below this a box is an accidental click

/**
 * Renders a PDF page and lets the user draw, move and resize rectangles directly on it.
 *
 * Tools that need a position on a page previously asked for it as numbers — redaction took
 * raw x/y/width/height in PDF points with no preview at all, which is not something anyone
 * can supply accurately. The mobile app already lets you draw these regions on the page;
 * this brings the web to the same standard, and is shared so every such tool behaves the
 * same way.
 */
export function PdfPageCanvas({
    file, boxes, onChange, onMetrics, single = false,
    boxClassName = 'bg-slate-900/70 border-slate-900',
    renderBoxContent, drawDisabled = false, hint,
}: Props) {
    const [pageIndex, setPageIndex] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [drag, setDrag] = useState<Drag | null>(null);
    const surfaceRef = useRef<HTMLDivElement>(null);
    // react-pdf needs a pixel width; a fixed one overflowed every phone.
    const { ref: sizerRef, width: pageWidth } = useContainerWidth<HTMLDivElement>(560);
    const metricsRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

    const pageBoxes = boxes.filter((b) => b.page === pageIndex);

    /** Pointer position as a 0–1 fraction of the rendered page. */
    const toFraction = useCallback((event: React.PointerEvent | PointerEvent) => {
        const rect = surfaceRef.current?.getBoundingClientRect();
        if (!rect || rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };
        return {
            x: clamp((event.clientX - rect.left) / rect.width),
            y: clamp((event.clientY - rect.top) / rect.height),
        };
    }, []);

    // Listening on the window rather than the element means a drag that leaves the page
    // still tracks, and always ends — otherwise releasing outside leaves a box stuck.
    useEffect(() => {
        if (!drag) return;

        const onMove = (event: PointerEvent) => {
            const point = toFraction(event);
            onChange(boxes.map((box) => {
                if (box.id !== drag.id) return box;
                if (drag.kind === 'draw' || drag.kind === 'resize') {
                    const ax = drag.kind === 'draw' ? drag.startX : drag.anchorX;
                    const ay = drag.kind === 'draw' ? drag.startY : drag.anchorY;
                    return {
                        ...box,
                        x: Math.min(ax, point.x),
                        y: Math.min(ay, point.y),
                        width: Math.abs(point.x - ax),
                        height: Math.abs(point.y - ay),
                    };
                }
                return {
                    ...box,
                    x: clamp(point.x - drag.offsetX, 0, 1 - box.width),
                    y: clamp(point.y - drag.offsetY, 0, 1 - box.height),
                };
            }));
        };

        const onUp = () => {
            const kept = boxes.filter((box) => box.width >= MIN_SIZE && box.height >= MIN_SIZE);
            // A draw too small to be intentional is a stray click. Dropping it outright is right
            // when boxes accumulate, but a single-box tool would be left with nothing — and its
            // parent, holding the last value it was sent, would keep the degenerate 0x0 area.
            // Cropping showed this as "Keeping 0% x 0%", which would erase the page.
            if (drag.kind === 'draw' && kept.length !== boxes.length && single) {
                onChange(drag.restore);
            } else {
                onChange(kept);
            }
            setDrag(null);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
        };
    }, [drag, boxes, onChange, toFraction]);

    function startDraw(event: React.PointerEvent) {
        if (drawDisabled || event.button !== 0) return;
        const point = toFraction(event);
        // Single-box tools are controlled components that re-key the box from their own state
        // every render (crop's "crop", placement's "placement"). Minting a fresh id here would
        // leave the in-flight drag pointing at an id the next render no longer contains, and
        // the box would stop following the pointer. Redefining the one box keeps its identity.
        const id = (single && boxes[0]?.id)
            || `B_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const fresh: Box = { id, page: pageIndex, x: point.x, y: point.y, width: 0, height: 0 };
        onChange(single ? [fresh] : [...boxes, fresh]);
        setSelectedId(id);
        setDrag({ kind: 'draw', startX: point.x, startY: point.y, id, restore: boxes });
    }

    function startMove(event: React.PointerEvent, box: Box) {
        // A box with no slack on either axis fills the page and cannot be moved anywhere, so a
        // press on it can only mean "draw a smaller one". Claiming the gesture as a move would
        // clamp to a no-op and make the page appear dead — which is exactly what happened to
        // cropping, whose keep-area starts as the whole page.
        if (box.width >= 1 && box.height >= 1) return; // bubbles to startDraw on the surface

        event.stopPropagation();
        const point = toFraction(event);
        setSelectedId(box.id);
        setDrag({ kind: 'move', id: box.id, offsetX: point.x - box.x, offsetY: point.y - box.y });
    }

    function startResize(event: React.PointerEvent, box: Box) {
        event.stopPropagation();
        setSelectedId(box.id);
        // Anchor at the opposite corner so dragging the handle resizes rather than moves.
        setDrag({ kind: 'resize', id: box.id, anchorX: box.x, anchorY: box.y });
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {hint ?? (single
                        ? 'Drag on the page to position the area. Drag inside it to move, or the corner to resize.'
                        : 'Drag on the page to draw an area. Drag inside one to move it, or its corner to resize.')}
                </p>
                {totalPages > 1 && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                            disabled={pageIndex === 0}
                            aria-label="Previous page"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700
                                       disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400 px-1">
                            {pageIndex + 1} / {totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={pageIndex >= totalPages - 1}
                            aria-label="Next page"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700
                                       disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            <div ref={sizerRef} className="flex justify-center w-full">
                <Document
                    file={file}
                    onLoadSuccess={(doc) => setTotalPages(doc.numPages)}
                    loading={<div className="h-96 w-72 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />}
                    className="hide-text-layer hide-annotation-layer"
                >
                    <div
                        ref={surfaceRef}
                        onPointerDown={startDraw}
                        className={`relative inline-block select-none shadow-md rounded-lg overflow-hidden
                                    ${drawDisabled ? '' : 'cursor-crosshair'} touch-none`}
                    >
                        <Page
                            pageNumber={pageIndex + 1}
                            width={pageWidth ?? 320}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            onLoadSuccess={(page) => {
                                // originalWidth/Height are PDF points, which the redaction
                                // endpoint works in.
                                const next = { w: page.originalWidth, h: page.originalHeight };
                                if (next.w !== metricsRef.current.w || next.h !== metricsRef.current.h) {
                                    metricsRef.current = next;
                                    onMetrics?.({ pointWidth: next.w, pointHeight: next.h, totalPages });
                                }
                            }}
                        />

                        {pageBoxes.map((box) => (
                            <div
                                key={box.id}
                                onPointerDown={(event) => startMove(event, box)}
                                className={`absolute border-2 ${boxClassName}
                                            ${selectedId === box.id ? 'ring-2 ring-blue-400' : ''}
                                            ${box.width >= 1 && box.height >= 1 ? 'cursor-crosshair' : 'cursor-move'}`}
                                style={{
                                    left: `${box.x * 100}%`,
                                    top: `${box.y * 100}%`,
                                    width: `${box.width * 100}%`,
                                    height: `${box.height * 100}%`,
                                }}
                            >
                                {renderBoxContent?.(box)}
                                <span
                                    onPointerDown={(event) => startResize(event, box)}
                                    className="absolute -right-1.5 -bottom-1.5 w-3.5 h-3.5 rounded-full
                                               bg-white border-2 border-blue-500 cursor-nwse-resize"
                                    aria-label="Resize"
                                />
                                {!single && (
                                    <button
                                        type="button"
                                        onPointerDown={(event) => event.stopPropagation()}
                                        onClick={() => onChange(boxes.filter((b) => b.id !== box.id))}
                                        aria-label="Remove area"
                                        className="absolute -right-2 -top-2 w-5 h-5 rounded-full bg-white
                                                   border border-slate-300 text-slate-600 text-xs leading-none
                                                   shadow-sm hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </Document>
            </div>

            {!single && pageBoxes.length > 0 && (
                <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                    {pageBoxes.length} area{pageBoxes.length === 1 ? '' : 's'} on this page
                    {boxes.length !== pageBoxes.length && ` · ${boxes.length} in total`}
                </p>
            )}
        </div>
    );
}

function clamp(value: number, min = 0, max = 1) {
    return Math.min(Math.max(value, min), max);
}
