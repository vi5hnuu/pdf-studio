import { MetadataRoute } from 'next'
import { SITE_URL } from '@/app/_utils/config'
import { allToolPaths } from '@/app/_utils/seo'
import { TOOL_GROUPS, categoryPath } from '@/app/_utils/tool-groups'

/**
 * Generated from the tool catalogue rather than a hand-maintained list.
 *
 * The previous version listed 9 of the 36 tools — it had simply not been updated as tools
 * were added, so 27 pages were never submitted. Deriving it means that cannot recur.
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date()

    return [
        {
            url: SITE_URL,
            lastModified,
            changeFrequency: 'weekly',
            priority: 1,
        },
        ...TOOL_GROUPS.map((group) => ({
            url: `${SITE_URL}${categoryPath(group.id)}`,
            lastModified,
            changeFrequency: 'monthly' as const,
            priority: 0.9,
        })),
        ...allToolPaths().map((path) => ({
            url: `${SITE_URL}${path}`,
            lastModified,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        })),
    ]
}
