<?php

namespace App\Http\Controllers;

use App\Models\AgentProduct;
use App\Models\AgentShop;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Referral;
use App\Models\ReferralCommission;
use App\Models\Withdrawal;
use App\Services\CheckoutIntegrationService;
use App\Services\CommissionService;
use App\Services\OrderPusherService;
use App\Services\FosterOrderPusherService;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AgentController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();
        $stats = CommissionService::getAgentStats($user->id);
        $referralStats = CommissionService::getReferralStats($user->id);
        $shop = AgentShop::where('user_id', $user->id)->first();
        $recentWithdrawals = Withdrawal::where('agent_id', $user->id)->latest()->take(5)->get();

        $shopData = $shop ? array_merge($shop->toArray(), [
            'logo_url' => $shop->logo ? asset('storage/' . $shop->logo) : null,
        ]) : null;

        return Inertia::render('Agent/Dashboard', [
            'stats' => $stats,
            'referralStats' => $referralStats,
            'shop' => $shopData,
            'recentWithdrawals' => $recentWithdrawals,
            'withdrawalSettings' => [
                'minimum_withdrawal' => (float) Setting::get('minimum_withdrawal', 10),
                'withdrawal_fee' => (float) Setting::get('withdrawal_fee', 0),
            ],
        ]);
    }

    public function createShop(Request $request)
    {
        if (!config('agent.shop_creation_enabled')) {
            return back()->withErrors(['message' => 'Shop creation is currently disabled.']);
        }

        $user = Auth::user();

        if (AgentShop::where('user_id', $user->id)->exists()) {
            return back()->withErrors(['message' => 'You already have a shop.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'logo' => 'nullable|image|max:2048',
        ]);

        $slug = Str::slug($validated['name']);
        if (AgentShop::where('slug', $slug)->exists()) {
            $slug .= '-' . Str::random(6);
        }

        $data = [
            'user_id' => $user->id,
            'name' => $validated['name'],
            'slug' => $slug,
        ];

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('shop-logos', 'public');
        }

        AgentShop::create($data);

        return back()->with('success', 'Shop created successfully!');
    }

    public function updateShop(Request $request)
    {
        $user = Auth::user();
        $shop = AgentShop::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'primary_color' => 'nullable|string|max:7',
            'background_color' => 'nullable|string|max:7',
            'is_active' => 'required|boolean',
            'logo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            if ($shop->logo) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($shop->logo);
            }
            $validated['logo'] = $request->file('logo')->store('shop-logos', 'public');
        }
        unset($validated['logo_file']);

        $shop->update($validated);

        return back()->with('success', 'Shop updated successfully!');
    }

    public function referrals()
    {
        $user = Auth::user();
        $referralStats = CommissionService::getReferralStats($user->id);

        $referredAgents = Referral::where('referrer_id', $user->id)
            ->with('referred:id,name,email,created_at')
            ->latest()
            ->get();

        $referralCommissions = ReferralCommission::where('referrer_id', $user->id)
            ->with(['referredAgent:id,name', 'commission.order:id,total,status,created_at'])
            ->latest()
            ->take(50)
            ->get();

        return Inertia::render('Agent/Referrals', [
            'referralStats' => $referralStats,
            'referredAgents' => $referredAgents,
            'referralCommissions' => $referralCommissions,
            'referralCode' => $user->referral_code,
        ]);
    }

    public function commissions()
    {
        $user = Auth::user();
        $stats = CommissionService::getAgentStats($user->id);

        $commissions = \App\Models\Commission::where('agent_id', $user->id)
            ->with(['order:id,total,status,beneficiary_number,network,created_at', 'product:id,name,network', 'productVariant:id,variant_attributes'])
            ->latest()
            ->paginate(30);

        return Inertia::render('Agent/Commissions', [
            'stats' => $stats,
            'commissions' => $commissions,
        ]);
    }

    public function addProduct(Request $request)
    {
        $user = Auth::user();
        $shop = AgentShop::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'product_variant_id' => 'required|exists:product_variants,id',
            'agent_price' => 'required|numeric|min:0',
        ]);

        $variant = ProductVariant::findOrFail($validated['product_variant_id']);

        if ((float) $validated['agent_price'] < (float) $variant->price) {
            return back()->withErrors([
                'agent_price' => 'Agent price must be >= base price (GHS ' . number_format($variant->price, 2) . ').',
            ]);
        }

        AgentProduct::updateOrCreate(
            ['agent_shop_id' => $shop->id, 'product_variant_id' => $variant->id],
            [
                'product_id' => $variant->product_id,
                'agent_price' => $validated['agent_price'],
                'is_active' => true,
            ]
        );

        return back()->with('success', 'Product added to shop!');
    }

    public function removeProduct(Request $request, AgentProduct $agentProduct)
    {
        $user = Auth::user();
        $shop = AgentShop::where('user_id', $user->id)->firstOrFail();

        if ((int) $agentProduct->agent_shop_id !== (int) $shop->id) {
            abort(403);
        }

        $agentProduct->update(['is_active' => false]);

        return back()->with('success', 'Product removed from shop.');
    }

    public function requestWithdrawal(Request $request)
    {
        if (!config('agent.withdrawal_enabled')) {
            return back()->withErrors(['message' => 'Withdrawals are currently disabled.']);
        }

        $user = Auth::user();
        $minAmount = (float) Setting::get('minimum_withdrawal', 10);
        $withdrawalFeePercent = (float) Setting::get('withdrawal_fee', 0);

        $validated = $request->validate([
            'amount' => "required|numeric|min:{$minAmount}",
        ]);

        $available = (float) \App\Models\Commission::where('agent_id', $user->id)
            ->where('status', 'available')
            ->selectRaw('COALESCE(SUM(commission_amount - withdrawn_amount), 0) as total')
            ->value('total');

        $referralAvailable = (float) ReferralCommission::where('referrer_id', $user->id)
            ->where('status', 'available')
            ->selectRaw('COALESCE(SUM(referral_amount - withdrawn_amount), 0) as total')
            ->value('total');

        $totalAvailable = $available + $referralAvailable;

        if ((float) $validated['amount'] > $totalAvailable) {
            return back()->withErrors([
                'amount' => 'Insufficient balance. Available: GHS ' . number_format($totalAvailable, 2),
            ]);
        }

        if (Withdrawal::where('agent_id', $user->id)->where('status', 'pending')->exists()) {
            return back()->withErrors(['message' => 'You already have a pending withdrawal.']);
        }

        $amount = (float) $validated['amount'];
        $feeAmount = (float) bcmul(bcdiv((string) $withdrawalFeePercent, '100', 4), (string) $amount, 2);
        $netAmount = (float) bcsub((string) $amount, (string) $feeAmount, 2);

        if ($netAmount <= 0) {
            return back()->withErrors([
                'amount' => 'Amount too low after applying ' . $withdrawalFeePercent . '% withdrawal fee.',
            ]);
        }

        Withdrawal::create([
            'agent_id' => $user->id,
            'amount' => $amount,
            'withdrawal_fee' => $feeAmount,
            'net_amount' => $netAmount,
        ]);

        return back()->with('success', 'Withdrawal request submitted! Fee (' . $withdrawalFeePercent . '%): GHS ' . number_format($feeAmount, 2) . ', You will receive: GHS ' . number_format($netAmount, 2));
    }

    public function shopProducts()
    {
        $user = Auth::user();
        $shop = AgentShop::where('user_id', $user->id)->first();

        $productType = $user->isDealer() ? 'dealer_product' : 'agent_product';

        $products = Product::where('product_type', $productType)
            ->with(['variants' => function ($q) {
                $q->where('status', 'IN STOCK');
            }])->get();

        $shopProducts = $shop
            ? AgentProduct::where('agent_shop_id', $shop->id)
                ->where('is_active', true)
                ->with('productVariant.product')
                ->get()
            : collect();

        return Inertia::render('Agent/Products', [
            'products' => $products,
            'shopProducts' => $shopProducts,
            'shop' => $shop,
        ]);
    }

    // Public: View agent mini shop
    public function viewShop(string $slug)
    {
        if (!config('agent.enabled')) {
            abort(404);
        }

        $shop = AgentShop::where('slug', $slug)->where('is_active', true)->firstOrFail();
        $agentProducts = $shop->activeProducts()
            ->with(['productVariant.product'])
            ->get()
            ->map(function ($ap) {
                $variant = $ap->productVariant;
                $product = $variant->product;
                return [
                    'id' => $ap->id,
                    'product_name' => $product->name,
                    'network' => $product->network,
                    'expiry' => $product->expiry,
                    'size' => $variant->variant_attributes['size'] ?? 'N/A',
                    'agent_price' => $ap->agent_price,
                    'product_variant_id' => $variant->id,
                    'product_id' => $product->id,
                    'in_stock' => $variant->status === 'IN STOCK',
                ];
            });

        return Inertia::render('Shop/View', [
            'shop' => [
                'name' => $shop->name,
                'slug' => $shop->slug,
                'agent_name' => $shop->agent->name,
                'agent_phone' => $shop->agent->phone,
                'primary_color' => $shop->primary_color,
                'background_color' => $shop->background_color,
                'logo_url' => $shop->logo ? asset('storage/' . $shop->logo) : null,
            ],
            'products' => $agentProducts,
            'youtubeTrackOrderUrl' => Setting::get('youtube_track_order_url', ''),
        ]);
    }

    // Public: Purchase from agent shop via Paystack
    public function purchaseFromShop(Request $request, string $slug)
    {
        if (!config('agent.enabled')) {
            abort(404);
        }

        $shop = AgentShop::where('slug', $slug)->where('is_active', true)->firstOrFail();

        $validated = $request->validate([
            'product_variant_id' => 'required|exists:product_variants,id',
            'beneficiary_number' => 'required|string|max:20',
            'email' => 'required|email|max:255',
        ]);

        $agentProduct = AgentProduct::where('agent_shop_id', $shop->id)
            ->where('product_variant_id', $validated['product_variant_id'])
            ->where('is_active', true)
            ->firstOrFail();

        $variant = $agentProduct->productVariant;
        if ($variant->status !== 'IN STOCK') {
            return back()->withErrors(['message' => 'Product is out of stock.']);
        }

        $amount = (float) $agentProduct->agent_price;
        $reference = 'shop_' . Str::random(16);

        $transaction = \App\Models\Transaction::create([
            'user_id' => $shop->user_id,
            'order_id' => null,
            'amount' => $amount,
            'status' => 'pending',
            'type' => 'order',
            'description' => 'Shop purchase: ' . $variant->product->name . ' (' . ($variant->variant_attributes['size'] ?? '') . ')',
            'reference' => $reference,
        ]);

        $response = \Illuminate\Support\Facades\Http::withHeaders([
            'Authorization' => 'Bearer ' . config('paystack.secret_key'),
            'Content-Type' => 'application/json',
        ])->post('https://api.paystack.co/transaction/initialize', [
            'email' => $validated['email'],
            'amount' => (int) round($amount * 100),
            'callback_url' => route('shop.payment.callback'),
            'reference' => $reference,
            'metadata' => [
                'type' => 'shop_purchase',
                'shop_id' => $shop->id,
                'agent_id' => $shop->user_id,
                'product_variant_id' => $variant->id,
                'product_id' => $variant->product_id,
                'agent_product_id' => $agentProduct->id,
                'beneficiary_number' => $validated['beneficiary_number'],
                'network' => $variant->product->network,
                'amount' => $amount,
                'transaction_id' => $transaction->id,
            ],
        ]);

        if ($response->successful()) {
            $paymentUrl = $response->json('data.authorization_url');
            return \Inertia\Inertia::location($paymentUrl);
        }

        $transaction->update(['status' => 'failed']);
        return back()->withErrors(['message' => 'Payment initialization failed. Please try again.']);
    }

    // Paystack callback for shop purchases
    public function handleShopPaymentCallback(Request $request)
    {
        $reference = $request->query('reference');
        if (!$reference) {
            return redirect()->route('shop.order.failed');
        }

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => 'Bearer ' . config('paystack.secret_key'),
            ])->get("https://api.paystack.co/transaction/verify/{$reference}");

            if (!$response->successful() || $response->json('data.status') !== 'success') {
                return redirect()->route('shop.order.failed');
            }

            $metadata = $response->json('data.metadata');
            $transaction = \App\Models\Transaction::find($metadata['transaction_id'] ?? null);

            if (!$transaction || $transaction->status !== 'pending') {
                return redirect()->route('shop.order.failed');
            }

            $shop = AgentShop::find($metadata['shop_id']);
            if (!$shop) {
                return redirect()->route('shop.order.failed');
            }

            $order = \App\Models\Order::create([
                'user_id' => $shop->user_id,
                'agent_id' => $metadata['agent_id'],
                'total' => $metadata['amount'],
                'status' => 'pending',
                'beneficiary_number' => $metadata['beneficiary_number'],
                'network' => $metadata['network'],
            ]);

            $order->products()->attach($metadata['product_id'], [
                'quantity' => 1,
                'price' => $metadata['amount'],
                'beneficiary_number' => $metadata['beneficiary_number'],
                'product_variant_id' => $metadata['product_variant_id'],
            ]);

            $commissionService = new CommissionService();
            $commissionService->createCommission($order->fresh());

            $transaction->update([
                'status' => 'completed',
                'order_id' => $order->id,
            ]);

            $variant = ProductVariant::find($metadata['product_variant_id']);

            // Push order to external API
            $this->pushOrderToExternalApi($order);

            // Store order ID in session for success page
            session()->put('shop_order_id', $order->id);

            return redirect()->route('shop.order.success');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Shop payment callback error', ['error' => $e->getMessage()]);
            return redirect()->route('shop.order.failed');
        }
    }

    public function orderSuccess(Request $request)
    {
        $orderId = session()->get('shop_order_id');
        if (!$orderId) {
            return redirect()->route('shop.order.failed');
        }

        $order = \App\Models\Order::with(['products'])->find($orderId);
        if (!$order || !$order->agent_id) {
            return redirect()->route('shop.order.failed');
        }

        $shop = AgentShop::where('user_id', $order->agent_id)->first();
        $orderProduct = $order->products->first();
        $variant = $orderProduct ? ProductVariant::find($orderProduct->pivot->product_variant_id) : null;

        return Inertia::render('Shop/Success', [
            'order' => [
                'id' => $order->id,
                'total' => $order->total,
                'beneficiary_number' => $order->beneficiary_number,
                'network' => $order->network,
                'product_name' => $variant?->product?->name ?? 'Data Bundle',
                'size' => $variant?->variant_attributes['size'] ?? '',
            ],
            'shop' => [
                'name' => $shop?->name ?? 'Shop',
                'slug' => $shop?->slug ?? '',
            ],
        ]);
    }

    public function orderFailed()
    {
        return Inertia::render('Shop/Failed');
    }

    public function trackOrder(Request $request, string $slug)
    {
        $shop = AgentShop::where('slug', $slug)->where('is_active', true)->firstOrFail();

        $validated = $request->validate([
            'beneficiary_number' => 'required|string|max:20',
            'reference' => 'required|string|max:255',
        ]);

        $beneficiary = $validated['beneficiary_number'];
        $reference = $validated['reference'];

        $transaction = \App\Models\Transaction::where('reference', $reference)->first();

        if (!$transaction) {
            try {
                $response = \Illuminate\Support\Facades\Http::withHeaders([
                    'Authorization' => 'Bearer ' . config('paystack.secret_key'),
                ])->get("https://api.paystack.co/transaction/verify/{$reference}");

                if (!$response->successful() || $response->json('data.status') !== 'success') {
                    return response()->json(['error' => 'This reference is invalid.'], 422);
                }
            } catch (\Exception $e) {
                return response()->json(['error' => 'This reference is invalid.'], 422);
            }

            return response()->json(['error' => 'This reference is invalid.'], 422);
        }

        if ($transaction->order_id) {
            $order = \App\Models\Order::with('products')->find($transaction->order_id);

            if ($order && $order->beneficiary_number === $beneficiary) {
                $variant = null;
                $orderProduct = $order->products->first();
                if ($orderProduct) {
                    $variant = ProductVariant::with('product')->find($orderProduct->pivot->product_variant_id);
                }

                return response()->json([
                    'type' => 'order_found',
                    'order' => [
                        'id' => $order->id,
                        'total' => $order->total,
                        'status' => $order->status,
                        'beneficiary_number' => $order->beneficiary_number,
                        'network' => $order->network,
                        'product_name' => $variant?->product?->name ?? 'Data Bundle',
                        'size' => $variant?->variant_attributes['size'] ?? '',
                        'created_at' => $order->created_at->format('M d, Y h:i A'),
                    ],
                ]);
            }

            return response()->json(['error' => 'This reference was used for another number.'], 422);
        }

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => 'Bearer ' . config('paystack.secret_key'),
            ])->get("https://api.paystack.co/transaction/verify/{$reference}");

            if (!$response->successful() || $response->json('data.status') !== 'success') {
                return response()->json(['error' => 'This reference is invalid.'], 422);
            }

            $metadata = $response->json('data.metadata');

            if (($metadata['shop_id'] ?? null) != $shop->id) {
                return response()->json(['error' => 'This reference is invalid.'], 422);
            }

            $agentProducts = $shop->activeProducts()
                ->with(['productVariant.product'])
                ->get()
                ->map(function ($ap) {
                    $variant = $ap->productVariant;
                    $product = $variant->product;
                    return [
                        'id' => $ap->id,
                        'product_name' => $product->name,
                        'network' => $product->network,
                        'size' => $variant->variant_attributes['size'] ?? 'N/A',
                        'agent_price' => $ap->agent_price,
                        'product_variant_id' => $variant->id,
                        'product_id' => $product->id,
                    ];
                })
                ->filter(fn($p) => (float) $p['agent_price'] <= (float) ($metadata['amount'] ?? 0));

            return response()->json([
                'type' => 'can_create_order',
                'paymentAmount' => (float) ($metadata['amount'] ?? $transaction->amount),
                'availableProducts' => $agentProducts->values(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'This reference is invalid.'], 422);
        }
    }

    public function createOrderFromReference(Request $request, string $slug)
    {
        $shop = AgentShop::where('slug', $slug)->where('is_active', true)->firstOrFail();

        $validated = $request->validate([
            'reference' => 'required|string|max:255',
            'beneficiary_number' => 'required|string|max:20',
            'product_variant_id' => 'required|exists:product_variants,id',
        ]);

        $transaction = \App\Models\Transaction::where('reference', $validated['reference'])->first();

        if (!$transaction || $transaction->order_id) {
            return response()->json(['error' => 'This reference is no longer available for order creation.'], 422);
        }

        $agentProduct = AgentProduct::where('agent_shop_id', $shop->id)
            ->where('product_variant_id', $validated['product_variant_id'])
            ->where('is_active', true)
            ->firstOrFail();

        $variant = $agentProduct->productVariant;

        $order = \App\Models\Order::create([
            'user_id' => $shop->user_id,
            'agent_id' => $shop->user_id,
            'total' => $agentProduct->agent_price,
            'status' => 'pending',
            'beneficiary_number' => $validated['beneficiary_number'],
            'network' => $variant->product->network,
        ]);

        $order->products()->attach($variant->product_id, [
            'quantity' => 1,
            'price' => $agentProduct->agent_price,
            'beneficiary_number' => $validated['beneficiary_number'],
            'product_variant_id' => $variant->id,
        ]);

        (new CommissionService())->createCommission($order->fresh());

        $transaction->update([
            'status' => 'completed',
            'order_id' => $order->id,
        ]);

        // Push order to external API
        $this->pushOrderToExternalApi($order);

        return response()->json([
            'type' => 'order_found',
            'order' => [
                'id' => $order->id,
                'total' => $order->total,
                'status' => $order->status,
                'beneficiary_number' => $order->beneficiary_number,
                'network' => $order->network,
                'product_name' => $variant->product->name,
                'size' => $variant->variant_attributes['size'] ?? '',
                'created_at' => $order->created_at->format('M d, Y h:i A'),
            ],
            'message' => 'Order #' . $order->id . ' created successfully!',
        ]);
    }

    private function pushOrderToExternalApi(\App\Models\Order $order): void
    {
        try {
            $network = strtolower($order->network);
            $jaybartEnabled = (bool) Setting::get('jaybart_order_pusher_enabled', 1);
            $fosterEnabled = (bool) Setting::get('foster_order_pusher_enabled', 1);

            if (in_array($network, ['mtn', 'telecel']) && $jaybartEnabled) {
                (new OrderPusherService())->pushOrderToApi($order);
            } elseif ($network === 'ishare' && $fosterEnabled) {
                (new FosterOrderPusherService())->pushOrderToApi($order);
            }
        } catch (\Exception $e) {
            $order->update(['order_pusher_status' => 'failed']);
            \Illuminate\Support\Facades\Log::error('Shop order pusher failed', ['orderId' => $order->id, 'error' => $e->getMessage()]);
        }
    }

    // Public: Upgrade to agent with optional referral
    public function upgradeToAgent(Request $request)
    {
        if (!config('agent.registration_enabled')) {
            return back()->withErrors(['message' => 'Agent registration is currently disabled.']);
        }

        $user = Auth::user();
        if (!$user || $user->role !== 'customer') {
            return back()->withErrors(['message' => 'Only customers can upgrade to agent.']);
        }

        $validated = $request->validate([
            'referrer_id' => 'nullable|exists:users,id',
        ]);

        if (!empty($validated['referrer_id'])) {
            $request->session()->put('agent_referrer_id', (int) $validated['referrer_id']);
        }

        return app(BecomeAgentController::class)->update($request);
    }
}
