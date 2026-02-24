import { FormEventHandler } from 'react';
import GuestLayout from '@/layouts/GuestLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed uppercase tracking-tight font-medium">
                Forgot your password? No problem. Just let us know your email address and we will email you a password
                reset link that will allow you to choose a new one.
            </div>

            {status && <div className="mb-6 font-bold text-xs text-green-600 dark:text-green-400 border border-green-200 p-2 bg-green-50 uppercase tracking-widest">{status}</div>}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <Label htmlFor="email" className="text-xs uppercase font-bold tracking-wider">Email Address</Label>

                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-none border-gray-300 shadow-none h-11 focus:ring-0 focus:border-blue-600"
                        required
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    {errors.email && <div className="text-red-500 text-xs mt-1 uppercase font-bold">{errors.email}</div>}
                </div>

                <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-100">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-none h-12 shadow-none font-bold uppercase tracking-widest" disabled={processing}>
                        Email Password Reset Link
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
