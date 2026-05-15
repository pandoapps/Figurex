<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\User;
use Illuminate\Database\Seeder;

class ActivitySeeder extends Seeder
{
    public function run(): void
    {
        $activities = [
            'vendedor@figurex.com' => [
                ['description' => 'Nova venda para Carlos Silva', 'status' => 'Aprovado'],
                ['description' => 'Pagamento confirmado da venda Mbappé Prata', 'status' => 'Pago'],
                ['description' => 'Novo anúncio criado: Casemiro Escudo', 'status' => 'Ativo'],
                ['description' => 'Saldo resgatado para conta bancária', 'status' => 'Concluído'],
            ],
            'comprador@figurex.com' => [
                ['description' => 'Compra realizada: Neymar Jr. Edição Ouro', 'status' => 'Concluído'],
                ['description' => 'Compra realizada: Cristiano Ronaldo Raro', 'status' => 'Pendente'],
                ['description' => 'Chamado aberto sobre atraso no envio', 'status' => 'Em análise'],
            ],
        ];

        foreach ($activities as $email => $entries) {
            $user = User::where('email', $email)->first();

            if (! $user) {
                continue;
            }

            foreach ($entries as $entry) {
                Activity::updateOrCreate(
                    ['user_id' => $user->id, 'description' => $entry['description']],
                    ['status' => $entry['status']],
                );
            }
        }
    }
}
