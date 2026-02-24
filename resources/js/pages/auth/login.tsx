import { useEffect, FormEventHandler, useState } from 'react';
import GuestLayout from '@/layouts/GuestLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Log in" />
            <div className="text-center mb-8">
                <img src='/affiliatesconnects.jpg' alt="Affiliates Connects Logo" className="w-40 h-20 mx-auto mb-4 rounded-none" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">Sign In</h2>
                <p className="text-sm text-gray-500 mt-2">Welcome back to Debkins</p>
            </div>
            <form onSubmit={submit} className="space-y-6">
                <div>
                    <Label htmlFor="email" className="text-xs uppercase font-bold tracking-wider">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoFocus
                        className="mt-1 rounded-none border-gray-300 dark:border-gray-600 focus:ring-0 focus:border-blue-600 shadow-none h-11"
                    />
                    {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                </div>

                <div>
                    <Label htmlFor="password" title="Password" className="text-xs uppercase font-bold tracking-wider">Password</Label>
                    <div className="relative mt-1">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            className="pr-10 rounded-none border-gray-300 dark:border-gray-600 focus:ring-0 focus:border-blue-600 shadow-none h-11"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                    </div>
                    {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
                </div>

                <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="w-4 h-4 rounded-none border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-0"
                        />
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Remember me</span>
                    </label>
                    <Link
                        href={route('password.request')}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 underline uppercase font-bold tracking-tighter"
                    >
                        Forgot?
                    </Link>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-none h-12 shadow-none font-bold uppercase tracking-widest transition-colors" disabled={processing}>
                    {processing ? 'Processing...' : 'Login'}
                </Button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">New here? </span>
                <Link
                    href={route('register')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 font-bold uppercase text-xs tracking-widest ml-1"
                >
                    Create Account
                </Link>
            </div>
        </GuestLayout>
    );
}
