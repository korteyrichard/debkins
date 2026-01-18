<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Setting;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add foster_order_pusher_enabled setting
        Setting::updateOrCreate(
            ['key' => 'foster_order_pusher_enabled'],
            ['value' => '1']
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Setting::where('key', 'foster_order_pusher_enabled')->delete();
    }
};
