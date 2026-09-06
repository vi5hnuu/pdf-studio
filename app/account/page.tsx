'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/app/_components/site-header';
import { SiteFooter } from '@/app/_components/site-footer';
import { useCallback, useEffect, useState } from 'react';
import {
    AuthUser, currentUser, deleteAccount, isSignedIn, onSessionChange, resendVerification,
    sessionKind, signOut, updateProfile,
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
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const load = useCallback(async () => {
        setSignedIn(isSignedIn());
        const [nextBalance, nextLedger, profile] = await Promise.all([
            fetchBalance(), fetchLedger(), currentUser(),
        ]);
        setBalance(nextBalance);
        setLedger(nextLedger);
        setUser(profile);
        setFirstName(profile?.firstName ?? '');
        setLastName(profile?.lastName ?? '');
    }, []);

    useEffect(() => {
        load();
        return onSessionChange(load); // re-read after sign-out drops back to a guest
    }, [load]);

    async function onResendVerification() {
        if (!user?.email) return;
        setBusy(true);
        setMessage(null);
        try {
            setMessage({ kind: 'success', text: await resendVerification(user.email) });
        } catch (error) {
            setMessage({ kind: 'error', text: (error as Error).message });
        }
        setBusy(false);
    }

    async function onSaveProfile(event: React.FormEvent) {
        event.preventDefault();
        setBusy(true);
        setMessage(null);
        try {
            await updateProfile({ firstName, lastName });
            setMessage({ kind: 'success', text: 'Your name has been updated.' });
            await load();
        } catch (error) {
            setMessage({ kind: 'error', text: (error as Error).message });
        }
        setBusy(false);
    }

    async function onDeleteAccount() {
        // Irreversible and takes the credits with it, so it asks first.
        const confirmed = window.confirm(
            'Delete your account permanently? Your credits go with it and this cannot be undone.');
        if (!confirmed) return;

        setBusy(true);
        setMessage(null);
        try {
            await deleteAccount();
            setMessage({ kind: 'success', text: 'Your account has been deleted.' });
            await load();
        } catch (error) {
            setMessage({ kind: 'error', text: (error as Error).message });
        }
        setBusy(false);
    }

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
            <SiteHeader />

            <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-6">
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Your account</h1>
            </div>

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
                                {user && user.enabled !== false && (
                                    <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                                        E-mail verified.
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

                {/* Verification — the one thing that blocks a new account, so it leads. */}
                {signedIn && user && user.enabled === false && (
                    <section className="rounded-sm border border-amber-200 dark:border-amber-800
                                        bg-amber-50 dark:bg-amber-900/20 p-4">
                        <h2 className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                            Verify your e-mail
                        </h2>
                        <p className="mt-1 text-sm text-amber-700 dark:text-amber-300/90">
                            We sent a link to {user.email}. Open it to finish setting up your account.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <button
                                onClick={onResendVerification}
                                disabled={busy}
                                className="px-3 py-1.5 rounded-sm bg-amber-600 hover:bg-amber-700 text-white
                                           text-sm font-semibold disabled:opacity-50 transition-colors"
                            >
                                Resend the e-mail
                            </button>
                            <button
                                onClick={load}
                                disabled={busy}
                                className="px-3 py-1.5 rounded-sm border border-amber-300 dark:border-amber-700
                                           text-amber-800 dark:text-amber-300 text-sm font-medium
                                           disabled:opacity-50 transition-colors"
                            >
                                I&apos;ve verified — check again
                            </button>
                        </div>
                    </section>
                )}

                {/* Account actions */}
                {signedIn && (
                    <section className="rounded-sm border border-slate-200 dark:border-slate-700
                                        bg-white dark:bg-slate-800 p-5 sm:p-6 space-y-5">
                        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Account settings</h2>

                        <form onSubmit={onSaveProfile} className="space-y-2">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Your name</p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="First name"
                                    className="flex-1 px-2.5 py-1.5 rounded-sm border border-slate-200
                                               dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100
                                               text-sm outline-none focus:border-blue-400"
                                />
                                <input
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Last name"
                                    className="flex-1 px-2.5 py-1.5 rounded-sm border border-slate-200
                                               dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100
                                               text-sm outline-none focus:border-blue-400"
                                />
                                <button
                                    type="submit"
                                    disabled={busy}
                                    className="px-3 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-700 text-white
                                               text-sm font-semibold disabled:opacity-50 transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </form>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                            <Link
                                href="/account/password"
                                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Change your password
                            </Link>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                            <button
                                onClick={onDeleteAccount}
                                disabled={busy}
                                className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline
                                           disabled:opacity-50"
                            >
                                Delete my account
                            </button>
                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                Permanent. Your credits go with it.
                            </p>
                        </div>
                    </section>
                )}

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

            <SiteFooter />
        </main>
    );
}
