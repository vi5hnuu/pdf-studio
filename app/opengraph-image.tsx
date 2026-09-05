import { ImageResponse } from 'next/og';

/**
 * The site's share card, rendered at build/request time rather than shipped as a static
 * asset. Open Graph and Twitter previously pointed at `/og-image.png`, which did not exist
 * in `public/` — so every shared link rendered a broken preview.
 *
 * Generating it keeps the wording in step with the site instead of going stale in a binary.
 */
export const runtime = 'edge';
export const alt = 'PDF Studio — Free Online PDF Tools';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    padding: '80px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 60%, #9333ea 100%)',
                    color: 'white',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: '-0.03em' }}>
                    PDF Studio
                </div>
                <div style={{ fontSize: 40, marginTop: 20, opacity: 0.92, maxWidth: 900 }}>
                    Merge, split, compress, convert and protect PDFs
                </div>
                <div style={{ fontSize: 30, marginTop: 36, opacity: 0.75 }}>
                    Free · No sign-up · Works in your browser
                </div>
            </div>
        ),
        size,
    );
}
