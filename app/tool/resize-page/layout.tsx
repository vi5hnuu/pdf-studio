import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/resize-page',
    title: 'Resize PDF Page Size — Free Online Tool',
    description: 'Resize every page to A4, Letter or Legal. Free, no sign-up, works in your browser.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
