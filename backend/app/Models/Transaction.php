<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ad_id',
        'buyer_id',
        'seller_id',
        'item_name',
        'item_image_path',
        'value',
        'shipping_cost',
        'destination_cep',
        'shipping_service',
        'payment_status',
        'shipping_status',
        'evidence_image',
        'tracking_code',
        'asaas_payment_id',
        'pix_qrcode',
        'pix_payload',
        'pix_expiration_date',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'shipping_cost' => 'decimal:2',
            'pix_expiration_date' => 'datetime',
        ];
    }

    public function ad(): BelongsTo
    {
        return $this->belongsTo(Ad::class);
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }
}
