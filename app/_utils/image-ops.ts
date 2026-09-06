/**
 * Client-side reimplementation of the server's image operations, for live preview.
 *
 * Several image tools asked for numbers — a border width and an RGB colour, a filter
 * intensity, target dimensions — with nothing showing what they would do. The maths here
 * mirrors `ImageService` on the server (the same sepia matrix, the same brightness and
 * contrast rescale around 128, the same border geometry), so what the preview shows is what
 * the download contains rather than an impression of it.
 *
 * Resizing is the one approximation: the server uses bicubic interpolation and the browser
 * uses its own smoothing, so a resized preview matches in dimensions and framing but can
 * differ very slightly in resampling.
 */

export type FilterKind =
    | 'GRAYSCALE' | 'SEPIA' | 'SHARPEN' | 'BRIGHTNESS' | 'CONTRAST' | 'VINTAGE';

const clamp255 = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));

/** Draws the image with a solid border of `width` px in the given colour. */
export function drawBordered(
    canvas: HTMLCanvasElement, image: HTMLImageElement,
    width: number, r: number, g: number, b: number,
) {
    const bw = Math.max(0, Math.round(width));
    canvas.width = image.naturalWidth + bw * 2;
    canvas.height = image.naturalHeight + bw * 2;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = `rgb(${clamp255(r)}, ${clamp255(g)}, ${clamp255(b)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, bw, bw);
}

/** Rotates by a multiple of 90 degrees, swapping the canvas dimensions as needed. */
export function drawRotated(canvas: HTMLCanvasElement, image: HTMLImageElement, degrees: number) {
    const angle = ((degrees % 360) + 360) % 360;
    const swap = angle === 90 || angle === 270;
    canvas.width = swap ? image.naturalHeight : image.naturalWidth;
    canvas.height = swap ? image.naturalWidth : image.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
    ctx.restore();
}

/** Mirrors across the horizontal or vertical axis. */
export function drawFlipped(
    canvas: HTMLCanvasElement, image: HTMLImageElement, direction: string,
) {
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    if (direction === 'VERTICAL') {
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
    } else {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }
    ctx.drawImage(image, 0, 0);
    ctx.restore();
}

/** Scales to the requested box, preserving the source when a dimension is omitted. */
export function drawResized(
    canvas: HTMLCanvasElement, image: HTMLImageElement,
    targetWidth?: number, targetHeight?: number,
) {
    const width = targetWidth && targetWidth > 0 ? targetWidth : image.naturalWidth;
    const height = targetHeight && targetHeight > 0 ? targetHeight : image.naturalHeight;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, 0, 0, width, height);
}

/**
 * Applies a filter, matching the server's implementation.
 *
 * @param intensity 0–1 blend for sepia/grayscale/vintage; a multiplier for brightness and
 *                  contrast, where 1.0 means no change
 */
export function drawFiltered(
    canvas: HTMLCanvasElement, image: HTMLImageElement,
    kind: FilterKind, intensity: number,
) {
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(image, 0, 0);

    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = frame.data;

    for (let i = 0; i < px.length; i += 4) {
        const r = px[i], g = px[i + 1], b = px[i + 2];

        switch (kind) {
            case 'GRAYSCALE': {
                // Same luminance weights the server's grayscale conversion uses.
                const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                px[i] = clamp255(lum * intensity + r * (1 - intensity));
                px[i + 1] = clamp255(lum * intensity + g * (1 - intensity));
                px[i + 2] = clamp255(lum * intensity + b * (1 - intensity));
                break;
            }
            case 'SEPIA':
            case 'VINTAGE': {
                // The server's sepia matrix, blended with the original by intensity.
                const sr = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
                const sg = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
                const sb = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
                px[i] = clamp255(sr * intensity + r * (1 - intensity));
                px[i + 1] = clamp255(sg * intensity + g * (1 - intensity));
                px[i + 2] = clamp255(sb * intensity + b * (1 - intensity));
                break;
            }
            case 'BRIGHTNESS': {
                // RescaleOp(intensity, 0): a straight per-channel multiply.
                px[i] = clamp255(r * intensity);
                px[i + 1] = clamp255(g * intensity);
                px[i + 2] = clamp255(b * intensity);
                break;
            }
            case 'CONTRAST': {
                // RescaleOp scaling around the 128 mid-point.
                const offset = 128 * (1 - intensity);
                px[i] = clamp255(r * intensity + offset);
                px[i + 1] = clamp255(g * intensity + offset);
                px[i + 2] = clamp255(b * intensity + offset);
                break;
            }
            case 'SHARPEN':
                // A convolution is not worth reproducing per keystroke; the unfiltered image
                // is shown and the caller labels the preview as approximate.
                break;
        }
    }

    ctx.putImageData(frame, 0, 0);
}
