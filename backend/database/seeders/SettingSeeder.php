<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::persistGroup('asaas', [
            'api_key_production' => '',
            'api_key_sandbox' => '',
            'environment' => 'sandbox',
            'webhook_url' => 'https://figurex.com.br/api/webhooks/asaas',
            'webhook_token' => '',
        ]);

        Setting::persistGroup('fretenet', [
            'access_token' => '',
            'cnpj' => '',
            'origin_cep' => '04538-132',
            'default_shipping_type' => 'PAC',
        ]);
    }
}
