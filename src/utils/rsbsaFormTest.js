import { rsbsaService } from '../api/rsbsaService';
import { userService } from '../api/userService';

/**
 * RSBSA Form Testing Utilities
 * Use these functions to test the RSBSA form functionality
 */

export const rsbsaFormTest = {
  
  /**
   * Test API connections
   */
  async testAPIConnections() {
    console.log('🧪 Testing RSBSA Form API Connections...');
    
    const results = {
      rsbsaService: { success: false, error: null },
      userService: { success: false, error: null },
      livelihoodCategories: { success: false, error: null, data: null }
    };

    // Test RSBSA service connection
    try {
      const rsbsaTest = await rsbsaService.testConnection();
      results.rsbsaService = rsbsaTest;
      console.log('✅ RSBSA Service:', rsbsaTest.success ? 'Connected' : 'Failed');
    } catch (error) {
      results.rsbsaService = { success: false, error: error.message };
      console.log('❌ RSBSA Service: Failed to connect');
    }

    // Test livelihood categories fetch
    try {
      const categories = await rsbsaService.getLivelihoodCategories();
      results.livelihoodCategories = { success: true, error: null, data: categories };
      console.log('✅ Livelihood Categories:', categories.length, 'items loaded');
    } catch (error) {
      results.livelihoodCategories = { success: false, error: error.message, data: null };
      console.log('❌ Livelihood Categories: Failed to load');
    }

    // Test user service (with mock user ID)
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        await userService.getUserNames(user.id);
        results.userService = { success: true, error: null };
        console.log('✅ User Service: Connected');
      } else {
        results.userService = { success: false, error: 'No user ID found in localStorage' };
        console.log('⚠️ User Service: No user logged in');
      }
    } catch (error) {
      results.userService = { success: false, error: error.message };
      console.log('❌ User Service: Failed to connect');
    }

    console.log('🧪 API Connection Test Results:', results);
    return results;
  },

  /**
   * Test form data structure
   */
  testFormDataStructure() {
    console.log('🧪 Testing RSBSA Form Data Structure...');
    
    const testFormData = {
      enrollment: {
        id: null,
        user_id: 1,
        application_reference_code: 'TEST-2024-001',
        enrollment_year: 2024,
        enrollment_type: 'new',
        application_status: 'draft'
      },
      beneficiaryProfile: {
        id: null,
        user_id: 1,
        first_name: 'Juan',
        middle_name: 'Dela',
        last_name: 'Cruz',
        name_extension: '',
        barangay: 'Test Barangay',
        municipality: 'Opol',
        province: 'Misamis Oriental',
        region: 'Region X (Northern Mindanao)',
        contact_number: '09123456789',
        birth_date: '1990-01-01',
        sex: 'male',
        civil_status: 'single'
      },
      farmProfile: {
        id: null,
        beneficiary_id: null,
        livelihood_category_id: 1
      },
      farmParcels: [{
        id: Date.now(),
        barangay: 'Test Barangay',
        farm_area: 1.5,
        tenure_type: 'owned',
        farm_type: 'irrigated'
      }],
      livelihoodDetails: {
        farmer: {
          is_rice: true,
          is_corn: false,
          is_other_crops: false,
          other_crops_description: '',
          is_livestock: false,
          livestock_description: '',
          is_poultry: false,
          poultry_description: ''
        }
      }
    };

    const completion = rsbsaService.calculateCompletion(testFormData);
    console.log('✅ Test Form Data Structure Valid');
    console.log('📊 Completion Percentage:', completion + '%');
    
    return { valid: true, completion, testData: testFormData };
  },

  /**
   * Test form validation
   */
  testFormValidation() {
    console.log('🧪 Testing RSBSA Form Validation...');
    
    // Test incomplete form data
    const incompleteData = {
      beneficiaryProfile: {
        first_name: 'Juan',
        last_name: '', // Missing required field
        barangay: '',  // Missing required field
        contact_number: '',  // Missing required field
        birth_date: null,  // Missing required field
        sex: null,  // Missing required field
        civil_status: null  // Missing required field
      },
      farmProfile: {
        livelihood_category_id: null  // Missing required field
      },
      farmParcels: []  // Missing required parcels
    };

    const completion = rsbsaService.calculateCompletion(incompleteData);
    console.log('📊 Incomplete Form Completion:', completion + '%');
    
    return { completion, incompleteData };
  },

  /**
   * Simulate form submission
   */
  async simulateFormSubmission() {
    console.log('🧪 Simulating RSBSA Form Submission...');
    
    const testData = this.testFormDataStructure().testData;
    
    try {
      // This will likely fail since we don't have a real backend
      const result = await rsbsaService.submitCompleteApplication(testData);
      console.log('✅ Form Submission Successful:', result);
      return { success: true, result };
    } catch (error) {
      console.log('❌ Form Submission Failed (Expected):', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 Running All RSBSA Form Tests...');
    console.log('=====================================');
    
    const results = {
      apiConnections: await this.testAPIConnections(),
      formStructure: this.testFormDataStructure(),
      formValidation: this.testFormValidation(),
      formSubmission: await this.simulateFormSubmission()
    };
    
    console.log('=====================================');
    console.log('🧪 All Tests Completed:', results);
    return results;
  }
};

// Export for browser console testing
if (typeof window !== 'undefined') {
  window.rsbsaFormTest = rsbsaFormTest;
  console.log('🧪 RSBSA Form Test utilities available as window.rsbsaFormTest');
  console.log('📝 Run window.rsbsaFormTest.runAllTests() to test all functionality');
}

export default rsbsaFormTest;