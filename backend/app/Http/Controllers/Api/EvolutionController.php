<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class EvolutionController extends Controller
{
    private function config(): array
    {
        return [
            'url' => env('EVOLUTION_URL', ''),
            'api_key' => env('EVOLUTION_API_KEY', ''),
            'instance' => env('EVOLUTION_INSTANCE', ''),
        ];
    }

    private function http(int $timeout = 10): \Illuminate\Http\Client\PendingRequest
    {
        return Http::withHeader('apikey', $this->config()['api_key'])->timeout($timeout);
    }

    private function formatPhone(string $phone): string
    {
        // Remove tudo que não é dígito: (, ), -, espaço, +, etc.
        $digits = preg_replace('/\D/', '', $phone);

        // Remove zero à esquerda (ex: "011 99999-9999" → "11999999999")
        if (str_starts_with($digits, '0')) {
            $digits = ltrim($digits, '0');
        }

        // Se já contém DDI (começa com 55 e tem 12-13 dígitos), mantém como está.
        // Caso contrário (10 ou 11 dígitos = DDD + número), adiciona DDI do Brasil.
        if (strlen($digits) <= 11) {
            $digits = '55' . $digits;
        }

        return $digits;
    }

    public function connectionStatus(): JsonResponse
    {
        $config = $this->config();
        $base = $config['url'];
        $instance = $config['instance'];

        try {
            $stateResponse = $this->http()->get("{$base}/instance/connectionState/{$instance}");
        } catch (ConnectionException) {
            return response()->json(['state' => 'unknown', 'qrcode' => null]);
        }

        // Instância ainda não existe — cria automaticamente
        if ($stateResponse->status() === 404 || $stateResponse->status() === 400) {
            try {
                $this->http()->post("{$base}/instance/create", [
                    'instanceName' => $instance,
                    'integration' => 'WHATSAPP-BAILEYS',
                ]);
            } catch (ConnectionException) {
                return response()->json(['state' => 'unknown', 'qrcode' => null]);
            }

            $state = 'close';
        } else {
            $state = $stateResponse->json('instance.state')
                ?? $stateResponse->json('state')
                ?? 'unknown';
        }

        $qrcode = null;

        if ($state !== 'open') {
            try {
                $qrResponse = $this->http()->get("{$base}/instance/connect/{$instance}");

                if ($qrResponse->successful()) {
                    // v1.x devolve o data URI completo em "base64"
                    // v2.x pode devolver em "qrcode.base64"
                    $qrcode = $qrResponse->json('base64')
                        ?? $qrResponse->json('qrcode.base64')
                        ?? $qrResponse->json('code')
                        ?? null;
                }
            } catch (ConnectionException) {
                // QR code indisponível, retorna sem ele
            }
        }

        return response()->json([
            'state' => $state,
            'qrcode' => $qrcode,
        ]);
    }

    public function sendTestMessage(Request $request): JsonResponse
    {
        $request->validate([
            'number'  => ['required', 'string', 'max:20'],
            'message' => ['required', 'string', 'max:4096'],
        ]);

        $config = $this->config();

        try {
            $response = $this->http(30)->post("{$config['url']}/message/sendText/{$config['instance']}", [
                'number'      => $this->formatPhone($request->string('number')->value()),
                'textMessage' => ['text' => $request->string('message')->value()],
            ]);
        } catch (ConnectionException) {
            abort(502, 'Não foi possível conectar à Evolution API. Verifique se o WhatsApp está conectado.');
        }

        abort_unless(
            $response->successful(),
            502,
            'Falha ao enviar mensagem. Verifique se o WhatsApp está conectado e o número é válido.'
        );

        return response()->json(['message' => 'Mensagem de teste enviada com sucesso.']);
    }

    public function sendMessage(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'message' => ['required', 'string', 'max:4096'],
        ]);

        abort_if(! $user->phone, 422, 'Este colecionador não possui telefone cadastrado.');

        $config = $this->config();

        try {
            $response = $this->http(30)->post("{$config['url']}/message/sendText/{$config['instance']}", [
                'number'      => $this->formatPhone($user->phone),
                'textMessage' => ['text' => $request->string('message')->value()],
            ]);
        } catch (ConnectionException) {
            abort(502, 'Não foi possível conectar à Evolution API. Verifique se o WhatsApp está conectado.');
        }

        abort_unless(
            $response->successful(),
            502,
            'Falha ao enviar mensagem. Verifique se o WhatsApp está conectado.'
        );

        return response()->json(['message' => 'Mensagem enviada com sucesso.']);
    }

    public function getMessages(Request $request, User $user): JsonResponse
    {
        abort_if(! $user->phone, 422, 'Este colecionador não possui telefone cadastrado.');

        $config = $this->config();
        $remoteJid = $this->formatPhone($user->phone) . '@s.whatsapp.net';

        try {
            $response = $this->http()->post("{$config['url']}/chat/findMessages/{$config['instance']}", [
                'where' => [
                    'key' => ['remoteJid' => $remoteJid],
                ],
                'limit' => (int) $request->input('limit', 50),
            ]);
        } catch (ConnectionException) {
            abort(502, 'Não foi possível conectar à Evolution API. Verifique se o WhatsApp está conectado.');
        }

        if (! $response->successful()) {
            \Log::error('Evolution getMessages falhou', [
                'remoteJid' => $remoteJid,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            abort(502, 'Falha ao buscar mensagens na Evolution API (HTTP ' . $response->status() . '). Verifique os logs.');
        }

        $body = $response->json();

        // Evolution com MongoDB retorna array direto na raiz.
        // Evolution com store em arquivo retorna { messages: { records: [...] } } ou { messages: [...] }.
        $messages = match (true) {
            is_array($body) && array_is_list($body)      => $body,
            isset($body['messages']['records'])           => $body['messages']['records'],
            isset($body['messages']) && is_array($body['messages']) => $body['messages'],
            default                                       => [],
        };

        return response()->json(['messages' => $messages]);
    }
}
