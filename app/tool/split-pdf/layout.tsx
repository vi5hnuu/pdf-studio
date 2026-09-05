import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/split-pdf',
    title: 'Split PDF Online — Free PDF Splitter',
    description: 'Split a PDF into multiple files by page range, fixed groups, or extract every page individually. Free, no registration required.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
