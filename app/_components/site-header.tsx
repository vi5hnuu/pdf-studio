'use client';

import Link from 'next/link';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { AccountLink } from '@/app/_components/account-link';
import { ThemeToggle } from '@/app/_components/theme-provider';
import { TOOL_GROUPS, categoryPath } from '@/app/_utils/tool-groups';
import { toolsInfo } from '@/app/_utils/constants';

const LogoMark = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
         className="text-white">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
    </svg>
);

/**
 * The site header, shared by every page.
 *
 * There was no site-wide navigation: the home page carried its own anchor links and each tool
 * page had a lone "All Tools" button wired to `router.back()`. Anyone arriving on a tool from
 * search — which is most of the traffic these pages are built for — had no way to reach the
 * rest of the site, and pressing that button took them off it entirely. This gives every page
 * the same masthead, with the full tool catalogue one hover away.
 */
export function SiteHeader() {
    const [openMenu, setOpenMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on outside click and on Escape, so the panel never strands the keyboard user.
    useEffect(() => {
        if (!openMenu) return;
        const onPointer = (event: PointerEvent) => {
            if (!menuRef.current?.contains(event.target as Node)) setOpenMenu(false);
        };
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpenMenu(false);
        };
        window.addEventListener('pointerdown', onPointer);
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('pointerdown', onPointer);
            window.removeEventListener('keydown', onKey);
        };
    }, [openMenu]);

    return (
        <header className="sticky top-0 z-40 flex-shrink-0 bg-white dark:bg-slate-800
                           border-b border-slate-200 dark:border-slate-700">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="flex h-11 items-center gap-4">
                    <Link href="/" className="flex items-center gap-1.5 flex-shrink-0"
                          aria-label="PDF Studio home">
                        <span className="p-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-sm">
                            <LogoMark />
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
                            PDF Studio
                        </span>
                    </Link>

                    <nav aria-label="Main" className="flex items-center gap-1 text-sm">
                        <div className="relative" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setOpenMenu((open) => !open)}
                                aria-expanded={openMenu}
                                aria-haspopup="true"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-sm font-medium
                                           text-slate-600 dark:text-slate-300 hover:text-slate-900
                                           dark:hover:text-slate-100 hover:bg-slate-100
                                           dark:hover:bg-slate-700 transition-colors"
                            >
                                Tools
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="2.5" aria-hidden="true"
                                     className={openMenu ? 'rotate-180 transition-transform' : 'transition-transform'}>
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>

                            {openMenu && (
                                <div className="absolute left-0 top-full mt-1 w-[min(90vw,52rem)] max-h-[70vh]
                                                overflow-auto rounded-sm border border-slate-200 dark:border-slate-700
                                                bg-white dark:bg-slate-800 shadow-lg p-3
                                                grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                                    {TOOL_GROUPS.map((group) => (
                                        <div key={group.id}>
                                            <Link
                                                href={categoryPath(group.id)}
                                                onClick={() => setOpenMenu(false)}
                                                className="block px-1 pb-1 text-[11px] font-semibold uppercase
                                                           tracking-wide text-slate-400 dark:text-slate-500
                                                           hover:text-slate-700 dark:hover:text-slate-200
                                                           transition-colors"
                                            >
                                                {group.label}
                                            </Link>
                                            <ul>
                                                {group.tools.map((tool) => {
                                                    const info = toolsInfo[tool];
                                                    if (!info) return null;
                                                    return (
                                                        <li key={info.path}>
                                                            <Link
                                                                href={info.path}
                                                                onClick={() => setOpenMenu(false)}
                                                                className="block px-1 py-0.5 rounded-sm text-xs
                                                                           text-slate-600 dark:text-slate-300
                                                                           hover:text-slate-900 dark:hover:text-slate-100
                                                                           hover:bg-slate-100 dark:hover:bg-slate-700
                                                                           transition-colors"
                                                            >
                                                                {info.title}
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link href="/#features"
                              className="hidden sm:inline-block px-2 py-1 rounded-sm font-medium
                                         text-slate-600 dark:text-slate-300 hover:text-slate-900
                                         dark:hover:text-slate-100 hover:bg-slate-100
                                         dark:hover:bg-slate-700 transition-colors">
                            Features
                        </Link>
                        <Link href="/#faq"
                              className="hidden sm:inline-block px-2 py-1 rounded-sm font-medium
                                         text-slate-600 dark:text-slate-300 hover:text-slate-900
                                         dark:hover:text-slate-100 hover:bg-slate-100
                                         dark:hover:bg-slate-700 transition-colors">
                            FAQ
                        </Link>
                    </nav>

                    <div className="ml-auto flex items-center gap-2">
                        <AccountLink />
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
}
