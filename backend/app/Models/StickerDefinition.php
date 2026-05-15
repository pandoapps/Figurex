<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class StickerDefinition extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'team_id',
        'player_name',
        'image_path',
        'rarity',
    ];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }
}
