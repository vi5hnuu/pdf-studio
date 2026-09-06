import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/resize-image',
    title: 'Resize Image Online Free — Change Image Dimensions',
    description: 'Resize images to exact pixel dimensions with aspect ratio control. Free, instant, no sign-up.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
