import { Metadata } from 'next';
import { SITE_URL } from '@/app/_utils/config';
import { toolsInfo } from '@/app/_utils/constants';
import { categoryPath, groupForPath } from '@/app/_utils/tool-groups';
import type { Crumb } from '@/app/_components/breadcrumbs';

/**
 * Per-tool metadata, including the tool's own canonical URL.
 *
 * The root layout sets `alternates.canonical` to the site root. Next merges metadata down
 * the layout tree, so every tool page inherited it and declared the homepage as its
 * canonical — telling Google that all 36 tool pages are duplicates of the homepage and
 * should not be indexed separately. Each page must state its own.
 */
export function toolMetadata(args: {
    /** Route path, e.g. `/tool/merge-pdf`. */
    path: string;
    title: string;
    description: string;
}): Metadata {
    const { path, title, description } = args;
    const url = `${SITE_URL}${path}`;

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            type: 'website',
            url,
            title,
            description,
            siteName: 'PDF Studio',
            // og:image is supplied by app/opengraph-image.tsx, which covers every route.
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
    };
}

/** All tool routes, derived from the single tool catalogue so the two cannot drift. */
export function allToolPaths(): string[] {
    return Object.values(toolsInfo).map((tool) => tool.path);
}

interface Faq {
    q: string;
    a: string;
}

/**
 * `FAQPage` structured data.
 *
 * Every tool page already renders a real FAQ; without this markup none of it is eligible
 * for a rich result, which is the main organic differentiator in this category.
 */
export function faqJsonLd(faqs: Faq[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
    };
}

/**
 * `BreadcrumbList` for a trail of crumbs.
 *
 * Takes the same crumbs the page renders, so the markup can never describe a path the visitor
 * cannot see — which is the condition Google attaches to breadcrumb rich results.
 */
export function breadcrumbJsonLd(crumbs: Crumb[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            ...(crumb.href ? { item: `${SITE_URL}${crumb.href}` } : {}),
        })),
    };
}

/**
 * The crumbs for a tool page: home, the tool's category, then the tool.
 *
 * The category level is what makes this a hierarchy rather than a flat list — every tool used
 * to sit directly under the home page, which told search engines the site had no structure.
 */
export function toolCrumbs(path: string, name: string): Crumb[] {
    const group = groupForPath(path);
    return [
        { name: 'Home', href: '/' },
        ...(group ? [{ name: group.label, href: categoryPath(group.id) }] : []),
        { name },
    ];
}

/** `SoftwareApplication` + `BreadcrumbList` for a single tool page. */
export function toolJsonLd(args: {
    path: string;
    name: string;
    description: string;
}) {
    const url = `${SITE_URL}${args.path}`;
    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                // The root layout describes PDF Studio as a whole; this describes the one tool.
                // Both carry an @id so they read as two distinct things rather than as two
                // competing descriptions of the same application.
                '@type': 'SoftwareApplication',
                '@id': `${url}#app`,
                name: args.name,
                description: args.description,
                url,
                applicationCategory: 'UtilitiesApplication',
                applicationSubCategory: groupForPath(args.path)?.label,
                operatingSystem: 'Web',
                isPartOf: { '@id': `${SITE_URL}/#app` },
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            },
            breadcrumbJsonLd(toolCrumbs(args.path, args.name)),
        ],
    };
}

/** Renders a JSON-LD block. Next keeps it in the SSR output, which is what crawlers read. */
export function JsonLd({ data }: { data: object }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
