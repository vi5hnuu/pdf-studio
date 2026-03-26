import { Inter } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import Script from "next/script";
import { Metadata } from "next";
import { BASE_URL } from "@/app/_utils/constants";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: 'PDF Studio — Free Online PDF Tools',
        template: '%s | PDF Studio',
    },
    description:
        'Free online PDF tools: merge, split, rotate, protect, and convert PDF files instantly. No sign-up required. 9 powerful tools — 100% free.',
    keywords: [
        'PDF tools', 'merge PDF', 'split PDF', 'rotate PDF', 'protect PDF',
        'unlock PDF', 'PDF to JPG', 'image to PDF', 'reorder PDF', 'add page numbers',
        'free PDF editor', 'online PDF tools', 'PDF converter',
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
        url: BASE_URL,
        siteName: 'PDF Studio',
        title: 'PDF Studio — Free Online PDF Tools',
        description:
            'Merge, split, rotate, protect, and convert PDFs online. 9 free tools — no sign-up required.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'PDF Studio — Free Online PDF Tools',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PDF Studio — Free Online PDF Tools',
        description:
            'Merge, split, rotate, protect, and convert PDFs online. 9 free tools — no sign-up required.',
        images: ['/og-image.png'],
    },
    alternates: {
        canonical: BASE_URL,
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
            '@id': `${BASE_URL}/#website`,
            url: BASE_URL,
            name: 'PDF Studio',
            description: 'Free online PDF tools for everyone',
            inLanguage: 'en-US',
        },
        {
            '@type': 'Organization',
            '@id': `${BASE_URL}/#organization`,
            name: 'Laxmi Solutions',
            url: BASE_URL,
        },
        {
            '@type': 'SoftwareApplication',
            '@id': `${BASE_URL}/#app`,
            name: 'PDF Studio',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Web',
            url: BASE_URL,
            description:
                'A free suite of online PDF tools including merge, split, rotate, protect, and convert.',
            offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
            },
            featureList: [
                'Merge PDF files',
                'Split PDF files',
                'Rotate PDF pages',
                'Add page numbers',
                'Protect PDF with password',
                'Unlock PDF password',
                'Convert image to PDF',
                'Convert PDF to JPG',
                'Reorder PDF pages',
            ],
        },
    ],
}

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <head>
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
            </body>
        </html>
    )
}
