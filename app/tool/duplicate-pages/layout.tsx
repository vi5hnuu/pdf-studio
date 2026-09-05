import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/duplicate-pages',
    title: 'Duplicate PDF Pages Online — Free Tool',
    description: 'Duplicate selected pages within any PDF document. Free, instant, no sign-up.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
