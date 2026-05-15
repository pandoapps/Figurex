<?php

use App\Http\Controllers\Api\AdController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EvolutionController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\ShippingController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\StickerDefinitionController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rotas públicas
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/stats', StatsController::class);
Route::get('/ads', [AdController::class, 'index']);
Route::get('/ads/{ad}', [AdController::class, 'show']);
Route::get('/teams', [TeamController::class, 'index']);
Route::post('/webhooks/asaas', [WebhookController::class, 'asaas']);

/*
|--------------------------------------------------------------------------
| Rotas autenticadas (participante ou administrador)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::get('/dashboard', [DashboardController::class, 'participant']);

    Route::get('/my-ads', [AdController::class, 'mine']);
    Route::post('/ads', [AdController::class, 'store']);
    Route::put('/ads/{ad}', [AdController::class, 'update']);
    Route::delete('/ads/{ad}', [AdController::class, 'destroy']);

    Route::post('/shipping/quote', [ShippingController::class, 'quote']);

    Route::get('/purchases', [TransactionController::class, 'purchases']);
    Route::get('/sales', [TransactionController::class, 'sales']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);
    Route::post('/transactions/{transaction}/shipping', [TransactionController::class, 'updateShipping']);
    Route::post('/transactions/{transaction}/cancel', [TransactionController::class, 'cancel']);

    Route::get('/tickets', [TicketController::class, 'index']);
    Route::get('/tickets/{ticket}', [TicketController::class, 'show']);
    Route::post('/tickets/{ticket}/messages', [TicketController::class, 'storeMessage']);

    Route::get('/sticker-definitions', [StickerDefinitionController::class, 'index']);

    /*
    |----------------------------------------------------------------------
    | Rotas administrativas
    |----------------------------------------------------------------------
    */
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'admin']);

        Route::get('/users', [UserController::class, 'index']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::patch('/users/{user}/toggle-status', [UserController::class, 'toggleStatus']);

        Route::get('/ads', [AdController::class, 'adminIndex']);
        Route::post('/ads', [AdController::class, 'adminStore']);
        Route::put('/ads/{ad}', [AdController::class, 'adminUpdate']);
        Route::patch('/ads/{ad}/approve', [AdController::class, 'approve']);
        Route::patch('/ads/{ad}/reject', [AdController::class, 'reject']);
        Route::delete('/ads/{ad}', [AdController::class, 'adminDestroy']);

        Route::post('/teams', [TeamController::class, 'store']);
        Route::put('/teams/{team}', [TeamController::class, 'update']);
        Route::delete('/teams/{team}', [TeamController::class, 'destroy']);

        Route::post('/sticker-definitions', [StickerDefinitionController::class, 'store']);
        Route::put('/sticker-definitions/{stickerDefinition}', [StickerDefinitionController::class, 'update']);
        Route::delete('/sticker-definitions/{stickerDefinition}', [StickerDefinitionController::class, 'destroy']);

        Route::get('/transactions', [TransactionController::class, 'adminIndex']);
        Route::delete('/transactions/{transaction}', [TransactionController::class, 'adminDestroy']);

        Route::get('/settings/{group}', [SettingController::class, 'show']);
        Route::put('/settings/{group}', [SettingController::class, 'update']);

        Route::get('/whatsapp/status', [EvolutionController::class, 'connectionStatus']);
        Route::get('/whatsapp/{user}/messages', [EvolutionController::class, 'getMessages']);
        Route::post('/whatsapp/{user}/send', [EvolutionController::class, 'sendMessage']);
    });
});
