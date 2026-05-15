<?php

namespace App\Console\Commands;

use App\Models\Ad;
use App\Models\Transaction;
use App\Services\AsaasService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CleanExpiredReservations extends Command
{
    protected $signature = 'reservations:clean';

    protected $description = 'Libera anúncios reservados cujo pagamento PIX não foi confirmado em 1 minuto.';

    public function handle(AsaasService $asaas): void
    {
        $expired = Transaction::query()
            ->where('payment_status', 'pendente')
            ->where('created_at', '<=', now()->subMinute())
            ->get();

        if ($expired->isEmpty()) {
            return;
        }

        foreach ($expired as $transaction) {
            try {
                DB::transaction(function () use ($transaction, $asaas) {
                    if ($transaction->asaas_payment_id) {
                        $asaas->cancelPayment($transaction->asaas_payment_id);
                    }

                    Ad::where('id', $transaction->ad_id)
                        ->where('status', 'reservado')
                        ->update(['status' => 'aprovado']);

                    $transaction->forceDelete();
                });

                Log::info("Reserva expirada liberada: transaction #{$transaction->id}, ad #{$transaction->ad_id}");
            } catch (\Throwable $e) {
                Log::error("Falha ao liberar reserva #{$transaction->id}: {$e->getMessage()}");
            }
        }

        $this->info("Liberadas {$expired->count()} reserva(s) expirada(s).");
    }
}
