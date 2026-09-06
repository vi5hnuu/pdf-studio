import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/edit-metadata',
    title: 'Edit PDF Metadata Online — Change Title, Author & More Free',
    description: 'Edit PDF document properties including title, author, subject, keywords, and creator. Update metadata without altering page content. Free, instant, no sign-up.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
