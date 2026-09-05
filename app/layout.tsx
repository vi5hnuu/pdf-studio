import { Inter } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import Script from "next/script";
import { Metadata, Viewport } from "next";
import { SITE_URL } from "@/app/_utils/config";
import { toolsInfo } from "@/app/_utils/constants";
import { ThemeToggle } from "@/app/_components/theme-provider";
import { DownloadToast } from "@/app/_components/download-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: 'PDF Studio — Free Online PDF Tools',
        template: '%s | PDF Studio',
    },
    description:
        'Free online PDF tools: merge, split, rotate, compress, protect and convert PDF and image files instantly. 36 tools, no sign-up required, 100% free.',
    keywords: [
        'PDF tools', 'merge PDF', 'split PDF', 'rotate PDF', 'compress PDF', 'protect PDF',
        'unlock PDF', 'PDF to JPG', 'PDF to Word', 'PDF to Excel', 'image to PDF',
        'reorder PDF', 'add page numbers', 'watermark PDF', 'redact PDF', 'crop PDF',
        'free PDF editor', 'online PDF tools', 'PDF converter', 'image compressor',
    ],
    authors: [{ name: 'Laxmi Solutions' }],
    creator: 'Laxmi Solutions',
    publisher: 'Laxmi Solutions',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: SITE_URL,
        siteName: 'PDF Studio',
        title: 'PDF Studio — Free Online PDF Tools',
        description:
            'Merge, split, rotate, compress, protect and convert PDFs online. 36 free tools — no sign-up required.',
        // og:image comes from app/opengraph-image.tsx (file convention).
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PDF Studio — Free Online PDF Tools',
        description:
            'Merge, split, rotate, compress, protect and convert PDFs online. 36 free tools — no sign-up required.',
    },
    // Only the homepage's canonical. Tool pages set their own via toolMetadata() — a
    // canonical declared here is inherited by every child route, which previously told
    // Google all 36 tool pages were duplicates of the homepage.
    alternates: {
        canonical: '/',
    },
    other: {
        'google-adsense-account': 'ca-pub-4715945578201106',
    },
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            url: SITE_URL,
            name: 'PDF Studio',
            description: 'Free online PDF tools for everyone',
            inLanguage: 'en-US',
        },
        {
            '@type': 'Organization',
            '@id': `${SITE_URL}/#organization`,
            name: 'Laxmi Solutions',
            url: SITE_URL,
        },
        {
            '@type': 'SoftwareApplication',
            '@id': `${SITE_URL}/#app`,
            name: 'PDF Studio',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Web',
            url: SITE_URL,
            description:
                'A free suite of online PDF tools including merge, split, rotate, protect, and convert.',
            offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
            },
            // Derived from the tool catalogue so it cannot drift out of date as tools are added.
            featureList: Object.values(toolsInfo).map((tool) => tool.title),
        },
    ],
}

/** Separate export in Next 14 — these are ignored if placed inside `metadata`. */
export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
    ],
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <head>
                {/* Anti-FOUC: apply theme before first paint */}
                <script dangerouslySetInnerHTML={{
                    __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
                }} />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className={inter.className}>
                <Script
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4715945578201106"
                    strategy="afterInteractive"
                    crossOrigin="anonymous"
                />
                <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
                {/* Confirms a download happened; browsers save silently. */}
                <DownloadToast />
                {/* Floating theme toggle */}
                <div className="fixed bottom-5 right-5 z-50">
                    <ThemeToggle />
                </div>
            </body>
        </html>
    )
}
