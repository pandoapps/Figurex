<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Raridade, jogador, seleção e foto vêm sempre da figurinha (sticker_definition).
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'price' => (float) $this->price,
            'image_url' => $this->stickerDefinition?->image_path
                ? asset('storage/'.$this->stickerDefinition->image_path)
                : null,
            'status' => $this->status,
            'sticker_definition_id' => $this->sticker_definition_id,
            'rarity' => $this->stickerDefinition?->rarity,
            'player_name' => $this->stickerDefinition?->player_name,
            'team' => $this->whenLoaded(
                'stickerDefinition',
                fn () => $this->stickerDefinition->team?->name,
            ),
            'seller' => [
                'id' => $this->user_id,
                'name' => $this->whenLoaded('user', fn () => $this->user->name),
            ],
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
