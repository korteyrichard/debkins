import { FormEventHandler } from 'react';
import GuestLayout from '@/layouts/GuestLayout';
import { Button } from '@/components/ui/button';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="mb-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed uppercase tracking-tight font-medium">
                Thanks for signing up! Before getting started, could you verify your email address by clicking on the
                link we just emailed to you? If you didn't receive the email, we will gladly send you another.
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-6 font-bold text-xs text-green-600 dark:text-green-400 border border-green-200 p-2 bg-green-50 uppercase tracking-widest leading-normal">
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-8 flex flex-col gap-4 pt-6 border-t border-gray-100">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-none h-12 shadow-none font-bold uppercase tracking-widest" disabled={processing}>
                        Resend Verification Email
                    </Button>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-xs uppercase font-bold tracking-widest text-gray-500 hover:text-gray-800 underline block"
                    >
                        Log Out
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
