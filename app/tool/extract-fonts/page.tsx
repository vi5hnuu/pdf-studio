'use client';

import * as React from 'react';
import { SimpleToolPage } from '@/app/_components/simple-tool-page';
import { ToolsApi } from '@/app/_utils/api';

export default function Page() {
    return (
        <SimpleToolPage
            path="/tool/extract-fonts"
            title="Extract Fonts From PDF"
            toolName="Extract Fonts"
            subtitle="Extract embedded font programs from a PDF as a ZIP"
            icon="extract-fonts.svg"
            gradient="from-amber-600 to-amber-800"
            accent="bg-amber-700 hover:bg-amber-800"
            apiUrl={ToolsApi.extractFonts}
            accept={['application/pdf']}
            nameable={false}
            outputExt="zip"
            defaultOutName="extracted-fonts"
            submitLabel="Extract Fonts & Download ZIP"
            about="Extracts the font programs embedded in a PDF and returns them in a ZIP. Useful for identifying exactly which fonts a document uses, and for diagnosing rendering differences between machines."
            features={[
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Free and unlimited', description: 'No account, no watermark and no cap on how many files you process.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Private by design', description: 'Files are sent over HTTPS and removed from the server after processing.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Works in the browser', description: 'Nothing to install — it runs on desktop, tablet and phone alike.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Fast', description: 'Processing happens server-side and usually finishes in a few seconds.' }
            ]}
            faqs={[
                { q: 'Can I install and use the extracted fonts?', a: 'That depends entirely on the font licence. Extracting is a technical operation; whether you may install or redistribute the font is a separate legal question about that font.' },
                { q: 'Why are some fonts missing?', a: 'Only embedded fonts can be extracted. If a PDF references a font installed on the author machine without embedding it, there is nothing in the file to extract.' },
                { q: 'What about subsetted fonts?', a: 'Many PDFs embed only the glyphs actually used. Such a font extracts successfully but contains only that subset.' },
                { q: 'What format are they in?', a: 'They are written in the format embedded in the PDF, typically TrueType or Type 1.' }
            ]}
        />
    );
}
