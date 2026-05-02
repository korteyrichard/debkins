import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

interface OrderInfo {
    id: number;
    total: number;
    beneficiary_number: string;
    network: string;
    product_name: string;
    size: string;
}

interface ShopInfo {
    name: string;
    slug: string;
}

interface Props {
    order: OrderInfo;
    shop: ShopInfo;
}

export default function ShopSuccess() {
    const { order, shop } = usePage<Props>().props;

    return (
        <>
            <Head title="Order Successful" />

            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
                    <div className="bg-green-500 px-6 py-8 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-1">Payment Successful!</h1>
                        <p className="text-green-100 text-sm">Your order has been placed</p>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Order ID</span>
                                <span className="font-bold">#{order.id}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Product</span>
                                <span className="font-medium">{order.product_name} {order.size && `(${order.size})`}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Network</span>
                                <span className="font-medium">{order.network}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Beneficiary</span>
                                <span className="font-medium">{order.beneficiary_number}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between">
                                <span className="text-gray-500 text-sm">Amount Paid</span>
                                <span className="text-lg font-bold text-green-600">GHS {Number(order.total).toFixed(2)}</span>
                            </div>
                        </div>

                        <p className="text-xs text-gray-400 text-center">
                            Your order is being processed. The data bundle will be delivered to the beneficiary number shortly.
                        </p>

                        <a href={`/shop/${shop.slug}`} className="block">
                            <Button variant="outline" className="w-full rounded-lg">
                                Back to {shop.name}
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
