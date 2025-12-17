<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OrderPusherService
{
    private $baseUrl = 'https://agent.jaybartservices.com/api/v1';
    private $apiKey = 'e86efb714fb64202ad66481ea24ee784ce570a05';

    public function pushOrderToApi(Order $order)
    {
        Log::info('Processing order for API push', ['order_id' => $order->id]);
        
        $items = $order->products()->withPivot('quantity', 'price', 'beneficiary_number', 'product_variant_id')->get();
        Log::info('Order has items', ['count' => $items->count()]);
        
        $hasSuccessfulResponse = false;
        $hasFailedResponse = false;

        foreach ($items as $item) {
            Log::info('Processing item', ['name' => $item->name]);
            
            $beneficiaryPhone = $item->pivot->beneficiary_number;
            $variant = \App\Models\ProductVariant::find($item->pivot->product_variant_id);
            $sharedBundle = $variant && isset($variant->variant_attributes['size']) ? (int)filter_var($variant->variant_attributes['size'], FILTER_SANITIZE_NUMBER_INT) * 1000 : 0;
            $networkId = $this->getNetworkIdFromProduct($item->name);
            
            Log::info('Item details', [
                'product' => $item->name,
                'beneficiary' => $beneficiaryPhone,
                'bundle' => $sharedBundle,
                'network_id' => $networkId
            ]);

            if (empty($beneficiaryPhone)) {
                Log::warning('No beneficiary phone found for item, skipping');
                $hasFailedResponse = true;
                continue;
            }

            if (!$networkId || !$sharedBundle) {
                Log::warning('Missing required order data', [
                    'order_id' => $order->id,
                    'item_id' => $item->id
                ]);
                $hasFailedResponse = true;
                continue;
            }

            $endpoint = $this->baseUrl . '/buy-other-package';
            $payload = [
                'recipient_msisdn' => $this->formatPhone($beneficiaryPhone),
                'network_id' => $networkId,
                'shared_bundle' => $sharedBundle
            ];
            
            Log::info('Sending to API', ['endpoint' => $endpoint, 'payload' => $payload]);

            try {
                $response = Http::withHeaders([
                    'x-api-key' => $this->apiKey,
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json'
                ])->timeout(30)->post($endpoint, $payload);

                Log::info('API Response', [
                    'status_code' => $response->status(),
                    'body' => $response->body()
                ]);

                if ($response->successful()) {
                    $responseData = $response->json();
                    if (isset($responseData['transaction_code'])) {
                        $order->update(['reference_id' => $responseData['transaction_code']]);
                        Log::info('Reference ID saved', [
                            'order_id' => $order->id,
                            'reference_id' => $responseData['transaction_code']
                        ]);
                    }
                    $hasSuccessfulResponse = true;
                } else {
                    $hasFailedResponse = true;
                }

            } catch (\Exception $e) {
                Log::error('API Error', ['message' => $e->getMessage()]);
                $hasFailedResponse = true;
            }
        }
        
        // Update API status based on results
        if ($hasSuccessfulResponse && !$hasFailedResponse) {
            $order->update(['api_status' => 'success']);
        } elseif ($hasFailedResponse) {
            $order->update(['api_status' => 'failed']);
        }
    }
    
    private function formatPhone($phone)
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        if (strlen($phone) == 10 && substr($phone, 0, 1) == '0') {
            return $phone;
        }
        
        return $phone;
    }
    
    private function getNetworkIdFromProduct($productName)
    {
        $productName = strtolower($productName);
        
        if (stripos($productName, 'mtn') !== false) {
            return 3;
        } elseif (stripos($productName, 'telecel') !== false) {
            return 2;
        } elseif (stripos($productName, 'ishare') !== false) {
            return 1;
        } elseif (stripos($productName, 'bigtime') !== false) {
            return 4;
        }
        
        return 3;
    }
}