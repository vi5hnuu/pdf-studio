import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/rotate-pdf',
    title: 'Rotate PDF Pages Online — Free PDF Rotator',
    description: 'Rotate all pages or specific pages of a PDF by 90°, 180°, or 270°. Free online tool, no account needed.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
