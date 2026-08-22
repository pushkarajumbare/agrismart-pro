/**
 * AgriSmart Pro - Centralized API Configuration
 * Automatically uses environment variable REACT_APP_API_URL or defaults to production Render backend
 */

export const API_BASE_URL = 
  process.env.REACT_APP_API_URL || 'https://agrismart-pro-3.onrender.com';

export const PYTHON_AI_BASE_URL = 
  process.env.REACT_APP_PYTHON_API_URL || 'https://agrismart-pro-2.onrender.com';

const apiConfig = {
  API_BASE_URL,
  PYTHON_AI_BASE_URL,
};

export default apiConfig;
