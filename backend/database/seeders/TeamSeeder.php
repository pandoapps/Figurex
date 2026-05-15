<?php

namespace Database\Seeders;

use App\Models\Team;
use Illuminate\Database\Seeder;

class TeamSeeder extends Seeder
{
    public function run(): void
    {
        // As fotos (flag_photo e team_photo) ficam em branco no seed e são
        // enviadas posteriormente pelo administrador no painel de seleções.
        $teams = ['Brasil', 'Argentina', 'França', 'Portugal'];

        foreach ($teams as $name) {
            Team::updateOrCreate(['name' => $name], ['name' => $name]);
        }
    }
}
