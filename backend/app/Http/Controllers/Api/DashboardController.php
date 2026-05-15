<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityResource;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService)
    {
    }

    public function participant(Request $request): JsonResponse
    {
        $summary = $this->dashboardService->participantSummary($request->user());

        return response()->json([
            'cards' => $summary['cards'],
            'activities' => ActivityResource::collection($summary['activities']),
        ]);
    }

    public function admin(): JsonResponse
    {
        return response()->json(
            $this->dashboardService->adminSummary()
        );
    }
}
