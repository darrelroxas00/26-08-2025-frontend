/* eslint-disable no-else-return */
import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * RSBSA Service - Handles all RSBSA-related API operations
 * Based on the database schema:
 * - rsbsa_enrollments
 * - beneficiary_details
 * - farm_profiles
 * - farm_parcels
 * - livelihood_categories
 * - commodities
 * - sectors
 */

export const rsbsaService = {
  // ========================================
  // RSBSA ENROLLMENT OPERATIONS
  // ========================================

  /**
   * Create new RSBSA enrollment
   */
  async createEnrollment(enrollmentData) {
    try {
      const response = await apiClient.post('/rsbsa-enrollments', enrollmentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create RSBSA enrollment');
    }
  },

  /**
   * Get RSBSA enrollment by ID
   */
  async getEnrollment(enrollmentId) {
    try {
      const response = await apiClient.get(`/rsbsa-enrollments/${enrollmentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch RSBSA enrollment');
    }
  },

  /**
   * Get RSBSA enrollment by user ID
   */
  async getEnrollmentByUser(userId) {
    try {
      const response = await apiClient.get(`/rsbsa-enrollments/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user enrollment:', error);
      // Return null if not found instead of throwing error
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch user enrollment');
    }
  },

  /**
   * Update RSBSA enrollment
   */
  async updateEnrollment(enrollmentId, updateData) {
    try {
      const response = await apiClient.put(`/rsbsa-enrollments/${enrollmentId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update RSBSA enrollment');
    }
  },

  /**
   * Submit RSBSA enrollment for review
   */
  async submitEnrollment(enrollmentId) {
    try {
      const response = await apiClient.post(`/rsbsa-enrollments/${enrollmentId}/submit`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit enrollment');
    }
  },

  // ========================================
  // BENEFICIARY DETAILS OPERATIONS
  // ========================================

  /**
   * Create or update beneficiary details
   */
  async saveBeneficiaryDetails(beneficiaryData) {
    try {
      if (beneficiaryData.id) {
        // Update existing
        const response = await apiClient.put(`/beneficiary-details/${beneficiaryData.id}`, beneficiaryData);
        return response.data;
      } else {
        // Create new
        const response = await apiClient.post('/beneficiary-details', beneficiaryData);
        return response.data;
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to save beneficiary details');
    }
  },

  /**
   * Get beneficiary details by user ID
   */
  async getBeneficiaryDetails(userId) {
    try {
      const response = await apiClient.get(`/beneficiary-details/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching beneficiary details:', error);
      // Return null if not found instead of throwing error
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch beneficiary details');
    }
  },

  /**
   * Verify RSBSA number
   */
  async verifyRSBSANumber(rsbsaNumber) {
    try {
      const response = await apiClient.post('/rsbsa-verification', { rsbsa_number: rsbsaNumber });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify RSBSA number');
    }
  },

  // ========================================
  // FARM PROFILE OPERATIONS
  // ========================================

  /**
   * Create or update farm profile
   */
  async saveFarmProfile(farmProfileData) {
    try {
      if (farmProfileData.id) {
        // Update existing
        const response = await apiClient.put(`/farm-profiles/${farmProfileData.id}`, farmProfileData);
        return response.data;
      } else {
        // Create new
        const response = await apiClient.post('/farm-profiles', farmProfileData);
        return response.data;
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to save farm profile');
    }
  },

  /**
   * Get farm profile by beneficiary ID
   */
  async getFarmProfile(beneficiaryId) {
    try {
      const response = await apiClient.get(`/farm-profiles/beneficiary/${beneficiaryId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch farm profile');
    }
  },

  // ========================================
  // FARM PARCELS OPERATIONS
  // ========================================

  /**
   * Save farm parcels (create/update/delete)
   */
  async saveFarmParcels(farmProfileId, parcels) {
    try {
      const response = await apiClient.post(`/farm-profiles/${farmProfileId}/parcels`, { parcels });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to save farm parcels');
    }
  },

  /**
   * Get farm parcels by farm profile ID
   */
  async getFarmParcels(farmProfileId) {
    try {
      const response = await apiClient.get(`/farm-profiles/${farmProfileId}/parcels`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch farm parcels');
    }
  },

  // ========================================
  // LIVELIHOOD DETAILS OPERATIONS
  // ========================================

  /**
   * Save livelihood details based on category
   */
  async saveLivelihoodDetails(livelihoodType, details) {
    try {
      const endpoint = `/${livelihoodType}-details`;
      if (details.id) {
        // Update existing
        const response = await apiClient.put(`${endpoint}/${details.id}`, details);
        return response.data;
      } else {
        // Create new
        const response = await apiClient.post(endpoint, details);
        return response.data;
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || `Failed to save ${livelihoodType} details`);
    }
  },

  // ========================================
  // REFERENCE DATA OPERATIONS
  // ========================================

  /**
   * Get livelihood categories
   */
  async getLivelihoodCategories() {
    try {
      const response = await apiClient.get('/livelihood-categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching livelihood categories:', error);
      // Return fallback categories if API fails
      return [
        { id: 1, livelihood_category_name: 'Rice Farmer', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 2, livelihood_category_name: 'Corn Farmer', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 3, livelihood_category_name: 'Vegetable Farmer', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 4, livelihood_category_name: 'Fruit Farmer', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 5, livelihood_category_name: 'Livestock Raiser', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 6, livelihood_category_name: 'Poultry Raiser', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 7, livelihood_category_name: 'Fisherfolk', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 8, livelihood_category_name: 'Aquaculture', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 9, livelihood_category_name: 'Agricultural Worker/Farmworker', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 10, livelihood_category_name: 'Agri-Youth', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
    }
  },

  /**
   * Get commodity categories
   */
  async getCommodityCategories() {
    try {
      const response = await apiClient.get('/commodity-categories');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch commodity categories');
    }
  },

  /**
   * Get commodities by category
   */
  async getCommoditiesByCategory(categoryId) {
    try {
      const response = await apiClient.get(`/commodities/category/${categoryId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch commodities');
    }
  },

  /**
   * Get sectors
   */
  async getSectors() {
    try {
      const response = await apiClient.get('/sectors');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch sectors');
    }
  },

  /**
   * Get barangays
   */
  async getBarangays() {
    try {
      const response = await apiClient.get('/barangays');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch barangays');
    }
  },

  // ========================================
  // COMPLETE RSBSA APPLICATION
  // ========================================

  /**
   * Submit complete RSBSA application
   * This method handles the entire application submission process
   */
  async submitCompleteApplication(applicationData) {
    try {
      const response = await apiClient.post('/rsbsa-applications/complete', applicationData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit complete application');
    }
  },

  /**
   * Get application status
   */
  async getApplicationStatus(applicationId) {
    try {
      const response = await apiClient.get(`/rsbsa-applications/${applicationId}/status`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch application status');
    }
  },

  // ========================================
  // DRAFT MANAGEMENT
  // ========================================

  /**
   * Save application draft
   */
  async saveDraft(draftData) {
    try {
      const response = await apiClient.post('/rsbsa-applications/draft', draftData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to save draft');
    }
  },

  /**
   * Get saved draft
   */
  async getDraft(userId) {
    try {
      const response = await apiClient.get(`/rsbsa-applications/draft/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch draft');
    }
  },

  // ========================================
  // TESTING AND UTILITY METHODS
  // ========================================

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const response = await apiClient.get('/health');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('API connection test failed:', error);
      return { success: false, error: error.message };
    }
  },

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Generate application reference code
   */
  generateReferenceCode() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RSBSA-${new Date().getFullYear()}-${timestamp}-${random}`;
  },

  /**
   * Validate RSBSA number format
   */
  validateRSBSANumber(rsbsaNumber) {
    // Basic validation - can be enhanced based on actual format
    if (!rsbsaNumber) return false;
    if (rsbsaNumber.length < 8) return false;
    return true;
  },

  /**
   * Calculate form completion percentage
   */
  calculateCompletion(formData) {
    const requiredFields = [
      'beneficiaryProfile.first_name',
      'beneficiaryProfile.last_name',
      'beneficiaryProfile.barangay',
      'beneficiaryProfile.contact_number',
      'beneficiaryProfile.birth_date',
      'beneficiaryProfile.civil_status',
      'farmProfile.livelihood_category_id',
      'farmParcels'
    ];

    let completedFields = 0;
    let totalFields = requiredFields.length;

    requiredFields.forEach(field => {
      if (field === 'farmParcels') {
        if (formData.farmParcels && formData.farmParcels.length > 0) {
          const firstParcel = formData.farmParcels[0];
          if (firstParcel.barangay && firstParcel.tenure_type && firstParcel.farm_area > 0) {
            completedFields++;
          }
        }
      } else {
        const fieldValue = field.split('.').reduce((obj, key) => obj?.[key], formData);
        if (fieldValue && (typeof fieldValue === 'string' ? fieldValue.trim() !== '' : true)) {
          completedFields++;
        }
      }
    });

    return Math.round((completedFields / totalFields) * 100);
  }
};

export default rsbsaService;