'use client';

import * as React from 'react';
import { SimpleToolPage } from '@/app/_components/simple-tool-page';
import { ToolsApi } from '@/app/_utils/api';

export default function Page() {
    return (
        <SimpleToolPage
            path="/tool/remove-metadata"
            title="Remove PDF Metadata"
            toolName="Remove Metadata"
            subtitle="Remove all document info and XMP metadata from a PDF"
            icon="remove-metadata.svg"
            gradient="from-slate-600 to-slate-800"
            accent="bg-slate-700 hover:bg-slate-800"
            apiUrl={ToolsApi.removeMetadata}
            accept={['application/pdf']}
            nameable={false}
            outputExt="pdf"
            defaultOutName="no-metadata"
            submitLabel="Remove Metadata & Download"
            about="Clears the author, title, subject, keywords, producer and creation dates from a PDF, along with its XMP metadata packet. PDFs routinely carry the name of whoever created them and the software used; this removes that before you share the file."
            features={[
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Free and unlimited', description: 'No account, no watermark and no cap on how many files you process.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Private by design', description: 'Files are sent over HTTPS and removed from the server after processing.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Works in the browser', description: 'Nothing to install — it runs on desktop, tablet and phone alike.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Fast', description: 'Processing happens server-side and usually finishes in a few seconds.' }
            ]}
            faqs={[
                { q: 'What metadata does a PDF contain?', a: 'Typically the author name, title, subject, keywords, the application that produced it, and creation and modification timestamps, plus an XMP packet that can hold considerably more.' },
                { q: 'Does this change how the document looks?', a: 'No. Metadata is separate from page content, so the document renders identically.' },
                { q: 'Can metadata be recovered afterwards?', a: 'Not from the downloaded file. The fields are cleared, not hidden.' },
                { q: 'What if I want to set metadata instead of clearing it?', a: 'Use the Edit Metadata tool, which lets you write specific values.' }
            ]}
        />
    );
}
