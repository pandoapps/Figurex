<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0.01'],
            'sticker_definition_id' => ['required', 'exists:sticker_definitions,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Informe o título do anúncio.',
            'price.required' => 'Informe o preço.',
            'price.min' => 'O preço deve ser maior que zero.',
            'sticker_definition_id.required' => 'Selecione a figurinha do jogador.',
            'sticker_definition_id.exists' => 'A figurinha selecionada não existe.',
        ];
    }
}
