'use client';

import * as React from 'react';
import { SimpleToolPage } from '@/app/_components/simple-tool-page';
import { ToolsApi } from '@/app/_utils/api';

export default function Page() {
    return (
        <SimpleToolPage
            path="/tool/split-by-size"
            title="Split PDF by File Size"
            toolName="Split by Size"
            subtitle="Split a PDF into parts no larger than a chosen size"
            icon="split-by-size.svg"
            gradient="from-teal-600 to-teal-800"
            accent="bg-teal-700 hover:bg-teal-800"
            apiUrl={ToolsApi.splitBySize}
            accept={['application/pdf']}
            infoPart="split-by-size-info"
            nameable={true}
            outputExt="zip"
            defaultOutName="split-by-size"
            submitLabel="Split & Download ZIP"
            fields={[
                { name: 'max_size_mb', label: 'Maximum part size (MB)', type: 'number', default: 5, help: 'Each part will be at or below this size. Pages are packed in order.' }
            ]}
            about="Splits a PDF into several smaller PDFs, each no larger than the size you set. Pages are measured individually and packed in order, so reading order is preserved across the parts. Built for email attachment limits and upload caps that reject a single large file."
            features={[
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Free and unlimited', description: 'No account, no watermark and no cap on how many files you process.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Private by design', description: 'Files are sent over HTTPS and removed from the server after processing.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Works in the browser', description: 'Nothing to install — it runs on desktop, tablet and phone alike.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Fast', description: 'Processing happens server-side and usually finishes in a few seconds.' }
            ]}
            faqs={[
                { q: 'How are the parts named?', a: 'Each part is numbered in order inside the downloaded ZIP, so reading them in sequence is straightforward.' },
                { q: 'What if a single page is larger than the limit?', a: 'That page becomes its own part. A page cannot be divided, so the limit is a target that one oversized page may exceed.' },
                { q: 'Is page order preserved?', a: 'Yes. Pages are packed in their original order, so reading straight through the parts matches the original document.' },
                { q: 'How do I put the parts back together?', a: 'Use the Merge PDF tool and add the parts in order.' }
            ]}
            renderPreview={(file, values) => {
                const limitMb = Number(values.max_size_mb) || 1;
                const parts = Math.max(1, Math.ceil(file.size / (limitMb * 1024 * 1024)));
                return (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700
                                    bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm
                                    text-slate-600 dark:text-slate-300">
                        This {(file.size / (1024 * 1024)).toFixed(1)} MB file will split into
                        roughly <strong>{parts}</strong> part{parts === 1 ? '' : 's'} of up to{' '}
                        <strong>{limitMb} MB</strong>. Pages cannot be divided, so a single large
                        page may exceed the limit.
                    </div>
                );
            }}
        />
    );
}
