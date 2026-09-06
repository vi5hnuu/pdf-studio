import { Metadata } from 'next';

// Account pages must never be indexed.
export const metadata: Metadata = {
    title: 'Change your password | PDF Studio',
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
