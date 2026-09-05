import { describe, expect, it } from 'vitest';
import { toolMetadata, allToolPaths, faqJsonLd } from '@/app/_utils/seo';
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
