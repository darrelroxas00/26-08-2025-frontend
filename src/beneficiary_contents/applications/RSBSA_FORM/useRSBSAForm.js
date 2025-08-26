import { useState, useEffect, useCallback } from 'react';
import { rsbsaService } from '../../../api/rsbsaService';

/**
 * Custom hook for managing RSBSA form state and operations
 * Based on the database schema provided:
 * - rsbsa_enrollments
 * - beneficiary_details
 * - farm_profiles
 * - farm_parcels
 * - livelihood_categories
 * - commodities
 * - sectors
 */
export const useRSBSAForm = () => {
  // Form state based on database structure
  const [formData, setFormData] = useState({
    // RSBSA Enrollment (rsbsa_enrollments table)
    enrollment: {
      id: null,
      user_id: null,
      beneficiary_id: null,
      farm_profile_id: null,
      application_reference_code: '',
      enrollment_year: new Date().getFullYear(),
      enrollment_type: 'new',
      application_status: 'draft',
      submitted_at: null,
      approved_at: null,
      rejected_at: null,
      rejection_reason: null,
      coordinator_notes: null,
      reviewed_by: null,
      assigned_rsbsa_number: null,
      rsbsa_number_assigned_at: null,
      created_at: null,
      updated_at: null
    },

    // Beneficiary Profile (beneficiary_details table)
    beneficiaryProfile: {
      id: null,
      user_id: null,
      fname: '',
      mname: '',
      lname: '',
      extension_name: '',
      system_generated_rsbsa_number: null,
      manual_rsbsa_number: null,
      rsbsa_verification_status: 'not_verified',
      rsbsa_verification_notes: null,
      rsbsa_verified_at: null,
      rsbsa_verified_by: null,
      barangay: '',
      municipality: 'Opol',
      province: 'Misamis Oriental',
      region: 'Region X (Northern Mindanao)',
      contact_number: '',
      emergency_contact_number: null,
      birth_date: null,
      place_of_birth: null,
      sex: null,
      civil_status: null,
      name_of_spouse: null,
      highest_education: null,
      religion: null,
      is_pwd: false,
      has_government_id: 'no',
      gov_id_type: null,
      gov_id_number: null,
      is_association_member: 'no',
      association_name: null,
      mothers_maiden_name: null,
      is_household_head: false,
      household_head_name: null,
      profile_completion_status: 'pending',
      is_profile_verified: false,
      verification_notes: null,
      profile_verified_at: null,
      profile_verified_by: null,
      data_source: 'self_registration',
      last_updated_by_beneficiary: null,
      completion_tracking: null,
      created_at: null,
      updated_at: null
    },

    // Farm Profile (farm_profiles table)
    farmProfile: {
      id: null,
      beneficiary_id: null,
      livelihood_category_id: null,
      created_at: null,
      updated_at: null
    },

    // Farm Parcels (farm_parcels table) - Array for multiple parcels
    farmParcels: [],

    // Livelihood Details based on category
    livelihoodDetails: {
      farmer: {
        id: null,
        farm_profile_id: null,
        is_rice: false,
        is_corn: false,
        is_other_crops: false,
        other_crops_description: '',
        is_livestock: false,
        livestock_description: '',
        is_poultry: false,
        poultry_description: '',
        created_at: null,
        updated_at: null
      },
      fisherfolk: {
        id: null,
        farm_profile_id: null,
        is_fish_capture: false,
        is_aquaculture: false,
        is_fish_processing: false,
        other_fishing_description: '',
        created_at: null,
        updated_at: null
      },
      farmworker: {
        id: null,
        farm_profile_id: null,
        is_land_preparation: false,
        is_cultivation: false,
        is_harvesting: false,
        other_work_description: '',
        created_at: null,
        updated_at: null
      },
      agriYouth: {
        id: null,
        farm_profile_id: null,
        is_agri_youth: false,
        is_part_of_farming_household: false,
        is_formal_agri_course: false,
        is_nonformal_agri_course: false,
        is_agri_program_participant: false,
        other_involvement_description: '',
        created_at: null,
        updated_at: null
      }
    }
  });

  // Form validation errors
  const [errors, setErrors] = useState({});
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Load form data from localStorage and API on component mount
  useEffect(() => {
    const loadFormData = async () => {
      try {
        setIsLoading(true);
        
        // Load saved draft from localStorage
        const savedData = localStorage.getItem('rsbsa_form_data');
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            setFormData(prevData => ({ ...prevData, ...parsedData }));
          } catch (error) {
            console.error('Error loading saved form data from localStorage:', error);
          }
        }

        // Load user data and existing enrollment if available
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) {
          try {
            // Set user ID in form data
            setFormData(prevData => ({
              ...prevData,
              enrollment: { ...prevData.enrollment, user_id: user.id },
              beneficiaryProfile: { 
                ...prevData.beneficiaryProfile, 
                user_id: user.id,
                // Load user name from user object
                fname: user.fname || '',
                mname: user.mname || '',
                lname: user.lname || '',
                extension_name: user.extension_name || ''
              }
            }));

            // Check if user already has beneficiary details
            const beneficiaryDetails = await rsbsaService.getBeneficiaryDetails(user.id);
            if (beneficiaryDetails) {
              setFormData(prevData => ({
                ...prevData,
                beneficiaryProfile: { 
                  ...prevData.beneficiaryProfile, 
                  ...beneficiaryDetails,
                  // Preserve user name from user object
                  fname: user.fname || beneficiaryDetails.fname || '',
                  mname: user.mname || beneficiaryDetails.mname || '',
                  lname: user.lname || beneficiaryDetails.lname || '',
                  extension_name: user.extension_name || beneficiaryDetails.extension_name || ''
                }
              }));
            }

            // Check if user already has RSBSA enrollment
            const enrollment = await rsbsaService.getEnrollmentByUser(user.id);
            if (enrollment) {
              setFormData(prevData => ({
                ...prevData,
                enrollment: { ...prevData.enrollment, ...enrollment }
              }));
            }
          } catch (error) {
            console.error('Error loading user data from API:', error);
          }
        }
      } catch (error) {
        console.error('Error in loadFormData:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFormData();
  }, []);

  // Save form data to localStorage whenever formData changes
  useEffect(() => {
    try {
      localStorage.setItem('rsbsa_form_data', JSON.stringify(formData));
    } catch (error) {
      console.error('Error saving form data to localStorage:', error);
    }
  }, [formData]);

  // Update form field
  const updateField = useCallback((section, field, value) => {
    try {
      setFormData(prevData => ({
        ...prevData,
        [section]: {
          ...prevData[section],
          [field]: value
        }
      }));

      // Clear error for this field if it exists
      if (errors[`${section}.${field}`]) {
        setErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors[`${section}.${field}`];
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Error updating form field:', error);
    }
  }, [errors]);

  // Add new farm parcel
  const addFarmParcel = useCallback(() => {
    try {
      const newParcel = {
        id: Date.now(), // Temporary ID for frontend
        farm_profile_id: null,
        parcel_number: '',
        barangay: '',
        farm_area: 0,
        tenure_type: null,
        landowner_name: null,
        ownership_document_number: null,
        is_ancestral_domain: false,
        is_agrarian_reform_beneficiary: false,
        farm_type: null,
        is_organic_practitioner: false,
        remarks: null,
        created_at: null,
        updated_at: null
      };

      setFormData(prevData => ({
        ...prevData,
        farmParcels: [...prevData.farmParcels, newParcel]
      }));
    } catch (error) {
      console.error('Error adding farm parcel:', error);
    }
  }, []);

  // Update farm parcel
  const updateFarmParcel = useCallback((index, field, value) => {
    try {
      setFormData(prevData => ({
        ...prevData,
        farmParcels: prevData.farmParcels.map((parcel, i) =>
          i === index ? { ...parcel, [field]: value } : parcel
        )
      }));
    } catch (error) {
      console.error('Error updating farm parcel:', error);
    }
  }, []);

  // Remove farm parcel
  const removeFarmParcel = useCallback((index) => {
    try {
      setFormData(prevData => ({
        ...prevData,
        farmParcels: prevData.farmParcels.filter((_, i) => i !== index)
      }));
    } catch (error) {
      console.error('Error removing farm parcel:', error);
    }
  }, []);

  // Update livelihood details
  const updateLivelihoodDetails = useCallback((category, field, value) => {
    try {
      setFormData(prevData => ({
        ...prevData,
        livelihoodDetails: {
          ...prevData.livelihoodDetails,
          [category]: {
            ...prevData.livelihoodDetails[category],
            [field]: value
          }
        }
      }));
    } catch (error) {
      console.error('Error updating livelihood details:', error);
    }
  }, []);

  // Form validation
  const validateForm = useCallback(() => {
    try {
      const newErrors = {};

      // Validate beneficiary profile
      const { beneficiaryProfile } = formData;
      if (!beneficiaryProfile.barangay?.trim()) {
        newErrors['beneficiaryProfile.barangay'] = 'Barangay is required';
      }
      if (!beneficiaryProfile.contact_number?.trim()) {
        newErrors['beneficiaryProfile.contact_number'] = 'Contact number is required';
      }
      if (!beneficiaryProfile.birth_date) {
        newErrors['beneficiaryProfile.birth_date'] = 'Birth date is required';
      }
      if (!beneficiaryProfile.sex) {
        newErrors['beneficiaryProfile.sex'] = 'Sex is required';
      }
      if (!beneficiaryProfile.civil_status) {
        newErrors['beneficiaryProfile.civil_status'] = 'Civil status is required';
      }

      // Validate farm profile
      if (!formData.farmProfile.livelihood_category_id) {
        newErrors['farmProfile.livelihood_category_id'] = 'Livelihood category is required';
      }

      // Validate at least one farm parcel
      if (formData.farmParcels.length === 0) {
        newErrors['farmParcels'] = 'At least one farm parcel is required';
      } else {
        // Validate each farm parcel
        formData.farmParcels.forEach((parcel, index) => {
          if (!parcel.barangay?.trim()) {
            newErrors[`farmParcels.${index}.barangay`] = 'Parcel barangay is required';
          }
          if (!parcel.tenure_type) {
            newErrors[`farmParcels.${index}.tenure_type`] = 'Tenure type is required';
          }
          if (!parcel.farm_area || parcel.farm_area <= 0) {
            newErrors[`farmParcels.${index}.farm_area`] = 'Farm area must be greater than 0';
          }
          if (!parcel.farm_type) {
            newErrors[`farmParcels.${index}.farm_type`] = 'Farm type is required';
          }
        });
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (error) {
      console.error('Error in form validation:', error);
      return false;
    }
  }, [formData]);

  // Step-by-step validation
  const validateCurrentStep = useCallback(() => {
    try {
      const newErrors = {};
      
      switch (currentStep) {
        case 1: // Beneficiary Profile
          const { beneficiaryProfile } = formData;
          if (!beneficiaryProfile.barangay?.trim()) {
            newErrors['beneficiaryProfile.barangay'] = 'Barangay is required';
          }
          if (!beneficiaryProfile.contact_number?.trim()) {
            newErrors['beneficiaryProfile.contact_number'] = 'Contact number is required';
          }
          if (!beneficiaryProfile.birth_date) {
            newErrors['beneficiaryProfile.birth_date'] = 'Birth date is required';
          }
          if (!beneficiaryProfile.sex) {
            newErrors['beneficiaryProfile.sex'] = 'Sex is required';
          }
          if (!beneficiaryProfile.civil_status) {
            newErrors['beneficiaryProfile.civil_status'] = 'Civil status is required';
          }
          break;
          
        case 2: // Farm Profile
          if (!formData.farmProfile.livelihood_category_id) {
            newErrors['farmProfile.livelihood_category_id'] = 'Livelihood category is required';
          }
          break;
          
        case 3: // Farm Parcels
          if (formData.farmParcels.length === 0) {
            newErrors['farmParcels'] = 'At least one farm parcel is required';
          } else {
            formData.farmParcels.forEach((parcel, index) => {
              if (!parcel.barangay?.trim()) {
                newErrors[`farmParcels.${index}.barangay`] = 'Parcel barangay is required';
              }
              if (!parcel.tenure_type) {
                newErrors[`farmParcels.${index}.tenure_type`] = 'Tenure type is required';
              }
              if (!parcel.farm_area || parcel.farm_area <= 0) {
                newErrors[`farmParcels.${index}.farm_area`] = 'Farm area must be greater than 0';
              }
              if (!parcel.farm_type) {
                newErrors[`farmParcels.${index}.farm_type`] = 'Farm type is required';
              }
            });
          }
          break;
          
        case 4: // Livelihood Details
          // Validate that at least one livelihood category has some data
          const hasLivelihoodData = Object.values(formData.livelihoodDetails).some(category => 
            Object.values(category).some(value => 
              value !== null && value !== '' && value !== false
            )
          );
          if (!hasLivelihoodData) {
            newErrors['livelihoodDetails'] = 'Please provide details for at least one livelihood category';
          }
          break;
          
        case 5: // Review
          // Final validation before submission
          if (!validateForm()) {
            newErrors['general'] = 'Please complete all required fields before proceeding';
          }
          break;
          
        default:
          break;
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (error) {
      console.error('Error in step validation:', error);
      return false;
    }
  }, [formData, currentStep, validateForm]);

  // Navigate to next step with validation
  const nextStep = useCallback(() => {
    try {
      if (currentStep < totalSteps) {
        // Validate current step before proceeding
        if (validateCurrentStep()) {
          setCurrentStep(prev => prev + 1);
          // Clear errors when moving to next step
          setErrors({});
        } else {
          console.log('Step validation failed. Cannot proceed.');
        }
      }
    } catch (error) {
      console.error('Error navigating to next step:', error);
    }
  }, [currentStep, totalSteps, validateCurrentStep]);

  // Navigate to previous step
  const prevStep = useCallback(() => {
    try {
      if (currentStep > 1) {
        setCurrentStep(prev => prev - 1);
        // Clear errors when going back
        setErrors({});
      }
    } catch (error) {
      console.error('Error navigating to previous step:', error);
    }
  }, [currentStep]);

  // Go to specific step
  const goToStep = useCallback((step) => {
    try {
      if (step >= 1 && step <= totalSteps) {
        setCurrentStep(step);
      }
    } catch (error) {
      console.error('Error going to specific step:', error);
    }
  }, [totalSteps]);

  // Submit form
  const submitForm = useCallback(async () => {
    try {
      console.log('Starting form submission...');
      
      if (!validateForm()) {
        console.log('Form validation failed:', errors);
        return false;
      }

      setIsSubmitting(true);
      console.log('Form data being submitted:', formData);

      // Prepare application data for submission
      const applicationData = {
        enrollment: formData.enrollment,
        beneficiaryProfile: formData.beneficiaryProfile,
        farmProfile: formData.farmProfile,
        farmParcels: formData.farmParcels,
        livelihoodDetails: formData.livelihoodDetails
      };

      // Submit complete application
      const result = await rsbsaService.submitCompleteApplication(applicationData);
      console.log('Form submission successful:', result);

      // Update enrollment status
      setFormData(prevData => ({
        ...prevData,
        enrollment: {
          ...prevData.enrollment,
          application_status: 'submitted',
          submitted_at: new Date().toISOString(),
          application_reference_code: result.reference_code || rsbsaService.generateReferenceCode()
        }
      }));

      // Clear localStorage after successful submission
      localStorage.removeItem('rsbsa_form_data');
      
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, errors]);

  // Save draft
  const saveDraft = useCallback(async () => {
    try {
      console.log('Saving draft...');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (user.id) {
        const draftData = {
          user_id: user.id,
          form_data: formData,
          last_saved: new Date().toISOString()
        };
        
        await rsbsaService.saveDraft(draftData);
        console.log('Draft saved successfully');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }, [formData]);

  // Reset form
  const resetForm = useCallback(() => {
    try {
      setFormData({
        enrollment: {
          id: null,
          user_id: null,
          beneficiary_id: null,
          farm_profile_id: null,
          application_reference_code: '',
          enrollment_year: new Date().getFullYear(),
          enrollment_type: 'new',
          application_status: 'draft',
          submitted_at: null,
          approved_at: null,
          rejected_at: null,
          rejection_reason: null,
          coordinator_notes: null,
          reviewed_by: null,
          assigned_rsbsa_number: null,
          rsbsa_number_assigned_at: null,
          created_at: null,
          updated_at: null
        },
        beneficiaryProfile: {
          id: null,
          user_id: null,
          fname: '',
          mname: '',
          lname: '',
          extension_name: '',
          system_generated_rsbsa_number: null,
          manual_rsbsa_number: null,
          rsbsa_verification_status: 'not_verified',
          rsbsa_verification_notes: null,
          rsbsa_verified_at: null,
          rsbsa_verified_by: null,
          barangay: '',
          municipality: 'Opol',
          province: 'Misamis Oriental',
          region: 'Region X (Northern Mindanao)',
          contact_number: '',
          emergency_contact_number: null,
          birth_date: null,
          place_of_birth: null,
          sex: null,
          civil_status: null,
          name_of_spouse: null,
          highest_education: null,
          religion: null,
          is_pwd: false,
          has_government_id: 'no',
          gov_id_type: null,
          gov_id_number: null,
          is_association_member: 'no',
          association_name: null,
          mothers_maiden_name: null,
          is_household_head: false,
          household_head_name: null,
          profile_completion_status: 'pending',
          is_profile_verified: false,
          verification_notes: null,
          profile_verified_at: null,
          profile_verified_by: null,
          data_source: 'self_registration',
          last_updated_by_beneficiary: null,
          completion_tracking: null,
          created_at: null,
          updated_at: null
        },
        farmProfile: {
          id: null,
          beneficiary_id: null,
          livelihood_category_id: null,
          created_at: null,
          updated_at: null
        },
        farmParcels: [],
        livelihoodDetails: {
          farmer: {
            id: null,
            farm_profile_id: null,
            is_rice: false,
            is_corn: false,
            is_other_crops: false,
            other_crops_description: '',
            is_livestock: false,
            livestock_description: '',
            is_poultry: false,
            poultry_description: '',
            created_at: null,
            updated_at: null
          },
          fisherfolk: {
            id: null,
            farm_profile_id: null,
            is_fish_capture: false,
            is_aquaculture: false,
            is_fish_processing: false,
            other_fishing_description: '',
            created_at: null,
            updated_at: null
          },
          farmworker: {
            id: null,
            farm_profile_id: null,
            is_land_preparation: false,
            is_cultivation: false,
            is_harvesting: false,
            other_work_description: '',
            created_at: null,
            updated_at: null
          },
          agriYouth: {
            id: null,
            farm_profile_id: null,
            is_agri_youth: false,
            is_part_of_farming_household: false,
            is_formal_agri_course: false,
            is_nonformal_agri_course: false,
            is_agri_program_participant: false,
            other_involvement_description: '',
            created_at: null,
            updated_at: null
          }
        }
      });
      setErrors({});
      setCurrentStep(1);
      localStorage.removeItem('rsbsa_form_data');
      console.log('Form reset successfully');
    } catch (error) {
      console.error('Error resetting form:', error);
    }
  }, []);

  // Get form completion percentage
  const getFormProgress = useCallback(() => {
    try {
      return rsbsaService.calculateCompletion(formData);
    } catch (error) {
      console.error('Error calculating form progress:', error);
      return 0;
    }
  }, [formData]);

  // Return all necessary functions and state
  return {
    formData,
    errors,
    setErrors,
    isLoading,
    isSubmitting,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    submitForm,
    saveDraft,
    resetForm,
    updateField,
    addFarmParcel,
    updateFarmParcel,
    removeFarmParcel,
    updateLivelihoodDetails,
    validateCurrentStep
  };
};

export default useRSBSAForm;