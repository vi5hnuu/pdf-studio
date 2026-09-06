import * as React from 'react';
import { JsonLd, faqJsonLd, toolJsonLd } from '@/app/_utils/seo';
import { RelatedTools } from '@/app/_components/related-tools';

interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
}

interface FAQ {
    q: string;
    a: string;
}

interface ToolSeoSectionProps {
    about: string;
    features: Feature[];
    faqs: FAQ[];
    color?: string; // Tailwind ring/border color class
    /**
     * Route and name of the tool this section describes. Supplying them emits FAQPage,
     * SoftwareApplication and BreadcrumbList structured data alongside the visible copy —
     * the FAQs were already written, they were simply invisible to search engines.
     */
    toolPath?: string;
    toolName?: string;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5 text-blue-500">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export function ToolSeoSection({ about, features, faqs, toolPath, toolName }: ToolSeoSectionProps) {
    return (
        <section className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-700 space-y-10">
            {/* Structured data: makes the FAQ below eligible for a rich result. */}
            {faqs.length > 0 && <JsonLd data={faqJsonLd(faqs)} />}
            {toolPath && toolName && (
                <JsonLd data={toolJsonLd({ path: toolPath, name: toolName, description: about })} />
            )}
            {/* About */}
            <div>
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3">About this tool</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">{about}</p>
            </div>

            {/* Features */}
            <div>
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">Key features</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-sm p-4 border border-slate-100 dark:border-slate-700">
                            <div className="mt-0.5 flex-shrink-0">{f.icon}</div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{f.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{f.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* FAQ */}
            <div>
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">Frequently asked questions</h2>
                <dl className="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-100 dark:border-slate-700 rounded-sm overflow-hidden">
                    {faqs.map((faq, i) => (
                        <details key={i} className="group bg-white dark:bg-slate-800">
                            <summary className="flex items-center justify-between gap-4 cursor-pointer px-5 py-3.5 font-medium text-slate-800 dark:text-slate-100 select-none list-none hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm">
                                <dt>{faq.q}</dt>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    className="flex-shrink-0 text-slate-400 dark:text-slate-500 transition-transform group-open:rotate-180">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </summary>
                            <dd className="px-5 pb-4 pt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-700/30">
                                {faq.a}
                            </dd>
                        </details>
                    ))}
                </dl>
            </div>

            {/* Somewhere to go next, and internal links between sibling tools. */}
            {toolPath && <RelatedTools path={toolPath} />}
        </section>
    );
}
