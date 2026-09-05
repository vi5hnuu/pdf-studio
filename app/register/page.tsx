'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { AuthShell, Banner, Field, SubmitButton } from '@/app/_components/auth-shell';
import { AuthError, register } from '@/app/_utils/auth';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState<string | null>(null);

    async function submit(event: FormEvent) {
        event.preventDefault();
        // Checked here so the length rule is stated before a round trip, not after.
        if (password.length < 8) {
            setError('Passwords must be at least 8 characters.');
            return;
        }
        setPending(true);
        setError(null);
        try {
            setDone(await register({ email: email.trim(), password, firstName: firstName.trim() || undefined }));
        } catch (e) {
            setError(e instanceof AuthError ? e.message : 'Could not create the account.');
        } finally {
            setPending(false);
        }
    }

    if (done) {
        return (
            <AuthShell title="Check your e-mail" subtitle={done}>
                <Link
                    href="/sign-in"
                    className="block w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white
                               font-semibold text-sm text-center transition-colors"
                >
                    Go to sign in
                </Link>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            title="Create an account"
            subtitle="Keep your credits across the web and the mobile app."
            footer={
                <>
                    Already have one?{' '}
                    <Link href="/sign-in" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Sign in
                    </Link>
                </>
            }
        >
            <form onSubmit={submit} className="flex flex-col gap-4">
                {error && <Banner kind="error">{error}</Banner>}

                <Field id="firstName" label="First name" value={firstName} onChange={setFirstName}
                       autoComplete="given-name" placeholder="Optional" />
                <Field id="email" label="E-mail" type="email" value={email} onChange={setEmail}
                       autoComplete="email" required placeholder="you@example.com" />
                <Field id="password" label="Password" type="password" value={password}
                       onChange={setPassword} autoComplete="new-password" required
                       hint="At least 8 characters." />

                <SubmitButton pending={pending}>Create account</SubmitButton>

                <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                    By continuing you agree to our{' '}
                    <a href="https://legal.laxmi.solutions/pdf-craft/terms-of-service"
                       className="underline" target="_blank" rel="noopener noreferrer">Terms</a>{' '}
                    and{' '}
                    <a href="https://legal.laxmi.solutions/pdf-craft/privacy-policy"
                       className="underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                </p>
            </form>
        </AuthShell>
    );
}
