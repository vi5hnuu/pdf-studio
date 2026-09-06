import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { SiteHeader } from '@/app/_components/site-header';
import { SiteFooter } from '@/app/_components/site-footer';
import { Breadcrumbs, Crumb } from '@/app/_components/breadcrumbs';
import { JsonLd, breadcrumbJsonLd } from '@/app/_utils/seo';
import { SITE_URL } from '@/app/_utils/config';
import { TOOL_GROUPS, categoryPath } from '@/app/_utils/tool-groups';
import { toolsInfo } from '@/app/_utils/constants';

/**
 * A category landing page.
 *
 * The site was two levels deep — the home page and 51 tools — so there was nothing for a
 * breadcrumb to point at between them, and no page that could rank for a category term like
 * "pdf security tools". These give the catalogue a middle tier: each one is indexable, links
 * to every tool in its group, and is the target of the tools' breadcrumbs.
 */
export function generateStaticParams() {
    return TOOL_GROUPS.map((group) => ({ category: group.id }));
}

/**
 * The categories are a fixed set, so anything else is a genuine 404 at the routing layer
 * rather than a page rendered on demand only to call `notFound()` — which answered 200 and
 * would have let search engines index an empty category.
 */
export const dynamicParams = false;

function groupFor(category: string) {
    return TOOL_GROUPS.find((group) => group.id === category) ?? null;
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
    const group = groupFor(params.category);
    if (!group) return {};

    const title = `${group.label} PDF Tools — Free & Online`;
    const description = `${group.description}. ${group.tools.length} free tools, no sign-up required.`;
    const url = `${SITE_URL}${categoryPath(group.id)}`;

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: { type: 'website', url, title, description, siteName: 'PDF Studio' },
        twitter: { card: 'summary_large_image', title, description },
    };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
    const group = groupFor(params.category);
    if (!group) notFound();

    const crumbs: Crumb[] = [{ name: 'Home', href: '/' }, { name: group.label }];

    return (
        <div className="flex flex-col min-h-dvh bg-slate-50 dark:bg-slate-900">
            <SiteHeader />
            <JsonLd data={breadcrumbJsonLd(crumbs)} />

            <main className="flex-1">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
                    <Breadcrumbs crumbs={crumbs} />

                    <h1 className="mt-3 text-xl font-bold text-slate-900 dark:text-slate-100">
                        {group.label} PDF tools
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {group.description}. All free, in your browser, no account needed.
                    </p>

                    <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {group.tools.map((tool) => {
                            const info = toolsInfo[tool];
                            if (!info) return null;
                            return (
                                <li key={info.path}>
                                    <Link
                                        href={info.path}
                                        className="group flex items-start gap-3 h-full rounded-sm border
                                                   border-slate-200 dark:border-slate-700 bg-white
                                                   dark:bg-slate-800 px-3 py-2.5 hover:border-slate-300
                                                   dark:hover:border-slate-600 transition-colors"
                                    >
                                        {/* The tool icons are white-stroked, so they need the
                                            coloured tile behind them the grid cards use —
                                            without it they are invisible on a light card. */}
                                        <span className={`${info.backgroundColor} w-8 h-8 rounded-sm
                                                          flex-shrink-0 flex items-center justify-center`}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={`/${info.src}`} alt="" width={16} height={16}
                                                 className="w-4 h-4" />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-sm font-semibold text-slate-800
                                                             dark:text-slate-100">
                                                {info.title}
                                            </span>
                                            <span className="block text-xs text-slate-500 dark:text-slate-400
                                                             leading-snug">
                                                {info.description}
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <nav aria-label="Other categories" className="mt-10">
                        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            Other categories
                        </h2>
                        <ul className="mt-2 flex flex-wrap gap-2">
                            {TOOL_GROUPS.filter((other) => other.id !== group.id).map((other) => (
                                <li key={other.id}>
                                    <Link
                                        href={categoryPath(other.id)}
                                        className="inline-block rounded-sm border border-slate-200
                                                   dark:border-slate-700 px-2.5 py-1 text-xs
                                                   text-slate-600 dark:text-slate-300
                                                   hover:border-slate-300 dark:hover:border-slate-600
                                                   transition-colors"
                                    >
                                        {other.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
