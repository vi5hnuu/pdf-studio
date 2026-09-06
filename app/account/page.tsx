'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
    AuthUser, currentUser, isSignedIn, onSessionChange, sessionKind, signOut,
} from '@/app/_utils/auth';
import {
    LedgerEntry, claimDaily, describeReason, fetchBalance, fetchLedger,
} from '@/app/_utils/credits';

/**
 * Credits, history and account actions.
 *
 * Reachable as a guest too: a guest has a real balance and can earn more, so sending them to
 * a sign-in wall first would hide the thing they came to look at.
 */
export default function AccountPage() {
    const router = useRouter();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [signedIn, setSignedIn] = useState(false);
    const [balance, setBalance] = useState<number | null>(null);
    const [ledger, setLedger] = useState<LedgerEntry[]>([]);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);

    const load = useCallback(async () => {
        setSignedIn(isSignedIn());
        const [nextBalance, nextLedger, profile] = await Promise.all([
            fetchBalance(), fetchLedger(), currentUser(),
        ]);
        setBalance(nextBalance);
        setLedger(nextLedger);
        setUser(profile);
    }, []);

    useEffect(() => {
        load();
        return onSessionChange(load); // re-read after sign-out drops back to a guest
    }, [load]);

    async function onClaimDaily() {
        setBusy(true);
        setMessage(null);
        const result = await claimDaily();
        if (result.error) setMessage({ kind: 'error', text: result.error });
        else {
            setBalance(result.credits ?? balance);
            setMessage({ kind: 'success', text: 'Daily credits added.' });
            setLedger(await fetchLedger());
        }
        setBusy(false);
    }

    return (
        <main className="min-h-dvh bg-slate-50 dark:bg-slate-900">
            <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200
                               dark:border-slate-700">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 h-14">
                    <Link href="/" className="text-sm font-medium text-slate-500 dark:text-slate-400
                                              hover:text-slate-900 dark:hover:text-slate-100">
                        ← All tools
                    </Link>
                    <h1 className="font-bold text-slate-900 dark:text-slate-100">Your account</h1>
                    <div className="w-16" />
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {message && (
                    <div role="alert" className={`rounded-sm border px-4 py-3 text-sm ${
                        message.kind === 'error'
                            ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                            : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Balance */}
                <section className="rounded-sm border border-slate-200 dark:border-slate-700
                                    bg-white dark:bg-slate-800 p-5 sm:p-6">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Credit balance</p>
                    <p className="mt-1 text-4xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {balance ?? '—'}
                    </p>

                    <div className="mt-4">
                        <button
                            onClick={onClaimDaily}
                            disabled={busy}
                            className="w-full sm:w-auto px-4 py-2 rounded-sm bg-blue-600 hover:bg-blue-700
                                       text-white font-semibold text-sm disabled:opacity-50 transition-colors"
                        >
                            Claim daily credits
                        </button>
                        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                            Free credits refresh every day. The mobile app also earns credits by
                            watching an ad.
                        </p>
                    </div>
                </section>

                {/* Account state */}
                <section className="rounded-sm border border-slate-200 dark:border-slate-700
                                    bg-white dark:bg-slate-800 p-5 sm:p-6">
                    {signedIn ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                    {user?.firstName || user?.email || 'Signed in'}
                                </p>
                                {user?.email && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                        {user.email}
                                    </p>
                                )}
                                {user && user.enabled === false && (
                                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                        Your e-mail is not verified yet.
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={async () => { await signOut(); router.refresh(); }}
                                className="py-2.5 px-4 rounded-sm border border-slate-200 dark:border-slate-700
                                           text-sm font-medium text-slate-600 dark:text-slate-300
                                           hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Sign out
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                                You&apos;re using PDF Studio without an account
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Credits earned here live only in this browser. Sign in and they move to your
                                account, where they work in the mobile app too.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 pt-1">
                                <Link
                                    href="/sign-in?next=/account"
                                    className="flex-1 py-3 rounded-sm bg-blue-600 hover:bg-blue-700 text-white
                                               font-semibold text-sm text-center transition-colors"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/register"
                                    className="flex-1 py-3 rounded-sm border border-slate-200 dark:border-slate-700
                                               text-slate-700 dark:text-slate-200 font-semibold text-sm text-center
                                               hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Create an account
                                </Link>
                            </div>
                        </div>
                    )}
                </section>

                {/* History */}
                <section className="rounded-sm border border-slate-200 dark:border-slate-700
                                    bg-white dark:bg-slate-800 p-5 sm:p-6">
                    <h2 className="font-semibold text-slate-900 dark:text-slate-100">Credit history</h2>
                    {ledger.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                            Nothing here yet. Using a paid tool or claiming credits will show up.
                        </p>
                    ) : (
                        <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
                            {ledger.map((entry) => (
                                <li key={entry.id} className="flex items-center justify-between gap-4 py-3">
                                    <div className="min-w-0">
                                        <p className="text-sm text-slate-800 dark:text-slate-100 truncate capitalize">
                                            {describeReason(entry)}
                                        </p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">
                                            {new Date(entry.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <span className={`text-sm font-semibold tabular-nums flex-shrink-0 ${
                                        entry.delta < 0
                                            ? 'text-slate-500 dark:text-slate-400'
                                            : 'text-green-600 dark:text-green-400'
                                    }`}>
                                        {entry.delta > 0 ? '+' : ''}{entry.delta}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    );
}
