<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeamResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'flag_photo_url' => $this->flag_photo ? asset('storage/'.$this->flag_photo) : null,
            'team_photo_url' => $this->team_photo ? asset('storage/'.$this->team_photo) : null,
            'sticker_definitions' => StickerDefinitionResource::collection(
                $this->whenLoaded('stickerDefinitions')
            ),
        ];
    }
}
