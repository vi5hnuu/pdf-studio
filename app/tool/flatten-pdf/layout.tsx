import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/flatten-pdf',
    title: 'Flatten PDF Online — Merge Form Fields & Annotations Free',
    description: 'Flatten PDF form fields and annotations permanently into page content. Prevents editing of interactive elements. Free, instant, no account required.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
