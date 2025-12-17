import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { strict } from 'node:assert';

interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    network: string;
  };
  quantity: string;
  beneficiary_number: string;
}

interface CheckoutPageProps {
  cartItems: CartItem[];
  walletBalance: number;
  auth: any;
  flash?: {
    success?: string;
    error?: string;
  };
  [key: string]: any;
}

export default function CheckoutPage() {
  const {
    cartItems = [],
    walletBalance = 0,
    auth,
    flash = {},
  } = usePage<CheckoutPageProps>().props;

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (flash.success) alert(flash.success);
    if (flash.error) alert(flash.error);
  }, [flash]);



  const handleCheckout = () => {
    // Check if user has sufficient balance
    if (walletBalance < total) {
      alert('Your balance is not enough to make this purchase');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    router.post(route('checkout.process'), {  cartItems: JSON.stringify(cartItems)  }, {
      onFinish: () => setLoading(false),
      onError: (errors) => {
        setErrorMessage('Failed to place order. Please try again.');
        console.error(errors);
      },
    });
  };


  // Fixed total calculation - just sum the prices since quantity represents data amount (1GB, 2GB)
  const total = cartItems.reduce((sum, item) => {
    const price = Number(item.product?.price) || 0;
    return sum + price;
  }, 0);

  return (
    <DashboardLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Checkout
        </h2>
      }
    >
      <Head title="Checkout" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Checkout
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Review your order and complete your purchase
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Order Summary</h2>
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                              {item.product?.name || 'Data Bundle'}
                            </h3>
                            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium uppercase tracking-wide">
                              {item.product?.network || 'Unknown'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Data Size:</span>
                              <div className="font-medium text-gray-900 dark:text-white mt-1">
                                {item.quantity}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Beneficiary:</span>
                              <div className="font-mono text-gray-900 dark:text-white mt-1">
                                {item.beneficiary_number || 'Not specified'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-6">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            GHS {Number(item.product?.price || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-6 sticky top-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="text-gray-900 dark:text-white">GHS {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Processing Fee</span>
                      <span className="text-gray-900 dark:text-white">GHS 0.00</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          GHS {total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Wallet Balance</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      GHS {Number(walletBalance).toFixed(2)}
                    </div>
                    {walletBalance < total && (
                      <div className="text-red-600 text-sm mt-1">
                        Insufficient balance
                      </div>
                    )}
                  </div>

                  {(flash.error || errorMessage) && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4">
                      {flash.error || errorMessage}
                    </div>
                  )}
                  {flash.success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 mb-4">
                      {flash.success}
                    </div>
                  )}

                  <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                    onClick={handleCheckout}
                    disabled={loading || cartItems.length === 0 || walletBalance < total}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Processing Order...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Complete Purchase
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}