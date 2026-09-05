/**
 * Turning an API response into a saved file.
 *
 * Both steps were previously open-coded in every tool, with the same two defects:
 * the object URL was revoked synchronously right after `click()`, which Firefox and
 * Safari treat as cancelling the download; and the filename was pulled out with
 * `disposition.split('filename=')[1]`, which keeps the surrounding quotes and ignores
 * the RFC 5987 `filename*` form the API now sends.
 */

/**
 * Extracts the filename from a `Content-Disposition` header.
 *
 * Prefers `filename*` (RFC 5987, percent-encoded UTF-8) over the plain `filename`,
 * because that is the one that survives non-ASCII names.
 */
export function filenameFrom(disposition: string | null, fallback: string): string {
    if (!disposition) return fallback;

    const extended = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(disposition);
    if (extended?.[1]) {
        try {
            return decodeURIComponent(extended[1].trim().replace(/^"|"$/g, ''));
        } catch {
            /* fall through to the plain form */
        }
    }

    const plain = /filename="?([^";]+)"?/i.exec(disposition);
    if (plain?.[1]) return plain[1].trim();

    return fallback;
}

/**
 * Saves a blob to the user's device.
 *
 * The anchor is attached to the document before clicking (detached anchors are ignored by
 * some browsers) and the object URL is revoked on a later tick, once the download has
 * actually started — revoking immediately cancels it.
 */
/** Event name the confirmation toast listens for. */
export const DOWNLOAD_EVENT = 'pdfstudio:downloaded';

export function saveBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();

    setTimeout(() => {
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    }, 1000);

    // Every tool finished by triggering a download and saying nothing. Browsers save
    // silently — on mobile especially — so the page looked unchanged and it was not obvious
    // anything had happened. Announcing it here covers every tool, including future ones.
    window.dispatchEvent(new CustomEvent(DOWNLOAD_EVENT, { detail: { filename } }));
}
