-- =====================================================
-- CLEAN RSBSA DATABASE STRUCTURE
-- Based on Official DA RSBSA Enrollment Form
-- =====================================================

-- 1. CORE USER TABLE (Existing - don't change)
-- users: id, first_name, middle_name, last_name, name_extension, email, etc.

-- 2. MAIN BENEFICIARY RECORD
CREATE TABLE beneficiaries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- RSBSA Information
    rsbsa_control_number VARCHAR(50) UNIQUE, -- Auto-generated
    previous_rsbsa_number VARCHAR(50) NULL,  -- If updating existing
    
    -- Basic Information (from official form)
    sex ENUM('male', 'female') NOT NULL,
    birth_date DATE NOT NULL,
    place_of_birth VARCHAR(255),
    civil_status ENUM('single', 'married', 'widowed', 'separated', 'divorced') NOT NULL,
    religion VARCHAR(100),
    
    -- Contact Information
    mobile_number VARCHAR(20) NOT NULL,
    landline_number VARCHAR(20) NULL,
    
    -- Address (Current)
    house_lot_number VARCHAR(100),
    street_sitio_subdivision VARCHAR(255),
    barangay VARCHAR(100) NOT NULL,
    municipality VARCHAR(100) NOT NULL DEFAULT 'Opol',
    province VARCHAR(100) NOT NULL DEFAULT 'Misamis Oriental',
    region VARCHAR(100) NOT NULL DEFAULT 'Region X (Northern Mindanao)',
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_number VARCHAR(20),
    emergency_contact_relationship VARCHAR(100),
    
    -- Government ID
    government_id_type VARCHAR(100),
    government_id_number VARCHAR(100),
    
    -- Education
    highest_formal_education ENUM('None', 'Elementary', 'High School', 'Vocational', 'College', 'Post Graduate'),
    
    -- PWD Status
    is_pwd BOOLEAN DEFAULT false,
    pwd_id_number VARCHAR(100) NULL,
    
    -- 4Ps Beneficiary
    is_4ps_beneficiary BOOLEAN DEFAULT false,
    household_id_number VARCHAR(100) NULL,
    
    -- Indigenous People
    is_indigenous_people BOOLEAN DEFAULT false,
    ip_group VARCHAR(100) NULL,
    
    -- Association Membership
    is_organization_member BOOLEAN DEFAULT false,
    organization_name VARCHAR(255) NULL,
    member_id_number VARCHAR(100) NULL,
    position_in_organization VARCHAR(100) NULL,
    
    -- Mother's Information
    mothers_maiden_name VARCHAR(255),
    
    -- Household Information
    is_household_head BOOLEAN DEFAULT false,
    household_head_name VARCHAR(255) NULL,
    household_head_relationship VARCHAR(100) NULL,
    
    -- Status Tracking
    enrollment_status ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected') DEFAULT 'draft',
    submitted_at TIMESTAMP NULL,
    reviewed_at TIMESTAMP NULL,
    reviewed_by BIGINT UNSIGNED NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_rsbsa_control_number (rsbsa_control_number),
    INDEX idx_beneficiary_status (enrollment_status),
    INDEX idx_beneficiary_location (province, municipality, barangay)
);

-- 3. FARM PROFILE (Main farming activity)
CREATE TABLE farm_profiles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    beneficiary_id BIGINT UNSIGNED NOT NULL,
    
    -- Main Livelihood
    main_livelihood ENUM('rice_farming', 'corn_farming', 'high_value_crops', 'livestock', 'poultry', 'fisheries', 'others') NOT NULL,
    livelihood_others_specify VARCHAR(255) NULL,
    
    -- Farming Experience
    years_farming_experience INT UNSIGNED,
    
    -- Land Information Summary
    total_farm_area DECIMAL(10,4) DEFAULT 0,
    total_parcels_count INT UNSIGNED DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE,
    INDEX idx_main_livelihood (main_livelihood)
);

-- 4. FARM PARCELS (Land Details)
CREATE TABLE farm_parcels (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    farm_profile_id BIGINT UNSIGNED NOT NULL,
    
    -- Location
    parcel_name VARCHAR(100),
    barangay VARCHAR(100) NOT NULL,
    municipality VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    
    -- Area and Ownership
    farm_area DECIMAL(8,4) NOT NULL,
    area_unit ENUM('hectares', 'square_meters') DEFAULT 'hectares',
    
    -- Tenurial Status
    tenurial_status ENUM('registered_owner', 'tenant', 'lessee', 'others') NOT NULL,
    tenurial_status_others VARCHAR(255) NULL,
    
    -- If Owner
    title_number VARCHAR(100) NULL,
    lot_number VARCHAR(100) NULL,
    survey_number VARCHAR(100) NULL,
    
    -- If Tenant/Lessee
    landowner_name VARCHAR(255) NULL,
    landowner_address TEXT NULL,
    
    -- Farm Type
    farm_type ENUM('irrigated', 'rainfed_lowland', 'rainfed_upland', 'others') NOT NULL,
    farm_type_others VARCHAR(255) NULL,
    
    -- Organic Agriculture
    is_organic_agriculture BOOLEAN DEFAULT false,
    organic_certification_number VARCHAR(100) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (farm_profile_id) REFERENCES farm_profiles(id) ON DELETE CASCADE,
    INDEX idx_parcel_location (province, municipality, barangay),
    INDEX idx_tenurial_status (tenurial_status)
);

-- 5. CROPS PLANTED (What they grow)
CREATE TABLE crops_planted (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    farm_parcel_id BIGINT UNSIGNED NOT NULL,
    
    -- Crop Information
    crop_category ENUM('rice', 'corn', 'high_value_crops', 'others') NOT NULL,
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    
    -- Planting Details
    planting_area DECIMAL(8,4) NOT NULL,
    cropping_season ENUM('dry_season', 'wet_season', 'year_round'),
    
    -- Production
    average_yield_per_season DECIMAL(8,2),
    yield_unit VARCHAR(50), -- tons, kilos, pieces, etc.
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (farm_parcel_id) REFERENCES farm_parcels(id) ON DELETE CASCADE,
    INDEX idx_crop_category (crop_category)
);

-- 6. LIVESTOCK AND POULTRY
CREATE TABLE livestock_poultry (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    farm_profile_id BIGINT UNSIGNED NOT NULL,
    
    -- Animal Type
    animal_category ENUM('livestock', 'poultry') NOT NULL,
    animal_type VARCHAR(100) NOT NULL, -- carabao, cattle, goat, pig, chicken, duck, etc.
    
    -- Details
    breed VARCHAR(100),
    number_of_heads INT UNSIGNED NOT NULL,
    
    -- Purpose
    purpose ENUM('breeding', 'fattening', 'draft_power', 'egg_production', 'others') NOT NULL,
    purpose_others VARCHAR(255) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (farm_profile_id) REFERENCES farm_profiles(id) ON DELETE CASCADE,
    INDEX idx_animal_category (animal_category, animal_type)
);

-- 7. FISHERIES (If applicable)
CREATE TABLE fisheries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    farm_profile_id BIGINT UNSIGNED NOT NULL,
    
    -- Fishery Type
    fishery_type ENUM('aquaculture', 'capture_fisheries') NOT NULL,
    
    -- For Aquaculture
    culture_environment ENUM('freshwater', 'brackishwater', 'marinewater') NULL,
    culture_system ENUM('pond', 'cage', 'pen', 'others') NULL,
    pond_area DECIMAL(8,4) NULL,
    
    -- Species
    species_cultured TEXT, -- JSON or comma-separated
    
    -- For Capture Fisheries
    fishing_ground VARCHAR(255) NULL,
    type_of_gear VARCHAR(255) NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (farm_profile_id) REFERENCES farm_profiles(id) ON DELETE CASCADE
);

-- 8. SIMPLIFIED ENROLLMENT TRACKING
CREATE TABLE rsbsa_enrollments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    beneficiary_id BIGINT UNSIGNED NOT NULL,
    
    -- Application Info
    application_reference_code VARCHAR(50) UNIQUE NOT NULL,
    enrollment_year YEAR NOT NULL,
    enrollment_type ENUM('new', 'update', 'renewal') DEFAULT 'new',
    
    -- Status
    status ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected') DEFAULT 'draft',
    submitted_at TIMESTAMP NULL,
    reviewed_at TIMESTAMP NULL,
    approved_at TIMESTAMP NULL,
    
    -- RSBSA Number (only when approved)
    assigned_rsbsa_number VARCHAR(50) UNIQUE NULL,
    rsbsa_assigned_at TIMESTAMP NULL,
    
    -- Review Information
    reviewed_by BIGINT UNSIGNED NULL,
    coordinator_notes TEXT NULL,
    rejection_reason TEXT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_enrollment_status (status),
    INDEX idx_enrollment_year (enrollment_year),
    INDEX idx_reference_code (application_reference_code)
);

-- =====================================================
-- REFERENCE TABLES
-- =====================================================

-- Livelihood Categories (for dropdowns)
CREATE TABLE livelihood_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    category_code VARCHAR(20) UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Commodity Master List
CREATE TABLE commodities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    commodity_name VARCHAR(100) NOT NULL,
    commodity_category ENUM('rice', 'corn', 'high_value_crops', 'livestock', 'poultry', 'fisheries'),
    scientific_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Barangay Master List
CREATE TABLE barangays (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    barangay_name VARCHAR(100) NOT NULL,
    municipality VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    barangay_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_location (province, municipality, barangay_name)
);