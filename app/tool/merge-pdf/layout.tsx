import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/merge-pdf',
    title: 'Merge PDF Files Online — Free PDF Merger',
    description: 'Combine multiple PDF files into one document for free. Drag to reorder pages, then download your merged PDF instantly. No sign-up, no limits.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
