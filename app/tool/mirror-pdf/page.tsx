'use client';

import * as React from 'react';
import { SimpleToolPage } from '@/app/_components/simple-tool-page';
import { ToolsApi } from '@/app/_utils/api';
import { PdfPagePreview } from '@/app/_components/pdf-page-preview';

export default function Page() {
    return (
        <SimpleToolPage
            path="/tool/mirror-pdf"
            title="Mirror PDF Pages"
            toolName="Mirror PDF"
            subtitle="Flip PDF pages horizontally or vertically"
            icon="mirror-pdf.svg"
            gradient="from-cyan-600 to-cyan-800"
            accent="bg-cyan-700 hover:bg-cyan-800"
            apiUrl={ToolsApi.mirrorPdf}
            accept={['application/pdf']}
            infoPart="mirror-pdf-info"
            nameable={false}
            outputExt="pdf"
            defaultOutName="mirrored"
            submitLabel="Mirror Pages & Download"
            fields={[
                { name: 'direction', label: 'Direction', type: 'select', options: [{ value: 'HORIZONTAL', label: 'Horizontal (left to right)' }, { value: 'VERTICAL', label: 'Vertical (top to bottom)' }], default: 'HORIZONTAL', help: 'Which axis to flip the pages across.' }
            ]}
            about="Flips every page across the horizontal or vertical axis. Useful for correcting pages that were scanned mirrored, and for preparing artwork for transfer printing, where the image has to be reversed before it is applied."
            features={[
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Free and unlimited', description: 'No account, no watermark and no cap on how many files you process.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Private by design', description: 'Files are sent over HTTPS and removed from the server after processing.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Works in the browser', description: 'Nothing to install — it runs on desktop, tablet and phone alike.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Fast', description: 'Processing happens server-side and usually finishes in a few seconds.' }
            ]}
            faqs={[
                { q: 'Does this rotate the pages?', a: 'No. Rotating turns a page; mirroring reflects it, so text reads backwards. Use Rotate PDF if you want to turn pages instead.' },
                { q: 'Will the text still be selectable?', a: 'The page content is transformed rather than rasterized, so the text layer is preserved.' },
                { q: 'Can I mirror only some pages?', a: 'This tool mirrors every page. To work on a subset, split the document first, mirror the part you need, then merge.' },
                { q: 'Which direction should I pick for transfer printing?', a: 'Horizontal, since it reverses left and right, which is what iron-on and screen transfers require.' }
            ]}
            renderPreview={(file, values) => (
                <PdfPagePreview
                    file={file}
                    transform={values.direction === 'VERTICAL' ? 'scaleY(-1)' : 'scaleX(-1)'}
                    caption={`Every page flipped ${String(values.direction).toLowerCase()}`}
                />
            )}
        />
    );
}
