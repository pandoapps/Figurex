<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('asaas_payment_id')->nullable()->after('tracking_code');
            $table->longText('pix_qrcode')->nullable()->after('asaas_payment_id');
            $table->text('pix_payload')->nullable()->after('pix_qrcode');
            $table->dateTime('pix_expiration_date')->nullable()->after('pix_payload');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['asaas_payment_id', 'pix_qrcode', 'pix_payload', 'pix_expiration_date']);
        });
    }
};
