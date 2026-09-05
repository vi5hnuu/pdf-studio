/**
 * Deployment URLs.
 *
 * Previously one `BASE_URL` constant served as both the public site address (canonical
 * tags, Open Graph, sitemap) and the API address — and it was written as
 * `true || process.env.NODE_ENV === 'development' ? 'http://localhost:8082' : …`, whose
 * `true ||` short-circuits, so production resolved to localhost for both. That broke every
 * API call and told Google the canonical URL of every page was `http://localhost:8082`.
 *
 * They are different things and are now separate, with real environment lookups.
 */

/** Where this site is served from. Used for canonical URLs, Open Graph and the sitemap. */
export const SITE_URL = (
    process.env.NEXT_PUBLIC_SITE_URL || 'https://pdf-studio.laxmi.solutions'
).replace(/\/$/, '');

/** Where pdf-studio-api is served from. */
export const API_URL = (
    process.env.NEXT_PUBLIC_API_URL || 'https://pdf-studio-api.laxmi.solutions'
).replace(/\/$/, '');

/**
 * Auth instance that issues this site's anonymous guest tokens.
 *
 * A separate deployment with its own database, so a flood of throwaway guests cannot touch
 * the real account space. See the auth repo's docs/DOCKER.md.
 */
export const GUEST_AUTH_URL = (
    process.env.NEXT_PUBLIC_GUEST_AUTH_URL || process.env.NEXT_PUBLIC_AUTH_URL
    || 'https://auth-web.laxmi.solutions'
).replace(/\/$/, '');

/**
 * Auth instance holding real accounts — the same one the mobile app uses.
 *
 * Signing in on the web must yield the same account and the same credit balance as the app,
 * so sign-in goes here rather than to the guest instance. A guest's earned credits are
 * carried over on sign-in via /credits/transfer-guest.
 */
export const ACCOUNT_AUTH_URL = (
    process.env.NEXT_PUBLIC_ACCOUNT_AUTH_URL || 'https://auth.laxmi.solutions'
).replace(/\/$/, '');

/** @deprecated Use GUEST_AUTH_URL or ACCOUNT_AUTH_URL — they are different deployments. */
export const AUTH_URL = GUEST_AUTH_URL;

/** The audience the API expects in a token minted for this product. */
export const API_AUDIENCE = 'pdf-studio-api';

/**
 * Largest upload the API accepts, mirroring `spring.servlet.multipart.max-file-size`.
 * Checked client-side so a user is told immediately rather than after uploading 200 MB.
 */
export const MAX_FILE_BYTES = Number(process.env.NEXT_PUBLIC_MAX_FILE_BYTES || 50 * 1024 * 1024);

export const MAX_FILE_LABEL = `${Math.round(MAX_FILE_BYTES / (1024 * 1024))} MB`;
