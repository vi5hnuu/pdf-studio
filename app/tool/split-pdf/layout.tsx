import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Split PDF Online — Free PDF Splitter',
    description: 'Split a PDF into multiple files by page range, fixed groups, or extract every page individually. Free, no registration required.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
