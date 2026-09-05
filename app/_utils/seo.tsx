import { Metadata } from 'next';
import { SITE_URL } from '@/app/_utils/config';
import { toolsInfo } from '@/app/_utils/constants';

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
                '@type': 'SoftwareApplication',
                name: args.name,
                description: args.description,
                url,
                applicationCategory: 'UtilitiesApplication',
                operatingSystem: 'Web',
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'PDF Studio', item: SITE_URL },
                    { '@type': 'ListItem', position: 2, name: args.name, item: url },
                ],
            },
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
