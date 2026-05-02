<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('commissions', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable()->after('order_id')->constrained('products')->nullOnDelete();
            $table->foreignId('product_variant_id')->nullable()->after('product_id')->constrained('product_variants')->nullOnDelete();
            $table->integer('quantity')->default(1)->after('commission_amount');
            $table->decimal('withdrawn_amount', 12, 2)->default(0)->after('quantity');
            $table->timestamp('available_at')->nullable()->after('status');
        });

        Schema::table('referral_commissions', function (Blueprint $table) {
            // Rename existing columns to match what the code expects
            $table->renameColumn('referral_id', 'referrer_id');
            $table->renameColumn('amount', 'referral_amount');
        });

        Schema::table('referral_commissions', function (Blueprint $table) {
            // Add missing columns
            $table->foreignId('referred_agent_id')->after('referrer_id')->constrained('users')->onDelete('cascade');
            $table->decimal('referral_percentage', 5, 2)->default(5.00)->after('referral_amount');
            $table->decimal('withdrawn_amount', 12, 2)->default(0)->after('status');
            $table->timestamp('available_at')->nullable()->after('withdrawn_amount');
        });
    }

    public function down(): void
    {
        Schema::table('referral_commissions', function (Blueprint $table) {
            $table->dropForeign(['referred_agent_id']);
            $table->dropColumn(['referred_agent_id', 'referral_percentage', 'withdrawn_amount', 'available_at']);
        });

        Schema::table('referral_commissions', function (Blueprint $table) {
            $table->renameColumn('referrer_id', 'referral_id');
            $table->renameColumn('referral_amount', 'amount');
        });

        Schema::table('commissions', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropForeign(['product_variant_id']);
            $table->dropColumn(['product_id', 'product_variant_id', 'quantity', 'withdrawn_amount', 'available_at']);
        });
    }
};
