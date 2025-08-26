<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('beneficiary_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Personal Information (no duplicate name fields)
            $table->date('birth_date')->nullable();
            $table->string('place_of_birth')->nullable();
            $table->enum('sex', ['male', 'female'])->nullable();
            $table->string('civil_status', 50)->nullable();
            $table->string('name_of_spouse')->nullable();
            $table->string('highest_education', 100)->nullable();
            $table->string('religion', 100)->nullable();
            $table->boolean('is_pwd')->default(false);
            
            // Address Information
            $table->string('barangay');
            $table->string('municipality');
            $table->string('province');
            $table->string('region');
            
            // Contact Information
            $table->string('contact_number', 20);
            $table->string('emergency_contact_number', 20)->nullable();
            
            // Government ID
            $table->enum('has_government_id', ['yes', 'no']);
            $table->string('gov_id_type', 100)->nullable();
            $table->string('gov_id_number', 100)->nullable();
            
            // Association Information
            $table->enum('is_association_member', ['yes', 'no']);
            $table->string('association_name')->nullable();
            
            // Family Information
            $table->string('mothers_maiden_name')->nullable();
            $table->boolean('is_household_head')->default(false);
            $table->string('household_head_name')->nullable();
            
            // Profile Status
            $table->enum('profile_completion_status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->boolean('is_profile_verified')->default(false);
            $table->text('verification_notes')->nullable();
            $table->timestamp('profile_verified_at')->nullable();
            $table->foreignId('profile_verified_by')->nullable()->constrained('users');
            
            // RSBSA Verification
            $table->enum('rsbsa_verification_status', ['not_verified', 'pending', 'verified', 'rejected'])->default('not_verified');
            $table->text('rsbsa_verification_notes')->nullable();
            $table->timestamp('rsbsa_verified_at')->nullable();
            $table->foreignId('rsbsa_verified_by')->nullable()->constrained('users');
            
            // Interview Information
            $table->enum('interview_status', ['not_interviewed', 'scheduled', 'completed', 'cancelled'])->default('not_interviewed');
            $table->timestamp('interviewed_at')->nullable();
            $table->foreignId('interviewed_by')->nullable()->constrained('users');
            $table->text('interview_notes')->nullable();
            
            // Data Source and Tracking
            $table->enum('data_source', ['self_registration', 'admin_created', 'imported', 'interview'])->default('self_registration');
            $table->timestamp('last_updated_by_beneficiary')->nullable();
            $table->json('completion_tracking')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('user_id');
            $table->index('rsbsa_verification_status');
            $table->index('profile_completion_status');
            $table->index('interview_status');
            $table->index('barangay');
            $table->index('municipality');
            $table->index('province');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beneficiary_details');
    }
};