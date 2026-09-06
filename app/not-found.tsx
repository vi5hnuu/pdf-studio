import Link from 'next/link';

/** 404. Without this the app fell back to Next's unstyled default page. */
export default function NotFound() {
    return (
        <main className="min-h-dvh flex flex-col items-center justify-center gap-5 px-6 text-center
                         bg-slate-50 dark:bg-slate-900">
            <p className="text-6xl font-bold text-slate-300 dark:text-slate-700">404</p>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                We couldn&apos;t find that page
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                The tool you&apos;re looking for may have moved or been renamed.
            </p>
            <Link
                href="/"
                className="mt-2 rounded-sm bg-blue-600 px-5 py-2.5 text-sm font-medium text-white
                           hover:bg-blue-700 transition-colors"
            >
                Browse all tools
            </Link>
        </main>
    );
}
