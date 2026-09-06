import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/remove-blank-pages',
    title: 'Remove Blank Pages from PDF Online — Free Tool',
    description: 'Automatically detect and remove empty or near-blank pages from any PDF. Adjust sensitivity to control what counts as blank. Free, instant, no sign-up.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
