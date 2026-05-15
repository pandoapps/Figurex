<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionShippingRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Ad;
use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function __construct(private readonly TransactionService $transactionService)
    {
    }

    public function purchases(Request $request): JsonResponse
    {
        $transactions = $request->user()
            ->purchases()
            ->with(['buyer', 'seller'])
            ->latest()
            ->get();

        return TransactionResource::collection($transactions)->response();
    }

    public function sales(Request $request): JsonResponse
    {
        $transactions = $request->user()
            ->sales()
            ->with(['buyer', 'seller'])
            ->latest()
            ->get();

        return TransactionResource::collection($transactions)->response();
    }

    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $ad = Ad::findOrFail($validated['ad_id']);

        $transaction = $this->transactionService->checkout(
            $request->user(),
            $ad,
            $validated['destination_cep'],
            $validated['shipping_service'],
        );

        return response()->json([
            'message' => 'Cobrança PIX gerada. Aguardando pagamento.',
            'transaction' => new TransactionResource($transaction),
        ], 201);
    }

    public function show(Request $request, Transaction $transaction): TransactionResource
    {
        $user = $request->user();

        abort_unless(
            $user->isAdmin()
                || $transaction->buyer_id === $user->id
                || $transaction->seller_id === $user->id,
            403,
            'Você não tem acesso a esta transação.'
        );

        return new TransactionResource($transaction->load(['buyer', 'seller']));
    }

    public function cancel(Request $request, Transaction $transaction): JsonResponse
    {
        abort_unless(
            $transaction->buyer_id === $request->user()->id,
            403,
            'Apenas o comprador pode cancelar esta transação.'
        );

        $this->transactionService->cancelCheckout($transaction);

        return response()->json(['message' => 'Transação cancelada. A figurinha voltou ao mercado.']);
    }

    public function updateShipping(UpdateTransactionShippingRequest $request, Transaction $transaction): JsonResponse
    {
        abort_unless(
            $transaction->seller_id === $request->user()->id,
            403,
            'Apenas o vendedor pode registrar a evidência de envio.'
        );

        $transaction = $this->transactionService->registerShipping(
            $transaction,
            $request->file('evidence_image'),
            $request->validated('tracking_code'),
        );

        return response()->json([
            'message' => 'Evidência de envio registrada com sucesso.',
            'transaction' => new TransactionResource($transaction),
        ]);
    }

    public function adminDestroy(Transaction $transaction): JsonResponse
    {
        $transaction->delete();

        return response()->json([
            'message' => 'Transação removida com sucesso.',
        ]);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $query = Transaction::query()->with(['buyer', 'seller'])->latest();

        if ($from = $request->date('from')) {
            $query->where('created_at', '>=', $from->startOfDay());
        }

        if ($to = $request->date('to')) {
            $query->where('created_at', '<=', $to->endOfDay());
        }

        if ($status = $request->string('payment_status')->trim()->value()) {
            $query->where('payment_status', $status);
        }

        return TransactionResource::collection(
            $query->paginate((int) $request->input('per_page', 25))
        )->response();
    }
}
