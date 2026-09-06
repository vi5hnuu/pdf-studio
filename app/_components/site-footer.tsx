import Link from 'next/link';
import * as React from 'react';
import { TOOL_GROUPS, categoryPath } from '@/app/_utils/tool-groups';
import { toolsInfo } from '@/app/_utils/constants';

/**
 * The site footer.
 *
 * Tool pages ended at their FAQ with nothing below it, so every page was a leaf. Listing the
 * catalogue here gives a visitor who reached the bottom somewhere to go, and links every page
 * to every other one — which is what makes a tool site of this shape rank.
 */
export function SiteFooter() {
    return (
        <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-6">
                    {TOOL_GROUPS.map((group) => (
                        <div key={group.id}>
                            <h2 className="mb-2">
                                <Link href={categoryPath(group.id)}
                                      className="text-[11px] font-semibold uppercase tracking-wide
                                                 text-slate-400 dark:text-slate-500
                                                 hover:text-slate-700 dark:hover:text-slate-200
                                                 transition-colors">
                                    {group.label}
                                </Link>
                            </h2>
                            <ul className="space-y-1">
                                {group.tools.map((tool) => {
                                    const info = toolsInfo[tool];
                                    if (!info) return null;
                                    return (
                                        <li key={info.path}>
                                            <Link href={info.path}
                                                  className="text-xs text-slate-500 dark:text-slate-400
                                                             hover:text-slate-900 dark:hover:text-slate-100
                                                             transition-colors">
                                                {info.title}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-700
                                flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        &copy; {new Date().getFullYear()} PDF Studio
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 sm:ml-auto">
                        Files are sent over HTTPS and deleted after processing.
                    </p>
                </div>
            </div>
        </footer>
    );
}
