<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RsbsaController;
use App\Http\Controllers\BeneficiaryDetailsController; // Added this import

// Add these new RSBSA controllers
use App\Http\Controllers\RSBSAEnrollmentController;
use App\Http\Controllers\FarmProfileController;
use App\Http\Controllers\FarmParcelController;
use App\Http\Controllers\LivelihoodDetailsController;
use App\Http\Controllers\ReferenceDataController;
use App\Http\Controllers\RSBSAFormController;

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
    Route::get('/beneficiary-details/user/{userId}', [BeneficiaryDetailsController::class, 'getByUserId']); // ✅ ADD THIS MISSING ROUTE
    Route::post('/beneficiary-details', [BeneficiaryDetailsController::class, 'store']);
    Route::put('/beneficiary-details/{userId}', [BeneficiaryDetailsController::class, 'update']);
    Route::get('/beneficiary-details/{userId}/verification-status', [BeneficiaryDetailsController::class, 'getVerificationStatus']);

    // -------------------- RSBSA System Routes --------------------
    Route::prefix('rsbsa')->group(function () {
        
        // RSBSA Enrollments
        Route::prefix('enrollments')->group(function () {
            Route::get('/', [RSBSAEnrollmentController::class, 'index']);
            Route::post('/', [RSBSAEnrollmentController::class, 'store']);
            Route::get('/{id}', [RSBSAEnrollmentController::class, 'show']);
            Route::put('/{id}', [RSBSAEnrollmentController::class, 'update']);
            Route::delete('/{id}', [RSBSAEnrollmentController::class, 'destroy']);
            
            // Enrollment Actions
            Route::put('/{id}/submit', [RSBSAEnrollmentController::class, 'submit']);
            Route::put('/{id}/approve', [RSBSAEnrollmentController::class, 'approve']);
            Route::put('/{id}/reject', [RSBSAEnrollmentController::class, 'reject']);
            Route::get('/{id}/status', [RSBSAEnrollmentController::class, 'getStatus']);
            
            // Enrollment Queries
            Route::get('/user/{userId}', [RSBSAEnrollmentController::class, 'getByUserId']);
            Route::get('/beneficiary/{beneficiaryId}', [RSBSAEnrollmentController::class, 'getByBeneficiaryId']);
            Route::get('/statistics/overview', [RSBSAEnrollmentController::class, 'getStatistics']);
        });

        // Farm Profiles
        Route::prefix('farm-profiles')->group(function () {
            Route::get('/', [FarmProfileController::class, 'index']);
            Route::post('/', [FarmProfileController::class, 'store']);
            Route::get('/{id}', [FarmProfileController::class, 'show']);
            Route::put('/{id}', [FarmProfileController::class, 'update']);
            Route::delete('/{id}', [FarmProfileController::class, 'destroy']);
            
            // Farm Profile Queries
            Route::get('/beneficiary/{beneficiaryId}', [FarmProfileController::class, 'getByBeneficiaryId']);
            Route::get('/category/{categoryId}', [FarmProfileController::class, 'getByLivelihoodCategory']);
        });

        // Farm Parcels
        Route::prefix('farm-parcels')->group(function () {
            Route::get('/', [FarmParcelController::class, 'index']);
            Route::post('/', [FarmParcelController::class, 'store']);
            Route::post('/bulk', [FarmParcelController::class, 'storeBulk']);
            Route::get('/{id}', [FarmParcelController::class, 'show']);
            Route::put('/{id}', [FarmParcelController::class, 'update']);
            Route::delete('/{id}', [FarmParcelController::class, 'destroy']);
            
            // Farm Parcel Queries
            Route::get('/farm-profile/{farmProfileId}', [FarmParcelController::class, 'getByFarmProfile']);
            Route::get('/barangay/{barangay}', [FarmParcelController::class, 'getByBarangay']);
            Route::get('/tenure-type/{tenureType}', [FarmParcelController::class, 'getByTenureType']);
        });

        // Livelihood Details
        Route::prefix('farmer-details')->group(function () {
            Route::get('/', [LivelihoodDetailsController::class, 'indexFarmer']);
            Route::post('/', [LivelihoodDetailsController::class, 'storeFarmer']);
            Route::get('/{id}', [LivelihoodDetailsController::class, 'showFarmer']);
            Route::put('/{id}', [LivelihoodDetailsController::class, 'updateFarmer']);
            Route::delete('/{id}', [LivelihoodDetailsController::class, 'destroyFarmer']);
        });

        Route::prefix('fisherfolk-details')->group(function () {
            Route::get('/', [LivelihoodDetailsController::class, 'indexFisherfolk']);
            Route::post('/', [LivelihoodDetailsController::class, 'storeFisherfolk']);
            Route::get('/{id}', [LivelihoodDetailsController::class, 'showFisherfolk']);
            Route::put('/{id}', [LivelihoodDetailsController::class, 'updateFisherfolk']);
            Route::delete('/{id}', [LivelihoodDetailsController::class, 'destroyFisherfolk']);
        });

        Route::prefix('farmworker-details')->group(function () {
            Route::get('/', [LivelihoodDetailsController::class, 'indexFarmworker']);
            Route::post('/', [LivelihoodDetailsController::class, 'storeFarmworker']);
            Route::get('/{id}', [LivelihoodDetailsController::class, 'showFarmworker']);
            Route::put('/{id}', [LivelihoodDetailsController::class, 'updateFarmworker']);
            Route::delete('/{id}', [LivelihoodDetailsController::class, 'destroyFarmworker']);
        });

        Route::prefix('agri-youth-details')->group(function () {
            Route::get('/', [LivelihoodDetailsController::class, 'indexAgriYouth']);
            Route::post('/', [LivelihoodDetailsController::class, 'storeAgriYouth']);
            Route::get('/{id}', [LivelihoodDetailsController::class, 'showAgriYouth']);
            Route::put('/{id}', [LivelihoodDetailsController::class, 'updateAgriYouth']);
            Route::delete('/{id}', [LivelihoodDetailsController::class, 'destroyAgriYouth']);
        });

        // Reference Data
        Route::prefix('reference-data')->group(function () {
            Route::get('/livelihood-categories', [ReferenceDataController::class, 'getLivelihoodCategories']);
            Route::get('/commodities', [ReferenceDataController::class, 'getCommodities']);
            Route::get('/regions', [ReferenceDataController::class, 'getRegions']);
            Route::get('/provinces/{regionId?}', [ReferenceDataController::class, 'getProvinces']);
            Route::get('/municipalities/{provinceId?}', [ReferenceDataController::class, 'getMunicipalities']);
            Route::get('/barangays/{municipalityId?}', [ReferenceDataController::class, 'getBarangays']);
        });

        // RSBSA Form Operations
        Route::prefix('form')->group(function () {
            Route::post('/submit-complete', [RSBSAFormController::class, 'submitCompleteForm']);
            Route::post('/save-draft', [RSBSAFormController::class, 'saveDraft']);
            Route::get('/draft/{userId}', [RSBSAFormController::class, 'getDraft']);
            Route::delete('/draft/{userId}', [RSBSAFormController::class, 'deleteDraft']);
        });

        // Admin/Coordinator only RSBSA routes
        Route::middleware(['role:admin,coordinator'])->group(function () {
            Route::get('/enrollments/pending-review', [RSBSAEnrollmentController::class, 'getPendingReview']);
            Route::get('/enrollments/statistics/detailed', [RSBSAEnrollmentController::class, 'getDetailedStatistics']);
            Route::post('/enrollments/{id}/assign-reviewer', [RSBSAEnrollmentController::class, 'assignReviewer']);
        });
    });
});

// Public RSBSA status check
Route::get('rsbsa/status/{reference_code}', [RsbsaController::class, 'getByReferenceCode']);

// Test route for debugging
Route::get('test/beneficiary-details/{userId}', [BeneficiaryDetailsController::class, 'getByUserId']);