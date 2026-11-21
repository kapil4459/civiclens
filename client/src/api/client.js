import axios from 'axios';

// In dev, '/api' and '/uploads' are proxied by Vite to localhost:5000.
// In production builds, set VITE_API_URL to the deployed backend origin.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api',
  timeout: 120000, // AI analysis can take up to ~2 min with retries
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Network error. Please try again.';
    return Promise.reject(new Error(message));
  }
);

/**
 * Resolves backend-relative file URLs (e.g. /uploads/xyz.png) against the
 * API origin. Absolute URLs (Cloudinary) pass through unchanged.
 */
export const resolveFileUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url}`;
};

export default apiClient;
