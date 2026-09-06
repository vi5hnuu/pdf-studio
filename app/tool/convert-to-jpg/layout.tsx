import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/convert-to-jpg',
    title: 'Convert Image to JPG Online Free',
    description: 'Convert PNG, BMP, or GIF images to JPEG format. Free, instant, no sign-up.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
