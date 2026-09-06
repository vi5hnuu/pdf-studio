import { describe, expect, it } from 'vitest';
import { formatBytes } from '../format';

describe('formatBytes', () => {
    it('keeps small files legible instead of rounding them to 0.00 MB', () => {
        expect(formatBytes(3761)).toBe('3.7 KB');
        expect(formatBytes(512)).toBe('512 B');
    });

    it('switches to MB above a megabyte', () => {
        expect(formatBytes(5 * 1024 * 1024)).toBe('5.00 MB');
    });

    it('does not print a size it does not have', () => {
        expect(formatBytes(NaN)).toBe('—');
        expect(formatBytes(-1)).toBe('—');
    });
});
