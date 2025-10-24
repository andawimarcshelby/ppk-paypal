<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout',        [AuthController::class, 'logout']);
    Route::get('/user',           [AuthController::class, 'me']);

    // 2FA
    Route::post('/2fa/setup',     [AuthController::class, 'twoFaSetup']);
    Route::post('/2fa/verify',    [AuthController::class, 'twoFaVerify']);
    Route::post('/2fa/disable',   [AuthController::class, 'twoFaDisable']);
});
