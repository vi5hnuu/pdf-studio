import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/extract-embedded-files',
    title: 'Extract PDF Attachments — Free Online Tool',
    description: 'Extract file attachments embedded in a PDF. Free, no sign-up, works in your browser.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
