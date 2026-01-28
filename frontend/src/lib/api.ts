import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  AuthResponse,
  User,
  PreLead,
  Lead,
  Customer,
  Contact,
  Activity,
  SalesTarget,
  WebhookConfig,
  WebhookLog,
  DashboardStats,
  PaginatedResponse,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Token Management
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  }

  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    this.setToken(response.data.access_token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async register(data: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role?: string;
  }): Promise<User> {
    const response = await this.client.post<User>('/auth/register', data);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/users/me');
    return response.data;
  }

  logout(): void {
    this.clearToken();
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get<DashboardStats>('/dashboard/stats');
    return response.data;
  }

  // Pre-Leads
  async getPreLeads(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    source?: string;
  }): Promise<PaginatedResponse<PreLead>> {
    const response = await this.client.get<PaginatedResponse<PreLead>>('/pre-leads', { params });
    return response.data;
  }

  async getPreLead(id: number): Promise<PreLead> {
    const response = await this.client.get<PreLead>(`/pre-leads/${id}`);
    return response.data;
  }

  async createPreLead(data: Partial<PreLead>): Promise<PreLead> {
    const response = await this.client.post<PreLead>('/pre-leads', data);
    return response.data;
  }

  async updatePreLead(id: number, data: Partial<PreLead>): Promise<PreLead> {
    const response = await this.client.put<PreLead>(`/pre-leads/${id}`, data);
    return response.data;
  }

  async validatePreLead(
    id: number,
    data: { priority?: string; expected_value?: number; notes?: string }
  ): Promise<{ message: string; lead_id: number }> {
    const response = await this.client.post(`/pre-leads/${id}/validate`, data);
    return response.data;
  }

  async discardPreLead(id: number, discard_reason: string): Promise<PreLead> {
    const response = await this.client.post<PreLead>(`/pre-leads/${id}/discard`, {
      discard_reason,
    });
    return response.data;
  }

  async deletePreLead(id: number): Promise<void> {
    await this.client.delete(`/pre-leads/${id}`);
  }

  // Leads
  async getLeads(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    source?: string;
    priority?: string;
    pipeline_stage?: number;
  }): Promise<PaginatedResponse<Lead>> {
    const response = await this.client.get<PaginatedResponse<Lead>>('/leads', { params });
    return response.data;
  }

  async getLead(id: number): Promise<Lead> {
    const response = await this.client.get<Lead>(`/leads/${id}`);
    return response.data;
  }

  async createLead(data: Partial<Lead>): Promise<Lead> {
    const response = await this.client.post<Lead>('/leads', data);
    return response.data;
  }

  async updateLead(id: number, data: Partial<Lead>): Promise<Lead> {
    const response = await this.client.put<Lead>(`/leads/${id}`, data);
    return response.data;
  }

  async convertLead(
    id: number,
    data: { customer_code?: string; customer_type?: string; notes?: string }
  ): Promise<{ message: string; customer_id: number; customer_code: string }> {
    const response = await this.client.post(`/leads/${id}/convert`, data);
    return response.data;
  }

  async discardLead(id: number, loss_reason: string): Promise<Lead> {
    const response = await this.client.post<Lead>(`/leads/${id}/discard`, { loss_reason });
    return response.data;
  }

  async updateLeadStage(id: number, stage: number): Promise<Lead> {
    const response = await this.client.put<Lead>(`/leads/${id}/stage`, null, {
      params: { stage },
    });
    return response.data;
  }

  async deleteLead(id: number): Promise<void> {
    await this.client.delete(`/leads/${id}`);
  }

  // Customers
  async getCustomers(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    customer_type?: string;
  }): Promise<PaginatedResponse<Customer>> {
    const response = await this.client.get<PaginatedResponse<Customer>>('/customers', { params });
    return response.data;
  }

  async getCustomer(id: number): Promise<Customer> {
    const response = await this.client.get<Customer>(`/customers/${id}`);
    return response.data;
  }

  async updateCustomer(id: number, data: Partial<Customer>): Promise<Customer> {
    const response = await this.client.put<Customer>(`/customers/${id}`, data);
    return response.data;
  }

  // Contacts
  async getContacts(params?: {
    page?: number;
    lead_id?: number;
    customer_id?: number;
  }): Promise<PaginatedResponse<Contact>> {
    const response = await this.client.get<PaginatedResponse<Contact>>('/contacts', { params });
    return response.data;
  }

  async getLeadContacts(leadId: number): Promise<Contact[]> {
    const response = await this.client.get<Contact[]>(`/contacts/lead/${leadId}`);
    return response.data;
  }

  async getCustomerContacts(customerId: number): Promise<Contact[]> {
    const response = await this.client.get<Contact[]>(`/contacts/customer/${customerId}`);
    return response.data;
  }

  async createContact(data: Partial<Contact>): Promise<Contact> {
    const response = await this.client.post<Contact>('/contacts', data);
    return response.data;
  }

  async updateContact(id: number, data: Partial<Contact>): Promise<Contact> {
    const response = await this.client.put<Contact>(`/contacts/${id}`, data);
    return response.data;
  }

  async deleteContact(id: number): Promise<void> {
    await this.client.delete(`/contacts/${id}`);
  }

  // Activities
  async getActivities(params?: {
    page?: number;
    lead_id?: number;
    customer_id?: number;
    activity_type?: string;
  }): Promise<PaginatedResponse<Activity>> {
    const response = await this.client.get<PaginatedResponse<Activity>>('/activities', { params });
    return response.data;
  }

  async getLeadActivities(leadId: number): Promise<Activity[]> {
    const response = await this.client.get<Activity[]>(`/activities/lead/${leadId}`);
    return response.data;
  }

  async getCustomerActivities(customerId: number): Promise<Activity[]> {
    const response = await this.client.get<Activity[]>(`/activities/customer/${customerId}`);
    return response.data;
  }

  async createActivity(data: Partial<Activity>): Promise<Activity> {
    const response = await this.client.post<Activity>('/activities', data);
    return response.data;
  }

  async completeActivity(id: number, outcome?: string): Promise<Activity> {
    const response = await this.client.post<Activity>(`/activities/${id}/complete`, null, {
      params: { outcome },
    });
    return response.data;
  }

  // Sales Targets
  async getSalesTargets(params?: {
    page?: number;
    user_id?: number;
    active_only?: boolean;
  }): Promise<PaginatedResponse<SalesTarget>> {
    const response = await this.client.get<PaginatedResponse<SalesTarget>>('/sales-targets', {
      params,
    });
    return response.data;
  }

  async getMyTargets(): Promise<SalesTarget[]> {
    const response = await this.client.get<SalesTarget[]>('/sales-targets/my-targets');
    return response.data;
  }

  async createSalesTarget(data: Partial<SalesTarget>): Promise<SalesTarget> {
    const response = await this.client.post<SalesTarget>('/sales-targets', data);
    return response.data;
  }

  async updateSalesTarget(id: number, data: Partial<SalesTarget>): Promise<SalesTarget> {
    const response = await this.client.put<SalesTarget>(`/sales-targets/${id}`, data);
    return response.data;
  }

  // Webhooks
  async getWebhookConfigs(params?: {
    page?: number;
    direction?: string;
  }): Promise<PaginatedResponse<WebhookConfig>> {
    const response = await this.client.get<PaginatedResponse<WebhookConfig>>('/webhooks/configs', {
      params,
    });
    return response.data;
  }

  async createWebhookConfig(data: Partial<WebhookConfig>): Promise<WebhookConfig> {
    const response = await this.client.post<WebhookConfig>('/webhooks/configs', data);
    return response.data;
  }

  async updateWebhookConfig(id: number, data: Partial<WebhookConfig>): Promise<WebhookConfig> {
    const response = await this.client.put<WebhookConfig>(`/webhooks/configs/${id}`, data);
    return response.data;
  }

  async deleteWebhookConfig(id: number): Promise<void> {
    await this.client.delete(`/webhooks/configs/${id}`);
  }

  async getWebhookLogs(params?: {
    page?: number;
    direction?: string;
    is_successful?: boolean;
  }): Promise<PaginatedResponse<WebhookLog>> {
    const response = await this.client.get<PaginatedResponse<WebhookLog>>('/webhooks/logs', {
      params,
    });
    return response.data;
  }

  // Marketing
  async sendBulkEmail(data: {
    subject: string;
    body: string;
    recipient_type: string;
    recipient_ids?: number[];
  }): Promise<{ total_recipients: number; queued: number; message: string }> {
    const response = await this.client.post('/marketing/bulk-email', data);
    return response.data;
  }

  async previewEmailRecipients(params: {
    recipient_type: string;
    status?: string;
  }): Promise<{ total_count: number; sample: any[] }> {
    const response = await this.client.get('/marketing/bulk-email/preview', { params });
    return response.data;
  }

  async sendWhatsAppMessages(data: {
    template_name: string;
    recipient_type: string;
    recipient_ids?: number[];
  }): Promise<{ total_recipients: number; queued: number; message: string }> {
    const response = await this.client.post('/marketing/whatsapp', data);
    return response.data;
  }

  async getWhatsAppTemplates(): Promise<{ templates: any[] }> {
    const response = await this.client.get('/marketing/whatsapp/templates');
    return response.data;
  }
}

export const api = new ApiService();
export default api;
