import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/convert-from-jpg',
    title: 'Convert JPG to PNG or BMP Online Free',
    description: 'Convert JPEG images to PNG or BMP format. Free, instant, no sign-up.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
