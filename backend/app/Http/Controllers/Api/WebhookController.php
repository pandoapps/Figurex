<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(private readonly TransactionService $transactionService)
    {
    }

    public function asaas(Request $request): JsonResponse
    {
        $settings = Setting::group('asaas');
        $expectedToken = $settings['webhook_token'] ?? '';

        if (! empty($expectedToken)) {
            $receivedToken = $request->header('asaas-access-token', '');
            if (! hash_equals($expectedToken, $receivedToken)) {
                Log::warning('Webhook Asaas rejeitado: token inválido.');

                return response()->json(['ok' => false], 401);
            }
        }

        $event = $request->string('event')->value();
        $paymentId = $request->input('payment.id', '');

        Log::info("Webhook Asaas recebido: event={$event}, paymentId={$paymentId}");

        if (! in_array($event, ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED'], true)) {
            return response()->json(['ok' => true]);
        }

        if (empty($paymentId)) {
            return response()->json(['ok' => true]);
        }

        $transaction = Transaction::where('asaas_payment_id', $paymentId)
            ->where('payment_status', 'pendente')
            ->first();

        if (! $transaction) {
            return response()->json(['ok' => true]);
        }

        $this->transactionService->confirmPayment($transaction);

        Log::info("Pagamento confirmado: asaas_payment_id={$paymentId}, transaction_id={$transaction->id}");

        return response()->json(['ok' => true]);
    }
}
