<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;

class HomeController extends Controller
{
    public function getBundleSizes(Request $request)
    {
        $network = $request->get('network');
        
        if (!$network) {
            return response()->json(['success' => false, 'message' => 'Network is required']);
        }
        
        $user = auth()->user();
        
        // Determine product type based on user role
        if ($user && $user->isDealer()) {
            $productType = 'dealer_product';
        } elseif ($user && ($user->isAgent() || $user->isAdmin())) {
            $productType = 'agent_product';
        } else {
            $productType = 'customer_product';
        }
        
        $product = Product::where('network', $network)
            ->where('product_type', $productType)
            ->first();
        
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found']);
        }
        
        $variants = $product->variants()
            ->where('status', 'IN STOCK')
            ->where('quantity', '>', 0)
            ->get()
            ->map(function($variant) {
                $size = $variant->variant_attributes['size'] ?? 'unknown';
                $displaySize = strtoupper(str_replace('gb', ' GB', $size));
                if ($size === '0.5gb') {
                    $displaySize = '500 MB';
                }
                return [
                    'value' => str_replace('gb', '', $size),
                    'label' => $displaySize,
                    'price' => $variant->price
                ];
            })
            ->sortBy(function($item) {
                return (float) $item['value'];
            })
            ->values();
            
        return response()->json(['success' => true, 'sizes' => $variants]);
    }
}