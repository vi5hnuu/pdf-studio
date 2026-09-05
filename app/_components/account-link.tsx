'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isSignedIn, onSessionChange } from '@/app/_utils/auth';
import { fetchBalance } from '@/app/_utils/credits';

/**
 * Header entry point to the account, showing the live credit balance.
 *
 * Without it the auth and credit pages existed but nothing linked to them, and a user had no
 * way to see what a paid tool was about to spend.
 */
export function AccountLink() {
    const [balance, setBalance] = useState<number | null>(null);
    const [signedIn, setSignedIn] = useState(false);

    useEffect(() => {
        let alive = true;
        const load = async () => {
            const next = await fetchBalance();
            if (alive) {
                setBalance(next);
                setSignedIn(isSignedIn());
            }
        };
        load();
        const stop = onSessionChange(load);
        return () => { alive = false; stop(); };
    }, []);

    return (
        <Link
            href="/account"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200
                       dark:border-slate-700 bg-white dark:bg-slate-800 pl-3 pr-3 py-1.5 text-sm
                       font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300
                       dark:hover:border-slate-600 transition-colors"
            aria-label={balance === null ? 'Your account' : `Your account — ${balance} credits`}
        >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" className="flex-shrink-0 text-slate-400">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
            </svg>
            {balance !== null && <span className="tabular-nums">{balance}</span>}
            <span className="hidden sm:inline text-slate-400 dark:text-slate-500">
                {signedIn ? 'Account' : 'Credits'}
            </span>
        </Link>
    );
}
