<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE ads MODIFY COLUMN status ENUM('pendente', 'aprovado', 'rejeitado', 'reservado', 'vendido') NOT NULL DEFAULT 'pendente'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE ads MODIFY COLUMN status ENUM('pendente', 'aprovado', 'rejeitado', 'vendido') NOT NULL DEFAULT 'pendente'");
    }
};
