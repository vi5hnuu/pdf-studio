import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Reorder PDF Pages Online — Free Page Organizer',
    description: 'Drag and drop PDF pages to reorder them visually. Rearrange any PDF page order and download the result instantly. Free, no account needed.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
