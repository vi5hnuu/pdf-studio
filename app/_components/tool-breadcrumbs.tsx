'use client';

import { usePathname } from 'next/navigation';
import { Breadcrumbs } from '@/app/_components/breadcrumbs';
import { toolCrumbs } from '@/app/_utils/seo';
import { toolsInfo } from '@/app/_utils/constants';

/**
 * The breadcrumb for whichever tool page is showing.
 *
 * Derived from the pathname in the shared layout so all 51 tool pages get the trail without
 * each one having to render it, and so it cannot drift from the `BreadcrumbList` markup —
 * both are built from the same `toolCrumbs`.
 */
export function ToolBreadcrumbs() {
    const pathname = usePathname();
    const info = Object.values(toolsInfo).find((tool) => tool.path === pathname);
    if (!info) return null;

    return (
        <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-1.5">
                <Breadcrumbs crumbs={toolCrumbs(info.path, info.title)} />
            </div>
        </div>
    );
}
