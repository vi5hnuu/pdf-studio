'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { AuthShell, Banner, Divider, Field, GhostButton, SubmitButton } from '@/app/_components/auth-shell';
import { AuthError, register } from '@/app/_utils/auth';
import { GoogleSignIn } from '@/app/_components/google-sign-in';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
            <AuthShell
                title="Check your inbox"
                subtitle={done}
                promise={{
                    heading: "You're almost in.",
                    bullets: [
                        { title: 'Verify your e-mail', body: 'The link lives for 24 hours.' },
                        { title: 'Then sign in', body: 'Your free credits are already waiting.' },
                        { title: 'Credits move with you', body: 'Web and mobile share one account.' },
                    ],
                }}
            >
                <div className="space-y-3">
                    <Link href="/sign-in" className="block">
                        <SubmitButton pending={false}>Go to sign in</SubmitButton>
                    </Link>
                    <Link href="/" className="block">
                        <GhostButton>Back to tools</GhostButton>
                    </Link>
                </div>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            title="Create an account"
            subtitle="Fifty-plus PDF tools, one credit balance, works on web and Android."
            footer={
                <>
                    Already have an account?{' '}
                    <Link
                        href="/sign-in"
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline
                                   focus-visible:outline-none focus-visible:ring-2
                                   focus-visible:ring-blue-500/40 rounded-sm"
                    >
                        Sign in
                    </Link>
                </>
            }
            promise={{
                heading: 'Start free. Keep your work.',
                bullets: [
                    { title: 'Welcome credits on the house', body: 'Open the account and tools unlock immediately.' },
                    { title: 'Private by design', body: 'Uploads are isolated and purged within minutes.' },
                    { title: 'One account, every surface', body: 'Credits sync across the web app and the Android app.' },
                ],
            }}
        >
            <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
                {error && <Banner kind="error">{error}</Banner>}

                <Field id="firstName" label="First name" value={firstName} onChange={setFirstName}
                       autoComplete="given-name" placeholder="Optional" />
                <Field id="email" label="E-mail" type="email" value={email} onChange={setEmail}
                       autoComplete="email" required placeholder="you@example.com" />
                <Field
                    id="password" label="Password" type={showPassword ? 'text' : 'password'}
                    value={password} onChange={setPassword}
                    autoComplete="new-password" required
                    hint="At least 8 characters."
                    placeholder="At least 8 characters"
                    trailing={
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="h-9 px-2 text-xs font-medium text-slate-500 dark:text-slate-400
                                       hover:text-slate-800 dark:hover:text-slate-200 rounded
                                       focus-visible:outline-none focus-visible:ring-2
                                       focus-visible:ring-blue-500/40"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    }
                />

                <SubmitButton pending={pending}>Create account</SubmitButton>

                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                    By continuing you agree to our{' '}
                    <a
                        href="https://legal.laxmi.solutions/pdf-craft/terms-of-service"
                        className="underline hover:text-slate-800 dark:hover:text-slate-200"
                        target="_blank" rel="noopener noreferrer"
                    >Terms</a>{' '}
                    and{' '}
                    <a
                        href="https://legal.laxmi.solutions/pdf-craft/privacy-policy"
                        className="underline hover:text-slate-800 dark:hover:text-slate-200"
                        target="_blank" rel="noopener noreferrer"
                    >Privacy Policy</a>.
                </p>
            </form>

            <div className="mt-6 space-y-6">
                <Divider label="or sign up with" />
                <GoogleSignIn onError={setError} />
            </div>
        </AuthShell>
    );
}
