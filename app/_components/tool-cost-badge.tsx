'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ToolCost, costForSize, fetchBalance, fetchCosts, onBalanceChange } from '@/app/_utils/credits';

/**
 * What this tool costs, and whether the current balance covers it.
 *
 * Nothing on the web said a tool cost anything: you picked a file, set the options, pressed
 * the button and only then discovered you could not afford it. This states the price up
 * front and, when the balance is short, links somewhere that fixes it.
 *
 * Free tools render nothing rather than a "0 credits" badge, which would only add noise to
 * the twenty-odd tools that never charge.
 */
export function ToolCostBadge({ toolId, file }: { toolId: string; file?: File | null }) {
    const [cost, setCost] = useState<ToolCost | undefined>();
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        let alive = true;
        (async () => {
            const [costs, currentBalance] = await Promise.all([fetchCosts(), fetchBalance()]);
            if (!alive) return;
            setCost(costs[toolId]);
            setBalance(currentBalance);
        })();
        const stop = onBalanceChange((credits) => { if (alive) setBalance(credits); });
        return () => { alive = false; stop(); };
    }, [toolId]);

    if (!cost || cost.baseCredits <= 0) return null;

    // Once a file is chosen the size surcharge is knowable, so quote the real figure rather
    // than the headline one.
    const price = file ? costForSize(cost, file.size) : cost.baseCredits;
    const grows = cost.sizeUnit === 'BYTES' && cost.creditsPerUnit > 0;
    const short = balance !== null && balance < price;

    return (
        <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border px-3 py-2 text-sm ${
            short
                ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300'
        }`}>
            <span className="font-medium">
                {file || !grows ? `Costs ${price}` : `Costs from ${price}`} credit{price === 1 ? '' : 's'}
            </span>
            {balance !== null && (
                <span className="text-slate-400 dark:text-slate-500">· you have {balance}</span>
            )}
            {short && (
                <Link href="/account" className="underline font-medium">
                    Get more credits
                </Link>
            )}
        </div>
    );
}
