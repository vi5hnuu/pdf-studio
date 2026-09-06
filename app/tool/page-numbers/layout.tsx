import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/page-numbers',
    title: 'Add Page Numbers to PDF — Free Online Tool',
    description: 'Stamp page numbers onto any PDF with custom font, size, position, and format. Download instantly. Free with no account required.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
