<?php

namespace App\Services;

use App\Models\AgentProduct;
use App\Models\AgentShop;
use App\Models\Commission;
use App\Models\Order;
use App\Models\Referral;
use App\Models\ReferralCommission;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CommissionService
{
    public function createCommission(Order $order): ?Commission
    {
        if (!config('agent.commission_enabled') || !$order->agent_id) {
            return null;
        }

        $shop = AgentShop::where('user_id', $order->agent_id)->first();
        if (!$shop) {
            return null;
        }

        $orderProduct = $order->products()->first();
        if (!$orderProduct) {
            return null;
        }

        $agentProduct = AgentProduct::where('agent_shop_id', $shop->id)
            ->where('product_variant_id', $orderProduct->pivot->product_variant_id)
            ->where('is_active', true)
            ->first();

        if (!$agentProduct) {
            return null;
        }

        $basePrice = (float) $orderProduct->pivot->price;
        $agentPrice = (float) $agentProduct->agent_price;

        // If order was placed through agent shop, the pivot price IS the agent price.
        // Get the real base price from the variant itself.
        $variant = \App\Models\ProductVariant::find($orderProduct->pivot->product_variant_id);
        if ($variant) {
            $basePrice = (float) $variant->price;
        }

        $commissionAmount = $agentPrice - $basePrice;

        if ($commissionAmount <= 0) {
            return null;
        }

        return DB::transaction(function () use ($order, $orderProduct, $agentProduct, $basePrice, $agentPrice, $commissionAmount) {
            $commission = Commission::create([
                'agent_id' => $order->agent_id,
                'order_id' => $order->id,
                'product_id' => $agentProduct->product_id,
                'product_variant_id' => $orderProduct->pivot->product_variant_id,
                'base_price' => $basePrice,
                'agent_price' => $agentPrice,
                'commission_amount' => $commissionAmount,
                'quantity' => (int) ($orderProduct->pivot->quantity ?? 1),
                'status' => 'available',
                'withdrawn_amount' => 0,
                'available_at' => Carbon::now(),
            ]);

            Log::info('Commission created', [
                'commission_id' => $commission->id,
                'agent_id' => $order->agent_id,
                'amount' => $commissionAmount,
            ]);

            return $commission;
        });
    }

    public function markAvailable(Order $order): void
    {
        if (!config('agent.commission_enabled')) {
            return;
        }

        Commission::where('order_id', $order->id)
            ->where('status', 'pending')
            ->update(['status' => 'available', 'available_at' => Carbon::now()]);

        ReferralCommission::whereHas('commission', function ($q) use ($order) {
            $q->where('order_id', $order->id);
        })->where('status', 'pending')->update(['status' => 'available', 'available_at' => Carbon::now()]);
    }

    public function reverseCommissions(Order $order): void
    {
        if (!config('agent.commission_enabled')) {
            return;
        }

        $commissions = Commission::where('order_id', $order->id)
            ->whereIn('status', ['pending', 'available'])
            ->get();

        foreach ($commissions as $commission) {
            $commission->update(['status' => 'reversed']);

            ReferralCommission::where('commission_id', $commission->id)
                ->whereIn('status', ['pending', 'available'])
                ->update(['status' => 'reversed']);
        }
    }

    public static function getAgentStats(int $agentId): array
    {
        // Available = sum of (commission_amount - withdrawn_amount) for 'available' commissions
        $available = (float) Commission::where('agent_id', $agentId)
            ->where('status', 'available')
            ->selectRaw('COALESCE(SUM(commission_amount - withdrawn_amount), 0) as total')
            ->value('total');

        $withdrawn = (float) Commission::where('agent_id', $agentId)
            ->selectRaw('COALESCE(SUM(withdrawn_amount), 0) as total')
            ->value('total');

        $totalOrders = Order::where('agent_id', $agentId)->count();

        return [
            'available_commission' => $available,
            'total_withdrawn' => $withdrawn,
            'total_earnings' => (float) ($available + $withdrawn),
            'total_orders' => $totalOrders,
        ];
    }

    public static function getReferralStats(int $agentId): array
    {
        $referrals = Referral::where('referrer_id', $agentId)->count();

        $available = (float) ReferralCommission::where('referrer_id', $agentId)
            ->where('status', 'available')
            ->selectRaw('COALESCE(SUM(referral_amount - withdrawn_amount), 0) as total')
            ->value('total');

        $withdrawn = (float) ReferralCommission::where('referrer_id', $agentId)
            ->selectRaw('COALESCE(SUM(withdrawn_amount), 0) as total')
            ->value('total');

        return [
            'total_referrals' => $referrals,
            'available_referral_commission' => $available,
            'total_referral_withdrawn' => $withdrawn,
        ];
    }
}
