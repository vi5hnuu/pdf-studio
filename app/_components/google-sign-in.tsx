'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GOOGLE_CLIENT_ID } from '@/app/_utils/config';
import { signInWithGoogle } from '@/app/_utils/auth';

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: Record<string, unknown>) => void;
                    renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
                };
            };
        };
    }
}

/**
 * "Continue with Google", matching the option the mobile app has always offered.
 *
 * Renders nothing until a web client id is configured: an unconfigured button could only ever
 * fail, and a sign-in option that does not work is worse than one that is absent.
 */
export function GoogleSignIn({ onError, next = '/' }: {
    onError?: (message: string) => void;
    /** Where to land after signing in. */
    next?: string;
}) {
    const router = useRouter();
    const holder = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID || !holder.current) return;

        let cancelled = false;

        const render = () => {
            if (cancelled || !window.google || !holder.current) return;
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: async (response: { credential?: string }) => {
                    if (!response.credential) return;
                    try {
                        await signInWithGoogle(response.credential);
                        router.push(next);
                        router.refresh();
                    } catch (error) {
                        onError?.((error as Error).message);
                    }
                },
            });
            window.google.accounts.id.renderButton(holder.current, {
                theme: 'outline', size: 'large', width: 320, text: 'continue_with',
            });
        };

        if (window.google) {
            render();
            return () => { cancelled = true; };
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.onload = render;
        document.head.appendChild(script);

        return () => { cancelled = true; };
    }, [router, next, onError]);

    if (!GOOGLE_CLIENT_ID) return null;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs text-slate-400 dark:text-slate-500">or</span>
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>
            <div ref={holder} className="flex justify-center" />
        </div>
    );
}
