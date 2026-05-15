<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Cria um novo participante e devolve o usuário com o token de acesso.
     *
     * @return array{user: User, token: string}
     */
    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => 'participante',
            'status' => 'ativo',
        ]);

        return [
            'user' => $user,
            'token' => $user->createToken('figurex')->plainTextToken,
        ];
    }

    /**
     * Valida credenciais e devolve o usuário autenticado com o token.
     *
     * @return array{user: User, token: string}
     */
    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciais inválidas. Verifique o e-mail e a senha.'],
            ]);
        }

        if ($user->status === 'inativo') {
            throw ValidationException::withMessages([
                'email' => ['Esta conta está inativa. Entre em contato com o suporte.'],
            ]);
        }

        return [
            'user' => $user,
            'token' => $user->createToken('figurex')->plainTextToken,
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }
}
