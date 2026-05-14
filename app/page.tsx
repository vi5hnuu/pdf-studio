import Link from "next/link";
import { toolsInfo } from "@/app/_utils/constants";
import AdUnit from "@/app/_components/ad-unit";
import { ToolsGrid } from "@/app/_components/tools-grid";

// ── Inline SVGs ──────────────────────────────────────────────────────────────
const LogoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="text-white">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
    </svg>
)

const ChevronRight = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
    </svg>
)

// ── Static data ───────────────────────────────────────────────────────────────
const features = [
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                className="text-blue-600">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        ),
        title: "100% Free Forever",
        description: "Every tool is completely free with no hidden fees, premium tiers, or usage limits.",
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                className="text-purple-600">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            </svg>
        ),
        title: "Privacy First",
        description: "Files are processed over HTTPS and automatically deleted from our servers after conversion.",
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                className="text-yellow-500">
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
        ),
        title: "Lightning Fast",
        description: "Optimised processing pipelines deliver results in seconds, not minutes.",
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                className="text-green-600">
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <path d="M8 21h8M12 17v4" />
            </svg>
        ),
        title: "Works Everywhere",
        description: "Accessible from any browser on desktop, tablet, or mobile — no app download needed.",
    },
]

const steps = [
    {
        num: "1",
        color: "from-blue-500 to-blue-600",
        title: "Upload Your File",
        description: "Drag and drop or click to select your PDF or image file from your device.",
    },
    {
        num: "2",
        color: "from-indigo-500 to-purple-600",
        title: "Customise Settings",
        description: "Configure the tool options to get exactly the output you need.",
    },
    {
        num: "3",
        color: "from-purple-500 to-pink-600",
        title: "Download the Result",
        description: "Process your file and download the result instantly — no waiting.",
    },
]

const faqs = [
    {
        q: "Is PDF Studio completely free?",
        a: "Yes. All 24 tools are 100% free with no hidden fees, no premium plans, and no usage limits.",
    },
    {
        q: "Do I need to create an account?",
        a: "No account or registration is required. You can use every tool instantly without signing up.",
    },
    {
        q: "Are my uploaded files secure?",
        a: "All file transfers are encrypted via HTTPS. Files are automatically deleted from our servers after processing.",
    },
    {
        q: "What PDF tools does PDF Studio offer?",
        a: "PDF Studio offers 24 tools across 5 categories — Organize: Merge, Split, Reorder, Delete Pages, Add Blank Pages, Remove Blank Pages, N-Up Layout. Convert: Image to PDF, PDF to JPG, Extract Text. Edit: Rotate, Crop, Page Numbers, Header & Footer, Watermark, Stamp, Grayscale, Edit Metadata, Flatten PDF. Optimize & Repair: Compress, Optimize, Repair. Security: Protect, Unlock.",
    },
    {
        q: "What file formats are supported?",
        a: "The tools primarily work with PDF files. Image to PDF accepts JPG, PNG, and other common formats. PDF to JPG exports pages as JPEG images.",
    },
    {
        q: "Is there a file size limit?",
        a: "We support most standard PDF files. Very large files may take slightly longer depending on your internet speed.",
    },
]

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
    return (
        <div className="min-h-screen bg-white flex flex-col">

            {/* ── STICKY HEADER ─────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                <LogoIcon />
                            </div>
                            <span className="font-bold text-lg text-slate-900 tracking-tight">PDF Studio</span>
                        </div>
                        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600">
                            <a href="#tools" className="hover:text-slate-900 transition-colors">Tools</a>
                            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
                            <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
                        </nav>
                        <a
                            href="#tools"
                            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
                        >
                            Get Started Free
                        </a>
                    </div>
                </div>
            </header>

            {/* ── HERO ──────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
                {/* subtle grid overlay */}
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)',
                        backgroundSize: '48px 48px',
                    }}
                />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/90 mb-6">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        Free to use &mdash; No account needed
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                        All Your PDF Tools&nbsp;&mdash;<br className="hidden sm:block" />
                        Free &amp; Instant
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8 leading-relaxed">
                        Merge, split, compress, watermark, and convert PDF files online. 24 powerful tools
                        across 5 categories — completely free, no sign-up.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <a
                            href="#tools"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl !bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-colors shadow-lg text-base"
                        >
                            Explore All Tools
                        </a>
                    </div>
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-blue-100 font-medium">
                        {['100% Free Forever', 'No Registration Required', 'Files Auto-Deleted', 'Works on All Devices'].map((t) => (
                            <span key={t} className="inline-flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><polyline points="20 6 9 17 4 12"/></svg>
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── AD BANNER (top) ────────────────────────────────────────── */}
            <div className="bg-slate-50 border-b border-slate-100">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    {/* Replace the slot value with your AdSense ad unit slot ID */}
                    <AdUnit slot="" format="horizontal" />
                </div>
            </div>

            {/* ── TOOLS SECTION ─────────────────────────────────────────── */}
            <section id="tools" className="py-16 md:py-20 bg-slate-50 scroll-mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                            24 Free PDF Tools
                        </h2>
                        <p className="text-slate-500 max-w-xl mx-auto text-base">
                            Filter by category or browse all — click any tool to start instantly.
                        </p>
                    </div>
                    <ToolsGrid />
                </div>
            </section>

            {/* ── AD (mid-page) ─────────────────────────────────────────── */}
            <div className="bg-slate-50 border-y border-slate-100">
                <div className="max-w-5xl mx-auto px-4 py-6">
                    {/* Replace the slot value with your AdSense ad unit slot ID */}
                    <AdUnit slot="" format="rectangle" />
                </div>
            </div>

            {/* ── FEATURES ──────────────────────────────────────────────── */}
            <section id="features" className="py-16 md:py-20 bg-white scroll-mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                            Why Choose PDF Studio?
                        </h2>
                        <p className="text-slate-500 max-w-xl mx-auto text-base">
                            Built for simplicity, speed, and privacy
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="text-center">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 mb-4">
                                    {f.icon}
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-2 text-base">{f.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
            <section className="py-16 md:py-20 bg-slate-50 border-y border-slate-100">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-slate-500 max-w-xl mx-auto text-base">
                            Edit your PDFs in three simple steps
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((step, i) => (
                            <div key={i} className="relative flex flex-col items-center text-center">
                                <div
                                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} text-white text-2xl font-extrabold flex items-center justify-center mb-4 shadow-md`}
                                >
                                    {step.num}
                                </div>
                                {/* connector line */}
                                {i < steps.length - 1 && (
                                    <div
                                        aria-hidden
                                        className="hidden md:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-slate-200"
                                    />
                                )}
                                <h3 className="font-semibold text-slate-900 mb-2 text-base">{step.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ───────────────────────────────────────────────────── */}
            <section id="faq" className="py-16 md:py-20 bg-white scroll-mt-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                            Frequently Asked Questions
                        </h2>
                    </div>
                    <dl className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                        {faqs.map((faq, i) => (
                            <details key={i} className="group bg-white">
                                <summary className="flex items-center justify-between gap-4 cursor-pointer px-6 py-4 font-semibold text-slate-900 select-none list-none hover:bg-slate-50 transition-colors text-base">
                                    <dt>{faq.q}</dt>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        className="flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                                    >
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </summary>
                                <dd className="px-6 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-50">
                                    <div className="pt-3">{faq.a}</div>
                                </dd>
                            </details>
                        ))}
                    </dl>
                </div>
            </section>

            {/* ── AD (bottom) ───────────────────────────────────────────── */}
            <div className="bg-slate-50 border-y border-slate-100">
                <div className="max-w-5xl mx-auto px-4 py-6">
                    {/* Replace the slot value with your AdSense ad unit slot ID */}
                    <AdUnit slot="" format="horizontal" />
                </div>
            </div>

            {/* ── FOOTER ────────────────────────────────────────────────── */}
            <footer className="bg-slate-900 text-slate-400">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                    <LogoIcon />
                                </div>
                                <span className="font-bold text-white text-base">PDF Studio</span>
                            </div>
                            <p className="text-sm leading-relaxed">
                                Free online PDF tools for everyone. No sign-up, no limits — edit, convert, and
                                manage your PDFs instantly.
                            </p>
                        </div>

                        {/* Tools — spans 2 of 4 columns, grouped by category */}
                        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-6 text-sm">
                            {[
                                { label: "Organize", paths: ["/tool/merge-pdf","/tool/split-pdf","/tool/reorder-pdf","/tool/delete-pages","/tool/add-blank-pages","/tool/remove-blank-pages","/tool/n-up"] },
                                { label: "Convert", paths: ["/tool/image-to-pdf","/tool/pdf-to-jpg","/tool/extract-text"] },
                                { label: "Edit", paths: ["/tool/rotate-pdf","/tool/crop-pdf","/tool/page-numbers","/tool/header-footer","/tool/watermark-pdf","/tool/stamp-pdf","/tool/grayscale-pdf","/tool/edit-metadata","/tool/flatten-pdf"] },
                                { label: "Optimize", paths: ["/tool/compress-pdf","/tool/optimize-pdf","/tool/repair-pdf"] },
                                { label: "Security", paths: ["/tool/protect-pdf","/tool/unprotect-pdf"] },
                            ].map(({ label, paths }) => (
                                <div key={label}>
                                    <h5 className="font-semibold text-slate-400 text-xs uppercase tracking-wider mb-2">{label}</h5>
                                    <ul className="space-y-1.5">
                                        {paths.map((path) => {
                                            const t = Object.values(toolsInfo).find(ti => ti.path === path);
                                            return t ? (
                                                <li key={path}>
                                                    <Link href={path} className="hover:text-white transition-colors capitalize">
                                                        {t.title}
                                                    </Link>
                                                </li>
                                            ) : null;
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Legal / Info */}
                        <div>
                            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
                                Information
                            </h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a href="#features" className="hover:text-white transition-colors">
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a href="#faq" className="hover:text-white transition-colors">
                                        FAQ
                                    </a>
                                </li>
                                <li>
                                    <a href="#tools" className="hover:text-white transition-colors">
                                        All Tools
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                        <p>&copy; {new Date().getFullYear()} PDF Studio by Laxmi Solutions. All rights reserved.</p>
                        <p>Made with care &mdash; Free forever</p>
                    </div>
                </div>
            </footer>

        </div>
    )
}
