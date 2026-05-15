<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StickerDefinitionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'team_id' => $this->team_id,
            'team' => new TeamResource($this->whenLoaded('team')),
            'player_name' => $this->player_name,
            'image_url' => $this->image_path ? asset('storage/'.$this->image_path) : null,
            'rarity' => $this->rarity,
        ];
    }
}
