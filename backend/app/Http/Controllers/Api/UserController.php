<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->latest();

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return UserResource::collection(
            $query->paginate((int) $request->input('per_page', 20))
        )->response();
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $user->update($request->validated());

        return response()->json([
            'message' => 'Colecionador atualizado com sucesso.',
            'user' => new UserResource($user),
        ]);
    }

    public function toggleStatus(Request $request, User $user): JsonResponse
    {
        abort_if(
            $user->id === $request->user()->id,
            422,
            'Você não pode alterar o status da sua própria conta.'
        );

        $user->update([
            'status' => $user->status === 'ativo' ? 'inativo' : 'ativo',
        ]);

        return response()->json([
            'message' => $user->status === 'ativo'
                ? 'Colecionador ativado com sucesso.'
                : 'Colecionador desativado com sucesso.',
            'user' => new UserResource($user),
        ]);
    }
}
