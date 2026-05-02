<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AgentShop extends Model
{
    protected $fillable = ['user_id', 'name', 'slug', 'logo', 'is_active', 'primary_color', 'background_color'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($shop) {
            if (empty($shop->slug)) {
                $shop->slug = Str::slug($shop->name) . '-' . Str::random(6);
            }
        });
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function agentProducts()
    {
        return $this->hasMany(AgentProduct::class);
    }

    public function activeProducts()
    {
        return $this->agentProducts()->where('is_active', true);
    }
}
