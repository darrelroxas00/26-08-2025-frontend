<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration fixes the redundancy in rsbsa_enrollments table
     * by removing user_id and farm_profile_id foreign keys.
     * 
     * We only need beneficiary_id because:
     * - beneficiary_id -> beneficiary_details.user_id (gets user)
     * - beneficiary_id -> farm_profiles.beneficiary_id (gets farm profile)
     */
    public function up(): void
    {
        Schema::table('rsbsa_enrollments', function (Blueprint $table) {
            // Step 1: Drop foreign key constraints first
            $table->dropForeign(['user_id']);
            $table->dropForeign(['farm_profile_id']);
            
            // Step 2: Drop the redundant columns
            $table->dropColumn(['user_id', 'farm_profile_id']);
            
            // Step 3: Add index to improve query performance
            $table->index(['beneficiary_id', 'application_status'], 'rsbsa_beneficiary_status_idx');
            $table->index(['beneficiary_id', 'enrollment_year'], 'rsbsa_beneficiary_year_idx');
        });
    }

    /**
     * Reverse the migrations.
     * 
     * This rollback restores the original messy structure
     * (in case you want to go back for some reason)
     */
    public function down(): void
    {
        Schema::table('rsbsa_enrollments', function (Blueprint $table) {
            // Step 1: Add the columns back
            $table->foreignId('user_id')->after('id')->constrained('users')->onDelete('cascade');
            $table->foreignId('farm_profile_id')->after('beneficiary_id')->constrained('farm_profiles')->onDelete('cascade');
            
            // Step 2: Drop the indexes we added
            $table->dropIndex('rsbsa_beneficiary_status_idx');
            $table->dropIndex('rsbsa_beneficiary_year_idx');
        });
    }
};