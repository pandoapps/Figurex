<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'transaction_id' => $this->transaction_id,
            'subject' => $this->subject,
            'status' => $this->status,
            'buyer' => [
                'id' => $this->buyer_id,
                'name' => $this->whenLoaded('buyer', fn () => $this->buyer->name),
            ],
            'seller' => [
                'id' => $this->seller_id,
                'name' => $this->whenLoaded('seller', fn () => $this->seller->name),
            ],
            'messages' => MessageResource::collection($this->whenLoaded('messages')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
