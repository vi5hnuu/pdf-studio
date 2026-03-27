import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Extract Text from PDF Online — Free PDF to Text',
    description: 'Extract all readable text content from any PDF file. Download the extracted text as a .txt file instantly. Free, no account needed.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
