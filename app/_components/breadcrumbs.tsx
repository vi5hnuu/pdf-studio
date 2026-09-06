import Link from 'next/link';
import * as React from 'react';

export interface Crumb {
    name: string;
    /** Route path. Omitted on the last crumb, which is the current page. */
    href?: string;
}

/**
 * The trail from the home page to the current one.
 *
 * The site emitted `BreadcrumbList` structured data with nothing on the page to back it, and
 * the trail it described had no middle level — every tool sat directly under the home page.
 * Google asks that the markup reflect something a visitor can actually see and follow, so the
 * same crumbs are rendered here and fed to {@link breadcrumbJsonLd}.
 */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
    if (crumbs.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className="text-xs">
            <ol className="flex flex-wrap items-center gap-1 text-slate-500 dark:text-slate-400">
                {crumbs.map((crumb, index) => {
                    const last = index === crumbs.length - 1;
                    return (
                        <li key={crumb.name} className="flex items-center gap-1">
                            {crumb.href && !last ? (
                                <Link href={crumb.href}
                                      className="hover:text-slate-900 dark:hover:text-slate-100
                                                 hover:underline transition-colors">
                                    {crumb.name}
                                </Link>
                            ) : (
                                <span aria-current="page" className="text-slate-700 dark:text-slate-200">
                                    {crumb.name}
                                </span>
                            )}
                            {!last && <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">/</span>}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
