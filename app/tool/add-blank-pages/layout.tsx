import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Add Blank Pages to PDF Online — Insert Empty Pages Free',
    description: 'Insert blank pages at specific positions in your PDF. Choose A4, Letter, or A3 page size and specify exactly where blank pages should be added. Free, no sign-up.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
