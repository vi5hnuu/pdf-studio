import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/extract-images',
    title: 'Extract Images From PDF — Free Online Tool',
    description: 'Extract every embedded image from a PDF as a ZIP. Free, no sign-up, works in your browser.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
