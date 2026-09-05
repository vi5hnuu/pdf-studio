import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/replace-pages',
    title: 'Replace Pages in a PDF — Free Online Tool',
    description: 'Replace a page range with the pages of another PDF. Free, no sign-up, works in your browser.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
