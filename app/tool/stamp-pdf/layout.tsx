import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/stamp-pdf',
    title: 'Stamp PDF Online — Overlay a PDF Stamp on Every Page Free',
    description: 'Overlay a stamp PDF onto every page of a source PDF with adjustable opacity. Ideal for watermarks, logos, and approval stamps. Free, instant, no sign-up.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
