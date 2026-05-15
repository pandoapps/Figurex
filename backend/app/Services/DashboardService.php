<?php

namespace App\Services;

use App\Models\Ad;
use App\Models\Transaction;
use App\Models\User;

class DashboardService
{
    /**
     * Resumo do painel do participante: cards + últimas atividades.
     */
    public function participantSummary(User $user): array
    {
        $activeAds = $user->ads()->where('status', 'aprovado')->count();
        $pendingAds = $user->ads()->where('status', 'pendente')->count();
        $sales = $user->sales()->where('payment_status', 'pago')->count();

        return [
            'cards' => [
                'active_ads' => $activeAds,
                'pending_ads' => $pendingAds,
                'completed_sales' => $sales,
                'balance' => (float) $user->balance,
            ],
            'activities' => $user->activities()
                ->latest()
                ->take(8)
                ->get(),
        ];
    }

    /**
     * Resumo do painel administrativo: cards + gráfico de vendas dos últimos 15 dias.
     */
    public function adminSummary(): array
    {
        $monthlyRevenue = Transaction::where('payment_status', 'pago')
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('value');

        return [
            'cards' => [
                'total_users' => User::count(),
                'total_ads' => Ad::count(),
                'monthly_revenue' => (float) $monthlyRevenue,
                'completed_sales' => Transaction::where('payment_status', 'pago')->count(),
            ],
            'sales_chart' => $this->salesChart(),
        ];
    }

    /**
     * Volume de vendas (em R$) dos últimos 15 dias para o gráfico do dashboard.
     */
    private function salesChart(): array
    {
        $days = [];

        for ($i = 14; $i >= 0; $i--) {
            $reference = now()->subDays($i);
            $total = Transaction::where('payment_status', 'pago')
                ->whereBetween('created_at', [
                    $reference->copy()->startOfDay(),
                    $reference->copy()->endOfDay(),
                ])
                ->sum('value');

            $days[] = [
                'label' => $reference->format('d/m'),
                'value' => (float) $total,
            ];
        }

        return $days;
    }
}
