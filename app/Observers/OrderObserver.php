<?php

namespace App\Observers;

use App\Models\Commission;
use App\Models\Order;
use App\Services\CommissionService;

class OrderObserver
{
    public function __construct(private CommissionService $commissionService) {}

    public function updated(Order $order): void
    {
        if (!$order->isDirty('status') || !$order->agent_id) {
            return;
        }

        match ($order->status) {
            'completed' => $this->commissionService->markAvailable($order),
            'cancelled' => $this->commissionService->reverseCommissions($order),
            default => null,
        };
    }
}
