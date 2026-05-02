import React, { useState } from 'react';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Variant {
    id: number;
    price: string;
    status: string;
    variant_attributes: { size?: string; [key: string]: any };
}

interface Product {
    id: number;
    name: string;
    network: string;
    expiry: string;
    variants: Variant[];
}

interface ShopProduct {
    id: number;
    agent_shop_id: number;
    product_variant_id: number;
    agent_price: string;
    product_variant: {
        id: number;
        price: string;
        variant_attributes: { size?: string };
        product: { name: string; network: string; expiry: string };
    };
}

interface Shop {
    id: number;
    name: string;
    slug: string;
}

interface AgentProductsProps extends PageProps {
    products: Product[];
    shopProducts: ShopProduct[];
    shop: Shop | null;
}

export default function AgentProducts() {
    const { auth, products, shopProducts, shop } = usePage<AgentProductsProps>().props;
    const [selectedVariant, setSelectedVariant] = useState('');
    const [agentPrice, setAgentPrice] = useState('');

    const form = useForm({
        product_variant_id: '',
        agent_price: '',
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        form.setData({ product_variant_id: selectedVariant, agent_price: agentPrice });
        router.post(route('agent.products.add'), {
            product_variant_id: selectedVariant,
            agent_price: agentPrice,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedVariant('');
                setAgentPrice('');
            },
        });
    };

    const handleRemove = (id: number) => {
        router.delete(route('agent.products.remove', id), { preserveScroll: true });
    };

    // Flatten all variants for the select
    const allVariants = products.flatMap((p) =>
        p.variants.map((v) => ({
            id: v.id,
            label: `${p.network} - ${p.name} - ${v.variant_attributes?.size || 'N/A'} (Base: GHS ${Number(v.price).toFixed(2)})`,
            basePrice: Number(v.price),
            inStock: v.status === 'IN STOCK',
        }))
    ).filter((v) => v.inStock);

    const selectedBase = allVariants.find((v) => String(v.id) === selectedVariant)?.basePrice || 0;

    if (!shop) {
        return (
            <DashboardLayout user={auth.user} header="Shop Products">
                <Head title="Shop Products" />
                <div className="text-center py-16">
                    <p className="text-gray-500 text-lg mb-4">Create a shop first to manage products.</p>
                    <Button onClick={() => router.visit(route('agent.dashboard'))} className="bg-blue-600 text-white rounded-none">
                        Go to Dashboard
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout user={auth.user} header="Shop Products">
            <Head title="Shop Products" />

            <div className="space-y-6">
                {/* Add Product Form */}
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Add Product to Shop</h3>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Product Variant</label>
                            <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a product variant" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allVariants.map((v) => (
                                        <SelectItem key={v.id} value={String(v.id)}>
                                            {v.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Your Price (GHS) {selectedBase > 0 && <span className="text-gray-400">— min: GHS {selectedBase.toFixed(2)}</span>}
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                min={selectedBase}
                                placeholder="Your selling price"
                                value={agentPrice}
                                onChange={(e) => setAgentPrice(e.target.value)}
                            />
                            {Number(agentPrice) > 0 && Number(agentPrice) >= selectedBase && (
                                <p className="text-xs text-green-600 mt-1">
                                    Commission per sale: GHS {(Number(agentPrice) - selectedBase).toFixed(2)}
                                </p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            disabled={!selectedVariant || !agentPrice || Number(agentPrice) < selectedBase}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-none"
                        >
                            Add to Shop
                        </Button>
                    </form>
                </div>

                {/* Current Shop Products */}
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                        Your Shop Products ({shopProducts.length})
                    </h3>
                    {shopProducts.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No products in your shop yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {shopProducts.map((sp) => (
                                <div key={sp.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                    <div>
                                        <p className="font-medium">
                                            {sp.product_variant?.product?.network} — {sp.product_variant?.product?.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Size: {sp.product_variant?.variant_attributes?.size || 'N/A'} |
                                            Base: GHS {Number(sp.product_variant?.price).toFixed(2)} |
                                            Expiry: {sp.product_variant?.product?.expiry}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">GHS {Number(sp.agent_price).toFixed(2)}</p>
                                            <p className="text-xs text-gray-400">
                                                +GHS {(Number(sp.agent_price) - Number(sp.product_variant?.price)).toFixed(2)} commission
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="rounded-none"
                                            onClick={() => handleRemove(sp.id)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
