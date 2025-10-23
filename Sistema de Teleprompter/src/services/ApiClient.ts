/**
 * ApiClient - Cliente HTTP para comunicación con Backend
 * 
 * Cliente centralizado para todas las peticiones al API REST.
 * Maneja JWT tokens, refresh automático, y retry logic.
 * 
 * @version 1.0.0
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// ============================================================================
// TIPOS
// ============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'Producer' | 'Operator';
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Producer' | 'Operator' | 'Admin';
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface Script {
  _id: string;
  title: string;
  content: string;
  category: string;
  status: 'Borrador' | 'Revisión' | 'Aprobado' | 'En Uso' | 'Archivado';
  priority: 'Alta' | 'Media' | 'Baja';
  duration: number;
  fontSize?: number;
  scrollSpeed?: number;
  producerNotes?: string;
  tags?: string[];
  timesUsed?: number;
  lastUsedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Configuration {
  _id: string;
  userId: string;
  scrollSpeed: number;
  fontSize: number;
  backgroundColor?: string;
  textColor?: string;
  guidelinePosition?: number;
  guidelineColor?: string;
  guidelineThickness?: number;
  guidelineVisible?: boolean;
  autoAdvance?: boolean;
  theme?: 'Light' | 'Dark';
  createdAt: Date;
  updatedAt: Date;
}

export interface RunOrder {
  _id: string;
  userId: string;
  name: string;
  isActive: boolean;
  items: RunOrderItem[];
  totalDuration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RunOrderItem {
  scriptId: string | Script;
  position: number;
  isCompleted?: boolean;
  startedAt?: Date;
  completedAt?: Date;
}

export interface Macro {
  _id: string;
  userId: string;
  key: string;
  action: string;
  description?: string;
  isActive: boolean;
  params?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Cargar tokens desde localStorage
    this.loadTokens();

    // Interceptor para agregar JWT a cada request
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para manejar 401 (Unauthorized) y refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Si ya está refrescando, poner en cola
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newAccessToken = await this.refreshAccessToken();
            this.accessToken = newAccessToken;
            this.saveTokens();

            // Resolver todas las peticiones en cola
            this.failedQueue.forEach((prom) => prom.resolve(newAccessToken));
            this.failedQueue = [];

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            this.failedQueue.forEach((prom) => prom.reject(refreshError));
            this.failedQueue = [];
            this.clearTokens();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ===== GESTIÓN DE TOKENS =====

  private loadTokens() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  private saveTokens() {
    if (this.accessToken) {
      localStorage.setItem('accessToken', this.accessToken);
    }
    if (this.refreshToken) {
      localStorage.setItem('refreshToken', this.refreshToken);
    }
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      `${this.client.defaults.baseURL?.replace('/api', '')}/api/auth/refresh`,
      { refreshToken: this.refreshToken }
    );

    return response.data.accessToken;
  }

  // ===== AUTENTICACIÓN =====

  async login(credentials: LoginCredentials): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const response = await this.client.post('/auth/login', credentials);
    this.accessToken = response.data.accessToken;
    this.refreshToken = response.data.refreshToken;
    this.saveTokens();
    return response.data;
  }

  async register(data: RegisterData): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const response = await this.client.post('/auth/register', data);
    this.accessToken = response.data.accessToken;
    this.refreshToken = response.data.refreshToken;
    this.saveTokens();
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  async getMe(): Promise<User> {
    const response = await this.client.get('/auth/me');
    return response.data.user;
  }

  // ===== SCRIPTS =====

  async getScripts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    priority?: string;
  }): Promise<{ scripts: Script[]; pagination: any }> {
    const response = await this.client.get('/scripts', { params });
    return response.data;
  }

  async getScript(id: string): Promise<Script> {
    const response = await this.client.get(`/scripts/${id}`);
    return response.data.script;
  }

  async createScript(data: Partial<Script>): Promise<Script> {
    const response = await this.client.post('/scripts', data);
    return response.data.script;
  }

  async updateScript(id: string, data: Partial<Script>): Promise<Script> {
    const response = await this.client.put(`/scripts/${id}`, data);
    return response.data.script;
  }

  async deleteScript(id: string): Promise<void> {
    await this.client.delete(`/scripts/${id}`);
  }

  async duplicateScript(id: string): Promise<Script> {
    const response = await this.client.post(`/scripts/${id}/duplicate`);
    return response.data.script;
  }

  async searchScripts(query: string): Promise<Script[]> {
    const response = await this.client.get('/scripts/search', { params: { q: query } });
    return response.data.scripts;
  }

  // ===== RUN ORDERS =====

  async getRunOrders(params?: { page?: number; limit?: number; isActive?: boolean }): Promise<{ runorders: RunOrder[]; pagination: any }> {
    const response = await this.client.get('/runorders', { params });
    return response.data;
  }

  async getRunOrder(id: string): Promise<RunOrder> {
    const response = await this.client.get(`/runorders/${id}`);
    return response.data.runorder;
  }

  async createRunOrder(data: { name: string; isActive?: boolean }): Promise<RunOrder> {
    const response = await this.client.post('/runorders', data);
    return response.data.runorder;
  }

  async updateRunOrder(id: string, data: Partial<RunOrder>): Promise<RunOrder> {
    const response = await this.client.put(`/runorders/${id}`, data);
    return response.data.runorder;
  }

  async deleteRunOrder(id: string): Promise<void> {
    await this.client.delete(`/runorders/${id}`);
  }

  async addItemToRunOrder(runOrderId: string, scriptId: string, position?: number): Promise<RunOrder> {
    const response = await this.client.post(`/runorders/${runOrderId}/items`, { scriptId, position });
    return response.data.runorder;
  }

  async removeItemFromRunOrder(runOrderId: string, itemId: string): Promise<RunOrder> {
    const response = await this.client.delete(`/runorders/${runOrderId}/items/${itemId}`);
    return response.data.runorder;
  }

  async activateRunOrder(id: string): Promise<RunOrder> {
    const response = await this.client.put(`/runorders/${id}/activate`);
    return response.data.runorder;
  }

  // ===== CONFIGURACIÓN =====

  async getConfig(): Promise<Configuration> {
    const response = await this.client.get('/config');
    return response.data.config;
  }

  async updateConfig(data: Partial<Configuration>): Promise<Configuration> {
    const response = await this.client.put('/config', data);
    return response.data.config;
  }

  async resetConfig(): Promise<Configuration> {
    const response = await this.client.post('/config/reset');
    return response.data.config;
  }

  // ===== MACROS =====

  async getMacros(params?: { isActive?: boolean }): Promise<Macro[]> {
    const response = await this.client.get('/macros', { params });
    return response.data.macros;
  }

  async updateMacro(id: string, data: Partial<Macro>): Promise<Macro> {
    const response = await this.client.put(`/macros/${id}`, data);
    return response.data.macro;
  }

  async toggleMacro(id: string): Promise<Macro> {
    const response = await this.client.put(`/macros/${id}/toggle`);
    return response.data.macro;
  }

  async resetMacros(): Promise<Macro[]> {
    const response = await this.client.post('/macros/reset');
    return response.data.macros;
  }

  // ===== UTILIDADES =====

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const apiClient = new ApiClient();

// Exponer en window para debugging en desarrollo
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).__API_CLIENT__ = apiClient;
  console.log('🔧 ApiClient expuesto en window.__API_CLIENT__ para debugging');
}
