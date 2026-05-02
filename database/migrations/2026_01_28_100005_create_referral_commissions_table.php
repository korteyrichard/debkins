<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referral_commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referral_id')->constrained('referrals')->onDelete('cascade');
            $table->foreignId('commission_id')->constrained('commissions')->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->enum('status', ['pending', 'available', 'withdrawn', 'reversed'])->default('pending');
            $table->timestamps();

            $table->index(['referral_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referral_commissions');
    }
};
