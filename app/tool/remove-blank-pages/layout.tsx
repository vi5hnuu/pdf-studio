import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Remove Blank Pages from PDF Online — Free Tool',
    description: 'Automatically detect and remove empty or near-blank pages from any PDF. Adjust sensitivity to control what counts as blank. Free, instant, no sign-up.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
