<?php

namespace Database\Seeders;

use App\Models\StickerDefinition;
use App\Models\Team;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class StickerDefinitionSeeder extends Seeder
{
    public function run(): void
    {
        // As fotos ficam versionadas em database/seeders/images/stickers e são
        // publicadas em storage/app/public/stickers (pasta ignorada pelo git).
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
                    'image_path' => $this->publishImage($definition['image_path']),
                    'rarity' => $definition['rarity'],
                ],
            );
        }
    }

    /**
     * Copia a foto versionada para o disco público e devolve o caminho salvo.
     * Sem arquivo de origem, devolve null para o frontend exibir o emoji padrão.
     */
    private function publishImage(string $path): ?string
    {
        $disk = Storage::disk('public');
        $source = database_path('seeders/images/'.$path);

        if (is_file($source)) {
            $disk->put($path, file_get_contents($source));
        }

        return $disk->exists($path) ? $path : null;
    }
}
