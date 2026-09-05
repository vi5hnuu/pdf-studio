import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/repair-pdf',
    title: 'Repair PDF Online — Fix Corrupted PDF Files Free',
    description: 'Repair damaged or corrupted PDF files online. Fixes structural issues, cross-reference tables, and recovers truncated files. Free, instant, no sign-up.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
