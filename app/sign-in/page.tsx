'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { AuthShell, Banner, Divider, Field, SubmitButton } from '@/app/_components/auth-shell';
import { AuthError, resendVerification, signIn } from '@/app/_utils/auth';
import { GoogleSignIn } from '@/app/_components/google-sign-in';

function SignInForm() {
    const router = useRouter();
    const params = useSearchParams();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    // The auth service blocks sign-in until the address is verified, so offer the resend
    // rather than leaving the user at a dead end.
    const [unverified, setUnverified] = useState(false);

    async function submit(event: FormEvent) {
        event.preventDefault();
        setPending(true);
        setError(null);
        setNotice(null);
        setUnverified(false);
        try {
            await signIn(identifier.trim(), password);
            router.push(params.get('next') || '/account');
        } catch (e) {
            const message = e instanceof AuthError ? e.message : 'Sign-in failed. Please try again.';
            setError(message);
            setUnverified(/verif/i.test(message));
        } finally {
            setPending(false);
        }
    }

    async function resend() {
        try {
            setNotice(await resendVerification(identifier.trim()));
            setError(null);
        } catch (e) {
            setError(e instanceof AuthError ? e.message : 'Could not resend the e-mail.');
        }
    }

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Sign in to pick up your credits across every PDF Studio tool."
            footer={
                <>
                    New to PDF Studio?{' '}
                    <Link
                        href="/register"
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline
                                   focus-visible:outline-none focus-visible:ring-2
                                   focus-visible:ring-blue-500/40 rounded-sm"
                    >
                        Create an account
                    </Link>
                </>
            }
            promise={{
                heading: 'Welcome back to your workspace.',
                bullets: [
                    { title: 'Your credits travel with you', body: 'Earn or buy on either side; use everywhere.' },
                    { title: 'Nothing stored for you to lose', body: 'Files purge within minutes of a run.' },
                    { title: 'Fast, batch-ready tools', body: 'Fifty-plus tools, same account, one bill.' },
                ],
            }}
        >
            <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
                {error && (
                    <Banner kind="error">
                        {error}
                        {unverified && (
                            <button
                                type="button"
                                onClick={resend}
                                className="ml-1 underline font-semibold hover:text-red-900 dark:hover:text-red-100"
                            >
                                Resend verification e-mail
                            </button>
                        )}
                    </Banner>
                )}
                {notice && <Banner kind="success">{notice}</Banner>}

                <Field
                    id="identifier" label="E-mail" type="email" value={identifier}
                    onChange={setIdentifier} autoComplete="email" required
                    placeholder="you@example.com"
                />
                <Field
                    id="password" label="Password" type={showPassword ? 'text' : 'password'}
                    value={password} onChange={setPassword}
                    autoComplete="current-password" required
                    placeholder="••••••••"
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

                <div className="flex justify-end -mt-1">
                    <Link
                        href="/forgot-password"
                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600
                                   dark:hover:text-blue-400 hover:underline
                                   focus-visible:outline-none focus-visible:ring-2
                                   focus-visible:ring-blue-500/40 rounded-sm"
                    >
                        Forgot your password?
                    </Link>
                </div>

                <SubmitButton pending={pending}>Sign in</SubmitButton>
            </form>

            <div className="mt-6 space-y-6">
                <Divider label="or continue with" />
                <GoogleSignIn onError={setError} />
            </div>
        </AuthShell>
    );
}

export default function SignInPage() {
    // useSearchParams needs a Suspense boundary during prerender.
    return (
        <Suspense fallback={<AuthShell title="Sign in"><div className="h-40" /></AuthShell>}>
            <SignInForm />
        </Suspense>
    );
}
