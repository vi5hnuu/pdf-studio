import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/image-to-pdf',
    title: 'Convert Images to PDF Online — Free Image to PDF',
    description: 'Convert JPG, PNG, and other images into a single PDF file. Drag to reorder images before converting. Free with no limits.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
