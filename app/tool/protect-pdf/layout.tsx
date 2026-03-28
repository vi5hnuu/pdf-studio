import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Password Protect PDF Online — Free PDF Encryption',
    description: 'Add password protection and permission controls to any PDF file. Set user and owner passwords with 128-bit encryption. Free, no sign-up.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
