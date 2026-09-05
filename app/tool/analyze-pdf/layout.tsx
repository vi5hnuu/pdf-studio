import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/analyze-pdf',
    title: 'Analyze a PDF — Free PDF Inspector',
    description: 'Inspect any PDF: page count, size, page dimensions, fonts, images, encryption and metadata. Free, no sign-up.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
