import apiClient from './client';

export const getHealth = () => apiClient.get('/health');

export const getComplaints = (params = {}) =>
  apiClient.get('/complaints', { params });

export const getComplaintStats = () => apiClient.get('/complaints/stats');

export const getComplaint = (id) => apiClient.get(`/complaints/${id}`);

export const submitComplaint = (formData) =>
  apiClient.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000, // AI analysis can take up to ~2 min with retries
  });
