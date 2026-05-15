<?php

namespace Database\Seeders;

use App\Models\Message;
use App\Models\Ticket;
use App\Models\Transaction;
use Illuminate\Database\Seeder;

class TicketSeeder extends Seeder
{
    public function run(): void
    {
        $transaction = Transaction::where('item_name', 'Cristiano Ronaldo Raro')->first();

        if (! $transaction) {
            return;
        }

        $ticket = Ticket::updateOrCreate(
            ['transaction_id' => $transaction->id],
            [
                'buyer_id' => $transaction->buyer_id,
                'seller_id' => $transaction->seller_id,
                'subject' => 'Atraso no envio - Cristiano Ronaldo Raro',
                'status' => 'em_analise',
            ],
        );

        $messages = [
            ['user_id' => $transaction->buyer_id, 'sender_name' => $transaction->buyer->name, 'role' => 'buyer', 'body' => 'Olá, ainda não recebi minha figurinha. Já se passaram 5 dias.'],
            ['user_id' => null, 'sender_name' => 'Sistema de Moderação', 'role' => 'moderator', 'body' => 'Chamado aberto. Aguardando posicionamento do vendedor.'],
            ['user_id' => $transaction->seller_id, 'sender_name' => $transaction->seller->name, 'role' => 'seller', 'body' => 'Tive um problema na agência, vou postar amanhã sem falta!'],
        ];

        foreach ($messages as $message) {
            Message::updateOrCreate(
                ['ticket_id' => $ticket->id, 'body' => $message['body']],
                $message,
            );
        }
    }
}
