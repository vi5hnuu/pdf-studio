import { describe, expect, it } from 'vitest';
import {
    toolMetadata, allToolPaths, faqJsonLd, breadcrumbJsonLd, toolCrumbs, toolJsonLd,
} from '@/app/_utils/seo';
import { TOOL_GROUPS, categoryPath } from '@/app/_utils/tool-groups';
import { SITE_URL } from '@/app/_utils/config';

describe('tool metadata', () => {
    it('gives each page its own canonical, not the site root', () => {
        const metadata = toolMetadata({
            path: '/tool/merge-pdf', title: 'Merge PDF', description: 'Combine PDFs.',
        });

        // The root layout's canonical is inherited by children, which previously made every
        // tool page declare the homepage as its canonical.
        expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/tool/merge-pdf`);
        expect(metadata.alternates?.canonical).not.toBe(SITE_URL);
    });

    it('carries the tool\'s own title and description into Open Graph', () => {
        const metadata = toolMetadata({
            path: '/tool/split-pdf', title: 'Split PDF', description: 'Split a PDF.',
        });

        expect(metadata.openGraph?.title).toBe('Split PDF');
        expect(metadata.openGraph?.url).toBe(`${SITE_URL}/tool/split-pdf`);
    });

    it('lists every tool for the sitemap', () => {
        const paths = allToolPaths();

        expect(paths.length).toBeGreaterThan(30);
        expect(new Set(paths).size).toBe(paths.length); // no duplicates
        for (const path of paths) expect(path.startsWith('/tool/')).toBe(true);
    });

    it('builds FAQPage structured data from the visible FAQs', () => {
        const jsonLd = faqJsonLd([{ q: 'Is it free?', a: 'Yes.' }]) as any;

        expect(jsonLd['@type']).toBe('FAQPage');
        expect(jsonLd.mainEntity[0].name).toBe('Is it free?');
        expect(jsonLd.mainEntity[0].acceptedAnswer.text).toBe('Yes.');
    });
});

describe('breadcrumbs', () => {
    it('puts the tool under its category, not directly under the home page', () => {
        const crumbs = toolCrumbs('/tool/crop-pdf', 'Crop PDF');

        expect(crumbs.map((crumb) => crumb.name)).toEqual(['Home', 'Edit', 'Crop PDF']);
        expect(crumbs[1].href).toBe(categoryPath('edit'));
    });

    it('leaves the current page without a link, as the last crumb', () => {
        const crumbs = toolCrumbs('/tool/merge-pdf', 'Merge pdf');

        expect(crumbs[crumbs.length - 1].href).toBeUndefined();
    });

    it('numbers the list items in order and omits an item for the current page', () => {
        const data = breadcrumbJsonLd(toolCrumbs('/tool/protect-pdf', 'Protect pdf')) as any;

        expect(data['@type']).toBe('BreadcrumbList');
        expect(data.itemListElement.map((entry: any) => entry.position)).toEqual([1, 2, 3]);
        expect(data.itemListElement[2].item).toBeUndefined();
    });

    it('describes every tool with a three-level trail, so none is orphaned', () => {
        for (const path of allToolPaths()) {
            expect(toolCrumbs(path, 'x')).toHaveLength(3);
        }
    });

    it('gives the tool app entity its own id so it does not clash with the site-wide one', () => {
        const data = toolJsonLd({
            path: '/tool/crop-pdf', name: 'Crop PDF', description: 'Crop pages.',
        }) as any;

        const app = data['@graph'].find((node: any) => node['@type'] === 'SoftwareApplication');
        expect(app['@id']).toContain('/tool/crop-pdf#app');
        expect(app.applicationSubCategory).toBe('Edit');
    });
});

describe('tool catalogue', () => {
    it('assigns every tool to exactly one category', () => {
        const grouped = TOOL_GROUPS.flatMap((group) => group.tools);

        expect(new Set(grouped).size).toBe(grouped.length);
        expect(grouped).toHaveLength(allToolPaths().length);
    });
});
