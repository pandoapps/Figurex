<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminStoreAdRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0.01'],
            'sticker_definition_id' => ['required', 'exists:sticker_definitions,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required' => 'Selecione o colecionador anunciante.',
            'user_id.exists' => 'O colecionador selecionado não existe.',
            'title.required' => 'Informe o título do anúncio.',
            'price.required' => 'Informe o preço.',
            'price.min' => 'O preço deve ser maior que zero.',
            'sticker_definition_id.required' => 'Selecione a figurinha do jogador.',
            'sticker_definition_id.exists' => 'A figurinha selecionada não existe.',
        ];
    }
}
