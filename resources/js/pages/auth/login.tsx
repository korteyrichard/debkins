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
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
                    <div className="text-center mb-6">
                        <img src='/affiliatesconnects.jpg' alt="Affiliates Connects Logo" className="w-40 h-20 mx-auto mb-3 rounded-lg" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Sign In</h2>
                    </div>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoFocus
                                className="mt-1"
                            />
                            {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                        </div>
                        
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <div className="relative mt-1">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2">
                                <Input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <span className="text-gray-600 dark:text-gray-400">Remember me</span>
                            </label>
                            <Link
                                href={route('password.request')}
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={processing}>
                            {processing ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">Don't have an account? </span>
                        <Link
                            href={route('register')}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium"
                        >
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
