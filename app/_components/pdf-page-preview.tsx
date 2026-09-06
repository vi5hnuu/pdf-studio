'use client';

import * as React from 'react';
import { useState } from 'react';
import { useContainerWidth } from '@/app/_hooks/use-container-width';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
).toString();

/**
 * Shows the first page with a tool's transform applied, so a geometry setting can be judged
 * by eye.
 *
 * Mirroring, scaling and resizing all changed the page in ways that were described only by a
 * dropdown or a number: you had to run the tool and open the download to find out what
 * "0.5" or "Legal" did to the document.
 */
export function PdfPagePreview({
    file, transform, overlay, caption, frameAspect,
}: {
    file: File;
    /** CSS transform applied to the rendered page, e.g. `scaleX(-1)`. */
    transform?: string;
    /**
     * Drawn on top of the page — a watermark, a header, a guide. Given the rendered page
     * width so an overlay can scale point sizes to match what it is drawn over; the page
     * width varies with the container.
     */
    overlay?: React.ReactNode | ((renderedWidth: number) => React.ReactNode);
    caption?: string;
    /**
     * Width/height ratio of the frame the page is shown inside. Used when the tool changes
     * the page shape, so the new proportions are visible against the old.
     */
    frameAspect?: number;
}) {
    const [ready, setReady] = useState(false);
    const { ref: sizerRef, width } = useContainerWidth<HTMLDivElement>(320);

    return (
        <div className="space-y-2">
            <div ref={sizerRef} className="flex justify-center rounded-sm border border-slate-200
                            dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4">
                <div
                    className="relative inline-block overflow-hidden bg-white shadow-sm"
                    style={frameAspect ? { aspectRatio: String(frameAspect) } : undefined}
                >
                    <Document
                        file={file}
                        onLoadSuccess={() => setReady(true)}
                        loading={<div className="h-72 w-52 animate-pulse bg-slate-100 dark:bg-slate-800" />}
                        className="hide-text-layer hide-annotation-layer"
                    >
                        <div style={{ transform, transformOrigin: 'center center' }}>
                            <Page
                                pageNumber={1}
                                width={width ? Math.max(160, width - 32) : 240}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                            />
                        </div>
                    </Document>
                    {ready && (typeof overlay === 'function'
                        ? overlay(width ? Math.max(160, width - 32) : 240)
                        : overlay)}
                </div>
            </div>
            {caption && (
                <p className="text-xs text-center text-slate-400 dark:text-slate-500">{caption}</p>
            )}
        </div>
    );
}
