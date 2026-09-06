'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

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
    /** The step the URL already reflects, so a re-render does not re-navigate. */
    const syncedStep = useRef(0);
    /** Set when the change came from the browser, which has already moved history itself. */
    const fromHistory = useRef(false);

    // Follow the browser's own back/forward.
    useEffect(() => {
        const onPopState = (event: PopStateEvent) => {
            const target = (event.state as { toolStep?: number } | null)?.toolStep;
            fromHistory.current = true;
            setStepState(clamp(target ?? 0, totalSteps));
        };
        window.addEventListener('popstate', onPopState);

        // Label the entry the user arrived on, so returning to it restores step 0 rather
        // than a null state.
        if (typeof window !== 'undefined' && (window.history.state as any)?.toolStep === undefined) {
            window.history.replaceState({ ...window.history.state, toolStep: 0 }, '');
        }
        return () => window.removeEventListener('popstate', onPopState);
    }, [totalSteps]);

    // History and scrolling are side effects, so they belong in an effect rather than in the
    // state updater — React may invoke an updater more than once for the same transition,
    // which pushed a duplicate history entry and made Back need two presses.
    useEffect(() => {
        if (step === syncedStep.current) return;
        const advancing = step > syncedStep.current;
        syncedStep.current = step;

        if (fromHistory.current) {
            fromHistory.current = false;
        } else {
            const url = step === 0
                ? window.location.pathname
                : `${window.location.pathname}?step=${step}`;
            // Going back through the app's own control should not stack another entry.
            const write = advancing ? window.history.pushState : window.history.replaceState;
            write.call(window.history, { ...window.history.state, toolStep: step }, '', url);
        }

        // Each step swaps the whole panel out. Keeping the old scroll offset dropped the user
        // into the middle of the new step, with its heading and instructions above the fold.
        //
        // The scroll is instant and re-asserted on the next frame: a step whose content is
        // still rendering (the PDF page canvas) grows after this runs, and the browser's
        // scroll anchoring pulls the viewport back down to what it was holding on to. A
        // smooth scroll loses that race outright, because the animation is cancelled.
        window.scrollTo({ top: 0, behavior: 'auto' });
        const settle = requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
        return () => cancelAnimationFrame(settle);
    }, [step]);

    const setStep = useCallback((next: number | ((n: number) => number)) => {
        setStepState((current) => clamp(typeof next === 'function' ? next(current) : next, totalSteps));
    }, [totalSteps]);

    return [step, setStep];
}

function clamp(value: number, totalSteps: number) {
    return Math.min(Math.max(value, 0), Math.max(totalSteps - 1, 0));
}
