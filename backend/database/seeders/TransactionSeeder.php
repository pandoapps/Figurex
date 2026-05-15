<?php

namespace Database\Seeders;

use App\Models\Ad;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $transactions = [
            ['ad' => 'Neymar Jr. Edição Ouro', 'buyer' => 'comprador@figurex.com', 'value' => 150.00, 'payment_status' => 'pago', 'shipping_status' => 'entregue', 'days_ago' => 13],
            ['ad' => 'Lionel Messi Base', 'buyer' => 'carlos@figurex.com', 'value' => 15.00, 'payment_status' => 'pago', 'shipping_status' => 'enviado', 'days_ago' => 12],
            ['ad' => 'Cristiano Ronaldo Raro', 'buyer' => 'comprador@figurex.com', 'value' => 85.00, 'payment_status' => 'pago', 'shipping_status' => 'aguardando_envio', 'days_ago' => 9],
            ['ad' => 'Mbappé Prata', 'buyer' => 'vendedor@figurex.com', 'value' => 45.00, 'payment_status' => 'pago', 'shipping_status' => 'entregue', 'days_ago' => 8],
            ['ad' => 'Casemiro Escudo', 'buyer' => 'comprador@figurex.com', 'value' => 25.00, 'payment_status' => 'pendente', 'shipping_status' => 'aguardando_envio', 'days_ago' => 2],
        ];

        foreach ($transactions as $data) {
            $ad = Ad::where('title', $data['ad'])->first();
            $buyer = User::where('email', $data['buyer'])->first();

            if (! $ad || ! $buyer) {
                continue;
            }

            Transaction::updateOrCreate(
                ['ad_id' => $ad->id, 'buyer_id' => $buyer->id],
                [
                    'seller_id' => $ad->user_id,
                    'item_name' => $ad->title,
                    'item_image_path' => $ad->stickerDefinition?->image_path,
                    'value' => $data['value'],
                    'shipping_cost' => 12.90,
                    'payment_status' => $data['payment_status'],
                    'shipping_status' => $data['shipping_status'],
                    'created_at' => now()->subDays($data['days_ago']),
                ],
            );
        }
    }
}
