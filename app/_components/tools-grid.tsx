"use client";

import { useState } from "react";
import Link from "next/link";
import { Tool, toolsInfo } from "@/app/_utils/constants";
import { groupTools } from '@/app/_utils/tool-groups';

// ─── Group definitions ────────────────────────────────────────────────────────
const GROUPS = [
    {
        id: "organize",
        label: "Organize",
        description: "Structure, rearrange, and clean up your PDF pages",
        tools: groupTools("organize"),
        chipIdle: "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100",
        chipActive: "bg-blue-600 text-white border-blue-600 shadow-sm",
        headingText: "text-blue-700",
        headingBorder: "border-blue-500",
        badge: "bg-blue-100 text-blue-700",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="4" rx="1"/><rect x="2" y="10" width="20" height="4" rx="1"/><rect x="2" y="17" width="20" height="4" rx="1"/>
            </svg>
        ),
    },
    {
        id: "convert",
        label: "Convert",
        description: "Transform PDFs to and from other formats",
        tools: groupTools("convert"),
        chipIdle: "border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100",
        chipActive: "bg-amber-500 text-white border-amber-500 shadow-sm",
        headingText: "text-amber-700",
        headingBorder: "border-amber-500",
        badge: "bg-amber-100 text-amber-700",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
        ),
    },
    {
        id: "edit",
        label: "Edit",
        description: "Add, adjust, and annotate page content",
        tools: groupTools("edit"),
        chipIdle: "border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100",
        chipActive: "bg-violet-600 text-white border-violet-600 shadow-sm",
        headingText: "text-violet-700",
        headingBorder: "border-violet-500",
        badge: "bg-violet-100 text-violet-700",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
        ),
    },
    {
        id: "optimize",
        label: "Optimize & Repair",
        description: "Reduce size, clean structure, and fix broken files",
        tools: groupTools("optimize"),
        chipIdle: "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100",
        chipActive: "bg-emerald-600 text-white border-emerald-600 shadow-sm",
        headingText: "text-emerald-700",
        headingBorder: "border-emerald-500",
        badge: "bg-emerald-100 text-emerald-700",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
        ),
    },
    {
        id: "security",
        label: "Security",
        description: "Protect with passwords or remove restrictions",
        tools: groupTools("security"),
        chipIdle: "border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100",
        chipActive: "bg-rose-600 text-white border-rose-600 shadow-sm",
        headingText: "text-rose-700",
        headingBorder: "border-rose-500",
        badge: "bg-rose-100 text-rose-700",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
            </svg>
        ),
    },
    {
        id: "image",
        label: "Image Tools",
        description: "Compress, convert, resize, and filter images",
        tools: groupTools("image"),
        chipIdle: "border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100",
        chipActive: "bg-purple-600 text-white border-purple-600 shadow-sm",
        headingText: "text-purple-700",
        headingBorder: "border-purple-500",
        badge: "bg-purple-100 text-purple-700",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
            </svg>
        ),
    },
] as const;

type GroupId = typeof GROUPS[number]["id"] | "all";

// ─── Tool card ────────────────────────────────────────────────────────────────
function ToolCard({ tool }: { tool: typeof toolsInfo[keyof typeof toolsInfo] }) {
    return (
        <Link
            href={tool.path}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-xs hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200"
        >
            <div className={`${tool.backgroundColor} w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm`}>
                <img src={`/${tool.src}`} alt="" width={18} height={18} className="w-[18px] h-[18px]" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight capitalize">
                    {tool.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug line-clamp-1">
                    {tool.description}
                </p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="flex-shrink-0 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all">
                <path d="m9 18 6-6-6-6" />
            </svg>
        </Link>
    );
}

// ─── Group section ────────────────────────────────────────────────────────────
function GroupSection({ group }: { group: typeof GROUPS[number] }) {
    return (
        <div className="space-y-4">
            {/* Group heading */}
            <div className={`flex items-center gap-3 border-l-4 ${group.headingBorder} pl-3`}>
                <span className={`flex items-center gap-1.5 text-sm font-bold ${group.headingText} uppercase tracking-wide`}>
                    <span className={group.headingText}>{group.icon}</span>
                    {group.label}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${group.badge}`}>
                    {group.tools.length}
                </span>
                <p className="text-xs text-slate-400 hidden sm:block">{group.description}</p>
            </div>
            {/* Tool grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {group.tools.map((toolKey) => (
                    <ToolCard key={toolKey} tool={toolsInfo[toolKey]} />
                ))}
            </div>
        </div>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function ToolsGrid() {
    const [active, setActive] = useState<GroupId>("all");
    const [query, setQuery] = useState("");
    const totalCount = GROUPS.reduce((s, g) => s + g.tools.length, 0);
    const activeGroup = active === "all" ? null : GROUPS.find(g => g.id === active) ?? null;

    // With more than fifty tools, category chips alone mean scanning several screens to find
    // one you can already name. The mobile app has always had a tool search; this is the
    // same thing. Matching covers the title and the description, so "shrink" finds Compress.
    const searching = query.trim().length > 0;
    const matches = searching
        ? Object.values(toolsInfo).filter((tool) => {
              const needle = query.trim().toLowerCase();
              return tool.title.toLowerCase().includes(needle)
                  || tool.description.toLowerCase().includes(needle)
                  || tool.path.toLowerCase().includes(needle);
          })
        : [];

    return (
        <div className="space-y-8">
            {/* Search */}
            <div className="relative">
                <label htmlFor="tool-search" className="sr-only">Search tools</label>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                     className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
                <input
                    id="tool-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Search ${totalCount} tools — try "compress", "merge", "sign"`}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700
                               bg-white dark:bg-slate-800 dark:text-slate-100 pl-11 pr-4 py-3 text-sm
                               outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                               dark:focus:ring-blue-900"
                />
            </div>

            {searching ? (
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {matches.length === 0
                            ? `No tools match “${query.trim()}”.`
                            : `${matches.length} tool${matches.length === 1 ? "" : "s"} matching “${query.trim()}”`}
                    </p>
                    {matches.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                            {matches.map((tool) => <ToolCard key={tool.path} tool={tool} />)}
                        </div>
                    )}
                </div>
            ) : (
            <>
            {/* Filter chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {/* All chip */}
                <button
                    onClick={() => setActive("all")}
                    className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-sm font-medium transition-all ${
                        active === "all"
                            ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                            : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                    }`}
                >
                    All
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${active === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                        {totalCount}
                    </span>
                </button>

                {GROUPS.map((g) => (
                    <button
                        key={g.id}
                        onClick={() => setActive(g.id)}
                        className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-sm font-medium transition-all ${
                            active === g.id ? g.chipActive : g.chipIdle
                        }`}
                    >
                        {g.icon}
                        {g.label}
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                            active === g.id ? "bg-white/25 text-current" : "bg-white/70 text-current opacity-70"
                        }`}>
                            {g.tools.length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tool groups */}
            {activeGroup ? (
                <GroupSection group={activeGroup} />
            ) : (
                <div className="space-y-10">
                    {GROUPS.map((g) => (
                        <GroupSection key={g.id} group={g} />
                    ))}
                </div>
            )}
            </>
            )}
        </div>
    );
}
