import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach Authorization header if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sih_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (username: string, password: string) => api.post('/auth/login', { username, password }),
  getMe: () => api.get('/auth/me'),
};

export const assetsApi = {
  getAssets: (params?: any) => api.get('/assets', { params }),
  getAssetById: (id: string) => api.get(`/assets/${id}`),
  reportDefect: (assetId: string, defectData: any) => api.post(`/assets/${assetId}/defects`, defectData),
};

export const tasksApi = {
  getTasks: (params?: any) => api.get('/tasks', { params }),
  createTask: (taskData: any) => api.post('/tasks', taskData),
  updateTask: (id: string, patchData: any) => api.patch(`/tasks/${id}`, patchData),
};

export const trafficApi = {
  getTimetable: (params?: any) => api.get('/traffic/timetable', { params }),
  getFreightForecast: (params?: any) => api.get('/traffic/freight-forecast', { params }),
  getCorridors: () => api.get('/traffic/corridors'),
  getCorridorAvailabilities: (params?: any) => api.get('/traffic/corridor-availabilities', { params }),
};

export const optimizationApi = {
  detectConflicts: () => api.post('/optimization/detect-conflicts'),
  generatePlan: (data: any) => api.post('/optimization/generate-plan', data),
  getWeights: () => api.get('/optimization/weights'),
  updateWeights: (weights: any) => api.put('/optimization/weights', weights),
  simulate: (payload: any) => api.post('/optimization/simulate', payload),
};

export const plansApi = {
  getPlans: () => api.get('/plans'),
  getPlanById: (id: string) => api.get(`/plans/${id}`),
  modifyBlock: (planId: string, blockId: string, data: any) => api.patch(`/plans/${planId}/blocks/${blockId}`, data),
  approvePlan: (id: string) => api.post(`/plans/${id}/approve`),
  rejectPlan: (id: string) => api.post(`/plans/${id}/reject`),
};

export const syntheticApi = {
  seed: () => api.post('/synthetic/seed'),
  getStatus: () => api.get('/synthetic/status'),
};

export const analyticsApi = {
  getDashboardData: () => api.get('/analytics/dashboard'),
};

export const reportsApi = {
  getSummary: (params?: any) => api.get('/reports/plan-summary', { params }),
  getExportCsvUrl: (planId: string) => `${API_BASE_URL}/reports/plan-summary?planId=${planId}&format=csv`,
};

export const auditApi = {
  getLogs: () => api.get('/audit'),
};

export default api;
