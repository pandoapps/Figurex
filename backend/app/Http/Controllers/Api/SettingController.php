<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSettingsRequest;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    public function __construct(private readonly SettingService $settingService)
    {
    }

    public function show(string $group): JsonResponse
    {
        return response()->json([
            'group' => $group,
            'settings' => $this->settingService->get($group),
        ]);
    }

    public function update(UpdateSettingsRequest $request, string $group): JsonResponse
    {
        $settings = $this->settingService->update(
            $group,
            $request->validated('settings'),
        );

        return response()->json([
            'message' => 'Configurações salvas com sucesso.',
            'group' => $group,
            'settings' => $settings,
        ]);
    }
}
