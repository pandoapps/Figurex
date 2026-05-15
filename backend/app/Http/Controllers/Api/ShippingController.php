<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Services\FreteNetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    public function __construct(private readonly FreteNetService $freteNetService)
    {
    }

    public function quote(Request $request): JsonResponse
    {
        $request->validate([
            'ad_id' => ['required', 'integer', 'exists:ads,id'],
            'destination_cep' => ['required', 'string', 'regex:/^\d{5}-?\d{3}$/'],
        ], [
            'ad_id.required' => 'Informe o anúncio para calcular o frete.',
            'ad_id.exists' => 'Anúncio não encontrado.',
            'destination_cep.required' => 'Informe o CEP de destino.',
            'destination_cep.regex' => 'CEP inválido. Use o formato 00000-000.',
        ]);

        $ad = Ad::with('user')->findOrFail($request->integer('ad_id'));
        $sellerCep = $ad->user?->cep ?? '';

        $options = $this->freteNetService->quote($sellerCep, $request->string('destination_cep')->value());

        return response()->json(['options' => $options]);
    }
}
