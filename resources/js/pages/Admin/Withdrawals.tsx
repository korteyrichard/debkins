import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { PageProps } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Agent {
    id: number;
    name: string;
    email: string;
}

interface Withdrawal {
    id: number;
    agent_id: number;
    amount: string;
    withdrawal_fee: string;
    net_amount: string;
    status: 'pending' | 'approved' | 'rejected';
    notes: string | null;
    processed_at: string | null;
    created_at: string;
    agent: Agent;
}

interface PaginatedData {
    data: Withdrawal[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Summary {
    total_pending: number;
    total_approved: number;
    total_rejected: number;
    pending_count: number;
}

interface WithdrawalsProps extends PageProps {
    withdrawals: PaginatedData;
    filters: { status?: string };
    summary: Summary;
}

export default function AdminWithdrawals() {
    const { auth, withdrawals, filters, summary } = usePage<WithdrawalsProps>().props;
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [notes, setNotes] = useState<Record<number, string>>({});
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const handleProcess = (id: number, action: 'approve' | 'reject') => {
        setProcessingId(id);
        router.post(route('admin.withdrawals.process', id), {
            action,
            notes: notes[id] || '',
        }, {
            preserveScroll: true,
            onFinish: () => setProcessingId(null),
        });
    };

    const handleFilter = (value: string) => {
        setStatusFilter(value);
        router.get(route('admin.withdrawals'), value === 'all' ? {} : { status: value }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout user={auth.user} header="Agent Withdrawals">
            <Head title="Agent Withdrawals" />

            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm">
                        <div>
                            <p className="text-xs text-muted-foreground">Pending</p>
                            <p className="text-lg font-bold">GHS {summary.total_pending.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">{summary.pending_count} request{summary.pending_count !== 1 ? 's' : ''}</p>
                        </div>
                        <Clock className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm">
                        <div>
                            <p className="text-xs text-muted-foreground">Approved</p>
                            <p className="text-lg font-bold">GHS {summary.total_approved.toFixed(2)}</p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm">
                        <div>
                            <p className="text-xs text-muted-foreground">Rejected</p>
                            <p className="text-lg font-bold">GHS {summary.total_rejected.toFixed(2)}</p>
                        </div>
                        <XCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border rounded-lg shadow-sm">
                        <div>
                            <p className="text-xs text-muted-foreground">All Time</p>
                            <p className="text-lg font-bold">GHS {(summary.total_pending + summary.total_approved + summary.total_rejected).toFixed(2)}</p>
                        </div>
                        <DollarSign className="h-5 w-5 text-blue-500" />
                    </div>
                </div>

                {/* Filter */}
                <div className="flex items-center justify-between">
                    <Select value={statusFilter} onValueChange={handleFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Withdrawals</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">{withdrawals.total} total</span>
                </div>

                {/* Withdrawals List */}
                {withdrawals.data.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground bg-white dark:bg-gray-800 border rounded-lg">
                        No withdrawal requests found.
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 border rounded-lg divide-y">
                        {withdrawals.data.map((w) => (
                            <div key={w.id} className={`px-4 py-3 ${w.status === 'pending' ? 'border-l-3 border-l-yellow-500' : ''}`}>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                            <span className="text-blue-700 text-xs font-bold">{w.agent?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-bold">GHS {Number(w.amount).toFixed(2)}</span>
                                                {Number(w.withdrawal_fee) > 0 && (
                                                    <span className="text-[10px] text-orange-600">Fee: {Number(w.withdrawal_fee).toFixed(2)}</span>
                                                )}
                                                {Number(w.withdrawal_fee) > 0 && (
                                                    <span className="text-[10px] text-green-600 font-medium">Net: {Number(w.net_amount).toFixed(2)}</span>
                                                )}
                                                {w.status === 'pending' && <Badge className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0">Pending</Badge>}
                                                {w.status === 'approved' && <Badge className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0">Approved</Badge>}
                                                {w.status === 'rejected' && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Rejected</Badge>}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{w.agent?.name} · {w.agent?.email} · {new Date(w.created_at).toLocaleDateString()}</p>
                                            {w.notes && <p className="text-xs text-gray-400 truncate">Note: {w.notes}</p>}
                                        </div>
                                    </div>

                                    {w.status === 'pending' && (
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button
                                                size="sm"
                                                className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                                                disabled={processingId === w.id}
                                                onClick={() => handleProcess(w.id, 'approve')}
                                            >
                                                {processingId === w.id ? '...' : 'Approve'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="h-7 px-2 text-xs"
                                                disabled={processingId === w.id}
                                                onClick={() => handleProcess(w.id, 'reject')}
                                            >
                                                {processingId === w.id ? '...' : 'Reject'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {withdrawals.last_page > 1 && (
                    <div className="flex justify-center gap-2 pt-4">
                        {Array.from({ length: withdrawals.last_page }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                size="sm"
                                variant={page === withdrawals.current_page ? 'default' : 'outline'}
                                onClick={() => router.get(route('admin.withdrawals'), { ...filters, page }, { preserveState: true })}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
