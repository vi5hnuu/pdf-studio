'use client'

import { Inter } from "next/font/google";
import "./globals.css";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v13-appRouter";

const inter = Inter({ subsets: ["latin"] });

//react-pdf
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
).toString();

//copy to build
// import path from "path";
// import fs from 'node:fs'
//
// const pdfjsDistPath = path.dirname('package.json');
// const pdfWorkerPath = path.join(pdfjsDistPath, 'build', 'pdf.worker.js');
//
// fs.copyFileSync(pdfWorkerPath, './dist/pdf.worker.js');
//
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <AppRouterCacheProvider>
        {children}
      </AppRouterCacheProvider>
      </body>
    </html>
  );
}
