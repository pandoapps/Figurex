<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Ticket::with(['buyer', 'seller'])->latest();

        if (! $user->isAdmin()) {
            $query->where(function ($builder) use ($user) {
                $builder->where('buyer_id', $user->id)
                    ->orWhere('seller_id', $user->id);
            });
        }

        return TicketResource::collection($query->get())->response();
    }

    public function show(Request $request, Ticket $ticket): TicketResource
    {
        $this->authorizeParticipant($request, $ticket);

        return new TicketResource(
            $ticket->load(['buyer', 'seller', 'messages'])
        );
    }

    public function storeMessage(StoreMessageRequest $request, Ticket $ticket): JsonResponse
    {
        $this->authorizeParticipant($request, $ticket);

        $user = $request->user();
        $role = match (true) {
            $user->isAdmin() => 'moderator',
            $ticket->seller_id === $user->id => 'seller',
            default => 'buyer',
        };

        $message = $ticket->messages()->create([
            'user_id' => $user->id,
            'sender_name' => $user->isAdmin() ? 'Sistema de Moderação' : $user->name,
            'role' => $role,
            'body' => $request->validated('body'),
        ]);

        return response()->json([
            'message' => 'Mensagem enviada ao chamado.',
            'ticket_message' => new MessageResource($message),
        ], 201);
    }

    private function authorizeParticipant(Request $request, Ticket $ticket): void
    {
        $user = $request->user();

        abort_unless(
            $user->isAdmin()
                || $ticket->buyer_id === $user->id
                || $ticket->seller_id === $user->id,
            403,
            'Você não tem acesso a este chamado.'
        );
    }
}
