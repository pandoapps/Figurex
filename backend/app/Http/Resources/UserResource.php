<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'status' => $this->status,
            'phone' => $this->phone,
            'cpf' => $this->cpf,
            'cep' => $this->cep,
            'neighborhood' => $this->neighborhood,
            'address' => $this->address,
            'number' => $this->number,
            'complement' => $this->complement,
            'city' => $this->city,
            'state' => $this->state,
            'image_url' => $this->image ? asset('storage/'.$this->image) : null,
            'balance' => (float) $this->balance,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
