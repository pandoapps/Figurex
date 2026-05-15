<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ad_id')->constrained()->onDelete('cascade');
            $table->foreignId('buyer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            $table->string('item_name');
            $table->string('item_image_path')->nullable();
            $table->decimal('value', 10, 2);
            $table->decimal('shipping_cost', 10, 2)->default(0);
            $table->enum('payment_status', ['pendente', 'pago'])->default('pendente');
            $table->enum('shipping_status', ['aguardando_envio', 'enviado', 'entregue'])->default('aguardando_envio');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
