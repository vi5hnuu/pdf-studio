'use client';

import * as React from 'react';
import { SimpleToolPage } from '@/app/_components/simple-tool-page';
import { ToolsApi } from '@/app/_utils/api';

export default function Page() {
    return (
        <SimpleToolPage
            path="/tool/resize-page"
            title="Resize PDF Page Size"
            toolName="Resize Page"
            subtitle="Resize every page to A4, Letter or Legal"
            icon="resize-page.svg"
            gradient="from-sky-600 to-sky-800"
            accent="bg-sky-700 hover:bg-sky-800"
            apiUrl={ToolsApi.resizePage}
            accept={['application/pdf']}
            infoPart="resize-page-info"
            nameable={false}
            outputExt="pdf"
            defaultOutName="resized"
            submitLabel="Resize Pages & Download"
            fields={[
                { name: 'size', label: 'Target page size', type: 'select', options: [{ value: 'A4', label: 'A4 (210 x 297 mm)' }, { value: 'LETTER', label: 'Letter (8.5 x 11 in)' }, { value: 'LEGAL', label: 'Legal (8.5 x 14 in)' }], default: 'A4', help: 'Every page is resized to this standard.' }
            ]}
            about="Changes every page to a standard paper size so the document prints consistently. Handy when a PDF mixes page sizes, or when a document authored for Letter needs to print on A4 without the printer scaling it unpredictably."
            features={[
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Free and unlimited', description: 'No account, no watermark and no cap on how many files you process.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Private by design', description: 'Files are sent over HTTPS and removed from the server after processing.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Works in the browser', description: 'Nothing to install — it runs on desktop, tablet and phone alike.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Fast', description: 'Processing happens server-side and usually finishes in a few seconds.' }
            ]}
            faqs={[
                { q: 'Is the content scaled to fit?', a: 'Yes. The page box is set to the target size and the content is scaled to match, preserving the layout.' },
                { q: 'Which size should I choose?', a: 'A4 is standard outside North America; Letter is standard in the US and Canada. Legal is for longer documents such as contracts.' },
                { q: 'Will this fix a document with mixed page sizes?', a: 'Yes. Every page ends up the same size regardless of what it started as.' },
                { q: 'Does it change the aspect ratio?', a: 'Content is scaled uniformly, so proportions are kept. A differing aspect ratio results in margins rather than stretching.' }
            ]}
        />
    );
}
