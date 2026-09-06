import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/filter-image',
    title: 'Image Filters Online Free — Apply Effects to Images',
    description: 'Apply grayscale, sepia, sharpen, vintage and other effects to images. Free, instant, no sign-up.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
