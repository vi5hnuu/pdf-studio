import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Crop PDF Online — Set Custom Page Margins Free',
    description: 'Crop PDF pages by setting custom left, right, top, and bottom margins. Remove unwanted borders and whitespace from every page instantly. Free, no sign-up.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
