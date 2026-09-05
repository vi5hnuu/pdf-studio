import * as React from 'react';
import { Metadata } from 'next';
import { SITE_URL } from '@/app/_utils/config';

export const metadata: Metadata = {
    title: 'Create an account',
    description: 'Create a PDF Studio account to keep your credits across the web and the mobile app.',
    alternates: { canonical: `${SITE_URL}/register` },
    robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
