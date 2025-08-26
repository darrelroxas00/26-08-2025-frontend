<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RsbsaController;
use App\Http\Controllers\BeneficiaryDetailsController; // Added this import

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// RSBSA Routes
Route::middleware(['auth:sanctum'])->group(function () {
    // RSBSA Enrollment Routes
    Route::apiResource('rsbsa', RsbsaController::class);
    
    // Additional RSBSA routes
    Route::get('rsbsa/user/enrollment', [RsbsaController::class, 'getUserEnrollment']);
    Route::post('rsbsa/reference-code', [RsbsaController::class, 'getByReferenceCode']);

    // -------------------- Beneficiary Details routes --------------------
    // Beneficiary profile management
    Route::get('/beneficiary-details/{userId}', [BeneficiaryDetailsController::class, 'show']);
    Route::get('/beneficiary-details/user/{userId}', [BeneficiaryDetailsController::class, 'getByUserId']); // ADDED THIS ROUTE
    Route::post('/beneficiary-details', [BeneficiaryDetailsController::class, 'store']);
    Route::put('/beneficiary-details/{userId}', [BeneficiaryDetailsController::class, 'update']);
    Route::get('/beneficiary-details/{userId}/verification-status', [BeneficiaryDetailsController::class, 'getVerificationStatus']);
});

// Public routes (if any)
Route::get('rsbsa/status/{reference_code}', [RsbsaController::class, 'getByReferenceCode']);