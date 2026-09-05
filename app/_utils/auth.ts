/**
 * Sessions for the web tier.
 *
 * Every pdf-studio-api endpoint requires a bearer token, so the site silently obtains an
 * anonymous guest token on first use and works from there. Signing in swaps that for a real
 * account token from the *account* auth instance — the same deployment the mobile app uses,
 * so the account and its credit balance are shared between them.
 *
 * The guest and the account live in different auth deployments with different user-id
 * spaces, so signing in changes which account the API bills. Credits the guest earned are
 * carried across by `/credits/transfer-guest`; see `signIn`.
 *
 * Tokens live in localStorage. That is exposed to XSS, which is an accepted trade for the
 * guest token (no identity, only the free allowance). A signed-in session carries more, so
 * treat any XSS here as account-compromising and keep the CSP tight.
 */
import { ACCOUNT_AUTH_URL, API_AUDIENCE, API_URL, GUEST_AUTH_URL } from '@/app/_utils/config';

const ACCESS_KEY = 'pdfstudio.accessToken';
const REFRESH_KEY = 'pdfstudio.refreshToken';
const KIND_KEY = 'pdfstudio.sessionKind';

export type SessionKind = 'guest' | 'account';

export interface AuthUser {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    enabled?: boolean;
    isGuest?: boolean;
}

/** In-flight session work, so parallel calls mint one guest rather than several. */
let inFlight: Promise<string | null> | null = null;

/** Notifies the UI when the session changes, so a header can re-render. */
const listeners = new Set<() => void>();
export function onSessionChange(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
function announce() {
    listeners.forEach((l) => l());
}

function read(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null; // private mode / storage disabled
    }
}

function write(key: string, value: string) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Non-fatal: the session still works in memory for this page's lifetime.
    }
}

function clear() {
    try {
        [ACCESS_KEY, REFRESH_KEY, KIND_KEY].forEach((k) => localStorage.removeItem(k));
    } catch {
        /* ignore */
    }
}

export function sessionKind(): SessionKind {
    return read(KIND_KEY) === 'account' ? 'account' : 'guest';
}

export function isSignedIn(): boolean {
    return sessionKind() === 'account';
}

function store(data: { accessToken?: string; refreshToken?: string }, kind: SessionKind): string | null {
    if (!data?.accessToken) return null;
    write(ACCESS_KEY, data.accessToken);
    if (data.refreshToken) write(REFRESH_KEY, data.refreshToken);
    write(KIND_KEY, kind);
    announce();
    return data.accessToken;
}

/** The auth deployment the current session belongs to. */
function authBase(kind: SessionKind = sessionKind()): string {
    return kind === 'account' ? ACCOUNT_AUTH_URL : GUEST_AUTH_URL;
}

/** Thrown for a failed auth call, carrying the server's own message. */
export class AuthError extends Error {
    constructor(message: string, readonly status?: number) {
        super(message);
    }
}

async function callAuth(base: string, path: string, body?: unknown): Promise<any> {
    let response: Response;
    try {
        response = await fetch(`${base}/api/v1/auth${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Audience': API_AUDIENCE },
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new AuthError("Couldn't reach the server. Check your connection and try again.");
    }

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        // The auth service returns its own message; showing "Something went wrong" instead
        // would hide the actual reason (wrong password, unverified e-mail, rate limited).
        throw new AuthError(payload?.message ?? 'That didn\'t work. Please try again.', response.status);
    }
    return payload?.data ?? payload;
}

async function createGuest(): Promise<string | null> {
    try {
        return store(await callAuth(GUEST_AUTH_URL, '/guest'), 'guest');
    } catch {
        return null; // offline or auth down; the caller surfaces a network error
    }
}

async function refresh(): Promise<string | null> {
    const refreshToken = read(REFRESH_KEY);
    const kind = sessionKind();
    if (!refreshToken) return createGuest();

    try {
        return store(await callAuth(authBase(kind), '/refresh', { refreshToken }), kind);
    } catch {
        // Expired or revoked. Fall back to a guest so the tools keep working rather than
        // dead-ending the page.
        clear();
        return createGuest();
    }
}

/** Returns a usable access token, creating a guest session if there is none. */
export async function getAccessToken(): Promise<string | null> {
    const existing = read(ACCESS_KEY);
    if (existing) return existing;
    inFlight ??= createGuest().finally(() => {
        inFlight = null;
    });
    return inFlight;
}

/** Forces a new token after a 401. Single-flighted for the same reason. */
export async function refreshAccessToken(): Promise<string | null> {
    inFlight ??= refresh().finally(() => {
        inFlight = null;
    });
    return inFlight;
}

// ── Account flows ─────────────────────────────────────────────────────────────

/**
 * Signs in against the account instance and carries the guest's credits across.
 *
 * The guest token is captured before it is replaced, because the transfer has to prove
 * ownership of the guest session it is draining.
 */
export async function signIn(identifier: string, password: string): Promise<void> {
    const guestToken = sessionKind() === 'guest' ? read(ACCESS_KEY) : null;

    const data = await callAuth(ACCOUNT_AUTH_URL, '/login', { identifier, password });
    if (!store(data, 'account')) throw new AuthError('Sign-in did not return a session.');

    if (guestToken) await transferGuestCredits(guestToken);
}

export async function register(input: {
    email: string; password: string; firstName?: string; lastName?: string;
}): Promise<string> {
    const data = await callAuth(ACCOUNT_AUTH_URL, '/register', input);
    return typeof data === 'string'
        ? data
        : 'Account created. Check your e-mail to verify it, then sign in.';
}

export async function forgotPassword(email: string): Promise<string> {
    await callAuth(ACCOUNT_AUTH_URL, '/forgot-password', { email });
    return 'If that e-mail is registered, a reset link is on its way.';
}

export async function resendVerification(email: string): Promise<string> {
    await callAuth(ACCOUNT_AUTH_URL, '/re-verify', { email });
    return 'Verification e-mail sent. Check your inbox.';
}

/** Signs out and drops back to a guest session so the tools keep working. */
export async function signOut(): Promise<void> {
    const refreshToken = read(REFRESH_KEY);
    if (refreshToken && sessionKind() === 'account') {
        await callAuth(ACCOUNT_AUTH_URL, '/logout', { refreshToken }).catch(() => undefined);
    }
    clear();
    announce();
    await createGuest();
}

/** The signed-in profile, or null for a guest. */
export async function currentUser(): Promise<AuthUser | null> {
    if (!isSignedIn()) return null;
    const token = await getAccessToken();
    if (!token) return null;
    try {
        const response = await fetch(`${ACCOUNT_AUTH_URL}/api/v1/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return null;
        const payload = await response.json();
        return payload?.data ?? payload;
    } catch {
        return null;
    }
}

/**
 * Moves credits earned as a guest onto the freshly signed-in account.
 *
 * Best-effort: a failure here must not turn a successful sign-in into an error, and the
 * endpoint is idempotent, so a later attempt can still succeed.
 */
async function transferGuestCredits(guestToken: string): Promise<void> {
    const token = read(ACCESS_KEY);
    if (!token) return;
    try {
        await fetch(`${API_URL}/api/v1/credits/transfer-guest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ guestToken }),
        });
    } catch {
        /* the credits stay on the guest; signing in again retries */
    }
}

/**
 * `fetch` with the bearer token attached, retrying once on 401 with a fresh one.
 *
 * For the tools that read JSON from the API rather than downloading a file.
 */
export async function authedFetch(url: string, init: RequestInit = {}): Promise<Response> {
    const send = (token: string | null) =>
        fetch(url, {
            ...init,
            headers: {
                ...(init.headers ?? {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

    const response = await send(await getAccessToken());
    if (response.status !== 401) return response;
    return send(await refreshAccessToken());
}
