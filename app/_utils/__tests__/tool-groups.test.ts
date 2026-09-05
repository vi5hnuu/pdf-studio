import { describe, expect, it } from 'vitest';
import { TOOL_GROUPS, groupTools, relatedTools } from '@/app/_utils/tool-groups';
import { toolsInfo } from '@/app/_utils/constants';

describe('tool grouping', () => {
    it('places every catalogued tool in exactly one group', () => {
        const grouped = TOOL_GROUPS.flatMap((group) => group.tools);
        const unique = new Set(grouped);

        expect(unique.size).toBe(grouped.length); // no tool in two groups
        // Every group entry resolves to a real catalogue row.
        for (const tool of grouped) expect(toolsInfo[tool]).toBeDefined();
    });

    it('returns the siblings of a tool, excluding itself', () => {
        const related = relatedTools('/tool/merge-pdf');

        expect(related.length).toBeGreaterThan(0);
        expect(related.some((t) => t.path === '/tool/merge-pdf')).toBe(false);
        expect(related.some((t) => t.path === '/tool/split-pdf')).toBe(true);
    });

    it('caps how many links a page shows', () => {
        expect(relatedTools('/tool/merge-pdf', 3).length).toBeLessThanOrEqual(3);
    });

    it('returns nothing for a path that is not a tool', () => {
        expect(relatedTools('/tool/not-a-real-tool')).toEqual([]);
    });

    it('gives the grid a non-empty list for each group', () => {
        for (const group of TOOL_GROUPS) {
            expect(groupTools(group.id).length).toBeGreaterThan(0);
        }
    });
});
