<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agent_shops', function (Blueprint $table) {
            $table->string('primary_color', 7)->nullable()->after('logo');
            $table->string('background_color', 7)->nullable()->after('primary_color');
        });
    }

    public function down(): void
    {
        Schema::table('agent_shops', function (Blueprint $table) {
            $table->dropColumn(['primary_color', 'background_color']);
        });
    }
};
