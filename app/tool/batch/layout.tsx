import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/batch',
    title: 'Batch Process PDFs — Free Online Tool',
    description: 'Apply one tool to many PDFs in a single run. Compress, grayscale, optimize, repair or flatten a whole folder. Free, no sign-up, works in your browser.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
