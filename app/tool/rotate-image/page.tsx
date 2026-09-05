'use client';

import * as React from 'react';
import { SimpleToolPage } from '@/app/_components/simple-tool-page';
import { ToolsApi } from '@/app/_utils/api';
import { ImagePreview } from '@/app/_components/image-preview';
import { drawRotated } from '@/app/_utils/image-ops';

export default function Page() {
    return (
        <SimpleToolPage
            path="/tool/rotate-image"
            title="Rotate an Image Online"
            toolName="Rotate Image"
            subtitle="Rotate an image by 90, 180 or 270 degrees"
            icon="rotate-image.svg"
            gradient="from-pink-500 to-pink-700"
            accent="bg-pink-600 hover:bg-pink-700"
            apiUrl={ToolsApi.rotateImage}
            accept={['image/jpeg','image/png','image/bmp','image/webp']}
            infoPart="rotate-image-info"
            nameable={true}
            outputExt="jpg"
            defaultOutName="rotated"
            submitLabel="Rotate & Download"
            fields={[
                { name: 'angle', label: 'Rotation', type: 'select', options: [{ value: '90', label: '90 degrees clockwise' }, { value: '180', label: '180 degrees' }, { value: '270', label: '270 degrees (90 counter-clockwise)' }], default: '90', help: 'Rotation applied to the whole image.' }
            ]}
            about="Turns an image by a quarter, half or three-quarter turn. Rotation in multiples of 90 degrees rearranges pixels rather than interpolating them, so nothing is blurred in the process."
            features={[
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Free and unlimited', description: 'No account, no watermark and no cap on how many files you process.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Private by design', description: 'Files are sent over HTTPS and removed from the server after processing.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Works in the browser', description: 'Nothing to install — it runs on desktop, tablet and phone alike.' },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Fast', description: 'Processing happens server-side and usually finishes in a few seconds.' }
            ]}
            faqs={[
                { q: 'Does rotating lose quality?', a: 'Rotation by a multiple of 90 degrees rearranges pixels without interpolating them, so there is no blurring. JPEG output is re-encoded at high quality.' },
                { q: 'Which formats are supported?', a: 'JPEG, PNG, BMP and WebP. JPEG inputs come back as JPEG; other formats come back as PNG so transparency is preserved.' },
                { q: 'Can I rotate by an arbitrary angle?', a: 'This tool handles 90, 180 and 270 degrees, which covers re-orienting a photo. Arbitrary angles would require cropping or padding the result.' },
                { q: 'Will the preview match the download?', a: 'Yes. The image is rotated as it is decoded, so what you see is what you get.' }
            ]}
            renderPreview={(file, values) => (
                <ImagePreview
                    file={file}
                    caption={`Rotated ${values.angle}\u00B0`}
                    draw={(canvas, image) => drawRotated(canvas, image, Number(values.angle) || 0)}
                />
            )}
        />
    );
}
