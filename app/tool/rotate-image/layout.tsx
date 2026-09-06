import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/rotate-image',
    title: 'Rotate an Image Online — Free Online Tool',
    description: 'Rotate an image by 90, 180 or 270 degrees. Free, no sign-up, works in your browser.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
