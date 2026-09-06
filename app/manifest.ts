import { MetadataRoute } from 'next';

/** Web app manifest — lets the site be installed and pinned, and supplies the theme colour. */
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'PDF Studio — Free Online PDF Tools',
        short_name: 'PDF Studio',
        description:
            'Merge, split, compress, convert and protect PDF and image files in your browser. Free, no sign-up.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        icons: [
            { src: '/icon', sizes: '512x512', type: 'image/png' },
            { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
        ],
    };
}
