import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageProps } from '@/types';

interface ShopInfo {
    name: string;
    slug: string;
    agent_name: string;
    agent_phone: string | null;
    primary_color: string | null;
    background_color: string | null;
    logo_url: string | null;
}

interface ShopProduct {
    id: number;
    product_name: string;
    network: string;
    expiry: string;
    size: string;
    agent_price: string;
    product_variant_id: number;
    product_id: number;
    in_stock: boolean;
}

interface ShopViewProps extends PageProps {
    shop: ShopInfo;
    products: ShopProduct[];
    flash?: { success?: string; error?: string };
    youtubeTrackOrderUrl?: string;
}

const networkMeta: Record<string, { color: string; icon: string }> = {
    MTN: { color: 'bg-yellow-500', icon: '/mtnlogo.jpeg' },
    TELECEL: { color: 'bg-red-500', icon: '/telecellogo.png' },
    ISHARE: { color: 'bg-blue-500', icon: '/atlogo.png' },
    BIGTIME: { color: 'bg-purple-500', icon: '/atlogo.png' },
};

interface TrackResult {
    type: 'order_found' | 'can_create_order';
    order?: {
        id: number;
        total: number;
        status: string;
        beneficiary_number: string;
        network: string;
        product_name: string;
        size: string;
        created_at: string;
    };
    paymentAmount?: number;
    availableProducts?: {
        id: number;
        product_name: string;
        network: string;
        size: string;
        agent_price: string;
        product_variant_id: number;
    }[];
    message?: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    processing: { bg: 'bg-blue-100', text: 'text-blue-800' },
    completed: { bg: 'bg-green-100', text: 'text-green-800' },
    failed: { bg: 'bg-red-100', text: 'text-red-800' },
    cancelled: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

export default function ShopView() {
    const { shop, products, flash, youtubeTrackOrderUrl } = usePage<ShopViewProps>().props;
    const [selected, setSelected] = useState<ShopProduct | null>(null);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Track order modal state
    const [showTrack, setShowTrack] = useState(false);
    const [trackPhone, setTrackPhone] = useState('');
    const [trackRef, setTrackRef] = useState('');
    const [trackSearching, setTrackSearching] = useState(false);
    const [trackError, setTrackError] = useState('');
    const [trackResult, setTrackResult] = useState<TrackResult | null>(null);
    const [trackSelectedProduct, setTrackSelectedProduct] = useState<number | null>(null);
    const [trackCreating, setTrackCreating] = useState(false);
    const [trackSuccess, setTrackSuccess] = useState('');

    const primaryColor = shop.primary_color || '#2563eb';

    // Replace favicon with shop logo or blank
    useEffect(() => {
        const setFavicon = (href: string | null) => {
            document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach(el => el.remove());
            if (href) {
                const link = document.createElement('link');
                link.rel = 'icon';
                link.href = href;
                document.head.appendChild(link);
            }
        };
        setFavicon(shop.logo_url);
        return () => setFavicon('/favicon.ico');
    }, [shop.logo_url]);

    const openModal = (product: ShopProduct) => {
        setSelected(product);
        setEmail('');
        setPhone('');
        setErrors({});
    };

    const closeModal = () => {
        if (!processing) {
            setSelected(null);
            setErrors({});
        }
    };

    const handlePurchase = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;

        const newErrors: Record<string, string> = {};
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Valid email is required.';
        if (!phone || phone.length < 10) newErrors.phone = 'Valid 10-digit phone number is required.';
        if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

        setProcessing(true);
        router.post(route('shop.purchase', shop.slug), {
            product_variant_id: selected.product_variant_id,
            beneficiary_number: phone,
            email: email,
        }, {
            onFinish: () => setProcessing(false),
            onError: (errs) => setErrors(errs as Record<string, string>),
        });
    };

    const meta = (network: string) => networkMeta[network.toUpperCase()] || { color: 'bg-gray-500', icon: '' };

    return (
        <>
            <Head title={shop.name}>
                <meta head-key="og:title" property="og:title" content={shop.name} />
                <meta head-key="og:type" property="og:type" content="website" />
                <meta head-key="twitter:card" name="twitter:card" content="summary" />
                <meta head-key="twitter:title" name="twitter:title" content={shop.name} />
                {shop.logo_url && <meta head-key="og:image" property="og:image" content={shop.logo_url} />}
                {shop.logo_url && <meta head-key="twitter:image" name="twitter:image" content={shop.logo_url} />}
                {shop.logo_url && <link head-key="favicon" rel="icon" href={shop.logo_url} />}
            </Head>

            <div className="min-h-screen" style={{ backgroundColor: shop.background_color || '#f3f4f6' }}>
                {/* Header */}
                <div className="text-white py-10 px-4" style={{ backgroundColor: primaryColor }}>
                    <div className="max-w-5xl mx-auto flex items-center justify-center gap-3">
                        {shop.logo_url && (
                            <img src={shop.logo_url} alt={shop.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/30" />
                        )}
                        <h1 className="text-3xl sm:text-4xl font-bold">{shop.name}</h1>
                    </div>
                </div>

                {/* Nav */}
                <div className="bg-white border-b border-gray-200 py-3 px-4 sticky top-0 z-10">
                    <div className="max-w-5xl mx-auto flex justify-center items-center gap-6">
                        <button onClick={() => { setShowTrack(true); setTrackError(''); setTrackResult(null); setTrackSuccess(''); }} className="text-sm font-medium hover:underline" style={{ color: primaryColor }}>Track Order</button>
                        {youtubeTrackOrderUrl && (
                            <a
                                href={youtubeTrackOrderUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:underline"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                How to Track Order
                            </a>
                        )}
                        {shop.agent_phone && (
                            <a
                                href={`https://wa.me/${shop.agent_phone.replace(/^0/, '233')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:underline"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                Contact Us
                            </a>
                        )}
                    </div>
                </div>

                {/* Flash messages */}
                {flash?.success && (
                    <div className="max-w-5xl mx-auto px-4 mt-4">
                        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
                            ✅ {flash.success}
                        </div>
                    </div>
                )}
                {flash?.error && (
                    <div className="max-w-5xl mx-auto px-4 mt-4">
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                            ❌ {flash.error}
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                <div className="max-w-5xl mx-auto px-4 py-8">
                    {products.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-5xl mb-4">🏪</div>
                            <p className="text-gray-500 text-lg">No products available yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {products.map((product) => {
                                const m = meta(product.network);
                                return (
                                    <button
                                        key={product.id}
                                        onClick={() => product.in_stock && openModal(product)}
                                        disabled={!product.in_stock}
                                        className={`bg-white border border-gray-200 rounded-lg overflow-hidden text-left transition-all duration-200 ${
                                            product.in_stock
                                                ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'
                                                : 'opacity-50 cursor-not-allowed'
                                        }`}
                                    >
                                        {/* Network banner */}
                                        <div className={`${m.color} px-3 py-2 flex items-center gap-2`}>
                                            {m.icon && (
                                                <img src={m.icon} alt="" className="w-6 h-6 rounded-full object-cover" />
                                            )}
                                            <span className="text-white text-xs font-bold uppercase tracking-wider">
                                                {product.network}
                                            </span>
                                        </div>

                                        <div className="p-4">
                                            <p className="font-semibold text-gray-900 text-sm mb-1 truncate">{product.product_name}</p>

                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs text-gray-500">{product.expiry}</span>
                                                <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                                    {product.size}
                                                </span>
                                            </div>

                                            <div className="text-xl font-bold" style={{ color: primaryColor }}>
                                                GHS {Number(product.agent_price).toFixed(2)}
                                            </div>

                                            {!product.in_stock && (
                                                <p className="text-red-500 text-xs font-medium mt-2">Out of Stock</p>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Track Order Modal */}
            {showTrack && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto" style={{ colorScheme: 'light' }}>
                        <button
                            onClick={() => setShowTrack(false)}
                            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                        >
                            ✕
                        </button>

                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Track Your Order</h2>
                            <p className="text-xs text-gray-500 mt-1">Enter your beneficiary number and Paystack reference</p>
                        </div>

                        <div className="p-6 space-y-4">
                            {trackSuccess && (
                                <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-lg text-sm">✅ {trackSuccess}</div>
                            )}

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                setTrackSearching(true);
                                setTrackError('');
                                setTrackResult(null);
                                setTrackSuccess('');
                                setTrackSelectedProduct(null);
                                fetch(`/shop/${shop.slug}/track`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '', 'Accept': 'application/json' },
                                    body: JSON.stringify({ beneficiary_number: trackPhone, reference: trackRef }),
                                })
                                    .then(async (res) => {
                                        const data = await res.json();
                                        if (!res.ok) setTrackError(data.error || data.message || 'Something went wrong.');
                                        else setTrackResult(data);
                                    })
                                    .catch(() => setTrackError('Something went wrong.'))
                                    .finally(() => setTrackSearching(false));
                            }} className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary Number</label>
                                    <Input type="tel" placeholder="0240000000" value={trackPhone} onChange={(e) => setTrackPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className="rounded-lg bg-white text-gray-900 border-gray-300 placeholder:text-gray-400" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Paystack Reference</label>
                                    <Input type="text" placeholder="shop_xxxxxxxxxxxxxxxx" value={trackRef} onChange={(e) => setTrackRef(e.target.value.trim())} className="rounded-lg bg-white text-gray-900 border-gray-300 placeholder:text-gray-400" />
                                </div>
                                {trackError && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded">{trackError}</p>}
                                <Button type="submit" disabled={trackSearching || !trackPhone || !trackRef} className="w-full h-11 text-white font-semibold rounded-lg" style={{ backgroundColor: primaryColor }}>
                                    {trackSearching ? 'Searching...' : 'Track Order'}
                                </Button>
                            </form>

                            {/* Order Found */}
                            {trackResult?.type === 'order_found' && trackResult.order && (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                        <span className="font-semibold text-gray-900 text-sm">Order #{trackResult.order.id}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${(statusColors[trackResult.order.status] || statusColors.pending).bg} ${(statusColors[trackResult.order.status] || statusColors.pending).text}`}>
                                            {trackResult.order.status.charAt(0).toUpperCase() + trackResult.order.status.slice(1)}
                                        </span>
                                    </div>
                                    <div className="p-4 space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="text-gray-500">Product</span><span className="font-medium">{trackResult.order.product_name} {trackResult.order.size && `(${trackResult.order.size})`}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Network</span><span className="font-medium">{trackResult.order.network}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Beneficiary</span><span className="font-medium">{trackResult.order.beneficiary_number}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{trackResult.order.created_at}</span></div>
                                        <div className="border-t pt-2 flex justify-between"><span className="text-gray-500">Amount</span><span className="text-base font-bold" style={{ color: primaryColor }}>GHS {Number(trackResult.order.total).toFixed(2)}</span></div>
                                    </div>
                                </div>
                            )}

                            {/* Can Create Order */}
                            {trackResult?.type === 'can_create_order' && trackResult.availableProducts && trackResult.availableProducts.length > 0 && (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="font-semibold text-gray-900 text-sm">Payment Found - No Order Created</p>
                                        <p className="text-xs text-gray-500 mt-1">Your payment of GHS {trackResult.paymentAmount?.toFixed(2)} was successful. Select a product to create your order.</p>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {trackResult.availableProducts.map((p) => (
                                            <button key={p.id} onClick={() => setTrackSelectedProduct(p.product_variant_id)} className={`w-full text-left p-3 rounded-lg border-2 transition-all ${trackSelectedProduct === p.product_variant_id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <div className="flex justify-between items-center">
                                                    <div><p className="font-medium text-sm">{p.product_name}</p><p className="text-xs text-gray-500">{p.network} • {p.size}</p></div>
                                                    <span className="font-bold text-sm" style={{ color: primaryColor }}>GHS {Number(p.agent_price).toFixed(2)}</span>
                                                </div>
                                            </button>
                                        ))}
                                        <Button
                                            onClick={() => {
                                                if (!trackSelectedProduct) return;
                                                setTrackCreating(true);
                                                setTrackError('');
                                                fetch(`/shop/${shop.slug}/create-order`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '', 'Accept': 'application/json' },
                                                    body: JSON.stringify({ reference: trackRef, beneficiary_number: trackPhone, product_variant_id: trackSelectedProduct }),
                                                })
                                                    .then(async (res) => {
                                                        const data = await res.json();
                                                        if (!res.ok) setTrackError(data.error || data.message || 'Something went wrong.');
                                                        else { setTrackResult(data); setTrackSuccess(data.message || 'Order created successfully!'); }
                                                    })
                                                    .catch(() => setTrackError('Something went wrong.'))
                                                    .finally(() => setTrackCreating(false));
                                            }}
                                            disabled={!trackSelectedProduct || trackCreating}
                                            className="w-full h-11 text-white font-semibold rounded-lg mt-2"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            {trackCreating ? 'Creating Order...' : 'Create Order'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Purchase Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative" style={{ colorScheme: 'light' }}>
                        {/* Close */}
                        <button
                            onClick={closeModal}
                            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                            disabled={processing}
                        >
                            ✕
                        </button>

                        {/* Product summary */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 ${meta(selected.network).color} rounded-full flex items-center justify-center`}>
                                    {meta(selected.network).icon ? (
                                        <img src={meta(selected.network).icon} alt="" className="w-6 h-6 rounded-full object-cover" />
                                    ) : (
                                        <span className="text-white text-sm font-bold">{selected.network.charAt(0)}</span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{selected.product_name}</p>
                                    <p className="text-xs text-gray-500">{selected.network} • {selected.size} • {selected.expiry}</p>
                                </div>
                            </div>
                            <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                                GHS {Number(selected.agent_price).toFixed(2)}
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handlePurchase} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                                    className="rounded-lg bg-white text-gray-900 border-gray-300 placeholder:text-gray-400"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary Number</label>
                                <Input
                                    type="tel"
                                    placeholder="0240000000"
                                    value={phone}
                                    onChange={(e) => {
                                        const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setPhone(cleaned);
                                        setErrors((p) => ({ ...p, phone: '' }));
                                    }}
                                    className="rounded-lg bg-white text-gray-900 border-gray-300 placeholder:text-gray-400"
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                {(errors as any).beneficiary_number && <p className="text-red-500 text-xs mt-1">{(errors as any).beneficiary_number}</p>}
                            </div>

                            {(errors as any).message && (
                                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded">{(errors as any).message}</p>
                            )}

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full h-12 text-white font-bold text-base rounded-lg"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    `Pay GHS ${Number(selected.agent_price).toFixed(2)}`
                                )}
                            </Button>

                            <p className="text-xs text-gray-400 text-center">
                                Secured by Paystack.
                            </p>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
