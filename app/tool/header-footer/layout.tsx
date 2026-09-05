import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/header-footer',
    title: 'Add Header & Footer to PDF Online — Free',
    description: 'Add custom header and footer text to every page of your PDF. Control font size, colour, and page range. Free, no installation, no sign-up required.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
