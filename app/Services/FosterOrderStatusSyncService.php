<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FosterOrderStatusSyncService
{
    private $baseUrl;
    private $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.foster.api_key', '');
        $this->baseUrl = config('services.foster.base_url', 'https://fgamall.researchershubgh.com/api/v1');
    }

    public function syncOrderStatus(Order $order)
    {
        if (!$order->reference_id) {
            Log::info('Order has no reference_id, skipping sync', ['order_id' => $order->id]);
            return;
        }

        if (strtoupper($order->network) !== 'ISHARE') {
            Log::info('Order is not Ishare, skipping', ['order_id' => $order->id, 'network' => $order->network]);
            return;
        }

        try {
            $this->syncIshareOrder($order);
        } catch (\Exception $e) {
            Log::error('Failed to sync order status from Foster API', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    private function syncIshareOrder(Order $order)
    {
        $endpoint = $this->baseUrl . '/checkOrderStatus/' . $order->reference_id;

        Log::info('Fetching order status', [
            'order_id' => $order->id,
            'reference' => $order->reference_id,
        ]);

        $response = Http::withToken($this->apiKey)
            ->accept('application/json')
            ->timeout(30)
            ->get($endpoint);

        Log::info('Foster API sync response', [
            'order_id' => $order->id,
            'status_code' => $response->status(),
            'body' => $response->body()
        ]);

        if ($response->successful()) {
            $data = $response->json();
            
            if (isset($data['success']) && $data['success'] === true && isset($data['data']['status'])) {
                $apiStatus = strtolower($data['data']['status']);
                
                if ($apiStatus === 'completed' || $apiStatus === 'delivered') {
                    $order->update(['status' => 'completed']);
                    Log::info('Order marked as completed', ['order_id' => $order->id]);
                } elseif ($apiStatus === 'failed') {
                    $order->update(['status' => 'failed']);
                    Log::info('Order marked as failed', ['order_id' => $order->id]);
                } else {
                    Log::info('Order still pending', ['order_id' => $order->id, 'api_status' => $apiStatus]);
                }
            } else {
                Log::info('Unexpected response structure', ['order_id' => $order->id, 'response' => $data]);
            }
        } else {
            Log::warning('Failed to fetch transaction status', [
                'order_id' => $order->id,
                'status_code' => $response->status()
            ]);
        }
    }

    public function syncPendingOrders()
    {
        $pendingOrders = Order::where('status', 'pending')
            ->whereNotNull('reference_id')
            ->where('network', 'Ishare')
            ->get();

        Log::info('Syncing pending Ishare orders', ['count' => $pendingOrders->count()]);

        foreach ($pendingOrders as $order) {
            $this->syncOrderStatus($order);
        }
    }
}
