import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/delete-pages',
    title: 'Delete PDF Pages Online — Free Page Remover',
    description: 'Visually select and delete unwanted pages from any PDF. Click to mark pages for removal and download the cleaned result instantly. Free, no sign-up.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
