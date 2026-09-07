'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { clearToolSettings, loadToolSettings, saveToolSettings } from '@/app/_utils/tool-settings';

/**
 * A tool's settings, remembered between visits.
 *
 * Behaves like `useState` over a plain object, and persists it. Two details matter:
 *
 * - The stored values are read **after mount**, not during the first render. Reading storage
 *   while rendering makes the server's HTML and the client's first pass disagree, which React
 *   reports as a hydration error and resolves by throwing the client's version away.
 * - Writes are debounced, so dragging a slider does not write to storage on every frame.
 */
export function useToolSettings<T extends object>(
    toolKey: string,
    defaults: T,
    /**
     * Keys that belong to the document rather than to the user's preference, above all a page
     * range: carrying one document's range into the next applies a choice made about a
     * different file. Excluded keys always start from their default.
     */
    exclude: (keyof T)[] = [],
) {
    const [values, setValues] = useState<T>(defaults);
    /** True once the stored values have been applied, so the first save cannot overwrite them. */
    const loaded = useRef(false);
    /**
     * The same fact as a rendered value, and a counter that changes on reset.
     *
     * A form that seeds its own state from an `initState` prop reads it once, so it must not be
     * mounted before the stored values arrive, and must be remounted when they are discarded.
     */
    const [revision, setRevision] = useState(0);
    const [ready, setReady] = useState(false);
    const defaultsRef = useRef(defaults);
    const excludeRef = useRef(exclude);

    useEffect(() => {
        setValues(loadToolSettings(toolKey, defaultsRef.current));
        loaded.current = true;
        setReady(true);
    }, [toolKey]);

    useEffect(() => {
        if (!loaded.current) return;
        const timer = setTimeout(() => saveToolSettings(toolKey, values, excludeRef.current), 400);
        return () => clearTimeout(timer);
    }, [toolKey, values]);

    const set = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
        setValues((current) => ({ ...current, [key]: value }));
    }, []);

    /** Restores the tool's defaults and forgets what was stored, so it is never a one-way door. */
    const reset = useCallback(() => {
        setValues(defaultsRef.current);
        clearToolSettings(toolKey);
        setRevision((n) => n + 1);
    }, [toolKey]);

    return { values, set, setValues, reset, ready, revision };
}
