import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/redact-pdf',
    title: 'Redact PDF Online — Permanently Black Out Text',
    description: 'Permanently black out sensitive regions of a PDF so the content underneath is removed, not just hidden. Free and private.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
