'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { AuthShell, Banner, Field, SubmitButton } from '@/app/_components/auth-shell';
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

    return (
        <AuthShell
            title="Reset your password"
            subtitle="We'll e-mail you a link to set a new one."
            footer={
                <Link href="/sign-in" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Back to sign in
                </Link>
            }
        >
            {sent ? (
                <Banner kind="success">{sent}</Banner>
            ) : (
                <form onSubmit={submit} className="flex flex-col gap-4">
                    {error && <Banner kind="error">{error}</Banner>}
                    <Field id="email" label="E-mail" type="email" value={email} onChange={setEmail}
                           autoComplete="email" required placeholder="you@example.com" />
                    <SubmitButton pending={pending}>Send reset link</SubmitButton>
                </form>
            )}
        </AuthShell>
    );
}
