import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { PageProps } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ReferralStats {
    total_referrals: number;
    pending_referral_commission: number;
    available_referral_commission: number;
    total_referral_withdrawn: number;
}

interface ReferredAgent {
    id: number;
    referrer_id: number;
    referred_id: number;
    referred_at: string | null;
    created_at: string;
    referred: {
        id: number;
        name: string;
        email: string;
        created_at: string;
    } | null;
}

interface ReferralCommission {
    id: number;
    referrer_id: number;
    referred_agent_id: number;
    commission_id: number;
    referral_amount: string;
    referral_percentage: string;
    status: string;
    created_at: string;
    referred_agent: { id: number; name: string } | null;
    commission: {
        id: number;
        order: { id: number; total: string; status: string; created_at: string } | null;
    } | null;
}

interface ReferralsProps extends PageProps {
    referralStats: ReferralStats;
    referredAgents: ReferredAgent[];
    referralCommissions: ReferralCommission[];
    referralCode: string;
}

const statusColor = (status: string) => {
    switch (status) {
        case 'available': return 'default';
        case 'withdrawn': return 'secondary';
        case 'reversed': return 'destructive';
        default: return 'outline';
    }
};

export default function AgentReferrals() {
    const { auth, referralStats, referredAgents, referralCommissions, referralCode } = usePage<ReferralsProps>().props;
    const [copied, setCopied] = useState(false);
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <DashboardLayout user={auth.user} header="Referrals">
            <Head title="Referrals" />

            <div className="space-y-6">
                {/* Referral Link */}
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Your Referral Link</h3>
                    <div className="flex items-center gap-2">
                        <input
                            readOnly
                            value={referralLink}
                            className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm rounded-none"
                        />
                        <Button onClick={copyLink} variant="outline" className="rounded-none">
                            {copied ? 'Copied!' : 'Copy'}
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="bg-indigo-600 rounded-none p-4 text-white border-b-4 border-indigo-700">
                        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">Total Referrals</p>
                        <p className="text-xl font-bold">{referralStats.total_referrals}</p>
                    </div>
                    <div className="bg-teal-600 rounded-none p-4 text-white border-b-4 border-teal-700">
                        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">Available</p>
                        <p className="text-xl font-bold">GHS {referralStats.available_referral_commission.toFixed(2)}</p>
                    </div>
                    <div className="bg-pink-600 rounded-none p-4 text-white border-b-4 border-pink-700">
                        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">Withdrawn</p>
                        <p className="text-xl font-bold">GHS {referralStats.total_referral_withdrawn.toFixed(2)}</p>
                    </div>
                </div>

                {/* Referred Agents */}
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                        Referred Agents ({referredAgents.length})
                    </h3>
                    {referredAgents.length === 0 ? (
                        <p className="text-gray-500 text-center py-8 text-sm">
                            No referrals yet. Share your referral link to earn commissions from agents you refer.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {referredAgents.map((r) => (
                                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                    <div>
                                        <p className="font-medium text-sm">{r.referred?.name || 'Unknown'}</p>
                                        <p className="text-xs text-gray-500">{r.referred?.email}</p>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {new Date(r.referred_at || r.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Referral Commission History */}
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                        Referral Commission History
                    </h3>
                    {referralCommissions.length === 0 ? (
                        <p className="text-gray-500 text-center py-8 text-sm">
                            No referral commissions yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                                        <th className="pb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Agent</th>
                                        <th className="pb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Amount</th>
                                        <th className="pb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Rate</th>
                                        <th className="pb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Order</th>
                                        <th className="pb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Status</th>
                                        <th className="pb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {referralCommissions.map((rc) => (
                                        <tr key={rc.id} className="border-b border-gray-100 dark:border-gray-800">
                                            <td className="py-2">{rc.referred_agent?.name || '—'}</td>
                                            <td className="py-2 font-medium text-green-600">
                                                GHS {Number(rc.referral_amount).toFixed(2)}
                                            </td>
                                            <td className="py-2 text-gray-500">{Number(rc.referral_percentage).toFixed(0)}%</td>
                                            <td className="py-2 text-gray-500">
                                                {rc.commission?.order ? (
                                                    <span>#{rc.commission.order.id} (GHS {Number(rc.commission.order.total).toFixed(2)})</span>
                                                ) : '—'}
                                            </td>
                                            <td className="py-2">
                                                <Badge variant={statusColor(rc.status) as any}>{rc.status}</Badge>
                                            </td>
                                            <td className="py-2 text-gray-400 text-xs">
                                                {new Date(rc.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
