import { ImageResponse } from 'next/og';

/** App icon, generated so there is a real PWA/tab icon rather than only the .ico favicon. */
export const runtime = 'edge';
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #2563eb 0%, #9333ea 100%)',
                    color: 'white',
                    fontSize: 300,
                    fontWeight: 700,
                    fontFamily: 'sans-serif',
                }}
            >
                P
            </div>
        ),
        size,
    );
}
