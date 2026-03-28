import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Stamp PDF Online — Overlay a PDF Stamp on Every Page Free',
    description: 'Overlay a stamp PDF onto every page of a source PDF with adjustable opacity. Ideal for watermarks, logos, and approval stamps. Free, instant, no sign-up.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
