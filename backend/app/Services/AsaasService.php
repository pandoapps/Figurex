<?php

namespace App\Services;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class AsaasService
{
    private string $apiKey;
    private string $baseUrl;

    public function __construct()
    {
        $settings = Setting::group('asaas');
        $environment = $settings['environment'] ?? 'sandbox';

        $this->apiKey = $environment === 'production'
            ? ($settings['api_key_production'] ?? '')
            : ($settings['api_key_sandbox'] ?? '');

        $this->baseUrl = $environment === 'production'
            ? 'https://api.asaas.com/v3'
            : 'https://sandbox.asaas.com/api/v3';
    }

    /**
     * Retorna o ID do cliente no Asaas, criando-o se ainda não existir.
     */
    public function findOrCreateCustomer(User $user): string
    {
        $cpfDigits = preg_replace('/\D/', '', $user->cpf ?? '');
        $hasCpf = strlen($cpfDigits) === 11;

        if ($user->asaas_customer_id) {
            // Sincroniza o CPF com o Asaas caso o customer tenha sido criado antes de o CPF ser preenchido.
            if ($hasCpf) {
                $this->http()->put('/customers/' . $user->asaas_customer_id, [
                    'name' => $user->name,
                    'email' => $user->email,
                    'cpfCnpj' => $cpfDigits,
                    'notificationDisabled' => true,
                ]);
            }

            return $user->asaas_customer_id;
        }

        $response = $this->http()->get('/customers', [
            'externalReference' => (string) $user->id,
            'limit' => 1,
        ]);

        $this->assertSuccess($response, 'Erro ao consultar clientes no Asaas.');

        $data = $response->json();

        $payload = [
            'name' => $user->name,
            'email' => $user->email,
            'externalReference' => (string) $user->id,
            'notificationDisabled' => true,
        ];

        if ($hasCpf) {
            $payload['cpfCnpj'] = $cpfDigits;
        }

        if (! empty($data['data'])) {
            $customerId = $data['data'][0]['id'];

            // Atualiza o customer encontrado com CPF se necessário.
            if ($hasCpf) {
                $this->http()->put('/customers/' . $customerId, $payload);
            }
        } else {
            $createResponse = $this->http()->post('/customers', $payload);

            $this->assertSuccess($createResponse, 'Erro ao criar cliente no Asaas.');

            $customerId = $createResponse->json('id');
        }

        $user->update(['asaas_customer_id' => $customerId]);

        return $customerId;
    }

    /**
     * Cria uma cobrança PIX no Asaas e retorna os dados do pagamento.
     */
    public function createPixCharge(string $customerId, float $value, string $description): array
    {
        $response = $this->http()->post('/payments', [
            'customer' => $customerId,
            'billingType' => 'PIX',
            'value' => round($value, 2),
            'dueDate' => now()->addHours(24)->format('Y-m-d'),
            'description' => $description,
        ]);

        $this->assertSuccess($response, 'Erro ao criar cobrança PIX no Asaas.');

        return $response->json();
    }

    /**
     * Cancela uma cobrança no Asaas (ignora falha silenciosamente).
     */
    public function cancelPayment(string $paymentId): void
    {
        try {
            $this->http()->post("/payments/{$paymentId}/cancel");
        } catch (\Throwable) {
            // Falha ao cancelar no Asaas não deve impedir o fluxo local.
        }
    }

    /**
     * Busca o QR Code PIX de uma cobrança existente.
     */
    public function getPixQrCode(string $paymentId): array
    {
        $response = $this->http()->get("/payments/{$paymentId}/pixQrCode");

        $this->assertSuccess($response, 'Erro ao obter QR Code PIX do Asaas.');

        return $response->json();
    }

    private function assertSuccess(Response $response, string $fallback): void
    {
        if ($response->failed()) {
            $errors = $response->json('errors');
            $detail = is_array($errors) && ! empty($errors)
                ? ($errors[0]['description'] ?? $fallback)
                : ($response->json('message') ?? $fallback);

            throw ValidationException::withMessages(['asaas' => [$detail]]);
        }
    }

    private function http()
    {
        if (empty($this->apiKey)) {
            throw ValidationException::withMessages([
                'asaas' => ['Chave de API do Asaas não configurada. Acesse Painel > Configurações > Asaas.'],
            ]);
        }

        return Http::withHeaders(['access_token' => $this->apiKey])
            ->baseUrl($this->baseUrl)
            ->timeout(30)
            ->acceptJson();
    }
}
