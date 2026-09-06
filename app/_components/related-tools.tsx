import Link from 'next/link';
import * as React from 'react';
import { relatedTools } from '@/app/_utils/tool-groups';

/**
 * Links to the other tools in this tool's group.
 *
 * Every tool page was previously a dead end — the only outbound link was the header logo —
 * so visitors who landed on one from search had no path to the rest of the site, and none
 * of the pages passed authority to each other.
 */
export function RelatedTools({ path }: { path: string }) {
    const related = relatedTools(path);
    if (related.length === 0) return null;

    return (
        <nav aria-label="Related tools">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">
                Related tools
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {related.map((tool) => (
                    <li key={tool.path}>
                        <Link
                            href={tool.path}
                            className="group flex items-center gap-3 rounded-sm border border-slate-100
                                       dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3
                                       hover:border-slate-300 dark:hover:border-slate-600
                                       hover:shadow-sm transition-all"
                        >
                            <span className={`w-8 h-8 rounded-sm ${tool.backgroundColor} flex items-center
                                              justify-center flex-shrink-0`}>
                                <img src={`/${tool.src}`} alt="" width={16} height={16} className="w-4 h-4" />
                            </span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200
                                             group-hover:text-blue-600 dark:group-hover:text-blue-400
                                             leading-tight">
                                {tool.title}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
