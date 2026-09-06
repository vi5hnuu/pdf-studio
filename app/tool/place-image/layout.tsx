import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/place-image',
    title: 'Add an Image to a PDF — Free Image Placement Tool',
    description: 'Insert an image anywhere on a PDF page at the exact position and size you choose. Free online tool, no account needed.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
