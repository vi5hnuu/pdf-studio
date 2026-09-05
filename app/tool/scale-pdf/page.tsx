'use client';

import * as React from 'react';
import { SimpleToolPage } from '@/app/_components/simple-tool-page';
import { ToolsApi } from '@/app/_utils/api';
import { PdfPagePreview } from '@/app/_components/pdf-page-preview';

export default function Page() {
    return (
        <SimpleToolPage
            path="/tool/scale-pdf"
            title="Scale PDF"
            toolName="Scale PDF"
            subtitle="Scale page size and content by a uniform factor"
            icon="scale-pdf.svg"
            gradient="from-indigo-600 to-indigo-800"
            accent="bg-indigo-700 hover:bg-indigo-800"
            apiUrl={ToolsApi.scalePdf}
            accept={['application/pdf']}
            infoPart="scale-pdf-info"
            nameable={false}
            outputExt="pdf"
            defaultOutName="scaled"
            submitLabel="Scale & Download"
            fields={[
                { name: 'scale', label: 'Scale factor', type: 'number', default: 1, help: '1 keeps the current size. 0.5 halves it; 2 doubles it.' }
            ]}
            about="Multiplies both the page dimensions and their content by a factor you choose. Unlike resizing to a preset, this keeps the aspect ratio exactly and works for any target, whether shrinking an oversized poster or enlarging a small document for easier reading."
            features={[
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Free and unlimited', description: 'No account, no watermark and no cap on how many files you process.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Private by design', description: 'Files are sent over HTTPS and removed from the server after processing.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Works in the browser', description: 'Nothing to install — it runs on desktop, tablet and phone alike.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Fast', description: 'Processing happens server-side and usually finishes in a few seconds.' }
            ]}
            faqs={[
                { q: 'What factor should I use?', a: '1 leaves the document unchanged. Use a value below 1 to shrink and above 1 to enlarge. 0.5 is half size and 2 is double.' },
                { q: 'Does scaling reduce quality?', a: 'No. The page content is vector-transformed rather than resampled, so text and vector graphics stay sharp at any factor.' },
                { q: 'Does the file size change?', a: 'Only marginally. Scaling changes coordinates, not the amount of data in the file.' },
                { q: 'How is this different from Resize Page?', a: 'Resize Page targets a named paper size; scaling applies a proportional factor to whatever size the pages already are.' }
            ]}
            renderPreview={(file, values) => (
                <PdfPagePreview
                    file={file}
                    transform={`scale(${Number(values.scale) || 1})`}
                    caption={`Pages and content at ${Math.round((Number(values.scale) || 1) * 100)}% of their current size`}
                />
            )}
        />
    );
}
