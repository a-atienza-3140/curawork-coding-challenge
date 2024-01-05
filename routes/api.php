<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FriendsController;
use App\Http\Controllers\Api\PendingFriendsController;
use App\Http\Controllers\Api\SentRequestFriendsController;
use App\Http\Controllers\Api\UsersController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/friends', [FriendsController::class, 'index']);
    Route::delete('/friends/remove', [FriendsController::class, 'destroy']);

    Route::get('/pending-friends', [PendingFriendsController::class, 'index']);
    Route::post('/pending-friends', [PendingFriendsController::class, 'store']);
    Route::post('/accept-friend', [PendingFriendsController::class, 'update']);

    Route::get('/sent-requests', [SentRequestFriendsController::class, 'index']);

    Route::get('/suggestions', [UsersController::class, 'index']);
});
