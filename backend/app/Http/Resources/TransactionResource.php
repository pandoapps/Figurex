<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ad_id' => $this->ad_id,
            'item_name' => $this->item_name,
            'item_image_url' => $this->item_image_path
                ? asset('storage/'.$this->item_image_path)
                : null,
            'value' => (float) $this->value,
            'shipping_cost' => (float) $this->shipping_cost,
            'destination_cep' => $this->destination_cep,
            'shipping_service' => $this->shipping_service,
            'total' => (float) $this->value + (float) $this->shipping_cost,
            'payment_status' => $this->payment_status,
            'shipping_status' => $this->shipping_status,
            'status_label' => $this->statusLabel(),
            'evidence_image_url' => $this->evidence_image
                ? asset('storage/'.$this->evidence_image)
                : null,
            'tracking_code' => $this->tracking_code,
            'asaas_payment_id' => $this->asaas_payment_id,
            'pix_qrcode' => $this->pix_qrcode,
            'pix_payload' => $this->pix_payload,
            'pix_expiration_date' => $this->pix_expiration_date?->toIso8601String(),
            'buyer' => [
                'id' => $this->buyer_id,
                'name' => $this->whenLoaded('buyer', fn () => $this->buyer->name),
            ],
            'seller' => [
                'id' => $this->seller_id,
                'name' => $this->whenLoaded('seller', fn () => $this->seller->name),
            ],
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }

    private function statusLabel(): string
    {
        if ($this->payment_status === 'pendente') {
            return 'Pendente';
        }

        return match ($this->shipping_status) {
            'aguardando_envio' => 'Pago',
            'enviado' => 'Enviado',
            'entregue' => 'Entregue',
            default => 'Pago',
        };
    }
}
