import * as React from 'react';
import { Metadata } from 'next';
import { SITE_URL } from '@/app/_utils/config';

export const metadata: Metadata = {
    title: 'Reset your password',
    description: 'Send yourself a link to reset your PDF Studio password.',
    alternates: { canonical: `${SITE_URL}/forgot-password` },
    robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
