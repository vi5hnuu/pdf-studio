import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Optimize PDF Online — Reduce File Size by Cleaning Structure',
    description: 'Optimize your PDF by removing redundant objects, unused resources, and embedded thumbnails. Faster loading, smaller files. Free, instant, no sign-up.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
