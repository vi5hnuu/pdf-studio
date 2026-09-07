/**
 * Remembering what a tool was last set to.
 *
 * Tools reset to their defaults on every visit, so anyone applying the same watermark, header or
 * page numbering across a batch of documents retyped the whole configuration each time. The
 * settings are per tool and per browser; nothing is sent anywhere.
 *
 * Never used for anything secret. A password is not a setting — it belongs to one document, and
 * keeping it would be storing a credential in the browser.
 */

/**
 * Bumped when a tool's settings change shape.
 *
 * A stored object from an older shape is discarded rather than merged, so a renamed or retyped
 * field cannot resurface as an unreadable value in a live control.
 */
const VERSION = 1;

const PREFIX = 'pdfstudio:tool-settings:';

interface Stored<T> {
    version: number;
    values: T;
}

function keyFor(toolKey: string): string {
    return `${PREFIX}${toolKey}`;
}

/**
 * Reads a tool's remembered settings, merged over its defaults.
 *
 * Only keys the defaults declare are taken, so a stored object left over from an older version
 * of a tool cannot introduce fields the page does not understand. Any failure — private mode,
 * blocked site data, corrupt JSON — returns the defaults, because a settings convenience must
 * never be able to stop a tool loading.
 */
export function loadToolSettings<T extends object>(toolKey: string, defaults: T): T {
    if (typeof window === 'undefined') return defaults;
    try {
        const raw = window.localStorage.getItem(keyFor(toolKey));
        if (!raw) return defaults;

        const stored = JSON.parse(raw) as Stored<Partial<T>>;
        if (stored?.version !== VERSION || !stored.values) return defaults;

        const merged = { ...defaults };
        for (const key of Object.keys(defaults) as (keyof T)[]) {
            const value = stored.values[key];
            // Type must match the default's, or a stored string would end up in a number input.
            if (value !== undefined && typeof value === typeof defaults[key]) {
                merged[key] = value as T[keyof T];
            }
        }
        return merged;
    } catch {
        return defaults;
    }
}

/**
 * Stores a tool's settings, minus any key in {@link exclude}.
 *
 * Excluded keys are the ones that belong to a document rather than to the user's preference — a
 * page range above all. Carrying "pages 4 to 9" from one document into the next would apply a
 * range chosen for a different file, which is worse than not remembering anything.
 */
export function saveToolSettings<T extends object>(toolKey: string, values: T, exclude: (keyof T)[] = []) {
    if (typeof window === 'undefined') return;
    try {
        const stored = { ...values };
        for (const key of exclude) delete stored[key];
        window.localStorage.setItem(keyFor(toolKey),
            JSON.stringify({ version: VERSION, values: stored } satisfies Stored<T>));
    } catch {
        /* Storage full or blocked; remembering is a convenience, never a requirement. */
    }
}

/** Forgets a tool's settings, so the next visit starts from its defaults. */
export function clearToolSettings(toolKey: string) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(keyFor(toolKey));
    } catch {
        /* Nothing to do; the caller has already reset the live controls. */
    }
}
