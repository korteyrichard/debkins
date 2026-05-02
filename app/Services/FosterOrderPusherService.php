<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FosterOrderPusherService
{
    private $baseUrl;
    private $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.foster.api_key', '');
        $this->baseUrl = config('services.foster.base_url', 'https://fgamall.researchershubgh.com/api/v1');
        Log::info('FosterOrderPusherService initialized', ['api_key_set' => !empty($this->apiKey)]);
    }

    public function pushOrderToApi(Order $order)
    {
        Log::info('Processing order for Foster API push', ['order_id' => $order->id]);
        
        $network = strtoupper($order->network);
        
        // Only push Ishare orders
        if ($network !== 'ISHARE') {
            Log::info('Skipping non-Ishare order', ['order_id' => $order->id, 'network' => $order->network]);
            return;
        }
        
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

            // Determine endpoint based on network
            if ($network === 'ISHARE') {
                $endpoint = $this->baseUrl . '/createIshareBundleOrder';
                $payload = [
                    'reference' => 'DEB-' . $order->id . '-' . $item->id,
                    'msisdn' => $this->formatPhone($beneficiaryPhone),
                    'capacity' => $sharedBundle,
                ];
            }
            
            Log::info('Sending to Foster API', [
                'endpoint' => $endpoint, 
                'payload' => $payload,
                'api_key_length' => strlen($this->apiKey)
            ]);

            try {
                $response = Http::withToken($this->apiKey)
                    ->accept('application/json')
                    ->timeout(30)
                    ->post($endpoint, $payload);

                Log::info('Foster API Response', [
                    'status_code' => $response->status(),
                    'body' => $response->body()
                ]);

                if ($response->successful()) {
                    $responseData = $response->json();
                    
                    // Handle response - new API returns reference in data.reference
                    $ref = $responseData['data']['reference'] ?? ($responseData['vendorTranxId'] ?? null);
                    if ($ref) {
                        $order->update(['reference_id' => $ref]);
                        Log::info('Reference ID saved', [
                            'order_id' => $order->id,
                            'reference_id' => $ref
                        ]);
                    }
                    
                    $hasSuccessfulResponse = true;
                } else {
                    $hasFailedResponse = true;
                }

            } catch (\Exception $e) {
                Log::error('Foster API Error', ['message' => $e->getMessage()]);
                $hasFailedResponse = true;
            }
        }
        
        // Update API status based on results
        if ($hasSuccessfulResponse && !$hasFailedResponse) {
            $order->update(['order_pusher_status' => 'success']);
        } elseif ($hasFailedResponse) {
            $order->update(['order_pusher_status' => 'failed']);
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
        
        if (stripos($productName, 'ishare') !== false) {
            return 1;
        }
        
        return null;
    }
}
