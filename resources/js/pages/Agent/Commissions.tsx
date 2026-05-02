import React from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { PageProps } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Stats {
    available_commission: number;
    total_withdrawn: number;
    total_earnings: number;
    total_orders: number;
}

interface Commission {
    id: number;
    order_id: number;
    base_price: string;
    agent_price: string;
    commission_amount: string;
    withdrawn_amount: string;
    status: string;
    created_at: string;
    order: { id: number; total: string; status: string; beneficiary_number: string; network: string; created_at: string } | null;
    product: { id: number; name: string; network: string } | null;
    product_variant: { id: number; variant_attributes: { size?: string } } | null;
}

interface PaginatedData {
    data: Commission[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props extends PageProps {
    stats: Stats;
    commissions: PaginatedData;
}

const statusBadge = (s: string) => {
    switch (s) {
        case 'available': return <Badge className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0">Available</Badge>;
        case 'withdrawn': return <Badge className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0">Withdrawn</Badge>;
        case 'reversed': return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Reversed</Badge>;
        default: return <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Pending</Badge>;
    }
};

export default function AgentCommissions() {
    const { auth, stats, commissions } = usePage<Props>().props;

    return (
        <DashboardLayout user={auth.user} header="Commissions">
            <Head title="Commissions" />

            <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-green-600 rounded-none p-4 text-white border-b-4 border-green-700">
                        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">Available</p>
                        <p className="text-xl font-bold">GHS {stats.available_commission.toFixed(2)}</p>
                    </div>
                    <div className="bg-blue-600 rounded-none p-4 text-white border-b-4 border-blue-700">
                        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">Withdrawn</p>
                        <p className="text-xl font-bold">GHS {stats.total_withdrawn.toFixed(2)}</p>
                    </div>
                    <div className="bg-purple-600 rounded-none p-4 text-white border-b-4 border-purple-700">
                        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">Total Earnings</p>
                        <p className="text-xl font-bold">GHS {stats.total_earnings.toFixed(2)}</p>
                    </div>
                    <div className="bg-orange-600 rounded-none p-4 text-white border-b-4 border-orange-700">
                        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">Shop Orders</p>
                        <p className="text-xl font-bold">{stats.total_orders}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Commission History</h3>
                        <span className="text-xs text-muted-foreground">{commissions.total} total</span>
                    </div>

                    {commissions.data.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground text-sm">No commissions yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs font-bold uppercase tracking-widest text-gray-500">
                                        <th className="px-4 py-2">Order</th>
                                        <th className="px-4 py-2">Product</th>
                                        <th className="px-4 py-2">Base</th>
                                        <th className="px-4 py-2">Agent Price</th>
                                        <th className="px-4 py-2">Commission</th>
                                        <th className="px-4 py-2">Status</th>
                                        <th className="px-4 py-2">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {commissions.data.map((c) => (
                                        <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800">
                                            <td className="px-4 py-2">
                                                <span className="font-medium">#{c.order_id}</span>
                                                {c.order && <span className="text-xs text-gray-400 ml-1">{c.order.network}</span>}
                                            </td>
                                            <td className="px-4 py-2 text-xs">
                                                {c.product?.name || '—'}
                                                {c.product_variant?.variant_attributes?.size && (
                                                    <span className="text-gray-400 ml-1">({c.product_variant.variant_attributes.size})</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">GHS {Number(c.base_price).toFixed(2)}</td>
                                            <td className="px-4 py-2">GHS {Number(c.agent_price).toFixed(2)}</td>
                                            <td className="px-4 py-2 font-bold text-green-600">GHS {Number(c.commission_amount).toFixed(2)}</td>
                                            <td className="px-4 py-2">{statusBadge(c.status)}</td>
                                            <td className="px-4 py-2 text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {commissions.last_page > 1 && (
                        <div className="flex justify-center gap-2 p-4">
                            {Array.from({ length: commissions.last_page }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    size="sm"
                                    variant={page === commissions.current_page ? 'default' : 'outline'}
                                    onClick={() => router.get(route('agent.commissions'), { page }, { preserveState: true })}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
