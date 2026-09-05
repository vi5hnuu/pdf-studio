'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { AuthShell, Banner, Field, SubmitButton } from '@/app/_components/auth-shell';
import { AuthError, resendVerification, signIn } from '@/app/_utils/auth';

function SignInForm() {
    const router = useRouter();
    const params = useSearchParams();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
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
            title="Sign in"
            subtitle="Your credits work across the web and the mobile app."
            footer={
                <>
                    New here?{' '}
                    <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Create an account
                    </Link>
                </>
            }
        >
            <form onSubmit={submit} className="flex flex-col gap-4">
                {error && (
                    <Banner kind="error">
                        {error}
                        {unverified && (
                            <button type="button" onClick={resend} className="ml-1 underline font-medium">
                                Resend the verification e-mail
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
                    id="password" label="Password" type="password" value={password}
                    onChange={setPassword} autoComplete="current-password" required
                />

                <div className="flex justify-end -mt-1">
                    <Link href="/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        Forgot your password?
                    </Link>
                </div>

                <SubmitButton pending={pending}>Sign in</SubmitButton>

                <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                    Any credits you earned before signing in are moved to your account.
                </p>
            </form>
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
