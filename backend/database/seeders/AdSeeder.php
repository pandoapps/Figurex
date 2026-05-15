<?php

namespace Database\Seeders;

use App\Models\Ad;
use App\Models\StickerDefinition;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdSeeder extends Seeder
{
    public function run(): void
    {
        // Cada anúncio aponta para uma figurinha (jogador); raridade e foto
        // são herdadas dela.
        $ads = [
            ['title' => 'Neymar Jr. Edição Ouro', 'description' => 'Figurinha dourada exclusiva da Copa.', 'price' => 150.00, 'seller' => 'vendedor@figurex.com', 'status' => 'aprovado', 'player' => 'Neymar Jr'],
            ['title' => 'Lionel Messi Base', 'description' => 'Lionel Messi versão regular.', 'price' => 15.00, 'seller' => 'ana@figurex.com', 'status' => 'aprovado', 'player' => 'Lionel Messi'],
            ['title' => 'Cristiano Ronaldo Raro', 'description' => 'CR7 em ótimo estado de conservação.', 'price' => 85.00, 'seller' => 'vendedor@figurex.com', 'status' => 'aprovado', 'player' => 'Cristiano Ronaldo'],
            ['title' => 'Mbappé Prata', 'description' => 'Kylian Mbappé edição metálica.', 'price' => 45.00, 'seller' => 'carlos@figurex.com', 'status' => 'aprovado', 'player' => 'Kylian Mbappé'],
            ['title' => 'Vinícius Jr. Estrela', 'description' => 'Vinícius Jr. brilhando pela seleção.', 'price' => 60.00, 'seller' => 'ana@figurex.com', 'status' => 'pendente', 'player' => 'Vinícius Jr'],
            ['title' => 'Casemiro Escudo', 'description' => 'O muro de contenção da seleção.', 'price' => 25.00, 'seller' => 'vendedor@figurex.com', 'status' => 'aprovado', 'player' => 'Casemiro'],
        ];

        foreach ($ads as $ad) {
            $seller = User::where('email', $ad['seller'])->first();
            $definition = StickerDefinition::where('player_name', $ad['player'])->first();

            if (! $seller || ! $definition) {
                continue;
            }

            Ad::updateOrCreate(
                ['user_id' => $seller->id, 'title' => $ad['title']],
                [
                    'sticker_definition_id' => $definition->id,
                    'description' => $ad['description'],
                    'price' => $ad['price'],
                    'status' => $ad['status'],
                ],
            );
        }
    }
}
