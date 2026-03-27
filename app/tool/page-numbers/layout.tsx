import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Add Page Numbers to PDF — Free Online Tool',
    description: 'Stamp page numbers onto any PDF with custom font, size, position, and format. Download instantly. Free with no account required.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
