import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Convert Images to PDF Online — Free Image to PDF',
    description: 'Convert JPG, PNG, and other images into a single PDF file. Drag to reorder images before converting. Free with no limits.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
