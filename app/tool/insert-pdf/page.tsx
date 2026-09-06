'use client';

import * as React from 'react';
import { SimpleToolPage } from '@/app/_components/simple-tool-page';
import { ToolsApi } from '@/app/_utils/api';

export default function Page() {
    return (
        <SimpleToolPage
            path="/tool/insert-pdf"
            title="Insert One PDF Into Another"
            toolName="Insert PDF"
            subtitle="Insert one PDF into another after a chosen page"
            icon="insert-pdf.svg"
            gradient="from-purple-600 to-purple-800"
            accent="bg-purple-700 hover:bg-purple-800"
            apiUrl={ToolsApi.insertPdf}
            accept={['application/pdf']}
            secondFile={ { part: 'insert', label: 'Now choose the PDF to insert', accept: ['application/pdf'] } }
            infoPart="insert-pdf-info"
            nameable={true}
            outputExt="pdf"
            defaultOutName="inserted"
            submitLabel="Insert & Download"
            pagePicker={{
                field: 'after_page',
                mode: 'single',
                // The endpoint indexes pages from 0 here, with -1 meaning "at the very
                // beginning" — which is what an empty selection leaves it as.
                zeroBased: true,
                label: 'Insert after which page?',
                hint: 'Click the page the inserted document should follow. Select nothing to insert at the very beginning.',
            }}
            about="Places the whole of a second PDF into the first, immediately after a page you nominate. Unlike merging, which only appends, this puts the new pages exactly where they belong, which is what you want when adding a signed page or an appendix into the middle of a document."
            features={[
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Free and unlimited', description: 'No account, no watermark and no cap on how many files you process.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Private by design', description: 'Files are sent over HTTPS and removed from the server after processing.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Works in the browser', description: 'Nothing to install — it runs on desktop, tablet and phone alike.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Fast', description: 'Processing happens server-side and usually finishes in a few seconds.' }
            ]}
            faqs={[
                { q: 'How is this different from merging?', a: 'Merging joins documents end to end. Inserting puts one document inside another at a specific position.' },
                { q: 'How do I insert at the very start?', a: 'Leave the page selection empty — with no page chosen, the document is inserted before the first page.' },
                { q: 'Is the whole second document inserted?', a: 'Yes, all of its pages, in order. To insert only part of it, split that document first.' },
                { q: 'Are bookmarks and links preserved?', a: 'Page content is preserved. Complex interactive features may not carry across, so flatten the source first if that matters.' }
            ]}
        />
    );
}
