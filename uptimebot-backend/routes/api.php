<?php

use Illuminate\Support\Facades\Route;

// Auth
use App\Http\Controllers\AuthController;

// Admin controllers
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\MonitorController as AdminMonitorController;
use App\Http\Controllers\Api\Admin\IncidentController as AdminIncidentController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;

// User controllers
use App\Http\Controllers\Api\User\MonitorController as UserMonitorController;
use App\Http\Controllers\Api\User\IncidentController as UserIncidentController;

// Dashboard & Stats controllers
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/login',      [AuthController::class, 'login']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'me']);

    // Shared: categories
    Route::get('/categories', [AdminCategoryController::class, 'index']);

    // User routes
    Route::prefix('user')->group(function () {
        Route::get('/monitors',    [UserMonitorController::class, 'index']);
        Route::post('/monitors',   [UserMonitorController::class, 'store']);
        Route::delete('/monitors/{monitor}', [UserMonitorController::class, 'destroy']);

        Route::get('/incidents', [UserIncidentController::class, 'index']);

        Route::get('/dashboard',           [UserController::class, 'dashboard']);
        Route::get('/monitor-stats',       [UserController::class, 'getMonitorStats']);
        Route::get('/incident-stats',      [UserController::class, 'getIncidentStats']);
        Route::get('/incidents-by-cause',  [UserController::class, 'getIncidentsByCause']);
        Route::get('/export-incidents-pdf',[UserController::class, 'exportIncidentsPdf']);
    });
});

// Admin routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

    // Dashboard & Charts
    Route::get('/dashboard',     [AdminController::class, 'dashboard']);
    Route::get('/monitor-stats', [AdminController::class, 'getMonitorStats']);
    Route::get('/incident-stats',[AdminController::class, 'getIncidentStats']);

    // Users management
    Route::get('/users',                         [AdminUserController::class, 'index']);
    Route::post('/users',                        [AdminUserController::class, 'store']);
    Route::delete('/users/{user}',               [AdminUserController::class, 'destroy']);
    Route::patch('/users/{user}/status',         [AdminUserController::class, 'updateStatus']);
    Route::post('/users/resend-otp',             [AdminUserController::class, 'resendOtp']);

    // ─── NEW: Permissions ──────────────────────────────────────────────────────
    Route::patch('/users/{user}/permissions',    [AdminController::class, 'updatePermissions']);

    // Monitors management
    Route::get('/monitors',                  [AdminMonitorController::class, 'index']);
    Route::post('/monitors',                 [AdminMonitorController::class, 'store']);
    Route::put('/monitors/{monitor}',        [AdminMonitorController::class, 'update']);
    Route::delete('/monitors/{monitor}',     [AdminMonitorController::class, 'destroy']);
    Route::post('/monitors/{monitor}/toggle',[AdminMonitorController::class, 'toggle']);
    Route::get('/monitors/users',            [AdminMonitorController::class, 'getUsers']);

    // Categories management
    Route::get('/categories',              [AdminCategoryController::class, 'index']);
    Route::post('/categories',             [AdminCategoryController::class, 'store']);
    Route::delete('/categories/{category}',[AdminCategoryController::class, 'destroy']);

    // Incidents
    Route::get('/incidents',                          [AdminIncidentController::class, 'index']);
    Route::get('/incidents/stats',                    [AdminIncidentController::class, 'stats']);
    Route::patch('/incidents/{incident}/root-cause',  [AdminIncidentController::class, 'updateRootCause']);

    // Dashboard Charts & Export
    Route::get('/incidents-by-cause',   [AdminController::class, 'getIncidentsByCause']);
    Route::get('/incidents-by-user',    [AdminController::class, 'getIncidentsByUser']);
    Route::get('/export-incidents-pdf', [AdminController::class, 'exportIncidentsPdf']);
});