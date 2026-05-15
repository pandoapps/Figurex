<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    /**
     * Estatísticas públicas exibidas na landing page.
     */
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'data' => [
                'total_stickers' => Ad::count(),
                'total_collectors' => User::where('role', 'participante')->count(),
                'total_sales' => Transaction::where('payment_status', 'pago')->count(),
            ],
        ]);
    }
}
