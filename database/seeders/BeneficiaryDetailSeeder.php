<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\BeneficiaryDetail;
use App\Models\User;

class BeneficiaryDetailSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing users
        $users = User::where('role', 'beneficiary')->take(5)->get();
        
        if ($users->isEmpty()) {
            $this->command->info('No beneficiary users found. Creating sample data...');
            return;
        }

        foreach ($users as $user) {
            // Check if beneficiary details already exist
            if (!BeneficiaryDetail::where('user_id', $user->id)->exists()) {
                BeneficiaryDetail::create([
                    'user_id' => $user->id,
                    'birth_date' => '1990-01-01',
                    'place_of_birth' => 'Opol, Misamis Oriental',
                    'sex' => 'male',
                    'civil_status' => 'single',
                    'barangay' => 'Sample Barangay',
                    'municipality' => 'Opol',
                    'province' => 'Misamis Oriental',
                    'region' => 'Region X (Northern Mindanao)',
                    'contact_number' => '09123456789',
                    'emergency_contact_number' => '09987654321',
                    'has_government_id' => 'yes',
                    'gov_id_type' => 'UMID',
                    'gov_id_number' => '1234567890',
                    'is_association_member' => 'no',
                    'is_household_head' => true,
                    'profile_completion_status' => 'pending',
                    'rsbsa_verification_status' => 'not_verified',
                    'interview_status' => 'not_interviewed',
                    'data_source' => 'self_registration'
                ]);
            }
        }

        $this->command->info('Beneficiary details seeded successfully!');
    }
}