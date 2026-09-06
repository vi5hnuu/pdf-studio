import * as React from 'react';
import { toolMetadata } from '@/app/_utils/seo';

export const metadata = toolMetadata({
    path: '/tool/grayscale-pdf',
    title: 'Convert PDF to Grayscale Online — Free Black & White PDF',
    description: 'Convert any color PDF to black and white grayscale. Perfect for printing or reducing ink costs. Free, instant, no sign-up.',
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
