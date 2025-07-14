import axios from 'axios';
import Cookies from 'js-cookie';
import { config } from '../config/env';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  Dataset, 
  Dashboard, 
  ApiResponse 
} from '../types';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    Cookies.remove('auth_token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const datasetApi = {
  getAll: async (): Promise<Dataset[]> => {
    const response = await api.get<ApiResponse<Dataset[]>>('/api/datasets');
    return response.data.data;
  },

  getById: async (id: number): Promise<Dataset> => {
    const response = await api.get<ApiResponse<Dataset>>(`/api/datasets/${id}`);
    return response.data.data;
  },

  create: async (name: string, data: any[]): Promise<Dataset> => {
    const response = await api.post<ApiResponse<Dataset>>('/api/datasets', { name, data });
    return response.data.data;
  },

  uploadFile: async (file: File): Promise<Dataset> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<ApiResponse<Dataset>>('/api/datasets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/datasets/${id}`);
  },
};

export const dashboardApi = {
  getAll: async (): Promise<Dashboard[]> => {
    const response = await api.get<ApiResponse<Dashboard[]>>('/api/dashboards');
    return response.data.data;
  },

  getById: async (id: number): Promise<Dashboard> => {
    const response = await api.get<ApiResponse<Dashboard>>(`/api/dashboards/${id}`);
    return response.data.data;
  },

  getPublic: async (publicId: string): Promise<Dashboard> => {
    const response = await api.get<ApiResponse<Dashboard>>(`/api/dashboards/public/${publicId}`);
    return response.data.data;
  },

  create: async (dashboard: Partial<Dashboard>): Promise<Dashboard> => {
    const response = await api.post<ApiResponse<Dashboard>>('/api/dashboards', dashboard);
    return response.data.data;
  },

  update: async (id: number, dashboard: Partial<Dashboard>): Promise<Dashboard> => {
    const response = await api.put<ApiResponse<Dashboard>>(`/api/dashboards/${id}`, dashboard);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/dashboards/${id}`);
  },

  share: async (id: number): Promise<{ publicId: string }> => {
    const response = await api.post<ApiResponse<{ publicId: string }>>(`/api/dashboards/${id}/share`);
    return response.data.data;
  },

  unshare: async (id: number): Promise<void> => {
    await api.post(`/api/dashboards/${id}/unshare`);
  },
};

export default api;