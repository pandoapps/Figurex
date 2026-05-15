<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminStoreAdRequest;
use App\Http\Requests\StoreAdRequest;
use App\Http\Requests\UpdateAdRequest;
use App\Http\Resources\AdResource;
use App\Models\Ad;
use App\Models\User;
use App\Services\AdService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AdController extends Controller
{
    public function __construct(private readonly AdService $adService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $ads = $this->adService->publicCatalog($request);

        return AdResource::collection($ads)->response();
    }

    public function show(Ad $ad): AdResource
    {
        return new AdResource($ad->load(['user', 'stickerDefinition.team']));
    }

    public function mine(Request $request): JsonResponse
    {
        $ads = $request->user()
            ->ads()
            ->with(['user', 'stickerDefinition.team'])
            ->latest()
            ->get();

        return AdResource::collection($ads)->response();
    }

    public function store(StoreAdRequest $request): JsonResponse
    {
        if (empty($request->user()->cep)) {
            throw ValidationException::withMessages([
                'profile' => ['Complete seu perfil com o CEP antes de criar um anúncio.'],
            ]);
        }

        $ad = $this->adService->createForUser($request->user(), $request->validated());

        return response()->json([
            'message' => 'Anúncio criado com sucesso! Ele ficará pendente até a aprovação da moderação.',
            'ad' => new AdResource($ad),
        ], 201);
    }

    public function update(UpdateAdRequest $request, Ad $ad): JsonResponse
    {
        $this->authorizeOwner($request, $ad);

        $ad = $this->adService->update($ad, $request->validated());

        return response()->json([
            'message' => 'Anúncio atualizado com sucesso.',
            'ad' => new AdResource($ad),
        ]);
    }

    public function destroy(Request $request, Ad $ad): JsonResponse
    {
        $this->authorizeOwner($request, $ad);

        $ad->delete();

        return response()->json([
            'message' => 'Anúncio removido com sucesso.',
        ]);
    }

    public function adminStore(AdminStoreAdRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = User::findOrFail($validated['user_id']);
        unset($validated['user_id']);

        $ad = $this->adService->createForUser($user, $validated);

        return response()->json([
            'message' => 'Anúncio criado com sucesso.',
            'ad' => new AdResource($ad),
        ], 201);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $ads = $this->adService->adminList($request);

        return AdResource::collection($ads)->response();
    }

    public function approve(Ad $ad): JsonResponse
    {
        $ad = $this->adService->approve($ad);

        return response()->json([
            'message' => 'Anúncio aprovado com sucesso.',
            'ad' => new AdResource($ad),
        ]);
    }

    public function reject(Ad $ad): JsonResponse
    {
        $ad = $this->adService->reject($ad);

        return response()->json([
            'message' => 'Anúncio rejeitado.',
            'ad' => new AdResource($ad),
        ]);
    }

    public function adminUpdate(UpdateAdRequest $request, Ad $ad): JsonResponse
    {
        $ad = $this->adService->update($ad, $request->validated());

        return response()->json([
            'message' => 'Anúncio atualizado com sucesso.',
            'ad' => new AdResource($ad),
        ]);
    }

    public function adminDestroy(Ad $ad): JsonResponse
    {
        $ad->delete();

        return response()->json([
            'message' => 'Anúncio removido da plataforma.',
        ]);
    }

    private function authorizeOwner(Request $request, Ad $ad): void
    {
        abort_unless(
            $ad->user_id === $request->user()->id,
            403,
            'Você só pode gerenciar os seus próprios anúncios.'
        );
    }
}
