<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\Ad;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

class AdService
{
    /** Relações sempre carregadas para montar o AdResource. */
    private const RELATIONS = ['user', 'stickerDefinition.team'];

    /**
     * Catálogo público: somente anúncios aprovados, com filtros opcionais.
     */
    public function publicCatalog(Request $request): LengthAwarePaginator
    {
        $query = Ad::query()
            ->with(self::RELATIONS)
            ->where('status', 'aprovado');

        if ($search = $request->string('search')->trim()->value()) {
            $query->where('title', 'like', "%{$search}%");
        }

        // O time agora pertence à figurinha (sticker_definition), não ao anúncio.
        if ($teamId = $request->integer('team_id')) {
            $query->whereHas('stickerDefinition', function ($builder) use ($teamId) {
                $builder->where('team_id', $teamId);
            });
        }

        $query->orderBy(
            'price',
            $request->input('sort') === 'maior_preco' ? 'desc' : 'asc'
        );

        if ($request->input('sort') === 'recentes') {
            $query->reorder()->latest();
        }

        return $query->paginate((int) $request->input('per_page', 24));
    }

    /**
     * Listagem administrativa: todos os anúncios, com filtros de status e busca.
     */
    public function adminList(Request $request): LengthAwarePaginator
    {
        $query = Ad::query()->with(self::RELATIONS)->latest();

        if ($status = $request->string('status')->trim()->value()) {
            $query->where('status', $status);
        }

        if ($search = $request->string('search')->trim()->value()) {
            $query->where('title', 'like', "%{$search}%");
        }

        return $query->paginate((int) $request->input('per_page', 20));
    }

    public function createForUser(User $user, array $data): Ad
    {
        $ad = $user->ads()->create([
            ...$data,
            'status' => 'pendente',
        ]);

        Activity::create([
            'user_id' => $user->id,
            'description' => "Novo anúncio criado: {$ad->title}",
            'status' => 'Pendente',
        ]);

        return $ad->load(self::RELATIONS);
    }

    public function update(Ad $ad, array $data): Ad
    {
        $ad->update($data);

        return $ad->load(self::RELATIONS);
    }

    public function approve(Ad $ad): Ad
    {
        $ad->update(['status' => 'aprovado']);

        Activity::create([
            'user_id' => $ad->user_id,
            'description' => "Anúncio aprovado: {$ad->title}",
            'status' => 'Ativo',
        ]);

        return $ad->load(self::RELATIONS);
    }

    public function reject(Ad $ad): Ad
    {
        $ad->update(['status' => 'rejeitado']);

        Activity::create([
            'user_id' => $ad->user_id,
            'description' => "Anúncio rejeitado: {$ad->title}",
            'status' => 'Rejeitado',
        ]);

        return $ad->load(self::RELATIONS);
    }
}
