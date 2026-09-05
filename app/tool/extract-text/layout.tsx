import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/extract-text',
    title: 'Extract Text from PDF Online — Free PDF to Text',
    description: 'Extract all readable text content from any PDF file. Download the extracted text as a .txt file instantly. Free, no account needed.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
