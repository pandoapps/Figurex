<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\Ad;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class TransactionService
{
    public function __construct(
        private readonly AsaasService $asaasService,
        private readonly FreteNetService $freteNetService,
    ) {
    }

    /**
     * Inicia o checkout: reserva o anúncio, cria transação pendente e gera cobrança PIX no Asaas.
     * O custo de frete é recalculado no servidor para garantir integridade do valor.
     */
    public function checkout(User $buyer, Ad $ad, string $destinationCep, string $shippingService): Transaction
    {
        if ($ad->user_id === $buyer->id) {
            throw ValidationException::withMessages([
                'ad_id' => ['Você não pode comprar o seu próprio anúncio.'],
            ]);
        }

        $cpfDigits = preg_replace('/\D/', '', $buyer->cpf ?? '');
        if (strlen($cpfDigits) !== 11) {
            throw ValidationException::withMessages([
                'cpf' => ['Seu CPF não está preenchido. Acesse seu perfil e preencha o CPF antes de comprar.'],
            ]);
        }

        if ($ad->status !== 'aprovado') {
            throw ValidationException::withMessages([
                'ad_id' => $ad->status === 'vendido'
                    ? ['Esta figurinha já foi vendida.']
                    : ['Esta figurinha ainda não está disponível para compra.'],
            ]);
        }

        // Usa o CEP do vendedor como origem para cálculo do frete.
        $sellerCep = User::find($ad->user_id)?->cep ?? '';

        // Recalcula o frete no servidor para não confiar no valor enviado pelo cliente.
        $shippingCost = $this->freteNetService->getPriceForService($sellerCep, $destinationCep, $shippingService);

        // Reserva o anúncio atomicamente e cria a transação pendente.
        // O anúncio vai para 'reservado'; só muda para 'vendido' no postback do Asaas.
        $transaction = DB::transaction(function () use ($buyer, $ad, $destinationCep, $shippingService, $shippingCost) {
            $ad = Ad::lockForUpdate()->findOrFail($ad->id);

            if ($ad->status !== 'aprovado') {
                throw ValidationException::withMessages([
                    'ad_id' => ['Esta figurinha não está disponível para compra.'],
                ]);
            }

            $transaction = Transaction::create([
                'ad_id' => $ad->id,
                'buyer_id' => $buyer->id,
                'seller_id' => $ad->user_id,
                'item_name' => $ad->title,
                'item_image_path' => $ad->stickerDefinition?->image_path,
                'value' => $ad->price,
                'shipping_cost' => $shippingCost,
                'destination_cep' => preg_replace('/\D/', '', $destinationCep),
                'shipping_service' => $shippingService,
                'payment_status' => 'pendente',
                'shipping_status' => 'aguardando_envio',
            ]);

            $ad->update(['status' => 'reservado']);

            return $transaction;
        });

        // Gera a cobrança PIX no Asaas fora do DB transaction.
        // Qualquer falha reverte a reserva para não bloquear o anúncio.
        try {
            $customerId = $this->asaasService->findOrCreateCustomer($buyer);

            $total = (float) $transaction->value + (float) $transaction->shipping_cost;

            $payment = $this->asaasService->createPixCharge(
                $customerId,
                $total,
                "Figurinha: {$ad->title}"
            );

            $qrCode = $this->asaasService->getPixQrCode($payment['id']);

            if (empty($qrCode['payload'])) {
                throw ValidationException::withMessages([
                    'asaas' => ['O código PIX não foi gerado pelo Asaas. Tente novamente em instantes.'],
                ]);
            }

            $transaction->update([
                'asaas_payment_id' => $payment['id'],
                'pix_qrcode' => $qrCode['encodedImage'] ?? null,
                'pix_payload' => $qrCode['payload'],
                'pix_expiration_date' => isset($qrCode['expirationDate'])
                    ? Carbon::parse($qrCode['expirationDate'])->utc()
                    : null,
            ]);
        } catch (\Throwable $e) {
            try {
                $transaction->forceDelete();
                $ad->update(['status' => 'aprovado']);
            } catch (\Throwable $rollbackError) {
                Log::error("Rollback falhou para transaction #{$transaction->id}: {$rollbackError->getMessage()}");
            }

            throw $e;
        }

        return $transaction->load(['buyer', 'seller']);
    }

    /**
     * Cancela uma transação pendente: libera o anúncio e cancela a cobrança no Asaas.
     */
    public function cancelCheckout(Transaction $transaction): void
    {
        if ($transaction->payment_status === 'pago') {
            throw ValidationException::withMessages([
                'transaction' => ['Não é possível cancelar uma transação já paga.'],
            ]);
        }

        DB::transaction(function () use ($transaction) {
            if ($transaction->asaas_payment_id) {
                $this->asaasService->cancelPayment($transaction->asaas_payment_id);
            }

            Ad::where('id', $transaction->ad_id)->update(['status' => 'aprovado']);

            $transaction->forceDelete();
        });
    }

    /**
     * Confirma o pagamento da transação (chamado via webhook do Asaas).
     */
    public function confirmPayment(Transaction $transaction): void
    {
        if ($transaction->payment_status === 'pago') {
            return;
        }

        DB::transaction(function () use ($transaction) {
            $transaction->update(['payment_status' => 'pago']);

            Ad::where('id', $transaction->ad_id)->update(['status' => 'vendido']);

            Activity::create([
                'user_id' => $transaction->buyer_id,
                'description' => "Pagamento PIX confirmado: {$transaction->item_name}",
                'status' => 'Pago',
            ]);

            Activity::create([
                'user_id' => $transaction->seller_id,
                'description' => "Nova venda confirmada via PIX: {$transaction->item_name}",
                'status' => 'Pago',
            ]);
        });
    }

    /**
     * Registra a evidência de envio (foto e código de rastreio) feita pelo vendedor.
     */
    public function registerShipping(Transaction $transaction, ?UploadedFile $evidence, ?string $trackingCode): Transaction
    {
        return DB::transaction(function () use ($transaction, $evidence, $trackingCode) {
            $data = [];

            if ($evidence) {
                if ($transaction->evidence_image) {
                    Storage::disk('public')->delete($transaction->evidence_image);
                }
                $data['evidence_image'] = $evidence->store('shipping-evidence', 'public');
            }

            if ($trackingCode !== null) {
                $data['tracking_code'] = $trackingCode;
            }

            if ($transaction->shipping_status === 'aguardando_envio'
                && ($evidence || $trackingCode)) {
                $data['shipping_status'] = 'enviado';
            }

            $transaction->update($data);

            Activity::create([
                'user_id' => $transaction->seller_id,
                'description' => "Envio registrado: {$transaction->item_name}",
                'status' => 'Enviado',
            ]);

            return $transaction->load(['buyer', 'seller']);
        });
    }
}
