<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('destination_cep', 9)->nullable()->after('shipping_cost');
            $table->string('shipping_service')->nullable()->after('destination_cep');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['destination_cep', 'shipping_service']);
        });
    }
};
