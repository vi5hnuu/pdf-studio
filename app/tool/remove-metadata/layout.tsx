import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/remove-metadata',
    title: 'Remove PDF Metadata — Free Online Tool',
    description: 'Remove all document info and XMP metadata from a PDF. Free, no sign-up, works in your browser.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
