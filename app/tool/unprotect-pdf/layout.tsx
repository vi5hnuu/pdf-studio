import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Unlock PDF — Remove Password Protection Online Free',
    description: 'Remove password protection from a PDF using the master password. Unlock restricted PDFs instantly. Free tool, no account needed.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
