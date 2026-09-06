import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/insert-pdf',
    title: 'Insert One PDF Into Another — Free Online Tool',
    description: 'Insert one PDF into another after a chosen page. Free, no sign-up, works in your browser.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
