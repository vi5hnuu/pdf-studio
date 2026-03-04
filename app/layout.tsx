'use client'

import { Inter } from "next/font/google";
import "./globals.css";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v13-appRouter";

const inter = Inter({ subsets: ["latin"] });

//react-pdf
import { pdfjs } from 'react-pdf';
import Script from "next/script";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
).toString();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4715945578201106"
          strategy="afterInteractive"
          crossOrigin="anonymous"
      />
      <AppRouterCacheProvider>
        {children}
      </AppRouterCacheProvider>
      </body>
    </html>
  );
}
