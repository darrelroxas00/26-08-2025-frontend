<?php

namespace App\Http\Controllers;

use App\Models\BeneficiaryDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

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
     * Store a newly created beneficiary detail
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fname' => 'required|string|max:255',
            'lname' => 'required|string|max:255',
            'mname' => 'nullable|string|max:255',
            'extension_name' => 'nullable|string|max:10',
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
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $userId = Auth::id();
            
            // Check if beneficiary details already exist for this user
            $existingBeneficiary = BeneficiaryDetail::where('user_id', $userId)->first();
            if ($existingBeneficiary) {
                return response()->json([
                    'success' => false,
                    'message' => 'Beneficiary details already exist for this user'
                ], 409);
            }

            $beneficiaryData = $request->all();
            $beneficiaryData['user_id'] = $userId;
            $beneficiaryData['profile_completion_status'] = 'pending';

            $beneficiaryDetail = BeneficiaryDetail::create($beneficiaryData);

            return response()->json([
                'success' => true,
                'message' => 'Beneficiary details created successfully',
                'data' => $beneficiaryDetail
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create beneficiary details',
                'error' => $e->getMessage()
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

            return response()->json([
                'success' => true,
                'data' => $beneficiaryDetail
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch beneficiary details',
                'error' => $e->getMessage()
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

            if (!$beneficiaryDetail) {
                return response()->json([
                    'success' => false,
                    'message' => 'Beneficiary details not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $beneficiaryDetail
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch beneficiary details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified beneficiary detail
     */
    public function update(Request $request, $userId)
    {
        $validator = Validator::make($request->all(), [
            'fname' => 'sometimes|required|string|max:255',
            'lname' => 'sometimes|required|string|max:255',
            'mname' => 'nullable|string|max:255',
            'extension_name' => 'nullable|string|max:10',
            'barangay' => 'sometimes|required|string|max:255',
            'municipality' => 'sometimes|required|string|max:255',
            'province' => 'sometimes|required|string|max:255',
            'region' => 'sometimes|required|string|max:255',
            'contact_number' => 'sometimes|required|string|max:20',
            'emergency_contact_number' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'place_of_birth' => 'nullable|string|max:255',
            'sex' => 'nullable|in:male,female',
            'civil_status' => 'nullable|string|max:50',
            'name_of_spouse' => 'nullable|string|max:255',
            'highest_education' => 'nullable|string|max:100',
            'religion' => 'nullable|string|max:100',
            'is_pwd' => 'boolean',
            'has_government_id' => 'sometimes|required|in:yes,no',
            'gov_id_type' => 'nullable|required_if:has_government_id,yes|string|max:100',
            'gov_id_number' => 'nullable|required_if:has_government_id,yes|string|max:100',
            'is_association_member' => 'sometimes|required|in:yes,no',
            'association_name' => 'nullable|required_if:is_association_member,yes|string|max:255',
            'mothers_maiden_name' => 'nullable|string|max:255',
            'is_household_head' => 'boolean',
            'household_head_name' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $beneficiaryDetail = BeneficiaryDetail::where('user_id', $userId)->first();

            if (!$beneficiaryDetail) {
                return response()->json([
                    'success' => false,
                    'message' => 'Beneficiary details not found'
                ], 404);
            }

            // Check if user is updating their own details or is admin/coordinator
            if (Auth::id() != $userId && !Auth::user()->hasRole(['admin', 'coordinator'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to update these beneficiary details'
                ], 403);
            }

            $beneficiaryDetail->update($request->all());
            $beneficiaryDetail->last_updated_by_beneficiary = now();
            $beneficiaryDetail->save();

            return response()->json([
                'success' => true,
                'message' => 'Beneficiary details updated successfully',
                'data' => $beneficiaryDetail
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update beneficiary details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get verification status for a beneficiary
     */
    public function getVerificationStatus($userId)
    {
        try {
            $beneficiaryDetail = BeneficiaryDetail::where('user_id', $userId)
                ->select(['rsbsa_verification_status', 'rsbsa_verification_notes', 'rsbsa_verified_at', 'rsbsa_verified_by'])
                ->first();

            if (!$beneficiaryDetail) {
                return response()->json([
                    'success' => false,
                    'message' => 'Beneficiary details not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $beneficiaryDetail
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch verification status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify a beneficiary (Admin/Coordinator only)
     */
    public function verify(Request $request, $userId)
    {
        $validator = Validator::make($request->all(), [
            'verification_notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $beneficiaryDetail = BeneficiaryDetail::where('user_id', $userId)->first();

            if (!$beneficiaryDetail) {
                return response()->json([
                    'success' => false,
                    'message' => 'Beneficiary details not found'
                ], 404);
            }

            $beneficiaryDetail->update([
                'rsbsa_verification_status' => 'verified',
                'rsbsa_verification_notes' => $request->verification_notes,
                'rsbsa_verified_at' => now(),
                'rsbsa_verified_by' => Auth::id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Beneficiary verified successfully',
                'data' => $beneficiaryDetail
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to verify beneficiary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a beneficiary (Admin/Coordinator only)
     */
    public function reject(Request $request, $userId)
    {
        $validator = Validator::make($request->all(), [
            'verification_notes' => 'required|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $beneficiaryDetail = BeneficiaryDetail::where('user_id', $userId)->first();

            if (!$beneficiaryDetail) {
                return response()->json([
                    'success' => false,
                    'message' => 'Beneficiary details not found'
                ], 404);
            }

            $beneficiaryDetail->update([
                'rsbsa_verification_status' => 'rejected',
                'rsbsa_verification_notes' => $request->verification_notes,
                'rsbsa_verified_at' => now(),
                'rsbsa_verified_by' => Auth::id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Beneficiary rejected successfully',
                'data' => $beneficiaryDetail
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject beneficiary',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}