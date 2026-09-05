import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/pdf-to-word',
    title: 'PDF to Word Online — Convert PDF to Editable DOCX Free',
    description: 'Convert PDF text content to a Word document (.docx) instantly online. Free, no sign-up.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
