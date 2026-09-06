import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/split-by-size',
    title: 'Split PDF by File Size — Free Online Tool',
    description: 'Split a PDF into parts no larger than a chosen size. Free, no sign-up, works in your browser.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
