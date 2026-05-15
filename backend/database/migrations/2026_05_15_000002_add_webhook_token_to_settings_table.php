<?php

use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Setting::persistGroup('asaas', [
            'webhook_token' => '',
        ]);
    }

    public function down(): void
    {
        Setting::where('group', 'asaas')->where('key', 'webhook_token')->delete();
    }
};
