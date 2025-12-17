import { useEffect, FormEventHandler, useState } from 'react';
import GuestLayout from '../../layouts/GuestLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        business_name: '',
        password: '',
        password_confirmation: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Register" />
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
                    <div className="text-center mb-6">
                        <img src='/affiliatesconnects.jpg' alt="Affiliates Connects Logo" className="w-40 h-20 mx-auto mb-3 rounded-lg" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create Account</h2>
                    </div>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={data.name}
                                autoComplete="name"
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                className="mt-1"
                            />
                            {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                        </div>
                        
                        <div>
                            <Label htmlFor="business_name">Business Name</Label>
                            <Input
                                id="business_name"
                                name="business_name"
                                value={data.business_name}
                                autoComplete="organization"
                                onChange={(e) => setData('business_name', e.target.value)}
                                className="mt-1"
                            />
                            {errors.business_name && <div className="text-red-500 text-sm mt-1">{errors.business_name}</div>}
                        </div>
                        
                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={data.phone}
                                autoComplete="tel"
                                onChange={(e) => setData('phone', e.target.value)}
                                className="mt-1"
                            />
                            {errors.phone && <div className="text-red-500 text-sm mt-1">{errors.phone}</div>}
                        </div>
                        
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
                                    autoComplete="new-password"
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
                        
                        <div>
                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                            <div className="relative mt-1">
                                <Input
                                    id="password_confirmation"
                                    type={showPasswordConfirmation ? "text" : "password"}
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswordConfirmation ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.password_confirmation && <div className="text-red-500 text-sm mt-1">{errors.password_confirmation}</div>}
                        </div>
                        
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={processing}>
                            {processing ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">Already have an account? </span>
                        <Link
                            href={route('login')}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
