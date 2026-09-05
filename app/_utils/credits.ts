import { API_URL } from '@/app/_utils/config';
import { authedFetch } from '@/app/_utils/auth';

export interface LedgerEntry {
    id: number;
    toolId: string | null;
    delta: number;
    reason: string;
    balanceAfter: number;
    createdAt: string;
}

/** Current balance, or null when it cannot be read (offline, session not ready). */
export async function fetchBalance(): Promise<number | null> {
    try {
        const response = await authedFetch(`${API_URL}/api/v1/credits/balance`);
        if (!response.ok) return null;
        const payload = await response.json();
        return payload?.data?.credits ?? null;
    } catch {
        return null;
    }
}

/** A page of credit history, newest first. */
export async function fetchLedger(page = 0, size = 25): Promise<LedgerEntry[]> {
    try {
        const response = await authedFetch(`${API_URL}/api/v1/credits/ledger?page=${page}&size=${size}`);
        if (!response.ok) return [];
        const payload = await response.json();
        return payload?.data?.entries ?? [];
    } catch {
        return [];
    }
}

/**
 * Claims the free daily allowance.
 *
 * @returns the new balance, or a message explaining why it was refused (already claimed
 *          today, or the per-IP cap reached)
 */
export async function claimDaily(): Promise<{ credits?: number; error?: string }> {
    try {
        const response = await authedFetch(`${API_URL}/api/v1/credits/daily`, { method: 'POST' });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            return { error: payload?.message ?? 'Could not claim your daily credits.' };
        }
        return { credits: payload?.data?.credits };
    } catch {
        return { error: "Couldn't reach the server. Check your connection." };
    }
}

/**
 * Grants credits for a completed rewarded ad.
 *
 * The key identifies one ad impression, so a retried request after a dropped response is not
 * granted twice.
 */
export async function grantRewarded(impressionKey: string): Promise<{ credits?: number; error?: string }> {
    try {
        const response = await authedFetch(`${API_URL}/api/v1/credits/rewarded`, {
            method: 'POST',
            headers: { 'Idempotency-Key': impressionKey },
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            return { error: payload?.message ?? 'Could not add your credits.' };
        }
        return { credits: payload?.data?.credits };
    } catch {
        return { error: "Couldn't reach the server. Check your connection." };
    }
}

/** Human label for a ledger row's reason. */
export function describeReason(entry: LedgerEntry): string {
    switch (entry.reason) {
        case 'WELCOME': return 'Welcome credits';
        case 'DAILY': return 'Daily free credits';
        case 'REWARDED_AD': return 'Watched an ad';
        case 'PURCHASE': return 'Credit purchase';
        case 'REVOKE': return 'Refunded purchase';
        case 'TRANSFER': return 'Moved with your account';
        case 'DEBIT': return entry.toolId ? `Used ${entry.toolId.replace(/-/g, ' ')}` : 'Tool used';
        default: return entry.reason;
    }
}
