'use client';

import * as React from 'react';
import { SimpleToolPage } from '@/app/_components/simple-tool-page';
import { ToolsApi } from '@/app/_utils/api';

export default function Page() {
    return (
        <SimpleToolPage
            path="/tool/extract-images"
            title="Extract Images From PDF"
            toolName="Extract Images"
            subtitle="Extract every embedded image from a PDF as a ZIP"
            icon="extract-images.svg"
            gradient="from-orange-600 to-orange-800"
            accent="bg-orange-700 hover:bg-orange-800"
            apiUrl={ToolsApi.extractImages}
            accept={['application/pdf']}
            nameable={false}
            outputExt="zip"
            defaultOutName="extracted-images"
            submitLabel="Extract Images & Download ZIP"
            about="Pulls the embedded image objects out of a PDF and returns them in a ZIP. These are the original images as stored in the file, not screenshots of the pages, so they come out at their full embedded resolution."
            features={[
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Free and unlimited', description: 'No account, no watermark and no cap on how many files you process.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Private by design', description: 'Files are sent over HTTPS and removed from the server after processing.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Works in the browser', description: 'Nothing to install — it runs on desktop, tablet and phone alike.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Fast', description: 'Processing happens server-side and usually finishes in a few seconds.' }
            ]}
            faqs={[
                { q: 'Are the images full quality?', a: 'Yes. The embedded image data is extracted as stored, so there is no re-encoding or loss.' },
                { q: 'Why did I get fewer images than I expected?', a: 'Vector graphics and text are not images, and only raster objects are extracted. A page that looks image-heavy may be drawn with vectors.' },
                { q: 'How is this different from PDF to JPG?', a: 'PDF to JPG renders each page as a picture. This extracts the images that were embedded inside the pages.' },
                { q: 'What format are the extracted images in?', a: 'Each is written in the format it was stored in, typically JPEG or PNG.' }
            ]}
        />
    );
}
