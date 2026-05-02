<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->decimal('base_price', 12, 2);
            $table->decimal('agent_price', 12, 2);
            $table->decimal('commission_amount', 12, 2);
            $table->enum('status', ['pending', 'available', 'withdrawn', 'reversed'])->default('pending');
            $table->timestamps();

            $table->index(['agent_id', 'status']);
            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commissions');
    }
};
