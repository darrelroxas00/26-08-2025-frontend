<?php

namespace App\Http\Controllers;

use App\Models\RsbsaEnrollment;
use App\Models\BeneficiaryDetail;
use App\Models\FarmProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class RsbsaController extends Controller
{
    /**
     * Display a listing of RSBSA enrollments
     */
    public function index(Request $request)
    {
        $query = RsbsaEnrollment::with(['user', 'interviewedBy']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('rsbsa_verification_status', $request->status);
        }

        // Filter by interview status
        if ($request->has('interview_status')) {
            $query->where('interview_status', $request->interview_status);
        }

        $enrollments = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $enrollments
        ]);
    }

    /**
     * Store a newly created RSBSA enrollment
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'beneficiaryProfile' => 'required|array',
            'farmProfile' => 'required|array',
            'farmParcels' => 'required|array|min:1',
            'livelihoodActivities' => 'required|array|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $userId = Auth::id();

            // Check if user already has an RSBSA enrollment
            $existingEnrollment = RsbsaEnrollment::where('user_id', $userId)->first();
            if ($existingEnrollment) {
                return response()->json([
                    'success' => false,
                    'message' => 'You already have an RSBSA enrollment'
                ], 409);
            }

            // Create RSBSA enrollment
            $enrollment = new RsbsaEnrollment();
            $enrollment->user_id = $userId;
            $enrollment->system_generated_rsbsa_number = $enrollment->generateSystemNumber();
            $enrollment->rsbsa_verification_status = 'not_verified';
            $enrollment->interview_status = 'pending';
            $enrollment->enrollment_date = now();
            $enrollment->data_source = 'self_registration';
            $enrollment->save();

            // Create or update beneficiary details
            $beneficiaryData = $request->beneficiaryProfile;
            BeneficiaryDetail::updateOrCreate(
                ['user_id' => $userId],
                [
                    'fname' => $beneficiaryData['fname'],
                    'mname' => $beneficiaryData['mname'] ?? null,
                    'lname' => $beneficiaryData['lname'],
                    'extension_name' => $beneficiaryData['extension_name'] ?? null,
                    'birth_date' => $beneficiaryData['birth_date'],
                    'place_of_birth' => $beneficiaryData['place_of_birth'],
                    'sex' => strtolower($beneficiaryData['sex']),
                    'civil_status' => $beneficiaryData['civil_status'],
                    'barangay' => $beneficiaryData['barangay'],
                    'municipality' => $beneficiaryData['municipality'],
                    'province' => $beneficiaryData['province'],
                    'region' => $beneficiaryData['region'],
                    'contact_number' => $beneficiaryData['contact_number'],
                    'emergency_contact_number' => $beneficiaryData['emergency_contact_number'] ?? null,
                    'mothers_maiden_name' => $beneficiaryData['mothers_maiden_name'],
                    'is_household_head' => $beneficiaryData['is_household_head'],
                    'household_head_name' => $beneficiaryData['household_head_name'] ?? null,
                    'highest_education' => $beneficiaryData['highest_education'],
                    'religion' => $beneficiaryData['religion'] ?? null,
                    'is_pwd' => $beneficiaryData['is_pwd'],
                    'has_government_id' => $beneficiaryData['has_government_id'],
                    'gov_id_type' => $beneficiaryData['gov_id_type'] ?? null,
                    'gov_id_number' => $beneficiaryData['gov_id_number'] ?? null,
                    'is_association_member' => $beneficiaryData['is_association_member'],
                    'association_name' => $beneficiaryData['association_name'] ?? null,
                    'name_of_spouse' => $beneficiaryData['name_of_spouse'] ?? null,
                    'profile_completion_status' => 'completed',
                    'data_source' => 'self_registration'
                ]
            );

            // Create farm profile
            $farmData = $request->farmProfile;
            FarmProfile::updateOrCreate(
                ['user_id' => $userId],
                [
                    'total_farm_area' => $farmData['total_farm_area'],
                    'land_tenure_status' => $farmData['land_tenure_status'],
                    'primary_livelihood' => $farmData['primary_livelihood'] ?? 'farming',
                    'farm_income_source' => json_encode($farmData['farm_income_source']),
                    'annual_farm_income' => $farmData['annual_farm_income'],
                    'farm_workers_count' => $farmData['farm_workers_count'],
                    'farm_equipment' => json_encode($farmData['farm_equipment'] ?? []),
                    'farm_animals' => json_encode($farmData['farm_animals'] ?? []),
                    'farm_structures' => json_encode($farmData['farm_structures'] ?? []),
                    'irrigation_type' => $farmData['irrigation_type'],
                    'farm_insurance' => $farmData['farm_insurance'] ?? 'none',
                    'farm_credit_access' => $farmData['farm_credit_access'] ?? 'none'
                ]
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'RSBSA enrollment submitted successfully',
                'data' => [
                    'reference_code' => $enrollment->system_generated_rsbsa_number,
                    'enrollment_id' => $enrollment->id
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Error creating RSBSA enrollment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified RSBSA enrollment
     */
    public function show($id)
    {
        $enrollment = RsbsaEnrollment::with(['user', 'interviewedBy'])->find($id);

        if (!$enrollment) {
            return response()->json([
                'success' => false,
                'message' => 'RSBSA enrollment not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $enrollment
        ]);
    }

    /**
     * Update the specified RSBSA enrollment
     */
    public function update(Request $request, $id)
    {
        $enrollment = RsbsaEnrollment::find($id);

        if (!$enrollment) {
            return response()->json([
                'success' => false,
                'message' => 'RSBSA enrollment not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'rsbsa_verification_status' => 'sometimes|in:not_verified,pending,verified,rejected',
            'interview_status' => 'sometimes|in:pending,interviewed,verified',
            'manual_rsbsa_number' => 'sometimes|string|max:255',
            'interview_notes' => 'sometimes|string',
            'rsbsa_verification_notes' => 'sometimes|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Update enrollment
        $enrollment->update($request->only([
            'rsbsa_verification_status',
            'interview_status',
            'manual_rsbsa_number',
            'interview_notes',
            'rsbsa_verification_notes'
        ]));

        // Update interview info if status changed
        if ($request->has('interview_status') && $request->interview_status === 'interviewed') {
            $enrollment->interviewed_at = now();
            $enrollment->interviewed_by = Auth::id();
            $enrollment->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'RSBSA enrollment updated successfully',
            'data' => $enrollment
        ]);
    }

    /**
     * Get user's own RSBSA enrollment
     */
    public function getUserEnrollment()
    {
        $enrollment = RsbsaEnrollment::where('user_id', Auth::id())
            ->with(['user', 'interviewedBy'])
            ->first();

        if (!$enrollment) {
            return response()->json([
                'success' => false,
                'message' => 'No RSBSA enrollment found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $enrollment
        ]);
    }

    /**
     * Get RSBSA enrollment by reference code
     */
    public function getByReferenceCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reference_code' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $enrollment = RsbsaEnrollment::where('system_generated_rsbsa_number', $request->reference_code)
            ->with(['user', 'interviewedBy'])
            ->first();

        if (!$enrollment) {
            return response()->json([
                'success' => false,
                'message' => 'RSBSA enrollment not found with this reference code'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $enrollment
        ]);
    }
}