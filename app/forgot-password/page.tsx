'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { AuthShell, Banner, Field, GhostButton, SubmitButton } from '@/app/_components/auth-shell';
import { AuthError, forgotPassword } from '@/app/_utils/auth';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState<string | null>(null);

    async function submit(event: FormEvent) {
        event.preventDefault();
        setPending(true);
        setError(null);
        try {
            setSent(await forgotPassword(email.trim()));
        } catch (e) {
            setError(e instanceof AuthError ? e.message : 'Could not send the reset e-mail.');
        } finally {
            setPending(false);
        }
    }

    const promise = {
        heading: 'A fresh start is a click away.',
        bullets: [
            { title: 'A one-time link', body: 'Expires in an hour — safe even if the mailbox is shared.' },
            { title: 'Your credits are untouched', body: 'Resetting the password does not touch your balance.' },
            { title: 'Need more help?', body: 'Write to support@pdf-studio and we will take it from there.' },
        ],
    };

    if (sent) {
        return (
            <AuthShell
                title="Check your inbox"
                subtitle="If an account exists for that e-mail, a reset link is on its way."
                promise={promise}
                footer={
                    <>
                        Didn&apos;t get it?{' '}
                        <button
                            onClick={() => setSent(null)}
                            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline
                                       focus-visible:outline-none focus-visible:ring-2
                                       focus-visible:ring-blue-500/40 rounded-sm"
                        >
                            Try again
                        </button>
                    </>
                }
            >
                <div className="space-y-3">
                    <Banner kind="success">{sent}</Banner>
                    <Link href="/sign-in" className="block">
                        <GhostButton>Back to sign in</GhostButton>
                    </Link>
                </div>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            title="Reset your password"
            subtitle="Enter the e-mail on your account and we'll send a link to pick a new one."
            promise={promise}
            footer={
                <Link
                    href="/sign-in"
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline
                               focus-visible:outline-none focus-visible:ring-2
                               focus-visible:ring-blue-500/40 rounded-sm"
                >
                    Back to sign in
                </Link>
            }
        >
            <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
                {error && <Banner kind="error">{error}</Banner>}
                <Field
                    id="email" label="E-mail" type="email" value={email} onChange={setEmail}
                    autoComplete="email" required placeholder="you@example.com"
                />
                <SubmitButton pending={pending}>Send reset link</SubmitButton>
            </form>
        </AuthShell>
    );
}
