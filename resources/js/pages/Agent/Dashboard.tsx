import React, { useState } from 'react';
import { Head, usePage, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Stats {
    pending_commission: number;
    available_commission: number;
    total_withdrawn: number;
    total_earnings: number;
    total_orders: number;
}

interface ReferralStats {
    total_referrals: number;
    available_referral_commission: number;
}

interface Shop {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    primary_color: string | null;
    background_color: string | null;
    logo: string | null;
    logo_url: string | null;
}

interface Withdrawal {
    id: number;
    amount: string;
    status: string;
    created_at: string;
}

interface AgentDashboardProps extends PageProps {
    stats: Stats;
    referralStats: ReferralStats;
    shop: Shop | null;
    recentWithdrawals: Withdrawal[];
    withdrawalSettings: {
        minimum_withdrawal: number;
        withdrawal_fee: number;
    };
}

export default function AgentDashboard() {
    const { auth, stats, referralStats, shop, recentWithdrawals, withdrawalSettings } = usePage<AgentDashboardProps>().props;
    const [editingShop, setEditingShop] = useState(false);

    const [createLogo, setCreateLogo] = useState<File | null>(null);
    const [editLogo, setEditLogo] = useState<File | null>(null);
    const shopForm = useForm({ name: '' });
    const editForm = useForm({
        name: shop?.name || '',
        primary_color: shop?.primary_color || '#2563eb',
        background_color: shop?.background_color || '#f3f4f6',
        is_active: shop?.is_active ?? true,
    });
    const withdrawForm = useForm({ amount: '' });

    const handleCreateShop = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', shopForm.data.name);
        if (createLogo) formData.append('logo', createLogo);
        router.post(route('agent.shop.create'), formData, { preserveScroll: true });
    };

    const handleUpdateShop = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('name', editForm.data.name);
        formData.append('primary_color', editForm.data.primary_color);
        formData.append('background_color', editForm.data.background_color);
        formData.append('is_active', editForm.data.is_active ? '1' : '0');
        if (editLogo) formData.append('logo', editLogo);
        router.post(route('agent.shop.update'), formData, {
            preserveScroll: true,
            onSuccess: () => { setEditingShop(false); setEditLogo(null); },
        });
    };

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        withdrawForm.post(route('agent.withdrawals.request'), {
            preserveScroll: true,
            onSuccess: () => withdrawForm.reset(),
        });
    };

    const storeDomain = (usePage().props as any).store_domain;
    const shopUrl = shop ? `https://${storeDomain}/shop/${shop.slug}` : '';

    return (
        <DashboardLayout user={auth.user} header="Store Dashboard">
            <Head title="Store Dashboard" />

            <div className="space-y-6">
                {/* Commission Stats */}
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Shop Section */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">My Shop</h3>
                        {shop ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-lg">{shop.name}</span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={shop.is_active ? 'default' : 'secondary'}>
                                            {shop.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                        <Button size="sm" variant="outline" onClick={() => setEditingShop(true)}>
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                                {/* Logo & Color preview */}
                                <div className="flex items-center gap-3">
                                    {shop.logo_url && (
                                        <img src={shop.logo_url} alt="Shop logo" className="w-10 h-10 rounded object-cover border" />
                                    )}
                                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: shop.primary_color || '#2563eb' }} title="Primary" />
                                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: shop.background_color || '#f3f4f6' }} title="Background" />
                                    <span className="text-xs text-gray-400">Shop colors</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-none">
                                    <p className="text-xs text-gray-500 mb-1">Shop URL</p>
                                    <div className="flex items-center gap-2">
                                        <code className="text-sm text-blue-600 break-all flex-1">{shopUrl}</code>
                                        <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(shopUrl)}>
                                            Copy
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-none"
                                        onClick={() => router.visit(route('agent.products'))}
                                    >
                                        Manage Products
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 rounded-none"
                                        onClick={() => window.open(shopUrl, '_blank')}
                                    >
                                        View Shop
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleCreateShop} className="space-y-3">
                                <Input
                                    placeholder="Shop name"
                                    value={shopForm.data.name}
                                    onChange={(e) => shopForm.setData('name', e.target.value)}
                                    maxLength={100}
                                />
                                {shopForm.errors.name && <p className="text-red-500 text-xs">{shopForm.errors.name}</p>}
                                {(shopForm.errors as any).message && <p className="text-red-500 text-xs">{(shopForm.errors as any).message}</p>}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Shop Logo (optional)</label>
                                    <input type="file" accept="image/*" onChange={(e) => setCreateLogo(e.target.files?.[0] || null)} className="text-sm" />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={shopForm.processing || !shopForm.data.name}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-none"
                                >
                                    {shopForm.processing ? 'Creating...' : 'Create Shop'}
                                </Button>
                            </form>
                        )}
                    </div>

                    {/* Withdrawal Section */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Request Withdrawal</h3>
                        <form onSubmit={handleWithdraw} className="space-y-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Available: <span className="font-bold text-green-600">
                                    GHS {(stats.available_commission + referralStats.available_referral_commission).toFixed(2)}
                                </span>
                            </p>
                            {withdrawalSettings.withdrawal_fee > 0 && (
                                <p className="text-xs text-orange-600 dark:text-orange-400">
                                    Withdrawal fee: {withdrawalSettings.withdrawal_fee}%
                                </p>
                            )}
                            <Input
                                type="number"
                                step="0.01"
                                min={withdrawalSettings.minimum_withdrawal}
                                placeholder={`Amount (min GHS ${withdrawalSettings.minimum_withdrawal.toFixed(2)})`}
                                value={withdrawForm.data.amount}
                                onChange={(e) => withdrawForm.setData('amount', e.target.value)}
                            />
                            {withdrawForm.data.amount && Number(withdrawForm.data.amount) > 0 && withdrawalSettings.withdrawal_fee > 0 && (
                                <p className="text-xs text-gray-500">
                                    Fee: GHS {(Number(withdrawForm.data.amount) * withdrawalSettings.withdrawal_fee / 100).toFixed(2)} · You will receive: <span className="font-bold text-green-600">
                                        GHS {(Number(withdrawForm.data.amount) - Number(withdrawForm.data.amount) * withdrawalSettings.withdrawal_fee / 100).toFixed(2)}
                                    </span>
                                </p>
                            )}
                            {withdrawForm.errors.amount && <p className="text-red-500 text-xs">{withdrawForm.errors.amount}</p>}
                            {(withdrawForm.errors as any).message && <p className="text-red-500 text-xs">{(withdrawForm.errors as any).message}</p>}
                            <Button
                                type="submit"
                                disabled={withdrawForm.processing || !withdrawForm.data.amount}
                                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-none"
                            >
                                {withdrawForm.processing ? 'Submitting...' : 'Request Withdrawal'}
                            </Button>
                        </form>

                        {recentWithdrawals.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Recent</p>
                                {recentWithdrawals.map((w) => (
                                    <div key={w.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900 text-sm">
                                        <span>GHS {Number(w.amount).toFixed(2)}</span>
                                        <Badge variant={w.status === 'approved' ? 'default' : w.status === 'rejected' ? 'destructive' : 'secondary'}>
                                            {w.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Shop Modal */}
            {editingShop && shop && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md relative">
                        <button
                            onClick={() => setEditingShop(false)}
                            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500"
                            disabled={editForm.processing}
                        >
                            ✕
                        </button>

                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold">Edit Shop</h3>
                        </div>

                        <form onSubmit={handleUpdateShop} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Shop Name</label>
                                <Input
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    maxLength={100}
                                />
                                {editForm.errors.name && <p className="text-red-500 text-xs mt-1">{editForm.errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Primary Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={editForm.data.primary_color}
                                            onChange={(e) => editForm.setData('primary_color', e.target.value)}
                                            className="w-10 h-10 rounded border cursor-pointer"
                                        />
                                        <Input
                                            value={editForm.data.primary_color}
                                            onChange={(e) => editForm.setData('primary_color', e.target.value)}
                                            maxLength={7}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Background Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={editForm.data.background_color}
                                            onChange={(e) => editForm.setData('background_color', e.target.value)}
                                            className="w-10 h-10 rounded border cursor-pointer"
                                        />
                                        <Input
                                            value={editForm.data.background_color}
                                            onChange={(e) => editForm.setData('background_color', e.target.value)}
                                            maxLength={7}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="rounded-lg overflow-hidden border">
                                <div className="h-10 flex items-center justify-center" style={{ backgroundColor: editForm.data.primary_color }}>
                                    <span className="text-white text-xs font-bold">{editForm.data.name || 'Shop Preview'}</span>
                                </div>
                                <div className="h-8" style={{ backgroundColor: editForm.data.background_color }} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Shop Logo</label>
                                {shop.logo_url && (
                                    <img src={shop.logo_url} alt="Current logo" className="w-16 h-16 rounded object-cover border mb-2" />
                                )}
                                <input type="file" accept="image/*" onChange={(e) => setEditLogo(e.target.files?.[0] || null)} className="text-sm" />
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Shop Active</label>
                                <button
                                    type="button"
                                    onClick={() => editForm.setData('is_active', !editForm.data.is_active)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        editForm.data.is_active ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        editForm.data.is_active ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>

                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-none"
                            >
                                {editForm.processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
