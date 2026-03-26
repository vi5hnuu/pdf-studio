import { MetadataRoute } from 'next'
import { BASE_URL } from '@/app/_utils/constants'

const tools = [
    'merge-pdf',
    'split-pdf',
    'rotate-pdf',
    'page-numbers',
    'protect-pdf',
    'unprotect-pdf',
    'image-to-pdf',
    'pdf-to-jpg',
    'reorder-pdf',
]

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        ...tools.map((tool) => ({
            url: `${BASE_URL}/tool/${tool}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        })),
    ]
}
