/**
 * Guest session for the web tier.
 *
 * Every pdf-studio-api endpoint requires a bearer token. The site has no sign-in, so it
 * silently obtains an anonymous guest token on first use — the same flow the mobile app
 * uses, against a separate auth instance whose user ids are namespaced apart from the
 * app's.
 *
 * Tokens live in localStorage. That is exposed to XSS, which is an accepted trade here:
 * a guest token carries no identity and grants only the free credit allowance, and the
 * alternative (httpOnly cookies) would require proxying every request through this app's
 * own server. Do not store a *full* account's tokens this way.
 */
import { API_AUDIENCE, AUTH_URL } from '@/app/_utils/config';

const ACCESS_KEY = 'pdfstudio.accessToken';
const REFRESH_KEY = 'pdfstudio.refreshToken';

/** In-flight session creation, so a burst of parallel calls mints one guest, not five. */
let inFlight: Promise<string | null> | null = null;

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
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
    } catch {
        /* ignore */
    }
}

function store(data: { accessToken?: string; refreshToken?: string }): string | null {
    if (!data?.accessToken) return null;
    write(ACCESS_KEY, data.accessToken);
    if (data.refreshToken) write(REFRESH_KEY, data.refreshToken);
    return data.accessToken;
}

async function createGuest(): Promise<string | null> {
    try {
        const res = await fetch(`${AUTH_URL}/api/v1/auth/guest`, {
            method: 'POST',
            headers: { 'X-Audience': API_AUDIENCE },
        });
        if (!res.ok) return null;
        const body = await res.json();
        return store(body?.data ?? {});
    } catch {
        return null; // offline or auth service down; the caller surfaces a network error
    }
}

async function refresh(): Promise<string | null> {
    const refreshToken = read(REFRESH_KEY);
    if (!refreshToken) return createGuest();
    try {
        const res = await fetch(`${AUTH_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Audience': API_AUDIENCE },
            body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) {
            clear();
            return createGuest(); // expired or revoked — start a fresh guest
        }
        const body = await res.json();
        return store(body?.data ?? {});
    } catch {
        return null;
    }
}

/** Returns a usable access token, creating a guest session if there is none. */
export async function getAccessToken(): Promise<string | null> {
    const existing = read(ACCESS_KEY);
    if (existing) return existing;
    // Single-flight: several tools starting at once must not each mint a guest account.
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
