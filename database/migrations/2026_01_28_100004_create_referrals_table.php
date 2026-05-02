<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('referred_id')->constrained('users')->onDelete('cascade');
            $table->string('referral_code');
            $table->decimal('referral_percentage', 5, 2)->default(5.00);
            $table->timestamps();

            $table->unique('referred_id');
            $table->index('referrer_id');
            $table->index('referral_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
