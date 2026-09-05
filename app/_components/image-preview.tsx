'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

/**
 * Live preview of what an image tool will produce.
 *
 * The image tools asked for a border width and RGB channels, a filter intensity, target
 * dimensions — numbers whose effect you could only see by running the tool and opening the
 * download. The canvas here applies the same operation the server will, so the settings can
 * be judged by eye before spending a credit.
 */
export function ImagePreview({
    file, draw, caption, approximate = false,
}: {
    file: File;
    /** Applies the operation. Called whenever the settings change. */
    draw: (canvas: HTMLCanvasElement, image: HTMLImageElement) => void;
    /** Shown under the preview, e.g. the resulting dimensions. */
    caption?: string;
    /** Set when the preview cannot match the output exactly, so the label says so. */
    approximate?: boolean;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [failed, setFailed] = useState(false);

    // Decode once per file; redrawing on every settings change reuses the decoded bitmap.
    useEffect(() => {
        const url = URL.createObjectURL(file);
        const img = new Image();

        // Revoking the URL while the decode is still running aborts it, and the abort arrives
        // as an error. Without detaching the handlers first, that superseded load reported
        // failure for the image that replaced it — so every image tool announced "this image
        // can't be previewed" for perfectly ordinary JPEGs and PNGs.
        img.onload = () => {
            URL.revokeObjectURL(url);
            setImage(img);
            setFailed(false);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            setImage(null);
            setFailed(true);
        };
        img.src = url;

        return () => {
            img.onload = null;
            img.onerror = null;
            URL.revokeObjectURL(url);
        };
    }, [file]);

    useEffect(() => {
        if (!image || !canvasRef.current) return;
        draw(canvasRef.current, image);
    }, [image, draw]);

    if (failed) {
        return (
            <p className="text-sm text-center text-slate-400 dark:text-slate-500">
                This image can&apos;t be previewed in the browser, but the tool will still process it.
            </p>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-center rounded-xl border border-slate-200
                            dark:border-slate-700 bg-[repeating-conic-gradient(#f1f5f9_0_25%,transparent_0_50%)]
                            dark:bg-[repeating-conic-gradient(#1e293b_0_25%,transparent_0_50%)]
                            bg-slate-50 dark:bg-slate-900 bg-[length:16px_16px] p-3 overflow-auto">
                {image ? (
                    <canvas
                        ref={canvasRef}
                        // Fit the preview box without changing the canvas's real pixel size,
                        // so the drawn result stays true to the output. The cap is tied to the
                        // viewport as well as an absolute size: a fixed 22rem filled a laptop
                        // screen entirely, pushing the very settings the preview exists to help
                        // you judge below the fold.
                        className="max-w-full max-h-[min(22rem,38vh)] h-auto w-auto object-contain shadow-sm"
                    />
                ) : (
                    <div className="h-32 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                )}
            </div>
            {(caption || approximate) && (
                <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                    {caption}
                    {caption && approximate ? ' · ' : ''}
                    {approximate && 'Preview is approximate'}
                </p>
            )}
        </div>
    );
}
