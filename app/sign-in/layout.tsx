import * as React from 'react';
import { Metadata } from 'next';
import { SITE_URL } from '@/app/_utils/config';

export const metadata: Metadata = {
    title: 'Sign in',
    description: 'Sign in to PDF Studio to use your credits across the web and the mobile app.',
    alternates: { canonical: `${SITE_URL}/sign-in` },
    // Account pages have nothing to offer search, and indexing them only competes with the
    // tool pages that do.
    robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
