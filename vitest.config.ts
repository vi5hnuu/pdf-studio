import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Unit tests for the pure logic the tool pages depend on — response filename parsing, the
 * tool grouping behind related links, and metadata generation. These are the pieces where a
 * silent regression is expensive: a wrong canonical or a mis-parsed filename is not visible
 * in the UI.
 */
export default defineConfig({
    test: {
        environment: 'node',
        include: ['app/**/__tests__/**/*.test.ts'],
    },
    resolve: {
        // Mirrors the "@/*" path alias in tsconfig.json.
        alias: { '@': path.resolve(__dirname, '.') },
    },
});
