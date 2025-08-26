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
 * User Service - Handles user-related API operations
 */
export const userService = {
  /**
   * Get current user data
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user data');
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user data');
    }
  },

  /**
   * Update user profile
   */
  async updateUserProfile(userId, userData) {
    try {
      const response = await apiClient.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user profile');
    }
  },

  /**
   * Get user names only (for display purposes)
   */
  async getUserNames(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}/names`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user names:', error);
      // Fallback: try to get from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id === userId && (user.first_name || user.last_name)) {
        return {
          first_name: user.first_name || '',
          middle_name: user.middle_name || '',
          last_name: user.last_name || '',
          name_extension: user.name_extension || ''
        };
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch user names');
    }
  }
};

export default userService;