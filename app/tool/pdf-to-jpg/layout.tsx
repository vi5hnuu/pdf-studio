import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Convert PDF to JPG Online — Free PDF to Image',
    description: 'Export every PDF page as a high-quality JPG image or combine all pages into a single image. Free, instant, no sign-up.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
