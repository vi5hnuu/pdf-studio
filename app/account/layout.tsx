import * as React from 'react';
import { Metadata } from 'next';
import { SITE_URL } from '@/app/_utils/config';

export const metadata: Metadata = {
    title: 'Your account',
    description: 'Your PDF Studio credits, history and account settings.',
    alternates: { canonical: `${SITE_URL}/account` },
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
