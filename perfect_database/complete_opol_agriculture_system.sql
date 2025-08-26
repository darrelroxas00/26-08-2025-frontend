-- =====================================================
-- PERFECT DATABASE STRUCTURE FOR OPOL MUNICIPAL AGRICULTURE OFFICE
-- WEB-BASED SYSTEM FOR AGRICULTURAL INVENTORY CONTROL, 
-- SUBSIDY DISBURSEMENT AND FARMER BENEFICIARY TRACKING
-- =====================================================

-- 1. USERS (Authentication & Basic Info)
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fname VARCHAR(100) NOT NULL,
    mname VARCHAR(100) NULL,
    lname VARCHAR(100) NOT NULL,
    extension_name VARCHAR(20) NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NULL,
    phone_number VARCHAR(20) NULL,
    role ENUM('admin', 'coordinator', 'beneficiary') DEFAULT 'beneficiary',
    status ENUM('active', 'inactive') DEFAULT 'active',
    
    -- Coordinator Assignment (for coordinators only)
    primary_sector_id BIGINT UNSIGNED NULL,
    
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_role (role),
    INDEX idx_status (status),
    INDEX idx_username (username)
);

-- 2. SECTORS (Rice, Corn, Livestock, etc.)
CREATE TABLE sectors (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sector_name VARCHAR(100) NOT NULL,
    sector_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_sector_code (sector_code)
);

-- 3. COORDINATOR SECTOR ASSIGNMENTS (Multi-sector coordinators)
CREATE TABLE coordinator_sectors (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    coordinator_id BIGINT UNSIGNED NOT NULL,
    sector_id BIGINT UNSIGNED NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT UNSIGNED NULL,
    
    FOREIGN KEY (coordinator_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_coordinator_sector (coordinator_id, sector_id),
    INDEX idx_coordinator (coordinator_id),
    INDEX idx_sector (sector_id),
    INDEX idx_primary (is_primary)
);

-- 4. COMMODITY CATEGORIES 
CREATE TABLE commodity_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    sector_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE CASCADE,
    INDEX idx_sector (sector_id)
);

-- 5. COMMODITIES
CREATE TABLE commodities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    commodity_name VARCHAR(100) NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    sector_id BIGINT UNSIGNED NOT NULL,
    commodity_code VARCHAR(20) UNIQUE NULL,
    scientific_name VARCHAR(150) NULL,
    description TEXT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES commodity_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE CASCADE,
    
    INDEX idx_category (category_id),
    INDEX idx_sector (sector_id),
    INDEX idx_status (status)
);

-- 6. LIVELIHOOD CATEGORIES
CREATE TABLE livelihood_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    sector_id BIGINT UNSIGNED NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE CASCADE,
    INDEX idx_sector (sector_id)
);

-- 7. BENEFICIARY DETAILS (Main RSBSA Registration)
CREATE TABLE beneficiary_details (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- RSBSA Information
    rsbsa_control_number VARCHAR(50) UNIQUE NULL,
    previous_rsbsa_number VARCHAR(50) NULL,
    
    -- Basic Information
    sex ENUM('male', 'female') NOT NULL,
    birth_date DATE NOT NULL,
    place_of_birth VARCHAR(255) NULL,
    civil_status ENUM('single', 'married', 'widowed', 'separated', 'divorced') NOT NULL,
    religion VARCHAR(100) NULL,
    
    -- Contact Information
    contact_number VARCHAR(20) NOT NULL,
    emergency_contact_number VARCHAR(20) NULL,
    
    -- Address
    house_lot_number VARCHAR(100) NULL,
    street_sitio_subdivision VARCHAR(255) NULL,
    barangay VARCHAR(100) NOT NULL,
    municipality VARCHAR(100) DEFAULT 'Opol' NOT NULL,
    province VARCHAR(100) DEFAULT 'Misamis Oriental' NOT NULL,
    region VARCHAR(100) DEFAULT 'Region X (Northern Mindanao)' NOT NULL,
    
    -- Additional Information
    mothers_maiden_name VARCHAR(255) NULL,
    highest_education ENUM('None', 'Elementary', 'High School', 'Vocational', 'College', 'Post Graduate') NULL,
    is_pwd BOOLEAN DEFAULT false,
    has_government_id ENUM('yes', 'no') DEFAULT 'no',
    gov_id_type VARCHAR(100) NULL,
    gov_id_number VARCHAR(100) NULL,
    is_association_member ENUM('yes', 'no') DEFAULT 'no',
    association_name VARCHAR(200) NULL,
    is_household_head BOOLEAN DEFAULT false,
    household_head_name VARCHAR(150) NULL,
    
    -- Status Tracking
    profile_completion_status ENUM('pending', 'completed', 'verified', 'needs_update') DEFAULT 'pending',
    is_profile_verified BOOLEAN DEFAULT false,
    verification_notes TEXT NULL,
    profile_verified_at TIMESTAMP NULL,
    profile_verified_by BIGINT UNSIGNED NULL,
    
    -- RSBSA Verification (separate from profile)
    rsbsa_verification_status ENUM('not_verified', 'pending', 'verified', 'rejected') DEFAULT 'not_verified',
    rsbsa_verification_notes TEXT NULL,
    rsbsa_verified_at TIMESTAMP NULL,
    rsbsa_verified_by BIGINT UNSIGNED NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (profile_verified_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (rsbsa_verified_by) REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_user (user_id),
    UNIQUE KEY unique_rsbsa_control (rsbsa_control_number),
    INDEX idx_rsbsa_status (rsbsa_verification_status),
    INDEX idx_profile_status (profile_completion_status),
    INDEX idx_barangay (barangay),
    INDEX idx_verified (is_profile_verified)
);

-- 8. FARM PROFILES (Multi-sector farms)
CREATE TABLE farm_profiles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    beneficiary_id BIGINT UNSIGNED NOT NULL,
    livelihood_category_id BIGINT UNSIGNED NOT NULL,
    sector_id BIGINT UNSIGNED NOT NULL,
    
    -- Farm Summary
    total_farm_area DECIMAL(10,4) DEFAULT 0,
    years_farming_experience INT UNSIGNED NULL,
    
    -- Priority for multi-sector farmers
    priority_level ENUM('primary', 'secondary', 'tertiary') DEFAULT 'primary',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiary_details(id) ON DELETE CASCADE,
    FOREIGN KEY (livelihood_category_id) REFERENCES livelihood_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE CASCADE,
    
    INDEX idx_beneficiary (beneficiary_id),
    INDEX idx_livelihood (livelihood_category_id),
    INDEX idx_sector (sector_id),
    INDEX idx_priority (priority_level)
);

-- 9. FARM PARCELS (Land details per farm profile)
CREATE TABLE farm_parcels (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    farm_profile_id BIGINT UNSIGNED NOT NULL,
    
    -- Location
    parcel_name VARCHAR(100) NULL,
    barangay VARCHAR(100) NOT NULL,
    municipality VARCHAR(100) DEFAULT 'Opol' NOT NULL,
    province VARCHAR(100) DEFAULT 'Misamis Oriental' NOT NULL,
    
    -- Area and Ownership
    farm_area DECIMAL(8,4) NOT NULL,
    area_unit ENUM('hectares', 'square_meters') DEFAULT 'hectares',
    
    -- Tenure
    tenure_type ENUM('registered_owner', 'tenant', 'lessee', 'others') NOT NULL,
    tenure_others VARCHAR(255) NULL,
    landowner_name VARCHAR(255) NULL,
    ownership_document_number VARCHAR(100) NULL,
    
    -- Classification
    farm_type ENUM('irrigated', 'rainfed_lowland', 'rainfed_upland', 'others') NOT NULL,
    farm_type_others VARCHAR(255) NULL,
    is_ancestral_domain BOOLEAN DEFAULT false,
    is_agrarian_reform_beneficiary BOOLEAN DEFAULT false,
    is_organic_practitioner BOOLEAN DEFAULT false,
    
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (farm_profile_id) REFERENCES farm_profiles(id) ON DELETE CASCADE,
    INDEX idx_farm_profile (farm_profile_id),
    INDEX idx_location (province, municipality, barangay),
    INDEX idx_tenure (tenure_type)
);

-- 10. CROPS PLANTED (What farmers grow)
CREATE TABLE crops_planted (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    farm_parcel_id BIGINT UNSIGNED NOT NULL,
    commodity_id BIGINT UNSIGNED NOT NULL,
    
    -- Planting Details
    variety VARCHAR(100) NULL,
    planting_area DECIMAL(8,4) NOT NULL,
    cropping_season ENUM('dry_season', 'wet_season', 'year_round') NULL,
    
    -- Production
    average_yield_per_season DECIMAL(8,2) NULL,
    yield_unit VARCHAR(50) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (farm_parcel_id) REFERENCES farm_parcels(id) ON DELETE CASCADE,
    FOREIGN KEY (commodity_id) REFERENCES commodities(id) ON DELETE CASCADE,
    
    INDEX idx_parcel (farm_parcel_id),
    INDEX idx_commodity (commodity_id)
);

-- 11. LIVESTOCK AND POULTRY
CREATE TABLE livestock_poultry (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    farm_profile_id BIGINT UNSIGNED NOT NULL,
    commodity_id BIGINT UNSIGNED NOT NULL,
    
    -- Animal Details
    breed VARCHAR(100) NULL,
    number_of_heads INT UNSIGNED NOT NULL,
    purpose ENUM('breeding', 'fattening', 'draft_power', 'egg_production', 'others') NOT NULL,
    purpose_others VARCHAR(255) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (farm_profile_id) REFERENCES farm_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (commodity_id) REFERENCES commodities(id) ON DELETE CASCADE,
    
    INDEX idx_farm_profile (farm_profile_id),
    INDEX idx_commodity (commodity_id)
);

-- 12. BENEFICIARY SECTOR ASSIGNMENTS (SOLUTION FOR MULTI-COMMODITY)
CREATE TABLE beneficiary_sectors (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    beneficiary_id BIGINT UNSIGNED NOT NULL,
    sector_id BIGINT UNSIGNED NOT NULL,
    assigned_coordinator_id BIGINT UNSIGNED NULL,
    
    -- Priority for multi-sector farmers
    is_primary_sector BOOLEAN DEFAULT false,
    assignment_reason ENUM('farm_profile', 'manual_assignment', 'program_specific') DEFAULT 'farm_profile',
    
    -- Status
    status ENUM('active', 'inactive') DEFAULT 'active',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT UNSIGNED NULL,
    
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiary_details(id) ON DELETE CASCADE,
    FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_coordinator_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_beneficiary_sector (beneficiary_id, sector_id),
    INDEX idx_beneficiary (beneficiary_id),
    INDEX idx_sector (sector_id),
    INDEX idx_coordinator (assigned_coordinator_id),
    INDEX idx_primary (is_primary_sector)
);

-- 13. RSBSA ENROLLMENTS (Simplified - only beneficiary_id needed)
CREATE TABLE rsbsa_enrollments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    beneficiary_id BIGINT UNSIGNED NOT NULL,
    
    -- Application Info
    application_reference_code VARCHAR(50) UNIQUE NOT NULL,
    enrollment_year YEAR NOT NULL,
    enrollment_type ENUM('new', 'renewal', 'update') DEFAULT 'new',
    
    -- Status Workflow
    application_status ENUM('draft', 'submitted', 'reviewing', 'interview_scheduled', 'approved', 'rejected', 'cancelled') DEFAULT 'draft',
    
    -- Interview and Verification
    interview_scheduled_at TIMESTAMP NULL,
    interview_conducted_at TIMESTAMP NULL,
    interview_notes TEXT NULL,
    
    -- Process Tracking
    submitted_at TIMESTAMP NULL,
    approved_at TIMESTAMP NULL,
    rejected_at TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    coordinator_notes TEXT NULL,
    
    -- Assignment
    reviewed_by BIGINT UNSIGNED NULL,
    assigned_rsbsa_number VARCHAR(50) UNIQUE NULL,
    rsbsa_number_assigned_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiary_details(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_beneficiary (beneficiary_id),
    INDEX idx_status (application_status),
    INDEX idx_year (enrollment_year),
    INDEX idx_reference (application_reference_code)
);

-- 14. INVENTORIES (Items for distribution)
CREATE TABLE inventories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(150) NOT NULL,
    item_code VARCHAR(50) UNIQUE NULL,
    sector_id BIGINT UNSIGNED NULL,
    
    -- Classification
    item_type ENUM('seed', 'fertilizer', 'pesticide', 'equipment', 'fuel', 'cash', 'feed', 'medicine', 'others') NOT NULL,
    assistance_category ENUM('physical', 'monetary', 'service') NOT NULL,
    
    -- Stock Management
    unit VARCHAR(50) NOT NULL,
    is_trackable_stock BOOLEAN DEFAULT true,
    unit_value DECIMAL(10, 2) NULL,
    minimum_stock_level DECIMAL(10, 2) DEFAULT 0,
    
    description TEXT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE SET NULL,
    INDEX idx_sector (sector_id),
    INDEX idx_type (item_type),
    INDEX idx_category (assistance_category),
    INDEX idx_status (status)
);

-- 15. SUBSIDY PROGRAMS
CREATE TABLE subsidy_programs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    program_code VARCHAR(50) UNIQUE NOT NULL,
    sector_id BIGINT UNSIGNED NULL,
    
    description TEXT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    
    -- Target
    target_beneficiaries INT UNSIGNED NULL,
    budget_allocation DECIMAL(15, 2) NULL,
    
    -- Status
    status ENUM('planning', 'pending', 'ongoing', 'completed', 'cancelled') DEFAULT 'planning',
    approval_status ENUM('pending', 'approved', 'denied') DEFAULT 'pending',
    
    -- Approval
    approved_by BIGINT UNSIGNED NULL,
    approved_at TIMESTAMP NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_sector (sector_id),
    INDEX idx_status (status),
    INDEX idx_approval (approval_status),
    INDEX idx_dates (start_date, end_date)
);

-- 16. PROGRAM BENEFICIARIES (Who gets what assistance)
CREATE TABLE program_beneficiaries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    subsidy_program_id BIGINT UNSIGNED NOT NULL,
    beneficiary_id BIGINT UNSIGNED NOT NULL,
    sector_id BIGINT UNSIGNED NOT NULL,
    assigned_coordinator_id BIGINT UNSIGNED NULL,
    
    -- Enrollment
    enrollment_date DATE NOT NULL,
    enrolled_by BIGINT UNSIGNED NOT NULL,
    
    -- Status
    status ENUM('enrolled', 'approved', 'prepared', 'distributed', 'cancelled') DEFAULT 'enrolled',
    
    -- Values
    total_assistance_value DECIMAL(12, 2) DEFAULT 0,
    
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (subsidy_program_id) REFERENCES subsidy_programs(id) ON DELETE CASCADE,
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiary_details(id) ON DELETE CASCADE,
    FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_coordinator_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (enrolled_by) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_program_beneficiary_sector (subsidy_program_id, beneficiary_id, sector_id),
    INDEX idx_program (subsidy_program_id),
    INDEX idx_beneficiary (beneficiary_id),
    INDEX idx_sector (sector_id),
    INDEX idx_coordinator (assigned_coordinator_id),
    INDEX idx_status (status)
);

-- 17. PROGRAM BENEFICIARY ITEMS (Specific items distributed)
CREATE TABLE program_beneficiary_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    program_beneficiary_id BIGINT UNSIGNED NOT NULL,
    inventory_id BIGINT UNSIGNED NOT NULL,
    
    -- Quantities
    requested_quantity DECIMAL(10, 2) NOT NULL,
    approved_quantity DECIMAL(10, 2) NULL,
    distributed_quantity DECIMAL(10, 2) DEFAULT 0,
    
    -- Values
    unit_value DECIMAL(10, 2) NULL,
    total_value DECIMAL(12, 2) NULL,
    
    -- Coordinator customization
    coordinator_notes TEXT NULL,
    
    -- Status
    status ENUM('pending', 'approved', 'prepared', 'distributed', 'cancelled') DEFAULT 'pending',
    
    -- Tracking
    approved_by BIGINT UNSIGNED NULL,
    approved_at TIMESTAMP NULL,
    distributed_by BIGINT UNSIGNED NULL,
    distributed_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (program_beneficiary_id) REFERENCES program_beneficiaries(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_id) REFERENCES inventories(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (distributed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_program_beneficiary (program_beneficiary_id),
    INDEX idx_inventory (inventory_id),
    INDEX idx_status (status)
);

-- 18. INVENTORY STOCKS (Stock movements)
CREATE TABLE inventory_stocks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    inventory_id BIGINT UNSIGNED NOT NULL,
    
    -- Movement
    quantity DECIMAL(10, 2) NOT NULL,
    movement_type ENUM('stock_in', 'stock_out', 'adjustment', 'transfer', 'distribution') NOT NULL,
    transaction_type ENUM('purchase', 'donation', 'return', 'distribution', 'damage', 'expired', 'transfer_in', 'transfer_out', 'adjustment', 'initial_stock') NOT NULL,
    
    -- Distribution tracking
    program_beneficiary_item_id BIGINT UNSIGNED NULL,
    
    -- Cost tracking
    unit_cost DECIMAL(10, 2) NULL,
    total_value DECIMAL(12, 2) NULL,
    running_balance DECIMAL(12, 2) DEFAULT 0,
    
    -- Details
    reference VARCHAR(100) NULL,
    source VARCHAR(150) NULL,
    destination VARCHAR(150) NULL,
    batch_number VARCHAR(50) NULL,
    
    -- Dates
    transaction_date DATE NOT NULL,
    date_received DATE NULL,
    expiry_date DATE NULL,
    
    -- Approval
    status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    is_verified BOOLEAN DEFAULT false,
    verified_by BIGINT UNSIGNED NULL,
    approved_at TIMESTAMP NULL,
    
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (inventory_id) REFERENCES inventories(id) ON DELETE CASCADE,
    FOREIGN KEY (program_beneficiary_item_id) REFERENCES program_beneficiary_items(id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_inventory (inventory_id),
    INDEX idx_movement (movement_type),
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_status (status)
);

-- =====================================================
-- ADD FOREIGN KEY CONSTRAINTS (Done last to avoid dependency issues)
-- =====================================================

ALTER TABLE users ADD FOREIGN KEY (primary_sector_id) REFERENCES sectors(id) ON DELETE SET NULL;