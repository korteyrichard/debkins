<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('referral_commissions', function (Blueprint $table) {
            $table->dropForeign(['commission_id']);
            $table->unsignedBigInteger('commission_id')->nullable()->change();
            $table->foreign('commission_id')->references('id')->on('commissions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('referral_commissions', function (Blueprint $table) {
            $table->dropForeign(['commission_id']);
            $table->unsignedBigInteger('commission_id')->nullable(false)->change();
            $table->foreign('commission_id')->references('id')->on('commissions')->onDelete('cascade');
        });
    }
};
