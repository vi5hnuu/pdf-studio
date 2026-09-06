import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/sanitize-pdf',
    title: 'Sanitize PDF — Free Online Tool',
    description: 'Strip JavaScript, embedded files and actions from a PDF. Free, no sign-up, works in your browser.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
