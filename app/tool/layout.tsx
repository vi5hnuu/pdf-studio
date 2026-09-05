'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

const LogoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="text-white">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
    </svg>
)

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    const navigate = useRouter()

    return (
        <div className="flex flex-col min-h-dvh bg-slate-50 dark:bg-slate-900">
            {/* Slim top nav */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-40 flex-shrink-0 sticky top-0">
                <div className="px-4 sm:px-6">
                    <div className="flex h-12 items-center justify-between gap-4">
                        <button
                            onClick={() => navigate.back()}
                            className="group inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                className="group-hover:-translate-x-0.5 transition-transform">
                                <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
                            </svg>
                            <span>All Tools</span>
                        </button>
                        <Link href="/" className="flex items-center gap-1.5">
                            <div className="p-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md">
                                <LogoIcon />
                            </div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">PDF Studio</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Page content fills remaining height */}
            <main className="flex-1 flex flex-col">
                {children}
            </main>
        </div>
    )
}
