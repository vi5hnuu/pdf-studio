'use client';

import * as React from 'react';
import { SimpleToolPage } from '@/app/_components/simple-tool-page';
import { ToolsApi } from '@/app/_utils/api';

export default function Page() {
    return (
        <SimpleToolPage
            path="/tool/sanitize-pdf"
            title="Sanitize PDF"
            toolName="Sanitize PDF"
            subtitle="Strip JavaScript, embedded files and actions from a PDF"
            icon="sanitize-pdf.svg"
            gradient="from-green-600 to-green-800"
            accent="bg-green-700 hover:bg-green-800"
            apiUrl={ToolsApi.sanitizePdf}
            accept={['application/pdf']}
            nameable={false}
            outputExt="pdf"
            defaultOutName="sanitized"
            submitLabel="Sanitize & Download"
            about="Removes the parts of a PDF that can carry active content: embedded JavaScript, launch and URI actions, attached files, and document metadata. The visible pages are untouched — only the machinery around them is stripped. Useful before sharing a document from an untrusted source, or before archiving."
            features={[
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Free and unlimited', description: 'No account, no watermark and no cap on how many files you process.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Private by design', description: 'Files are sent over HTTPS and removed from the server after processing.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Works in the browser', description: 'Nothing to install — it runs on desktop, tablet and phone alike.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Fast', description: 'Processing happens server-side and usually finishes in a few seconds.' }
            ]}
            faqs={[
                { q: 'What exactly is removed?', a: 'Embedded JavaScript, open and launch actions, URI actions, file attachments and document metadata. Page content, text and images are left exactly as they were.' },
                { q: 'Will the document still look the same?', a: 'Yes. Sanitizing does not re-render or rasterize anything, so the pages appear identical.' },
                { q: 'Does this remove a password?', a: 'No. Use Unprotect PDF for that; sanitize works on an already-readable document.' },
                { q: 'Are form fields removed?', a: 'Interactive actions attached to fields are removed. To flatten the fields themselves into the page, use Flatten PDF.' }
            ]}
        />
    );
}
