import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearToolSettings, loadToolSettings, saveToolSettings } from '@/app/_utils/tool-settings';

/** A minimal in-memory localStorage, so these run without a browser. */
function installStorage(overrides: Partial<Storage> = {}) {
    const data = new Map<string, string>();
    const storage = {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => void data.set(key, value),
        removeItem: (key: string) => void data.delete(key),
        clear: () => data.clear(),
        key: (index: number) => Array.from(data.keys())[index] ?? null,
        get length() { return data.size; },
        ...overrides,
    } as Storage;
    vi.stubGlobal('window', { localStorage: storage });
    return data;
}

interface Settings {
    text: string;
    fontSize: number;
    fromPage: number;
}

const defaults: Settings = { text: 'CONFIDENTIAL', fontSize: 48, fromPage: 0 };

describe('tool settings', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
    });

    it('returns the defaults when nothing has been stored', () => {
        installStorage();
        expect(loadToolSettings('watermark', defaults)).toEqual(defaults);
    });

    it('round-trips what was saved', () => {
        installStorage();
        saveToolSettings('watermark', { ...defaults, text: 'DRAFT', fontSize: 24 });
        expect(loadToolSettings('watermark', defaults))
            .toEqual({ text: 'DRAFT', fontSize: 24, fromPage: 0 });
    });

    it('never carries an excluded key, so one document\'s page range cannot reach the next', () => {
        const data = installStorage();
        saveToolSettings('watermark', { ...defaults, text: 'DRAFT', fromPage: 7 }, ['fromPage']);

        expect(JSON.parse(data.get('pdfstudio:tool-settings:watermark')!).values)
            .not.toHaveProperty('fromPage');
        expect(loadToolSettings('watermark', defaults).fromPage).toBe(0);
    });

    it('ignores a stored value whose type no longer matches the default', () => {
        const data = installStorage();
        data.set('pdfstudio:tool-settings:watermark',
            JSON.stringify({ version: 1, values: { fontSize: 'huge', text: 'DRAFT' } }));

        const loaded = loadToolSettings('watermark', defaults);
        expect(loaded.fontSize).toBe(48);
        expect(loaded.text).toBe('DRAFT');
    });

    it('ignores keys the tool does not declare', () => {
        const data = installStorage();
        data.set('pdfstudio:tool-settings:watermark',
            JSON.stringify({ version: 1, values: { text: 'DRAFT', removedField: 'x' } }));

        expect(loadToolSettings('watermark', defaults)).not.toHaveProperty('removedField');
    });

    it('discards settings stored under an older version', () => {
        const data = installStorage();
        data.set('pdfstudio:tool-settings:watermark',
            JSON.stringify({ version: 0, values: { text: 'DRAFT' } }));

        expect(loadToolSettings('watermark', defaults)).toEqual(defaults);
    });

    it('falls back to the defaults rather than throwing when storage is unavailable', () => {
        installStorage({
            getItem: () => { throw new Error('site data blocked'); },
            setItem: () => { throw new Error('site data blocked'); },
        });

        expect(loadToolSettings('watermark', defaults)).toEqual(defaults);
        expect(() => saveToolSettings('watermark', defaults)).not.toThrow();
        expect(() => clearToolSettings('watermark')).not.toThrow();
    });

    it('survives corrupt JSON', () => {
        const data = installStorage();
        data.set('pdfstudio:tool-settings:watermark', 'not json');
        expect(loadToolSettings('watermark', defaults)).toEqual(defaults);
    });

    it('forgets a tool on clear', () => {
        installStorage();
        saveToolSettings('watermark', { ...defaults, text: 'DRAFT' });
        clearToolSettings('watermark');
        expect(loadToolSettings('watermark', defaults)).toEqual(defaults);
    });
});
