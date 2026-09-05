import { describe, expect, it } from 'vitest';
import { filenameFrom } from '@/app/_utils/download';

/**
 * The filename was previously pulled out with `disposition.split('filename=')[1]`, which
 * kept the surrounding quotes and ignored the RFC 5987 form the API now sends.
 */
describe('filenameFrom', () => {
    it('strips the quotes around a plain filename', () => {
        expect(filenameFrom('attachment; filename="report.pdf"', 'fallback.pdf'))
            .toBe('report.pdf');
    });

    it('reads an unquoted filename', () => {
        expect(filenameFrom('attachment; filename=report.pdf', 'fallback.pdf'))
            .toBe('report.pdf');
    });

    it('prefers filename* so non-ASCII names survive', () => {
        const header = "attachment; filename=\"report.pdf\"; filename*=UTF-8''rapport%20final.pdf";
        expect(filenameFrom(header, 'fallback.pdf')).toBe('rapport final.pdf');
    });

    it('falls back when the header is absent or unusable', () => {
        expect(filenameFrom(null, 'fallback.pdf')).toBe('fallback.pdf');
        expect(filenameFrom('attachment', 'fallback.pdf')).toBe('fallback.pdf');
    });

    it('does not carry a stray semicolon into the name', () => {
        expect(filenameFrom('attachment; filename="a.pdf"; size=10', 'f.pdf')).toBe('a.pdf');
    });
});
