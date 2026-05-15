<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTransactionShippingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'evidence_image' => ['nullable', 'image', 'max:4096'],
            'tracking_code' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'evidence_image.image' => 'O arquivo enviado precisa ser uma imagem válida.',
            'evidence_image.max' => 'A evidência de envio deve ter no máximo 4 MB.',
            'tracking_code.max' => 'O código de rastreio deve ter no máximo 100 caracteres.',
        ];
    }
}
