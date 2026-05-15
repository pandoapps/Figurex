<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Administrador Figurex',
                'email' => 'admin@admin.com',
                'role' => 'admin',
                'status' => 'ativo',
                'balance' => 0,
            ],
            [
                'name' => 'João Vendedor',
                'email' => 'vendedor@figurex.com',
                'role' => 'participante',
                'status' => 'ativo',
                'phone' => '(11) 98888-1111',
                'cep' => '01310-100',
                'address' => 'Avenida Paulista',
                'number' => '1000',
                'city' => 'São Paulo',
                'state' => 'SP',
                'balance' => 450.00,
            ],
            [
                'name' => 'Maria Compradora',
                'email' => 'comprador@figurex.com',
                'role' => 'participante',
                'status' => 'ativo',
                'phone' => '(21) 97777-2222',
                'cep' => '22041-001',
                'address' => 'Avenida Atlântica',
                'number' => '250',
                'city' => 'Rio de Janeiro',
                'state' => 'RJ',
                'balance' => 120.00,
            ],
            [
                'name' => 'Carlos Silva',
                'email' => 'carlos@figurex.com',
                'role' => 'participante',
                'status' => 'ativo',
                'phone' => '(31) 96666-3333',
                'city' => 'Belo Horizonte',
                'state' => 'MG',
                'balance' => 80.00,
            ],
            [
                'name' => 'Ana Oliveira',
                'email' => 'ana@figurex.com',
                'role' => 'participante',
                'status' => 'inativo',
                'phone' => '(41) 95555-4444',
                'city' => 'Curitiba',
                'state' => 'PR',
                'balance' => 0,
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                array_merge($user, ['password' => Hash::make('123456')]),
            );
        }
    }
}
