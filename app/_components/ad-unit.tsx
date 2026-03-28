'use client'

import { useEffect, useRef } from 'react'

interface AdUnitProps {
    slot: string
    format?: 'auto' | 'horizontal' | 'rectangle' | 'vertical'
    className?: string
}

export default function AdUnit({ slot, format = 'auto', className = '' }: AdUnitProps) {
    const insRef = useRef<HTMLModElement>(null)

    useEffect(() => {
        const ins = insRef.current
        if (!ins || ins.getAttribute('data-adsbygoogle-status')) return
        try {
            // @ts-ignore
            ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        } catch {
            // AdSense not loaded yet
        }
    }, [])

    if (!slot) return null

    return (
        <div className={`overflow-hidden ${className}`}>
            <p className="text-center text-xs text-slate-400 mb-1 tracking-wide uppercase">Advertisement</p>
            <ins
                ref={insRef}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-4715945578201106"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    )
}
