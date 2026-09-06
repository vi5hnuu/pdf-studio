'use client';

import * as React from 'react';
import { SimpleToolPage } from '@/app/_components/simple-tool-page';
import { ToolsApi } from '@/app/_utils/api';

export default function Page() {
    return (
        <SimpleToolPage
            path="/tool/extract-embedded-files"
            title="Extract PDF Attachments"
            toolName="Extract Attachments"
            subtitle="Extract file attachments embedded in a PDF"
            icon="extract-embedded-files.svg"
            gradient="from-lime-600 to-lime-800"
            accent="bg-lime-700 hover:bg-lime-800"
            apiUrl={ToolsApi.extractEmbeddedFiles}
            accept={['application/pdf']}
            nameable={false}
            outputExt="zip"
            defaultOutName="attachments"
            submitLabel="Extract Attachments & Download ZIP"
            about="A PDF can carry other files inside it: spreadsheets behind an invoice, source data behind a report, or the XML in a hybrid e-invoice. This pulls those attachments out and returns them in a ZIP."
            features={[
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Free and unlimited', description: 'No account, no watermark and no cap on how many files you process.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Private by design', description: 'Files are sent over HTTPS and removed from the server after processing.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Works in the browser', description: 'Nothing to install — it runs on desktop, tablet and phone alike.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Fast', description: 'Processing happens server-side and usually finishes in a few seconds.' }
            ]}
            faqs={[
                { q: 'What is a PDF attachment?', a: 'A complete file stored inside the PDF. It is separate from the visible pages and often goes unnoticed, since most viewers hide it in a side panel.' },
                { q: 'What if the PDF has no attachments?', a: 'The tool tells you so rather than returning an empty archive.' },
                { q: 'Is this the same as extracting images?', a: 'No. Images are page content; attachments are whole files deliberately embedded in the document.' },
                { q: 'Are attachments a security risk?', a: 'They can be, since an attachment is an ordinary file and can be anything. Use Sanitize PDF to remove them if you would rather not carry them.' }
            ]}
        />
    );
}
