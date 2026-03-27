import * as React from 'react';

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
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5 text-blue-500">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export function ToolSeoSection({ about, features, faqs }: ToolSeoSectionProps) {
    return (
        <section className="mt-12 pt-10 border-t border-slate-100 space-y-10">
            {/* About */}
            <div>
                <h2 className="text-base font-semibold text-slate-800 mb-3">About this tool</h2>
                <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">{about}</p>
            </div>

            {/* Features */}
            <div>
                <h2 className="text-base font-semibold text-slate-800 mb-4">Key features</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <div className="mt-0.5 flex-shrink-0">{f.icon}</div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{f.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* FAQ */}
            <div>
                <h2 className="text-base font-semibold text-slate-800 mb-4">Frequently asked questions</h2>
                <dl className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                    {faqs.map((faq, i) => (
                        <details key={i} className="group bg-white">
                            <summary className="flex items-center justify-between gap-4 cursor-pointer px-5 py-3.5 font-medium text-slate-800 select-none list-none hover:bg-slate-50 transition-colors text-sm">
                                <dt>{faq.q}</dt>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    className="flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </summary>
                            <dd className="px-5 pb-4 pt-2 text-sm text-slate-500 leading-relaxed bg-slate-50/50">
                                {faq.a}
                            </dd>
                        </details>
                    ))}
                </dl>
            </div>
        </section>
    );
}
