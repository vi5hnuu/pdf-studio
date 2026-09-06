import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/pdf-to-excel',
    title: 'PDF to Excel Online — Export PDF Data to XLSX Free',
    description: 'Convert PDF content to a structured Excel spreadsheet. Free, no sign-up.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
