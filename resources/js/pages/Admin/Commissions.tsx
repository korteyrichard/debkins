import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { PageProps } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';

interface Commission {
    id: number;
    agent_id: number;
    order_id: number;
    base_price: string;
    agent_price: string;
    commission_amount: string;
    withdrawn_amount: string;
    status: string;
    created_at: string;
    agent: { id: number; name: string; email: string } | null;
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

interface Summary {
    total_commissions: number;
    total_available: number;
    total_withdrawn: number;
}

interface Props extends PageProps {
    commissions: PaginatedData;
    filters: { status?: string; agent_id?: string };
    summary: Summary;
}

const statusBadge = (s: string) => {
    switch (s) {
        case 'available': return <Badge className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0">Available</Badge>;
        case 'withdrawn': return <Badge className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0">Withdrawn</Badge>;
        case 'reversed': return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Reversed</Badge>;
        default: return <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Pending</Badge>;
    }
};

export default function AdminCommissions() {
    const { auth, commissions, filters, summary } = usePage<Props>().props;
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const handleFilter = (value: string) => {
        setStatusFilter(value);
        router.get(route('admin.commissions'), value === 'all' ? {} : { status: value }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout user={auth.user} header="Commissions">
            <Head title="Commissions" />

            <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm">
                        <div>
                            <p className="text-xs text-muted-foreground">Total Commissions</p>
                            <p className="text-lg font-bold">GHS {summary.total_commissions.toFixed(2)}</p>
                        </div>
                        <DollarSign className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm">
                        <div>
                            <p className="text-xs text-muted-foreground">Available</p>
                            <p className="text-lg font-bold">GHS {summary.total_available.toFixed(2)}</p>
                        </div>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm">
                        <div>
                            <p className="text-xs text-muted-foreground">Withdrawn</p>
                            <p className="text-lg font-bold">GHS {summary.total_withdrawn.toFixed(2)}</p>
                        </div>
                        <Wallet className="h-5 w-5 text-blue-500" />
                    </div>
                </div>

                {/* Filter */}
                <div className="flex items-center justify-between">
                    <Select value={statusFilter} onValueChange={handleFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="withdrawn">Withdrawn</SelectItem>
                            <SelectItem value="reversed">Reversed</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">{commissions.total} total</span>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 border rounded-lg overflow-hidden">
                    {commissions.data.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground text-sm">No commissions found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs font-bold uppercase tracking-widest text-gray-500 bg-gray-50 dark:bg-gray-900">
                                        <th className="px-3 py-2">Agent</th>
                                        <th className="px-3 py-2">Order</th>
                                        <th className="px-3 py-2">Product</th>
                                        <th className="px-3 py-2">Base</th>
                                        <th className="px-3 py-2">Agent $</th>
                                        <th className="px-3 py-2">Commission</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {commissions.data.map((c) => (
                                        <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                            <td className="px-3 py-2">
                                                <p className="font-medium text-xs">{c.agent?.name || '—'}</p>
                                                <p className="text-[10px] text-gray-400">{c.agent?.email}</p>
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="font-medium">#{c.order_id}</span>
                                                {c.order && <span className="text-[10px] text-gray-400 ml-1">{c.order.network}</span>}
                                            </td>
                                            <td className="px-3 py-2 text-xs">
                                                {c.product?.name || '—'}
                                                {c.product_variant?.variant_attributes?.size && (
                                                    <span className="text-gray-400 ml-1">({c.product_variant.variant_attributes.size})</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-xs">{Number(c.base_price).toFixed(2)}</td>
                                            <td className="px-3 py-2 text-xs">{Number(c.agent_price).toFixed(2)}</td>
                                            <td className="px-3 py-2 font-bold text-green-600 text-xs">{Number(c.commission_amount).toFixed(2)}</td>
                                            <td className="px-3 py-2">{statusBadge(c.status)}</td>
                                            <td className="px-3 py-2 text-[10px] text-gray-400">{new Date(c.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {commissions.last_page > 1 && (
                        <div className="flex justify-center gap-2 p-3 border-t">
                            {Array.from({ length: commissions.last_page }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    size="sm"
                                    variant={page === commissions.current_page ? 'default' : 'outline'}
                                    onClick={() => router.get(route('admin.commissions'), { ...filters, page }, { preserveState: true })}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
