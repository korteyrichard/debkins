<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FosterOrderStatusSyncService
{
    private $baseUrl = 'https://fgamall.researchershubgh.com/api/v1';
    private $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.foster.api_key', '');
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
        $endpoint = $this->baseUrl . '/fetch-ishare-transaction';
        $payload = ['transaction_id' => $order->reference_id];

        Log::info('Fetching ishare transaction status', [
            'order_id' => $order->id,
            'transaction_id' => $order->reference_id,
            'api_key_length' => strlen($this->apiKey),
            'api_key_set' => !empty($this->apiKey)
        ]);

        $response = Http::withHeaders([
            'x-api-key' => $this->apiKey,
            'Accept' => 'application/json',
            'Content-Type' => 'application/json'
        ])->timeout(30)->post($endpoint, $payload);

        Log::info('Foster API sync response', [
            'order_id' => $order->id,
            'status_code' => $response->status(),
            'body' => $response->body()
        ]);

        if ($response->successful()) {
            $data = $response->json();
            
            // Update order status based on API response
            if (isset($data['response_code']) && $data['response_code'] == '200') {
                $order->update(['status' => 'completed']);
                Log::info('Order marked as completed', ['order_id' => $order->id]);
            } else {
                Log::info('Transaction not successful', ['order_id' => $order->id, 'response' => $data]);
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
