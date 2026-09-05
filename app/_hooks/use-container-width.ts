'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Tracks the rendered width of an element.
 *
 * react-pdf needs an explicit pixel width, and hardcoding one meant the page overflowed
 * every phone — a 520px canvas inside a 360px viewport. Measuring the container lets the
 * page fill the space available and reflow when the window or orientation changes.
 *
 * @param max upper bound, so the page does not become unwieldy on a wide desktop
 */
export function useContainerWidth<T extends HTMLElement>(max = 640) {
    const ref = useRef<T>(null);
    const [width, setWidth] = useState<number | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const measure = () => {
            const available = element.clientWidth;
            if (available > 0) setWidth(Math.min(available, max));
        };
        measure();

        // ResizeObserver catches container changes a window listener misses — a panel
        // opening, an orientation change, the options column widening.
        if (typeof ResizeObserver === 'undefined') {
            window.addEventListener('resize', measure);
            return () => window.removeEventListener('resize', measure);
        }
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, [max]);

    return { ref, width };
}
