import { useEffect, FormEventHandler } from 'react';
import GuestLayout from '@/layouts/GuestLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }: { token: string; email: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.store'));
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <Label htmlFor="email" className="text-xs uppercase font-bold tracking-wider">Email Address</Label>

                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-none border-gray-300 shadow-none h-11 focus:ring-0 focus:border-blue-600"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    {errors.email && <div className="text-red-500 text-xs mt-1 uppercase font-bold">{errors.email}</div>}
                </div>

                <div className="mt-4">
                    <Label htmlFor="password" title="Password" className="text-xs uppercase font-bold tracking-wider">New Password</Label>

                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-none border-gray-300 shadow-none h-11 focus:ring-0 focus:border-blue-600"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    {errors.password && <div className="text-red-500 text-xs mt-1 uppercase font-bold">{errors.password}</div>}
                </div>

                <div className="mt-4">
                    <Label htmlFor="password_confirmation" title="Confirm Password" className="text-xs uppercase font-bold tracking-wider">Confirm New Password</Label>

                    <Input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full rounded-none border-gray-300 shadow-none h-11 focus:ring-0 focus:border-blue-600"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />

                    {errors.password_confirmation && <div className="text-red-500 text-xs mt-1 uppercase font-bold">{errors.password_confirmation}</div>}
                </div>

                <div className="flex items-center justify-end mt-6 pt-4 border-t border-gray-100">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-none h-12 shadow-none font-bold uppercase tracking-widest" disabled={processing}>
                        Reset Password
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
