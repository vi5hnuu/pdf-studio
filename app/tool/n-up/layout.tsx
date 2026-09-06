import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/n-up',
    title: 'N-Up PDF Online — Print Multiple Pages Per Sheet Free',
    description: 'Combine 2 or 4 PDF pages onto a single sheet. Perfect for printing handouts and saving paper. Free, instant, no sign-up.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
