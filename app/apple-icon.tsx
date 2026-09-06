import { ImageResponse } from 'next/og';

/**
 * The home-screen icon iOS uses.
 *
 * Without it Safari screenshots the page and uses that, which looks accidental next to real
 * app icons. Same mark as `icon.tsx`, at the 180px Apple asks for and with the inset those
 * icons need once iOS rounds the corners.
 */
export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
                    fontSize: 104,
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
