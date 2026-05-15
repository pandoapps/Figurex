<?php

namespace Database\Seeders;

use App\Models\StickerDefinition;
use App\Models\Team;
use Illuminate\Database\Seeder;

class StickerDefinitionSeeder extends Seeder
{
    public function run(): void
    {
        // Cada jogador recebe uma das 6 fotos de storage/app/public/stickers.
        $definitions = [
            ['team' => 'Brasil', 'player_name' => 'Neymar Jr', 'rarity' => 'Lendário', 'image_path' => 'stickers/sticker-1.webp'],
            ['team' => 'Brasil', 'player_name' => 'Vinícius Jr', 'rarity' => 'Raro', 'image_path' => 'stickers/sticker-2.jpg'],
            ['team' => 'Brasil', 'player_name' => 'Casemiro', 'rarity' => 'Comum', 'image_path' => 'stickers/sticker-3.jpg'],
            ['team' => 'Argentina', 'player_name' => 'Lionel Messi', 'rarity' => 'Lendário', 'image_path' => 'stickers/sticker-4.jpg'],
            ['team' => 'França', 'player_name' => 'Kylian Mbappé', 'rarity' => 'Lendário', 'image_path' => 'stickers/sticker-5.jpg'],
            ['team' => 'Portugal', 'player_name' => 'Cristiano Ronaldo', 'rarity' => 'Lendário', 'image_path' => 'stickers/sticker-6.jpg'],
        ];

        foreach ($definitions as $definition) {
            $team = Team::where('name', $definition['team'])->first();

            if (! $team) {
                continue;
            }

            StickerDefinition::updateOrCreate(
                ['team_id' => $team->id, 'player_name' => $definition['player_name']],
                [
                    'image_path' => $definition['image_path'],
                    'rarity' => $definition['rarity'],
                ],
            );
        }
    }
}
