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


export interface ToolCost {
    toolId: string;
    baseCredits: number;
    sizeUnit: string;
    creditsPerUnit: number;
    unitSize: number;
}

/** Cached price list; it changes rarely and every tool page wants it. */
let costsPromise: Promise<Record<string, ToolCost>> | null = null;

/**
 * The server's tool price list.
 *
 * The web charged credits without ever showing a price: you configured a tool, pressed the
 * button, and only then learned it cost more than you had. The mobile app has always shown
 * a cost badge and asked before spending.
 */
export function fetchCosts(): Promise<Record<string, ToolCost>> {
    costsPromise ??= (async () => {
        try {
            const response = await authedFetch(`${API_URL}/api/v1/credits/costs`);
            if (!response.ok) return {};
            const payload = await response.json();
            const rows: ToolCost[] = payload?.data ?? [];
            return Object.fromEntries(rows.map((row) => [row.toolId, row]));
        } catch {
            return {}; // price unknown; the badge simply does not render
        }
    })();
    return costsPromise;
}

/**
 * Cost for an input of this size, matching the server's arithmetic
 * (base + floor(bytes / unitSize) * creditsPerUnit).
 */
export function costForSize(cost: ToolCost | undefined, sizeBytes: number): number {
    if (!cost) return 0;
    if (cost.sizeUnit !== 'BYTES' || cost.creditsPerUnit <= 0 || cost.unitSize <= 0 || sizeBytes <= 0) {
        return cost.baseCredits;
    }
    return cost.baseCredits + Math.floor(sizeBytes / cost.unitSize) * cost.creditsPerUnit;
}
