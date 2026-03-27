import * as React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Convert PDF to Grayscale Online — Free Black & White PDF',
    description: 'Convert any color PDF to black and white grayscale. Perfect for printing or reducing ink costs. Free, instant, no sign-up.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
