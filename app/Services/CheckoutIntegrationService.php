<?php

namespace App\Services;

use App\Models\AgentProduct;
use App\Models\AgentShop;
use Illuminate\Http\Request;

class CheckoutIntegrationService
{
    public function setAgentSession(Request $request, AgentShop $shop): void
    {
        $request->session()->put('agent_shop_id', $shop->id);
        $request->session()->put('agent_id', $shop->user_id);
    }

    public function clearAgentSession(Request $request): void
    {
        $request->session()->forget(['agent_shop_id', 'agent_id']);
    }

    public function getAgentId(Request $request): ?int
    {
        return $request->session()->get('agent_id');
    }

    public function getAgentShopId(Request $request): ?int
    {
        return $request->session()->get('agent_shop_id');
    }

    public function getAgentPrice(int $shopId, int $variantId): ?float
    {
        $agentProduct = AgentProduct::where('agent_shop_id', $shopId)
            ->where('product_variant_id', $variantId)
            ->where('is_active', true)
            ->first();

        return $agentProduct ? (float) $agentProduct->agent_price : null;
    }
}
