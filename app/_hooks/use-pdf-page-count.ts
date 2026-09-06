'use client';

import { useEffect, useState } from 'react';
import { pdfjs } from 'react-pdf';

// Set here as well as in the viewer components: a page may use this hook without rendering
// any of them, and an unset worker makes every load fail silently.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
).toString();

/**
 * How many pages a chosen PDF has, or null while it is unknown.
 *
 * Several tools need the page count only to tell the user what their settings will do —
 * how many files a split produces, which pages a range covers. Loading the document just
 * for that was repeated ad-hoc, so it lives here and reads the count without rendering
 * anything.
 */
export function usePdfPageCount(file: File | null | undefined): number | null {
    const [pageCount, setPageCount] = useState<number | null>(null);

    useEffect(() => {
        if (!file) {
            setPageCount(null);
            return;
        }

        let cancelled = false;
        let task: { destroy: () => void } | null = null;

        (async () => {
            try {
                const buffer = await file.arrayBuffer();
                if (cancelled) return;
                const loading = pdfjs.getDocument({ data: buffer });
                task = loading;
                const document = await loading.promise;
                if (!cancelled) setPageCount(document.numPages);
                document.destroy();
            } catch {
                if (!cancelled) setPageCount(null); // encrypted or unreadable; callers hide the hint
            }
        })();

        return () => {
            cancelled = true;
            task?.destroy();
        };
    }, [file]);

    return pageCount;
}
