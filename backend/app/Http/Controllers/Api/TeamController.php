<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTeamRequest;
use App\Http\Resources\TeamResource;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class TeamController extends Controller
{
    public function index(): JsonResponse
    {
        $teams = Team::with('stickerDefinitions')->orderBy('name')->get();

        return TeamResource::collection($teams)->response();
    }

    public function store(StoreTeamRequest $request): JsonResponse
    {
        $data = ['name' => $request->validated('name')];
        $data = array_merge($data, $this->handlePhotos($request));

        $team = Team::create($data);

        return response()->json([
            'message' => 'Seleção adicionada com sucesso.',
            'team' => new TeamResource($team),
        ], 201);
    }

    public function update(StoreTeamRequest $request, Team $team): JsonResponse
    {
        $data = ['name' => $request->validated('name')];
        $data = array_merge($data, $this->handlePhotos($request, $team));

        $team->update($data);

        return response()->json([
            'message' => 'Seleção atualizada com sucesso.',
            'team' => new TeamResource($team),
        ]);
    }

    public function destroy(Team $team): JsonResponse
    {
        $team->delete();

        return response()->json([
            'message' => 'Seleção removida com sucesso.',
        ]);
    }

    /**
     * Salva as imagens enviadas (bandeira e foto da seleção) e devolve os
     * caminhos para persistência, removendo arquivos antigos quando substituídos.
     */
    private function handlePhotos(StoreTeamRequest $request, ?Team $team = null): array
    {
        $data = [];

        foreach (['flag_photo', 'team_photo'] as $field) {
            if ($request->hasFile($field)) {
                if ($team?->{$field}) {
                    Storage::disk('public')->delete($team->{$field});
                }
                $data[$field] = $request->file($field)->store('teams', 'public');
            }
        }

        return $data;
    }
}
