<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStickerDefinitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'team_id' => ['required', 'exists:teams,id'],
            'player_name' => ['required', 'string', 'max:255'],
            'rarity' => ['required', 'in:Comum,Raro,Lendário'],
            'photo' => ['nullable', 'image', 'max:4096'],
        ];
    }

    public function messages(): array
    {
        return [
            'team_id.required' => 'Selecione a seleção.',
            'player_name.required' => 'Informe o nome do jogador.',
            'rarity.required' => 'Selecione a raridade.',
            'photo.image' => 'O arquivo enviado precisa ser uma imagem válida.',
            'photo.max' => 'A foto do jogador deve ter no máximo 4 MB.',
        ];
    }
}
