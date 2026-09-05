'use client';

import * as React from 'react';
import { SimpleToolPage } from '@/app/_components/simple-tool-page';
import { ToolsApi } from '@/app/_utils/api';

export default function Page() {
    return (
        <SimpleToolPage
            path="/tool/replace-pages"
            title="Replace Pages in a PDF"
            toolName="Replace Pages"
            subtitle="Replace a page range with the pages of another PDF"
            icon="replace-pages.svg"
            gradient="from-rose-600 to-rose-800"
            accent="bg-rose-700 hover:bg-rose-800"
            apiUrl={ToolsApi.replacePages}
            accept={['application/pdf']}
            secondFile={ { part: 'replacement', label: 'Now choose the PDF with the replacement pages', accept: ['application/pdf'] } }
            infoPart="replace-pages-info"
            nameable={true}
            outputExt="pdf"
            defaultOutName="replaced-pages"
            submitLabel="Replace Pages & Download"
            fields={[
                { name: 'from', label: 'Replace from page', type: 'number', default: 1, help: 'First page to replace (1-based).' },
                { name: 'to', label: 'Replace to page', type: 'number', default: 1, help: 'Last page to replace. Use the same value as from to replace a single page.' }
            ]}
            about="Swaps a range of pages in one PDF for the pages of another. The usual case is a corrected or newly signed page replacing the original: rather than splitting, deleting and merging, you nominate the range and supply the replacement."
            features={[
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Free and unlimited', description: 'No account, no watermark and no cap on how many files you process.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Private by design', description: 'Files are sent over HTTPS and removed from the server after processing.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Works in the browser', description: 'Nothing to install — it runs on desktop, tablet and phone alike.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Fast', description: 'Processing happens server-side and usually finishes in a few seconds.' }
            ]}
            faqs={[
                { q: 'Do the ranges have to be the same length?', a: 'No. The replacement document can have more or fewer pages than the range it replaces, and the document grows or shrinks accordingly.' },
                { q: 'Are page numbers 1-based?', a: 'Yes. Page 1 is the first page of the document.' },
                { q: 'How do I replace a single page?', a: 'Set both from and to to that page number.' },
                { q: 'What happens to the pages I replace?', a: 'They are removed from the output. The original file you uploaded is unchanged.' }
            ]}
        />
    );
}
