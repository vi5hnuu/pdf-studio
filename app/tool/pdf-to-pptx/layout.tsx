import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/pdf-to-pptx',
    title: 'PDF to PowerPoint Online — Convert PDF to PPTX Free',
    description: 'Convert PDF pages into PowerPoint presentation slides. Free, no sign-up.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
