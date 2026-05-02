<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commission extends Model
{
    protected $fillable = [
        'agent_id', 'order_id', 'product_id', 'product_variant_id',
        'base_price', 'agent_price', 'commission_amount', 'quantity',
        'status', 'withdrawn_amount', 'available_at',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'agent_price' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'withdrawn_amount' => 'decimal:2',
        'available_at' => 'datetime',
    ];

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function referralCommissions()
    {
        return $this->hasMany(ReferralCommission::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }
}
