'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthShell } from '@/app/_components/auth-shell';
import { changePassword } from '@/app/_utils/auth';

/**
 * Changing your password.
 *
 * The auth service has always exposed this and the mobile app has always offered it; on the
 * web the only way to change a password was to sign out and use the forgot-password e-mail.
 */
export default function ChangePasswordPage() {
    const router = useRouter();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault();
        setError(null);

        // Caught here rather than at the server so the mistake is named before a round trip.
        if (newPassword !== confirmPassword) {
            setError('The new passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
            setError('Your new password must be at least 8 characters.');
            return;
        }

        setBusy(true);
        try {
            await changePassword(oldPassword, newPassword);
            setDone(true);
            setTimeout(() => router.push('/account'), 1200);
        } catch (caught) {
            setError((caught as Error).message);
        }
        setBusy(false);
    }

    const field = `w-full px-2.5 py-1.5 rounded-sm border border-slate-200 dark:border-slate-700
                   dark:bg-slate-900 dark:text-slate-100 text-sm outline-none
                   focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900`;

    return (
        <AuthShell
            title="Change your password"
            subtitle="You'll stay signed in on this device."
            footer={<Link href="/account" className="hover:underline">Back to your account</Link>}
        >
            {done ? (
                <p className="text-sm rounded-sm border border-green-200 dark:border-green-800
                              bg-green-50 dark:bg-green-900/20 px-3 py-2 text-green-700 dark:text-green-300">
                    Your password has been changed.
                </p>
            ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                    {error && (
                        <p role="alert" className="text-sm rounded-sm border border-red-200 dark:border-red-800
                                      bg-red-50 dark:bg-red-900/20 px-3 py-2 text-red-700 dark:text-red-300">
                            {error}
                        </p>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="current-password"
                               className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Current password
                        </label>
                        <input id="current-password" type="password" required autoComplete="current-password"
                               value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
                               className={field} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="new-password"
                               className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            New password
                        </label>
                        <input id="new-password" type="password" required autoComplete="new-password"
                               minLength={8} value={newPassword}
                               onChange={(e) => setNewPassword(e.target.value)} className={field} />
                        <p className="text-xs text-slate-400 dark:text-slate-500">At least 8 characters.</p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="confirm-password"
                               className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Confirm new password
                        </label>
                        <input id="confirm-password" type="password" required autoComplete="new-password"
                               value={confirmPassword}
                               onChange={(e) => setConfirmPassword(e.target.value)} className={field} />
                    </div>

                    <button type="submit" disabled={busy}
                            className="w-full py-2.5 rounded-sm bg-blue-600 hover:bg-blue-700 text-white
                                       font-semibold text-sm disabled:opacity-50 transition-colors">
                        {busy ? 'Changing…' : 'Change password'}
                    </button>
                </form>
            )}
        </AuthShell>
    );
}
