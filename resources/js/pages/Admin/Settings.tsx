import React from 'react';
import { Head, usePage, useForm } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SettingsData {
    agent_registration_fee: number;
    minimum_withdrawal: number;
    withdrawal_fee: number;
    referral_commission_percentage: number;
    youtube_track_order_url: string;
    youtube_verify_topup_url: string;
}

interface SettingsProps extends PageProps {
    settings: SettingsData;
}

export default function AdminSettings() {
    const { auth, settings } = usePage<SettingsProps>().props;
    const form = useForm({
        agent_registration_fee: settings.agent_registration_fee,
        minimum_withdrawal: settings.minimum_withdrawal,
        withdrawal_fee: settings.withdrawal_fee,
        referral_commission_percentage: settings.referral_commission_percentage,
        youtube_track_order_url: settings.youtube_track_order_url || '',
        youtube_verify_topup_url: settings.youtube_verify_topup_url || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('admin.settings.update'), { preserveScroll: true });
    };

    return (
        <AdminLayout user={auth.user} header="Settings">
            <Head title="Admin Settings" />

            <div className="max-w-2xl mx-auto py-6 space-y-6">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border rounded-lg p-6 space-y-5">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Agent & Withdrawal Settings</h3>

                    <div>
                        <label className="block text-sm font-medium mb-1">Agent Registration Fee (GHS)</label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.data.agent_registration_fee}
                            onChange={(e) => form.setData('agent_registration_fee', parseFloat(e.target.value) || 0)}
                        />
                        {form.errors.agent_registration_fee && <p className="text-red-500 text-xs mt-1">{form.errors.agent_registration_fee}</p>}
                        <p className="text-xs text-muted-foreground mt-1">Fee charged when a user upgrades to agent</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Minimum Withdrawal Amount (GHS)</label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.data.minimum_withdrawal}
                            onChange={(e) => form.setData('minimum_withdrawal', parseFloat(e.target.value) || 0)}
                        />
                        {form.errors.minimum_withdrawal && <p className="text-red-500 text-xs mt-1">{form.errors.minimum_withdrawal}</p>}
                        <p className="text-xs text-muted-foreground mt-1">Minimum amount agents can withdraw</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Withdrawal Fee (%)</label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={form.data.withdrawal_fee}
                            onChange={(e) => form.setData('withdrawal_fee', parseFloat(e.target.value) || 0)}
                        />
                        {form.errors.withdrawal_fee && <p className="text-red-500 text-xs mt-1">{form.errors.withdrawal_fee}</p>}
                        <p className="text-xs text-muted-foreground mt-1">Percentage deducted from each withdrawal (e.g. 5 = 5%)</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Referral Commission (%)</label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={form.data.referral_commission_percentage}
                            onChange={(e) => form.setData('referral_commission_percentage', parseFloat(e.target.value) || 0)}
                        />
                        {form.errors.referral_commission_percentage && <p className="text-red-500 text-xs mt-1">{form.errors.referral_commission_percentage}</p>}
                        <p className="text-xs text-muted-foreground mt-1">Percentage of agent commission earned by the referrer (e.g. 5 = 5%)</p>
                    </div>

                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 pt-4 border-t">YouTube Video URLs</h3>

                    <div>
                        <label className="block text-sm font-medium mb-1">How to Track Your Order (YouTube URL)</label>
                        <Input
                            type="url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={form.data.youtube_track_order_url}
                            onChange={(e) => form.setData('youtube_track_order_url', e.target.value)}
                        />
                        {form.errors.youtube_track_order_url && <p className="text-red-500 text-xs mt-1">{form.errors.youtube_track_order_url}</p>}
                        <p className="text-xs text-muted-foreground mt-1">Displayed as a YouTube button on the shop page</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">How to Verify Your Top Up (YouTube URL)</label>
                        <Input
                            type="url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={form.data.youtube_verify_topup_url}
                            onChange={(e) => form.setData('youtube_verify_topup_url', e.target.value)}
                        />
                        {form.errors.youtube_verify_topup_url && <p className="text-red-500 text-xs mt-1">{form.errors.youtube_verify_topup_url}</p>}
                        <p className="text-xs text-muted-foreground mt-1">Displayed as a YouTube button on the wallet page</p>
                    </div>

                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {form.processing ? 'Saving...' : 'Save Settings'}
                    </Button>
                </form>
            </div>
        </AdminLayout>
    );
}
