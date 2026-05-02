import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function ShopFailed() {
    return (
        <>
            <Head title="Payment Failed" />

            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
                    <div className="bg-red-500 px-6 py-8 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-1">Payment Failed</h1>
                        <p className="text-red-100 text-sm">Something went wrong with your payment</p>
                    </div>

                    <div className="p-6 space-y-4">
                        <p className="text-sm text-gray-500 text-center">
                            Your payment could not be verified. No charges were made. Please try again.
                        </p>
                        <Button
                            onClick={() => window.history.back()}
                            variant="outline"
                            className="w-full rounded-lg"
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
