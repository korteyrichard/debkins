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
            <div className="text-center mb-8">
                <img src='/affiliatesconnects.jpg' alt="Affiliates Connects Logo" className="w-40 h-20 mx-auto mb-4 rounded-none" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">Create Account</h2>
                <p className="text-sm text-gray-500 mt-2">Join the Debkins network today</p>
            </div>
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name" className="text-xs uppercase font-bold tracking-wider">Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={data.name}
                            autoComplete="name"
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            className="mt-1 rounded-none border-gray-300 dark:border-gray-600 focus:ring-0 focus:border-blue-600 shadow-none h-11"
                        />
                        {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                    </div>

                    <div>
                        <Label htmlFor="business_name" className="text-xs uppercase font-bold tracking-wider">Business Name</Label>
                        <Input
                            id="business_name"
                            name="business_name"
                            value={data.business_name}
                            autoComplete="organization"
                            onChange={(e) => setData('business_name', e.target.value)}
                            className="mt-1 rounded-none border-gray-300 dark:border-gray-600 focus:ring-0 focus:border-blue-600 shadow-none h-11"
                        />
                        {errors.business_name && <div className="text-red-500 text-xs mt-1">{errors.business_name}</div>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="phone" className="text-xs uppercase font-bold tracking-wider">Phone Number</Label>
                        <Input
                            id="phone"
                            name="phone"
                            value={data.phone}
                            autoComplete="tel"
                            onChange={(e) => setData('phone', e.target.value)}
                            className="mt-1 rounded-none border-gray-300 dark:border-gray-600 focus:ring-0 focus:border-blue-600 shadow-none h-11"
                        />
                        {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
                    </div>

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
                            className="mt-1 rounded-none border-gray-300 dark:border-gray-600 focus:ring-0 focus:border-blue-600 shadow-none h-11"
                        />
                        {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                    </div>
                </div>

                <div>
                    <Label htmlFor="password" title="Password" className="text-xs uppercase font-bold tracking-wider">Password</Label>
                    <div className="relative mt-1">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            autoComplete="new-password"
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

                <div>
                    <Label htmlFor="password_confirmation" title="Confirm Password" className="text-xs uppercase font-bold tracking-wider">Confirm Password</Label>
                    <div className="relative mt-1">
                        <Input
                            id="password_confirmation"
                            type={showPasswordConfirmation ? "text" : "password"}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                            className="pr-10 rounded-none border-gray-300 dark:border-gray-600 focus:ring-0 focus:border-blue-600 shadow-none h-11"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPasswordConfirmation ? '🙈' : '👁️'}
                        </button>
                    </div>
                    {errors.password_confirmation && <div className="text-red-500 text-xs mt-1">{errors.password_confirmation}</div>}
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-none h-12 shadow-none font-bold uppercase tracking-widest transition-colors mt-4" disabled={processing}>
                    {processing ? 'Creating Account...' : 'Register'}
                </Button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Already a member? </span>
                <Link
                    href={route('login')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 font-bold uppercase text-xs tracking-widest ml-1"
                >
                    Sign In
                </Link>
            </div>
        </GuestLayout>
    );
}
