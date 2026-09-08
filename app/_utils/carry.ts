/**
 * Carries a tool's result forward to the next tool.
 *
 * Every tool ends by saving a file to the browser's downloads. Running a second tool on that
 * result meant re-picking it from the file system by name — from a downloads folder where it
 * sits among everything else the user has ever saved. The result is kept here for the length
 * of the visit so the next tool can offer it directly.
 *
 * Deliberately module state rather than storage: a `Blob` cannot go in `localStorage`, and the
 * result is a document the user just made — it should live no longer than the tab. One file is
 * held at a time, so nothing accumulates in memory.
 */

export interface CarriedFile {
    file: File;
    /** Where it came from, e.g. `/tool/compress-pdf`, for a truthful label. */
    from: string;
}

let carried: CarriedFile | null = null;

type Listener = (carried: CarriedFile | null) => void;
const listeners = new Set<Listener>();

/** Records a finished result. Replaces whatever was held before. */
export function carryResult(blob: Blob, filename: string, from: string) {
    carried = {
        // A File rather than the Blob, because a file input can only be given File objects and
        // every tool page reads `event.target.files`.
        file: new File([blob], filename, { type: blob.type || 'application/octet-stream' }),
        from,
    };
    for (const listener of listeners) listener(carried);
}

export function getCarried(): CarriedFile | null {
    return carried;
}

export function clearCarried() {
    carried = null;
    for (const listener of listeners) listener(null);
}

/** Subscribes to changes; returns the unsubscribe function. */
export function onCarriedChange(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/**
 * Whether a carried file is worth offering to a picker that accepts these types.
 *
 * Offering a PDF to an image tool would be a dead end the user only discovers after the upload
 * fails, so the same matching the drop handler applies is used here.
 */
export function carriedMatches(file: File, accept: string[]): boolean {
    if (accept.length === 0) return true;
    return accept.some((type) =>
        type.endsWith('/*') ? file.type.startsWith(type.slice(0, -1)) : file.type === type);
}
