'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';

export interface ImageViewInfo {
    className?: string;
    style?: React.CSSProperties;
    file: File;
}

export function ImageView({ file, className = '', style }: ImageViewInfo) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        const objectUrl = URL.createObjectURL(file);
        setUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    if (!url) return (
        <div className={`w-full h-full bg-slate-100 animate-pulse rounded-sm ${className}`} style={style} />
    );

    return (
        <img
            className={`w-full h-full object-cover ${className}`}
            src={url}
            alt={file.name}
            style={style}
        />
    );
}
