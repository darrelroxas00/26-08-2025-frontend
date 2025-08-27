/* eslint-disable no-const-assign */
/* eslint-disable no-restricted-globals */
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when field is updated
    if (errors[field]) {
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
    const newErrors = {};

    // Required fields validation
    if (!formData.barangay) newErrors.barangay = 'Barangay is required';
    if (!formData.contact_number) newErrors.contact_number = 'Contact number is required';
    if (!formData.birth_date) newErrors.birth_date = 'Birth date is required';
    if (!formData.sex) newErrors.sex = 'Sex is required';

    // Enhanced birth date validation
    if (formData.birth_date) {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      
      // Check if date is valid
      if (isNaN(birthDate.getTime())) {
        newErrors.birth_date = 'Please enter a valid date';
      }
      // Check if date is in the future
      else if (birthDate > today) {
        newErrors.birth_date = 'Birth date cannot be in the future';
      }
      // Check if user is too young (under 18)
      else {
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < 18) {
          newErrors.birth_date = 'You must be at least 18 years old to register';
        } else if (age > 120) {
          newErrors.birth_date = 'Please enter a valid birth date';
        }
      }
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
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Load data function with API integration
  const loadPersonalDetails = useCallback(async (id) => {
    if (!id) return;
    
    setLoading(true);
    try {
      // API call to get beneficiary details from Laravel backend
      const response = await axiosInstance.get(`/api/beneficiary-details/${id}`);
      
      if (response.data.success) {
        const transformedData = transformFromBackend(response.data.data);
        setFormData(transformedData);
        setIsExistingRecord(true);
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
    if (!validateForm()) {
      return false;
    }

    setSaving(true);
    try {
      const backendData = transformToBackend(formData);

      // UPSERT Logic: Use POST for both create and update
      // The backend controller handles the updateOrCreate logic
      const payload = {
        user_id: userId,
        ...backendData
      };

      // API call to save/update beneficiary details - ENHANCED DEBUGGING
      console.log('🔍 Making API call to save personal details...');
      console.log('📡 API URL:', '/api/beneficiary-details');
      console.log('📦 Payload:', payload);
      console.log('🔑 User ID:', userId);
      console.log('⏰ Timestamp:', new Date().toISOString());
      
      const response = await axiosInstance.post('/api/beneficiary-details', payload);
      
      console.log('✅ API Response received:', response);
      console.log('📄 Response status:', response.status);
      console.log('📊 Response data:', response.data);

      if (response.data.success) {
        const savedData = response.data.data;
        // Transform data back from backend
        const transformedData = transformFromBackend(savedData);
        setFormData(transformedData);
        setIsExistingRecord(true);
        
        // Also save to localStorage as backup
        if (userId) {
          localStorage.setItem(`personal_details_${userId}`, JSON.stringify(transformedData));
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

        return true;
      }
      
      // If response.data.success is false, return false
      return false;
    } catch (error) {
      console.error('❌ ERROR saving personal details:', error);
      console.error('🔍 Error details:');
      console.error('- Error message:', error.message);
      console.error('- Error status:', error.response?.status);
      console.error('- Error statusText:', error.response?.statusText);
      console.error('- Error data:', error.response?.data);
      console.error('- Error config:', error.config);
      console.error('- Full error object:', error);
      
      // Check for specific error types
      if (error.code === 'ECONNREFUSED') {
        console.error('🚫 Connection refused - Backend server might be down');
        setErrors({ 
          general: 'Cannot connect to server. Please check if the backend is running on http://127.0.0.1:8000' 
        });
      } else if (error.response?.status === 404) {
        console.error('🔍 404 Error - API endpoint not found');
        setErrors({ 
          general: 'API endpoint not found. Please check the backend routes.' 
        });
      } else if (error.response?.status === 422) {
        console.error('⚠️ Validation Error - Check form data');
        setErrors({ 
          general: error.response?.data?.message || 'Validation failed. Please check your input data.' 
        });
      } else if (error.response?.status === 500) {
        console.error('💥 Server Error - Backend issue');
        setErrors({ 
          general: 'Server error. Please check the backend logs.' 
        });
      } else {
        setErrors({ 
          general: error.response?.data?.message || 'Failed to save profile data. Check console for details.' 
        });
      }
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
    setErrors,
    // Explicit CRUD operations
    isCreate: !isExistingRecord,
    isUpdate: isExistingRecord,
    // Utility functions for external use/testing
    transformToBackend,
    transformFromBackend
  };
};

export default usePersonalDetails;