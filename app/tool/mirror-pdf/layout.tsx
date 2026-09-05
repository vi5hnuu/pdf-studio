import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/mirror-pdf',
    title: 'Mirror PDF Pages — Free Online Tool',
    description: 'Flip PDF pages horizontally or vertically. Free, no sign-up, works in your browser.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
