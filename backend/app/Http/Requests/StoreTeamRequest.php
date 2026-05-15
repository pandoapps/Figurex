<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'flag_photo' => ['nullable', 'image', 'max:4096'],
            'team_photo' => ['nullable', 'image', 'max:4096'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Informe o nome da seleção.',
            'flag_photo.image' => 'A bandeira precisa ser um arquivo de imagem válido.',
            'flag_photo.max' => 'A imagem da bandeira deve ter no máximo 4 MB.',
            'team_photo.image' => 'A foto da seleção precisa ser um arquivo de imagem válido.',
            'team_photo.max' => 'A foto da seleção deve ter no máximo 4 MB.',
        ];
    }
}
