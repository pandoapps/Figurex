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

    private function http(): \Illuminate\Http\Client\PendingRequest
    {
        return Http::withHeader('apikey', $this->config()['api_key'])->timeout(10);
    }

    private function formatPhone(string $phone): string
    {
        $number = preg_replace('/\D/', '', $phone);

        if (strlen($number) <= 11) {
            $number = '55' . $number;
        }

        return $number;
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

    public function sendMessage(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'message' => ['required', 'string', 'max:4096'],
        ]);

        abort_if(! $user->phone, 422, 'Este colecionador não possui telefone cadastrado.');

        $config = $this->config();

        try {
            $response = $this->http()->post("{$config['url']}/message/sendText/{$config['instance']}", [
                'number' => $this->formatPhone($user->phone),
                'text' => $request->string('message')->value(),
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

        try {
            $response = $this->http()->post("{$config['url']}/chat/findMessages/{$config['instance']}", [
                'where' => [
                    'key' => ['remoteJid' => $this->formatPhone($user->phone) . '@s.whatsapp.net'],
                ],
                'limit' => (int) $request->input('limit', 50),
            ]);
        } catch (ConnectionException) {
            return response()->json(['messages' => []]);
        }

        if (! $response->successful()) {
            return response()->json(['messages' => []]);
        }

        $messages = $response->json('messages.records') ?? $response->json('messages') ?? [];

        return response()->json(['messages' => $messages]);
    }
}
