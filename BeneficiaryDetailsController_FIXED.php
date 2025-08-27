<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BeneficiaryDetail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class BeneficiaryDetailsController extends Controller
{
    /**
     * Display a listing of beneficiaries (Admin/Coordinator only)
     */
    public function index(Request $request)
    {
        $query = BeneficiaryDetail::with(['user']);

        // Filter by verification status
        if ($request->has('verification_status')) {
            $query->where('rsbsa_verification_status', $request->verification_status);
        }

        // Filter by profile completion status
        if ($request->has('profile_completion_status')) {
            $query->where('profile_completion_status', $request->profile_completion_status);
        }

        $beneficiaries = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $beneficiaries
        ]);
    }

    /**
     * Store or Update beneficiary details (UPSERT logic)
     */
    public function store(Request $request)
    {
        // Log the incoming request for debugging
        Log::info('Beneficiary Details Store Request', [
            'request_data' => $request->all(),
            'user_id' => $request->user_id ?? 'not provided',
            'auth_user_id' => Auth::id() ?? 'not authenticated'
        ]);

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
            'barangay' => 'required|string|max:255',
            'municipality' => 'required|string|max:255',
            'province' => 'required|string|max:255',
            'region' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'emergency_contact_number' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'place_of_birth' => 'nullable|string|max:255',
            'sex' => 'nullable|in:male,female',
            'civil_status' => 'nullable|string|max:50',
            'name_of_spouse' => 'nullable|string|max:255',
            'highest_education' => 'nullable|string|max:100',
            'religion' => 'nullable|string|max:100',
            'is_pwd' => 'boolean',
            'has_government_id' => 'required|in:yes,no',
            'gov_id_type' => 'nullable|required_if:has_government_id,yes|string|max:100',
            'gov_id_number' => 'nullable|required_if:has_government_id,yes|string|max:100',
            'is_association_member' => 'required|in:yes,no',
            'association_name' => 'nullable|required_if:is_association_member,yes|string|max:255',
            'mothers_maiden_name' => 'nullable|string|max:255',
            'is_household_head' => 'boolean',
            'household_head_name' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            Log::warning('Beneficiary Details Validation Failed', [
                'errors' => $validator->errors(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $userId = $request->user_id;
            
            // Prepare the data
            $beneficiaryData = $request->except(['user_id']);
            $beneficiaryData['user_id'] = $userId;
            $beneficiaryData['profile_completion_status'] = 'completed';
            $beneficiaryData['last_updated_by_beneficiary'] = now();

            // UPSERT: Update if exists, create if doesn't exist
            $beneficiaryDetail = BeneficiaryDetail::updateOrCreate(
                ['user_id' => $userId],
                $beneficiaryData
            );

            // Load the user relationship for the response
            $beneficiaryDetail->load('user');

            // Add user name data to the response
            $responseData = $beneficiaryDetail->toArray();
            if ($beneficiaryDetail->user) {
                $responseData['fname'] = $beneficiaryDetail->user->fname;
                $responseData['mname'] = $beneficiaryDetail->user->mname;
                $responseData['lname'] = $beneficiaryDetail->user->lname;
                $responseData['extension_name'] = $beneficiaryDetail->user->extension_name;
            }

            Log::info('Beneficiary Details Saved Successfully', [
                'user_id' => $userId,
                'beneficiary_id' => $beneficiaryDetail->id,
                'was_recently_created' => $beneficiaryDetail->wasRecentlyCreated
            ]);

            return response()->json([
                'success' => true,
                'message' => $beneficiaryDetail->wasRecentlyCreated 
                    ? 'Beneficiary details created successfully' 
                    : 'Beneficiary details updated successfully',
                'data' => $responseData
            ], $beneficiaryDetail->wasRecentlyCreated ? 201 : 200);

        } catch (\Exception $e) {
            Log::error('Failed to save beneficiary details', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to save beneficiary details',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Display the specified beneficiary detail
     */
    public function show($userId)
    {
        try {
            $beneficiaryDetail = BeneficiaryDetail::where('user_id', $userId)
                ->with(['user'])
                ->first();

            if (!$beneficiaryDetail) {
                return response()->json([
                    'success' => false,
                    'message' => 'Beneficiary details not found'
                ], 404);
            }

            // Add user name data to the response
            $responseData = $beneficiaryDetail->toArray();
            if ($beneficiaryDetail->user) {
                $responseData['fname'] = $beneficiaryDetail->user->fname;
                $responseData['mname'] = $beneficiaryDetail->user->mname;
                $responseData['lname'] = $beneficiaryDetail->user->lname;
                $responseData['extension_name'] = $beneficiaryDetail->user->extension_name;
            }

            return response()->json([
                'success' => true,
                'data' => $responseData
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch beneficiary details', [
                'error' => $e->getMessage(),
                'user_id' => $userId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch beneficiary details',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get beneficiary details by user ID (specific method for RSBSA form)
     */
    public function getByUserId($userId)
    {
        try {
            $beneficiaryDetail = BeneficiaryDetail::where('user_id', $userId)
                ->with(['user'])
                ->first();

            // If no beneficiary details exist, return user data only
            if (!$beneficiaryDetail) {
                $user = User::find($userId);
                if (!$user) {
                    return response()->json([
                        'success' => false,
                        'message' => 'User not found'
                    ], 404);
                }

                // Return user data with empty beneficiary details
                $responseData = [
                    'id' => null,
                    'user_id' => $userId,
                    'fname' => $user->fname,
                    'mname' => $user->mname,
                    'lname' => $user->lname,
                    'extension_name' => $user->extension_name,
                    'birth_date' => null,
                    'place_of_birth' => null,
                    'sex' => null,
                    'civil_status' => null,
                    'barangay' => '',
                    'municipality' => 'Opol',
                    'province' => 'Misamis Oriental',
                    'region' => 'Region X (Northern Mindanao)',
                    'contact_number' => '',
                    'emergency_contact_number' => null,
                    'has_government_id' => 'no',
                    'gov_id_type' => null,
                    'gov_id_number' => null,
                    'is_association_member' => 'no',
                    'association_name' => null,
                    'mothers_maiden_name' => null,
                    'is_household_head' => false,
                    'household_head_name' => null,
                    'highest_education' => null,
                    'religion' => null,
                    'is_pwd' => false,
                    'name_of_spouse' => null,
                    'profile_completion_status' => 'pending',
                    'rsbsa_verification_status' => 'not_verified',
                    'data_source' => 'self_registration',
                    'created_at' => null,
                    'updated_at' => null
                ];

                return response()->json([
                    'success' => true,
                    'data' => $responseData,
                    'message' => 'No beneficiary details found, returning user data only'
                ]);
            }

            // Add user name data to the response
            $responseData = $beneficiaryDetail->toArray();
            if ($beneficiaryDetail->user) {
                $responseData['fname'] = $beneficiaryDetail->user->fname;
                $responseData['mname'] = $beneficiaryDetail->user->mname;
                $responseData['lname'] = $beneficiaryDetail->user->lname;
                $responseData['extension_name'] = $beneficiaryDetail->user->extension_name;
            }

            return response()->json([
                'success' => true,
                'data' => $responseData
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch beneficiary details by user ID', [
                'error' => $e->getMessage(),
                'user_id' => $userId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch beneficiary details',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    // ... (rest of the methods remain the same)
    // I'm keeping the other methods as they were since they're working fine
}