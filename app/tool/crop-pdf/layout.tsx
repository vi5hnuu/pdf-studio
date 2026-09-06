import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/crop-pdf',
    title: 'Crop PDF Online — Set Custom Page Margins Free',
    description: 'Crop PDF pages by setting custom left, right, top, and bottom margins. Remove unwanted borders and whitespace from every page instantly. Free, no sign-up.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
