<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStickerDefinitionRequest;
use App\Http\Resources\StickerDefinitionResource;
use App\Models\StickerDefinition;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StickerDefinitionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = StickerDefinition::with('team')->orderBy('player_name');

        if ($teamId = $request->integer('team_id')) {
            $query->where('team_id', $teamId);
        }

        return StickerDefinitionResource::collection($query->get())->response();
    }

    public function store(StoreStickerDefinitionRequest $request): JsonResponse
    {
        $data = $request->safe()->except('photo');

        if ($request->hasFile('photo')) {
            $data['image_path'] = $request->file('photo')->store('players', 'public');
        }

        $definition = StickerDefinition::create($data);

        return response()->json([
            'message' => 'Jogador cadastrado com sucesso.',
            'sticker_definition' => new StickerDefinitionResource($definition->load('team')),
        ], 201);
    }

    public function update(StoreStickerDefinitionRequest $request, StickerDefinition $stickerDefinition): JsonResponse
    {
        $data = $request->safe()->except('photo');

        if ($request->hasFile('photo')) {
            if ($stickerDefinition->image_path) {
                Storage::disk('public')->delete($stickerDefinition->image_path);
            }
            $data['image_path'] = $request->file('photo')->store('players', 'public');
        }

        $stickerDefinition->update($data);

        return response()->json([
            'message' => 'Jogador atualizado com sucesso.',
            'sticker_definition' => new StickerDefinitionResource($stickerDefinition->load('team')),
        ]);
    }

    public function destroy(StickerDefinition $stickerDefinition): JsonResponse
    {
        $stickerDefinition->delete();

        return response()->json([
            'message' => 'Jogador removido com sucesso.',
        ]);
    }
}
