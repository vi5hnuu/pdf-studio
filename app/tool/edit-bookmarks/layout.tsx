import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/edit-bookmarks',
    title: 'Edit PDF Bookmarks Online — Free Outline Editor',
    description: 'View and edit the bookmark and outline tree of any PDF. Rename, restructure and remove entries, then download. Free, no sign-up.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
