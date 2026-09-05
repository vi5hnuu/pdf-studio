'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * The tool's current step, mirrored into the URL so the browser's Back works.
 *
 * Step state lived only in component state, so Back — the primary navigation gesture on a
 * phone — left the tool entirely instead of returning to the previous step, losing the file
 * and the settings. Each step advance pushes a history entry, so Back walks the steps and
 * only leaves the tool from the first one.
 *
 * The URL is written with `history.pushState` rather than the router, because a router
 * navigation would remount the page and discard the very state we are trying to preserve.
 */
export function useToolStep(totalSteps: number): [number, (next: number | ((n: number) => number)) => void] {
    const [step, setStepState] = useState(0);

    // Follow the browser's own back/forward.
    useEffect(() => {
        const onPopState = (event: PopStateEvent) => {
            const fromHistory = (event.state as { toolStep?: number } | null)?.toolStep;
            setStepState(clamp(fromHistory ?? 0, totalSteps));
        };
        window.addEventListener('popstate', onPopState);

        // Label the entry the user arrived on, so returning to it restores step 0 rather
        // than a null state.
        if (typeof window !== 'undefined' && (window.history.state as any)?.toolStep === undefined) {
            window.history.replaceState({ ...window.history.state, toolStep: 0 }, '');
        }
        return () => window.removeEventListener('popstate', onPopState);
    }, [totalSteps]);

    const setStep = useCallback((next: number | ((n: number) => number)) => {
        setStepState((current) => {
            const target = clamp(typeof next === 'function' ? next(current) : next, totalSteps);
            if (target === current) return current;

            const url = target === 0 ? window.location.pathname : `${window.location.pathname}?step=${target}`;
            if (target > current) {
                window.history.pushState({ ...window.history.state, toolStep: target }, '', url);
            } else {
                // Going back through the app's own control should not stack another entry.
                window.history.replaceState({ ...window.history.state, toolStep: target }, '', url);
            }
            return target;
        });
    }, [totalSteps]);

    return [step, setStep];
}

function clamp(value: number, totalSteps: number) {
    return Math.min(Math.max(value, 0), Math.max(totalSteps - 1, 0));
}
