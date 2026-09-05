'use client';

import * as React from 'react';
import { SimpleToolPage } from '@/app/_components/simple-tool-page';
import { ToolsApi } from '@/app/_utils/api';

export default function Page() {
    return (
        <SimpleToolPage
            path="/tool/border-image"
            title="Add a Border to an Image"
            toolName="Add Border"
            subtitle="Add a solid coloured border around an image"
            icon="border-image.svg"
            gradient="from-fuchsia-600 to-fuchsia-800"
            accent="bg-fuchsia-700 hover:bg-fuchsia-800"
            apiUrl={ToolsApi.borderImage}
            accept={['image/jpeg','image/png','image/bmp','image/webp']}
            infoPart="border-image-info"
            nameable={true}
            outputExt="jpg"
            defaultOutName="bordered"
            submitLabel="Add Border & Download"
            fields={[
                { name: 'width', label: 'Border width (px)', type: 'number', default: 20, help: 'Thickness of the border on every side.' },
                { name: 'r', label: 'Red (0-255)', type: 'number', default: 0 },
                { name: 'g', label: 'Green (0-255)', type: 'number', default: 0 },
                { name: 'b', label: 'Blue (0-255)', type: 'number', default: 0 }
            ]}
            about="Adds a solid frame of a chosen colour and thickness around an image. The border is added outside the original, so nothing is cropped: the canvas grows by the border width on each side."
            features={[
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Free and unlimited', description: 'No account, no watermark and no cap on how many files you process.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Private by design', description: 'Files are sent over HTTPS and removed from the server after processing.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Works in the browser', description: 'Nothing to install — it runs on desktop, tablet and phone alike.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Fast', description: 'Processing happens server-side and usually finishes in a few seconds.' }
            ]}
            faqs={[
                { q: 'Does the border crop my image?', a: 'No. The canvas is enlarged and the border drawn in the new area, so the original is fully preserved.' },
                { q: 'How do I choose a colour?', a: 'Set the red, green and blue channels from 0 to 255. All zeros is black; 255 in all three is white.' },
                { q: 'How much larger will the image be?', a: 'Twice the border width in each dimension. A 20px border adds 40px to the width and 40px to the height.' },
                { q: 'Which formats are supported?', a: 'JPEG, PNG, BMP and WebP. JPEG inputs return JPEG; other formats return PNG.' }
            ]}
        />
    );
}
