<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('referral_commissions');
        Schema::dropIfExists('referrals');

        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('referred_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('referred_at')->nullable();
            $table->timestamps();
            $table->unique('referred_id');
            $table->index('referrer_id');
        });

        Schema::create('referral_commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('referred_agent_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('commission_id')->constrained('commissions')->onDelete('cascade');
            $table->decimal('referral_amount', 12, 2);
            $table->decimal('referral_percentage', 5, 2);
            $table->enum('status', ['pending', 'available', 'withdrawn', 'reversed'])->default('available');
            $table->decimal('withdrawn_amount', 12, 2)->default(0);
            $table->timestamp('available_at')->nullable();
            $table->timestamps();
            $table->index(['referrer_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referral_commissions');
        Schema::dropIfExists('referrals');
    }
};
