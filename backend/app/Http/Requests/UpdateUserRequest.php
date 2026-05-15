<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->route('user')),
            ],
            'role' => ['required', 'in:admin,participante'],
            'status' => ['required', 'in:ativo,inativo'],
            'phone' => ['nullable', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Informe o nome do colecionador.',
            'email.required' => 'Informe o e-mail do colecionador.',
            'email.unique' => 'Este e-mail já está em uso por outro colecionador.',
            'role.in' => 'O tipo de colecionador é inválido.',
            'status.in' => 'O status do colecionador é inválido.',
        ];
    }
}
