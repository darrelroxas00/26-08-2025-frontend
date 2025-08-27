import { useState, useCallback, useEffect } from 'react';
import axiosInstance from 'src/api/axiosInstance';

const usePersonalDetails = (userId = null) => {
  // Initialize form data with default values matching the Laravel migration schema
  const [formData, setFormData] = useState({
    // RSBSA INFORMATION & VERIFICATION (matches beneficiary_details table)
    id: null, // Will be set if record exists
    system_generated_rsbsa_number: '',
    manual_rsbsa_number: '',
    rsbsa_verification_status: 'not_verified', // enum: not_verified, pending, verified, rejected
    rsbsa_verification_notes: '',
    
    // LOCATION INFORMATION
    barangay: '',
    municipality: 'Opol',
    province: 'Misamis Oriental',
    region: 'Region X (Northern Mindanao)',
    
    // CONTACT INFORMATION
    contact_number: '',
    emergency_contact_number: '',
    
    // PERSONAL INFORMATION
    birth_date: '',
    place_of_birth: '',
    sex: '', // will be converted to lowercase for backend: male/female
    civil_status: '', // enum: single, married, widowed, separated, divorced
    name_of_spouse: '',
    
    // EDUCATIONAL & DEMOGRAPHIC INFORMATION
    highest_education: '',
    religion: '',
    is_pwd: false,
    
    // GOVERNMENT ID INFORMATION
    has_government_id: 'no',
    gov_id_type: '',
    gov_id_number: '',
    
    // ASSOCIATION & ORGANIZATION MEMBERSHIP
    is_association_member: 'no',
    association_name: '',
    
    // HOUSEHOLD INFORMATION
    mothers_maiden_name: '',
    is_household_head: false,
    household_head_name: '',
    
    // PROFILE COMPLETION & VERIFICATION SYSTEM (matches Laravel migration)
    profile_completion_status: 'pending', // enum: pending, completed, verified, needs_update
    is_profile_verified: false,
    verification_notes: '',
    profile_verified_at: null,
    profile_verified_by: null,
    
    // DATA SOURCE & AUDIT TRACKING
    data_source: 'self_registration', // enum: self_registration, coordinator_input, da_import, system_migration
    last_updated_by_beneficiary: null,
    completion_tracking: {}
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isExistingRecord, setIsExistingRecord] = useState(false); // Track if record exists

  // Barangay options for Opol, Misamis Oriental
  const barangayOptions = [
    'Bagocboc', 'Barra', 'Bonbon', 'Buruanga', 'Cabadiangan', 'Camaman-an',
    'Gotokan', 'Igpit', 'Limbaybay', 'Lower Olave', 'Lumbia', 'Malitbog',
    'Mapayag', 'Napaliran', 'Opol Poblacion', 'Patag', 'Pontod', 'San Vicente',
    'Tingalan', 'Taboc', 'Talakag', 'Upper Olave'
  ];

  // Civil status options from enum
  const civilStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'widowed', label: 'Widowed' },
    { value: 'separated', label: 'Separated' },
    { value: 'divorced', label: 'Divorced' }
  ];

  // Education options from enum
  const educationOptions = [
    { value: 'None', label: 'None' },
    { value: 'Pre-school', label: 'Pre-school' },
    { value: 'Elementary', label: 'Elementary' },
    { value: 'Junior High School', label: 'Junior High School' },
    { value: 'Senior High School', label: 'Senior High School' },
    { value: 'Vocational', label: 'Vocational' },
    { value: 'College', label: 'College' },
    { value: 'Post Graduate', label: 'Post Graduate' }
  ];

  const yesNoOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  // Transform data for backend (convert sex to lowercase, etc.)
  const transformToBackend = useCallback((data) => ({
    ...data,
    sex: data.sex.toLowerCase(),
    last_updated_by_beneficiary: new Date().toISOString(),
    profile_completion_status: 'completed'
  }), []);

  // Transform data from backend (convert sex to title case, etc.)
  const transformFromBackend = useCallback((data) => ({
    ...data,
    sex: data.sex ? data.sex.charAt(0).toUpperCase() + data.sex.slice(1) : '',
  }), []);

  // Update field function
  const updateField = useCallback((field, value) => {
    console.log('=== UPDATE FIELD CALLED ===');
    console.log('Field:', field);
    console.log('Old value:', formData[field]);
    console.log('New value:', value);
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      console.log('Updated formData:', updated);
      return updated;
    });

    // Clear error when field is updated
    if (errors[field]) {
      console.log('Clearing error for field:', field);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Handle conditional fields
    if (field === 'civil_status' && value !== 'married') {
      setFormData(prev => ({
        ...prev,
        name_of_spouse: ''
      }));
    }

    if (field === 'has_government_id' && value === 'no') {
      setFormData(prev => ({
        ...prev,
        gov_id_type: '',
        gov_id_number: ''
      }));
    }

    if (field === 'is_association_member' && value === 'no') {
      setFormData(prev => ({
        ...prev,
        association_name: ''
      }));
    }

    if (field === 'is_household_head' && value === true) {
      setFormData(prev => ({
        ...prev,
        household_head_name: ''
      }));
    }
  }, [errors]);

  // Validation function
  const validateForm = useCallback(() => {
    console.log('=== FORM VALIDATION STARTED ===');
    console.log('Validating formData:', formData);
    
    const newErrors = {};

    // Required fields validation
    if (!formData.barangay) {
      newErrors.barangay = 'Barangay is required';
      console.log('Validation error: Barangay missing');
    }
    if (!formData.contact_number) {
      newErrors.contact_number = 'Contact number is required';
      console.log('Validation error: Contact number missing');
    }
    if (!formData.birth_date) {
      newErrors.birth_date = 'Birth date is required';
      console.log('Validation error: Birth date missing');
    }
    if (!formData.sex) {
      newErrors.sex = 'Sex is required';
      console.log('Validation error: Sex missing');
    }

    // Contact number format validation
    if (formData.contact_number && !/^09\d{9}$/.test(formData.contact_number)) {
      newErrors.contact_number = 'Contact number must be in format 09XXXXXXXXX';
    }

    // Emergency contact format validation (if provided)
    if (formData.emergency_contact_number && !/^09\d{9}$/.test(formData.emergency_contact_number)) {
      newErrors.emergency_contact_number = 'Emergency contact must be in format 09XXXXXXXXX';
    }

    // Conditional validations
    if (formData.civil_status === 'married' && !formData.name_of_spouse) {
      newErrors.name_of_spouse = 'Spouse name is required for married status';
    }

    if (formData.has_government_id === 'yes') {
      if (!formData.gov_id_type) newErrors.gov_id_type = 'Government ID type is required';
      if (!formData.gov_id_number) newErrors.gov_id_number = 'Government ID number is required';
    }

    if (formData.is_association_member === 'yes' && !formData.association_name) {
      newErrors.association_name = 'Association name is required';
    }

    if (!formData.is_household_head && !formData.household_head_name) {
      newErrors.household_head_name = 'Household head name is required';
    }

    setErrors(newErrors);
    console.log('Validation errors found:', newErrors);
    console.log('Validation passed:', Object.keys(newErrors).length === 0);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Load data function with API integration
  const loadPersonalDetails = useCallback(async (id) => {
    if (!id) return;
    
    setLoading(true);
    try {
      // API call to get beneficiary details from Laravel backend
      console.log('Loading personal details for user ID:', id);
      const response = await axiosInstance.get(`/api/beneficiary-details/${id}`);
      
      if (response.data && response.data.success) {
        const transformedData = transformFromBackend(response.data.data);
        setFormData(transformedData);
        setIsExistingRecord(true);
        console.log('Personal details loaded successfully');
      } else {
        console.log('No existing personal details found for user');
      }
    } catch (error) {
      console.error('Error loading personal details:', error);
      // If record doesn't exist (404), it's not an error - user just hasn't created profile yet
      if (error.response?.status === 404) {
        setIsExistingRecord(false);

        const savedData = localStorage.getItem(`personal_details_${id}`);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          const transformedData = transformFromBackend(parsedData);
          setFormData(transformedData);
          setIsExistingRecord(true);
        }
      } else {
        setErrors({ general: 'Failed to load profile data' });
      }
    } finally {
      setLoading(false);
    }
  }, [transformFromBackend]);

  // Calculate completion percentage - Enhanced version with required vs optional fields
  const getCompletionPercentage = useCallback(() => {
    const requiredFields = [
      'barangay', 'contact_number', 'birth_date', 'sex', 'civil_status'
    ];
    const optionalFields = [
      'emergency_contact_number', 'place_of_birth', 'highest_education', 
      'religion', 'mothers_maiden_name'
    ];
    
    const totalFields = requiredFields.length + optionalFields.length;
    let completedFields = 0;

    // Count required fields
    requiredFields.forEach(field => {
      if (formData[field] && formData[field] !== '') {
        completedFields++;
      }
    });

    // Count optional fields
    optionalFields.forEach(field => {
      if (formData[field] && formData[field] !== '') {
        completedFields++;
      }
    });

    return Math.round((completedFields / totalFields) * 100);
  }, [formData]);

  // Save data function with UPSERT logic
  const savePersonalDetails = useCallback(async () => {
    console.log('=== SAVE PERSONAL DETAILS CALLED ===');
    console.log('Current formData:', formData);
    console.log('Current userId:', userId);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      console.log('Current errors:', errors);
      return false;
    }

    console.log('Form validation passed, proceeding with save...');
    setSaving(true);
    try {
      const backendData = transformToBackend(formData);
      console.log('Transformed backend data:', backendData);

      // UPSERT Logic: Use POST for both create and update
      // The backend controller handles the updateOrCreate logic
      const payload = {
        user_id: userId,
        ...backendData
      };
      console.log('Final payload to send:', payload);

      // API call to save/update beneficiary details
      console.log('Making API call to /api/beneficiary-details...');
      const response = await axiosInstance.post('/api/beneficiary-details', payload);

      console.log('API Response received:', response);
      
      if (response.data && response.data.success) {
        console.log('API call successful!');
        const savedData = response.data.data;
        console.log('Saved data from API:', savedData);
        
        // Transform data back from backend
        const transformedData = transformFromBackend(savedData);
        console.log('Transformed data for frontend:', transformedData);
        
        setFormData(transformedData);
        setIsExistingRecord(true);
        
        // Also save to localStorage as backup
        if (userId) {
          localStorage.setItem(`personal_details_${userId}`, JSON.stringify(transformedData));
          console.log('Data saved to localStorage');
        }

        // Update completion tracking
        const completedFields = Object.keys(formData).filter(key => {
          const value = formData[key];
          return value !== '' && value !== null && value !== undefined;
        });

        const updatedTracking = {
          completed_fields: completedFields,
          completion_percentage: getCompletionPercentage(),
          last_updated: new Date().toISOString()
        };

        updateField('completion_tracking', updatedTracking);
        updateField('profile_completion_status', 'completed');
        updateField('last_updated_by_beneficiary', new Date().toISOString());

        console.log('Save operation completed successfully');
        return true;
      } else {
        console.log('API response indicates failure:', response.data);
        return false;
      }
    } catch (error) {
      console.error('Error saving personal details:', error);
      setErrors({ 
        general: error.response?.data?.message || 'Failed to save profile data' 
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [formData, userId, validateForm, updateField, transformToBackend, transformFromBackend, getCompletionPercentage]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      id: null,
      system_generated_rsbsa_number: '',
      manual_rsbsa_number: '',
      rsbsa_verification_status: 'not_verified',
      rsbsa_verification_notes: '',
      barangay: '',
      municipality: 'Opol',
      province: 'Misamis Oriental',
      region: 'Region X (Northern Mindanao)',
      contact_number: '',
      emergency_contact_number: '',
      birth_date: '',
      place_of_birth: '',
      sex: '',
      civil_status: '',
      name_of_spouse: '',
      highest_education: '',
      religion: '',
      is_pwd: false,
      has_government_id: 'no',
      gov_id_type: '',
      gov_id_number: '',
      is_association_member: 'no',
      association_name: '',
      mothers_maiden_name: '',
      is_household_head: false,
      household_head_name: '',
      profile_completion_status: 'pending',
      is_profile_verified: false,
      verification_notes: '',
      profile_verified_at: null,
      profile_verified_by: null,
      data_source: 'self_registration',
      last_updated_by_beneficiary: null,
      completion_tracking: {}
    });
    setErrors({});
    setIsExistingRecord(false);
  }, []);

  // Load data on mount if userId is provided
  useEffect(() => {
    if (userId) {
      loadPersonalDetails(userId);
    }
  }, [userId, loadPersonalDetails]);

  return {
    formData,
    errors,
    loading,
    saving,
    isExistingRecord, // Tells you if this is an update or insert
    barangayOptions,
    civilStatusOptions,
    educationOptions,
    yesNoOptions,
    updateField,
    validateForm,
    loadPersonalDetails,
    savePersonalDetails,
    getCompletionPercentage,
    resetForm,
    // Explicit CRUD operations
    isCreate: !isExistingRecord,
    isUpdate: isExistingRecord,
    // Utility functions for external use/testing
    transformToBackend,
    transformFromBackend
  };
};

export default usePersonalDetails;