import * as React from "react";
import { SiteHeader } from "@/app/_components/site-header";
import { SiteFooter } from "@/app/_components/site-footer";
import { ToolBreadcrumbs } from "@/app/_components/tool-breadcrumbs";

/**
 * Chrome shared by every tool page.
 *
 * This used to carry its own header whose only outbound control was an "All Tools" button
 * wired to `router.back()`. For a visitor arriving from search — the main audience for these
 * pages — that button led off the site entirely, and nothing else linked anywhere. It now
 * uses the same masthead and footer as the rest of the site.
 */
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex flex-col min-h-dvh bg-slate-50 dark:bg-slate-900">
            <SiteHeader />
            <ToolBreadcrumbs />
            <main className="flex-1 flex flex-col">{children}</main>
            <SiteFooter />
        </div>
    );
}
