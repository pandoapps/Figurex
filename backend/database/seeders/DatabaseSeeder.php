<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            TeamSeeder::class,
            StickerDefinitionSeeder::class,
            AdSeeder::class,
            TransactionSeeder::class,
            TicketSeeder::class,
            ActivitySeeder::class,
            SettingSeeder::class,
        ]);
    }
}
