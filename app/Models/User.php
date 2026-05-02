<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'business_name',
        'password',
        'wallet_balance',
        'role',
        'referral_code',
        'referred_by',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'wallet_balance' => 'decimal:2', // cast wallet_balance as decimal
            'role' => 'string', // cast role as string
        ];
    }

    public function carts()
    {
        return $this->hasMany(Cart::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function afaOrders()
    {
        return $this->hasMany(AFAOrders::class);
    }

    public function agentShop()
    {
        return $this->hasOne(AgentShop::class);
    }

    public function commissions()
    {
        return $this->hasMany(Commission::class, 'agent_id');
    }

    public function withdrawals()
    {
        return $this->hasMany(Withdrawal::class, 'agent_id');
    }

    public function referrals()
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    public function referredBy()
    {
        return $this->hasOne(Referral::class, 'referred_id');
    }
    
    /**
     * Get the default role for the user.
     *
     * @return string
     */
    protected static function boot()
    {
        parent::boot();
    
        static::creating(function ($user) {
            $user->role = $user->role ?? 'customer';
            if (empty($user->referral_code)) {
                $user->referral_code = strtoupper(\Illuminate\Support\Str::random(8));
            }
        });
    }

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    /**
     * Check if the user is a customer.
     *
     * @return bool
     */
    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    /**
     * Check if the user is an agent.
     *
     * @return bool
     */
    public function isAgent(): bool
    {
        return $this->role === 'agent';
    }

    /**
     * Check if the user is an admin.
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if the user is a dealer.
     *
     * @return bool
     */
    public function isDealer(): bool
    {
        return $this->role === 'dealer';
    }
}
