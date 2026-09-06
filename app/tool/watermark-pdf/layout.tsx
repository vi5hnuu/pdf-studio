import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/watermark-pdf',
    title: 'Add Watermark to PDF Online — Free PDF Watermark Tool',
    description: 'Stamp custom text watermarks onto any PDF with full control over opacity, angle, size, and position. Free tool, no account needed.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
