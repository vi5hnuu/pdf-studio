import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/optimize-pdf',
    title: 'Optimize PDF Online — Reduce File Size by Cleaning Structure',
    description: 'Optimize your PDF by removing redundant objects, unused resources, and embedded thumbnails. Faster loading, smaller files. Free, instant, no sign-up.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
