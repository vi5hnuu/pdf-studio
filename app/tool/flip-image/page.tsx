'use client';

import * as React from 'react';
import { SimpleToolPage } from '@/app/_components/simple-tool-page';
import { ToolsApi } from '@/app/_utils/api';
import { ImagePreview } from '@/app/_components/image-preview';
import { drawFlipped } from '@/app/_utils/image-ops';

export default function Page() {
    return (
        <SimpleToolPage
            path="/tool/flip-image"
            title="Flip an Image Online"
            toolName="Flip Image"
            subtitle="Flip an image horizontally or vertically"
            icon="flip-image.svg"
            gradient="from-violet-600 to-violet-800"
            accent="bg-violet-700 hover:bg-violet-800"
            apiUrl={ToolsApi.flipImage}
            accept={['image/jpeg','image/png','image/bmp','image/webp']}
            infoPart="flip-image-info"
            nameable={true}
            outputExt="jpg"
            defaultOutName="flipped"
            submitLabel="Flip & Download"
            fields={[
                { name: 'direction', label: 'Direction', type: 'select', options: [{ value: 'HORIZONTAL', label: 'Horizontal (left to right)' }, { value: 'VERTICAL', label: 'Vertical (top to bottom)' }], default: 'HORIZONTAL', help: 'Axis to mirror the image across.' }
            ]}
            about="Mirrors an image across the horizontal or vertical axis. Horizontal flipping corrects selfies and front-camera photos, which many phones save reversed; vertical flipping is mostly used for reflections and transfer printing."
            features={[
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Free and unlimited', description: 'No account, no watermark and no cap on how many files you process.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Private by design', description: 'Files are sent over HTTPS and removed from the server after processing.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Works in the browser', description: 'Nothing to install — it runs on desktop, tablet and phone alike.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Fast', description: 'Processing happens server-side and usually finishes in a few seconds.' }
            ]}
            faqs={[
                { q: 'What is the difference between flipping and rotating?', a: 'Flipping mirrors the image, so text reads backwards. Rotating turns it while keeping text readable.' },
                { q: 'Does flipping lose quality?', a: 'No pixels are interpolated, they are reordered. JPEG output is re-encoded at high quality.' },
                { q: 'Which formats are supported?', a: 'JPEG, PNG, BMP and WebP. Transparency is preserved for formats that support it.' },
                { q: 'Why does my selfie look wrong until I flip it?', a: 'Many phones save the front-camera image mirrored relative to the preview. A horizontal flip restores what you saw.' }
            ]}
            renderPreview={(file, values) => (
                <ImagePreview
                    file={file}
                    caption={`Flipped ${String(values.direction).toLowerCase()}`}
                    draw={(canvas, image) => drawFlipped(canvas, image, String(values.direction))}
                />
            )}
        />
    );
}
