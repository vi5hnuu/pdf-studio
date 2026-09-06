/**
 * Human-readable byte size.
 *
 * Every tool page printed `(size / 1024 / 1024).toFixed(2) MB`, so anything under ~5 KB read
 * as "0.00 MB" — the file looked empty at the exact moment the user is checking they picked
 * the right one. Scaling the unit is the whole point, and having it in one place keeps the
 * 20-odd call sites consistent.
 */
export function formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes < 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
