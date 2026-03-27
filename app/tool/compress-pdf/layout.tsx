import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Compress PDF Online — Reduce PDF File Size Free',
    description: 'Reduce the size of any PDF file with smart image compression. Choose your compression level and download the optimized result. Free, instant, no sign-up.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
