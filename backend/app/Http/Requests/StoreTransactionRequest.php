<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ad_id' => ['required', 'exists:ads,id'],
            'destination_cep' => ['required', 'string', 'regex:/^\d{5}-?\d{3}$/'],
            'shipping_service' => ['required', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'ad_id.required' => 'Selecione uma figurinha para comprar.',
            'ad_id.exists' => 'A figurinha selecionada não está mais disponível.',
            'destination_cep.required' => 'Informe o CEP de entrega.',
            'destination_cep.regex' => 'CEP de entrega inválido.',
            'shipping_service.required' => 'Selecione uma modalidade de envio.',
        ];
    }
}
