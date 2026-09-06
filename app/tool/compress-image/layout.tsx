import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/compress-image',
    title: 'Compress Image Online — Reduce Image File Size Free',
    description: 'Compress images to JPEG with adjustable quality. Free, instant, no sign-up.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
