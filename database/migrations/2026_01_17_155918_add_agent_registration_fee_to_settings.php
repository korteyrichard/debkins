<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Insert default agent registration fee setting
        DB::table('settings')->insertOrIgnore([
            'key' => 'agent_registration_fee',
            'value' => '50',
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    public function down(): void
    {
        DB::table('settings')->where('key', 'agent_registration_fee')->delete();
    }
};
