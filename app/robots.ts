import { MetadataRoute } from 'next'
import { SITE_URL } from '@/app/_utils/config'

/**
 * Generated so the sitemap URL always matches the deployed host.
 *
 * The static public/robots.txt pointed at pdf-studio-vi.onrender.com, a different host
 * from the one the pages were served on, so the sitemap it advertised was for another site.
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    }
}
