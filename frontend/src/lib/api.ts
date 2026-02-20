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

  async getUsers(params?: { skip?: number; limit?: number; role?: string; is_active?: boolean }): Promise<User[]> {
    const response = await this.client.get<User[]>('/users', { params });
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
    status?: number;  // 0 = active, 1 = discarded
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

  // Pre-Lead Full (with all entities)
  async getPreLeadFull(id: number): Promise<any> {
    const response = await this.client.get(`/pre-leads/${id}/full`);
    return response.data;
  }

  // Pre-Lead Contacts
  async getPreLeadContacts(preLeadId: number): Promise<any[]> {
    const response = await this.client.get(`/pre-leads/${preLeadId}/contacts`);
    return response.data;
  }

  async createPreLeadContact(preLeadId: number, data: any): Promise<any> {
    const response = await this.client.post(`/pre-leads/${preLeadId}/contacts`, { ...data, pre_lead_id: preLeadId });
    return response.data;
  }

  async updatePreLeadContact(preLeadId: number, contactId: number, data: any): Promise<any> {
    const response = await this.client.put(`/pre-leads/${preLeadId}/contacts/${contactId}`, data);
    return response.data;
  }

  async deletePreLeadContact(preLeadId: number, contactId: number): Promise<void> {
    await this.client.delete(`/pre-leads/${preLeadId}/contacts/${contactId}`);
  }

  // Pre-Lead Activities
  async getPreLeadActivities(preLeadId: number): Promise<any[]> {
    const response = await this.client.get(`/pre-leads/${preLeadId}/activities`);
    return response.data;
  }

  async createPreLeadActivity(preLeadId: number, data: any): Promise<any> {
    const response = await this.client.post(`/pre-leads/${preLeadId}/activities`, { ...data, pre_lead_id: preLeadId });
    return response.data;
  }

  async updatePreLeadActivity(preLeadId: number, activityId: number, data: any): Promise<any> {
    const response = await this.client.put(`/pre-leads/${preLeadId}/activities/${activityId}`, data);
    return response.data;
  }

  async deletePreLeadActivity(preLeadId: number, activityId: number): Promise<void> {
    await this.client.delete(`/pre-leads/${preLeadId}/activities/${activityId}`);
  }

  // Pre-Lead Memos
  async getPreLeadMemos(preLeadId: number): Promise<any[]> {
    const response = await this.client.get(`/pre-leads/${preLeadId}/memos`);
    return response.data;
  }

  async createPreLeadMemo(preLeadId: number, data: any): Promise<any> {
    const response = await this.client.post(`/pre-leads/${preLeadId}/memos`, { ...data, pre_lead_id: preLeadId });
    return response.data;
  }

  async updatePreLeadMemo(preLeadId: number, memoId: number, data: any): Promise<any> {
    const response = await this.client.put(`/pre-leads/${preLeadId}/memos/${memoId}`, data);
    return response.data;
  }

  async deletePreLeadMemo(preLeadId: number, memoId: number): Promise<void> {
    await this.client.delete(`/pre-leads/${preLeadId}/memos/${memoId}`);
  }

  // Pre-Lead Documents
  async getPreLeadDocuments(preLeadId: number): Promise<any[]> {
    const response = await this.client.get(`/pre-leads/${preLeadId}/documents`);
    return response.data;
  }

  async uploadPreLeadDocument(preLeadId: number, file: File, notes?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (notes) {
      formData.append('notes', notes);
    }
    const response = await this.client.post(`/pre-leads/${preLeadId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deletePreLeadDocument(preLeadId: number, documentId: number): Promise<void> {
    await this.client.delete(`/pre-leads/${preLeadId}/documents/${documentId}`);
  }

  // Pre-Lead Status History
  async getPreLeadStatusHistory(preLeadId: number): Promise<any[]> {
    const response = await this.client.get(`/pre-leads/${preLeadId}/status-history`);
    return response.data;
  }

  async changePreLeadStatus(preLeadId: number, data: { status: string; status_date?: string; remarks?: string }): Promise<any> {
    const response = await this.client.post(`/pre-leads/${preLeadId}/status`, { ...data, pre_lead_id: preLeadId });
    return response.data;
  }

  // Pre-Lead Qualified Profiles
  async getPreLeadQualifiedProfiles(preLeadId: number): Promise<any[]> {
    const response = await this.client.get(`/pre-leads/${preLeadId}/qualified-profiles`);
    return response.data;
  }

  async createPreLeadQualifiedProfile(preLeadId: number, data: any): Promise<any> {
    const response = await this.client.post(`/pre-leads/${preLeadId}/qualified-profiles`, { ...data, pre_lead_id: preLeadId });
    return response.data;
  }

  async updatePreLeadQualifiedProfile(preLeadId: number, profileId: number, data: any): Promise<any> {
    const response = await this.client.put(`/pre-leads/${preLeadId}/qualified-profiles/${profileId}`, data);
    return response.data;
  }

  async deletePreLeadQualifiedProfile(preLeadId: number, profileId: number): Promise<void> {
    await this.client.delete(`/pre-leads/${preLeadId}/qualified-profiles/${profileId}`);
  }

  // Leads
  async getLeads(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: number;  // 0 = active, 1 = discarded
    lead_status?: string;  // new, contacted, qualified, proposal_sent, negotiation, won, lost
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

  // Lead Full (with all entities)
  async getLeadFull(id: number): Promise<any> {
    const response = await this.client.get(`/leads/${id}/full`);
    return response.data;
  }

  // Lead Contacts
  async getAllLeadContacts(params?: { search?: string; contact_type?: string; skip?: number; limit?: number }): Promise<any[]> {
    const response = await this.client.get('/leads/all-contacts', { params });
    return response.data;
  }

  async getLeadContactsForEdit(leadId: number): Promise<any[]> {
    const response = await this.client.get(`/leads/${leadId}/contacts`);
    return response.data;
  }

  async createLeadContact(leadId: number, data: any): Promise<any> {
    const response = await this.client.post(`/leads/${leadId}/contacts`, { ...data, lead_id: leadId });
    return response.data;
  }

  async updateLeadContact(leadId: number, contactId: number, data: any): Promise<any> {
    const response = await this.client.put(`/leads/${leadId}/contacts/${contactId}`, data);
    return response.data;
  }

  async deleteLeadContact(leadId: number, contactId: number): Promise<void> {
    await this.client.delete(`/leads/${leadId}/contacts/${contactId}`);
  }

  // Lead Activities
  async getAllLeadActivities(params?: { activity_type?: string; status?: string; assigned_to?: number; skip?: number; limit?: number }): Promise<any[]> {
    try {
      const response = await this.client.get('/leads/all-activities', { params });
      return response.data;
    } catch (err) {
      // Fallback: fetch all leads and their activities individually
      console.log('Falling back to fetching activities per lead');
      const leadsRes = await this.client.get('/leads', { params: { page_size: 100 } });
      const leads = leadsRes.data.items || [];
      const allActivities: any[] = [];

      for (const lead of leads) {
        try {
          const activitiesRes = await this.client.get(`/leads/${lead.id}/activities`);
          const activities = activitiesRes.data || [];
          activities.forEach((activity: any) => {
            allActivities.push({
              ...activity,
              company_name: lead.company_name,
              lead_status: lead.status,
            });
          });
        } catch (e) {
          console.error(`Failed to fetch activities for lead ${lead.id}:`, e);
        }
      }
      return allActivities;
    }
  }

  async getLeadActivitiesForEdit(leadId: number): Promise<any[]> {
    const response = await this.client.get(`/leads/${leadId}/activities`);
    return response.data;
  }

  async createLeadActivity(leadId: number, data: any): Promise<any> {
    const response = await this.client.post(`/leads/${leadId}/activities`, { ...data, lead_id: leadId });
    return response.data;
  }

  async updateLeadActivity(leadId: number, activityId: number, data: any): Promise<any> {
    const response = await this.client.put(`/leads/${leadId}/activities/${activityId}`, data);
    return response.data;
  }

  async deleteLeadActivity(leadId: number, activityId: number): Promise<void> {
    await this.client.delete(`/leads/${leadId}/activities/${activityId}`);
  }

  // Lead Memos
  async getLeadMemos(leadId: number): Promise<any[]> {
    const response = await this.client.get(`/leads/${leadId}/memos`);
    return response.data;
  }

  async createLeadMemo(leadId: number, data: any): Promise<any> {
    const response = await this.client.post(`/leads/${leadId}/memos`, { ...data, lead_id: leadId });
    return response.data;
  }

  async updateLeadMemo(leadId: number, memoId: number, data: any): Promise<any> {
    const response = await this.client.put(`/leads/${leadId}/memos/${memoId}`, data);
    return response.data;
  }

  async deleteLeadMemo(leadId: number, memoId: number): Promise<void> {
    await this.client.delete(`/leads/${leadId}/memos/${memoId}`);
  }

  // Lead Documents
  async getLeadDocuments(leadId: number): Promise<any[]> {
    const response = await this.client.get(`/leads/${leadId}/documents`);
    return response.data;
  }

  async uploadLeadDocument(leadId: number, file: File, notes?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (notes) {
      formData.append('notes', notes);
    }
    const response = await this.client.post(`/leads/${leadId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deleteLeadDocument(leadId: number, documentId: number): Promise<void> {
    await this.client.delete(`/leads/${leadId}/documents/${documentId}`);
  }

  // Lead Status History
  async getLeadStatusHistory(leadId: number): Promise<any[]> {
    const response = await this.client.get(`/leads/${leadId}/status-history`);
    return response.data;
  }

  async changeLeadStatus(leadId: number, data: { status: string; status_date?: string; remarks?: string }): Promise<any> {
    const response = await this.client.post(`/leads/${leadId}/status`, { ...data, lead_id: leadId });
    return response.data;
  }

  // Lead Qualified Profiles
  async getLeadQualifiedProfiles(leadId: number): Promise<any[]> {
    const response = await this.client.get(`/leads/${leadId}/qualified-profiles`);
    return response.data;
  }

  async createLeadQualifiedProfile(leadId: number, data: any): Promise<any> {
    const response = await this.client.post(`/leads/${leadId}/qualified-profiles`, { ...data, lead_id: leadId });
    return response.data;
  }

  async updateLeadQualifiedProfile(leadId: number, profileId: number, data: any): Promise<any> {
    const response = await this.client.put(`/leads/${leadId}/qualified-profiles/${profileId}`, data);
    return response.data;
  }

  async deleteLeadQualifiedProfile(leadId: number, profileId: number): Promise<void> {
    await this.client.delete(`/leads/${leadId}/qualified-profiles/${profileId}`);
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
    page_size?: number;
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
    page_size?: number;
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

  async deleteSalesTarget(id: number): Promise<void> {
    await this.client.delete(`/sales-targets/${id}`);
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

  // WhatsApp Marketing Advanced
  async sendWhatsAppAdvanced(data: {
    recipients: { number: string; lead_id: number; name: string; company: string }[];
    template_key: string;
    documents?: { link: string }[];
    custom_message?: string;
  }): Promise<{ status: string; message: string }> {
    const response = await this.client.post('/marketing/whatsapp/send', data);
    return response.data;
  }

  async getWhatsAppDocuments(): Promise<any[]> {
    const response = await this.client.get('/marketing/whatsapp/documents');
    return response.data;
  }

  async uploadWhatsAppDocument(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post('/marketing/whatsapp/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deleteWhatsAppDocument(docId: number): Promise<void> {
    await this.client.post('/marketing/whatsapp/documents/delete', { doc_id: docId });
  }

  async getWhatsAppSentMessages(): Promise<any[]> {
    const response = await this.client.get('/marketing/whatsapp/sent-messages');
    return response.data;
  }

  async getWhatsAppReceivedMessages(): Promise<any[]> {
    const response = await this.client.get('/marketing/whatsapp/received-messages');
    return response.data;
  }

  async getWhatsAppConversation(phoneNumber: string): Promise<any[]> {
    const response = await this.client.get(`/marketing/whatsapp/conversation/${encodeURIComponent(phoneNumber)}`);
    return response.data;
  }

  async sendWhatsAppConversationMessage(phoneNumber: string, messageBody: string): Promise<any> {
    const response = await this.client.post('/marketing/whatsapp/conversation/send', {
      phone_number: phoneNumber,
      message_body: messageBody,
    });
    return response.data;
  }

  async getWhatsAppAuditLog(): Promise<any[]> {
    const response = await this.client.get('/marketing/whatsapp/audit-log');
    return response.data;
  }

  async getWhatsAppLeads(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    country_id?: number;
    state_id?: number;
    city_id?: number;
    group_id?: number;
    industry_id?: number;
    sales_rep?: number;
    lead_source?: string;
    lead_status?: string;
  }): Promise<any> {
    const response = await this.client.get('/marketing/whatsapp/leads', { params });
    return response.data;
  }

  async getLeadContactsForWhatsApp(leadId: number): Promise<{ contacts: any[] }> {
    const response = await this.client.get(`/marketing/whatsapp/lead/${leadId}/contacts`);
    return response.data;
  }

  // Advanced Bulk Email
  async sendBulkEmailAdvanced(data: {
    leads: { lead_id: number; contact_email: string; contact_name: string }[];
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
    attachment_ids?: number[];
    template_id?: string;
  }): Promise<{ total_recipients: number; queued: number; message: string }> {
    const response = await this.client.post('/marketing/bulk-email/advanced', data);
    return response.data;
  }

  async getBulkEmailDocuments(): Promise<any[]> {
    const response = await this.client.get('/marketing/bulk-email/documents');
    return response.data;
  }

  async uploadBulkEmailDocument(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post('/marketing/bulk-email/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deleteBulkEmailDocument(docId: number): Promise<void> {
    await this.client.delete(`/marketing/bulk-email/documents/${docId}`);
  }

  async getBulkEmailHistory(): Promise<any[]> {
    const response = await this.client.get('/marketing/bulk-email/history');
    return response.data;
  }

  // Customer Requirements
  async getCustomerRequirementByLead(leadId: number): Promise<any> {
    const response = await this.client.get(`/customer-requirements/lead/${leadId}`);
    return response.data;
  }

  async getCustomerRequirement(crId: number): Promise<any> {
    const response = await this.client.get(`/customer-requirements/${crId}`);
    return response.data;
  }

  async updateCustomerRequirement(crId: number, data: any): Promise<any> {
    const response = await this.client.put(`/customer-requirements/${crId}`, data);
    return response.data;
  }

  // CR Introduction
  async getCRIntroduction(crId: number): Promise<any> {
    const response = await this.client.get(`/customer-requirements/${crId}/introduction`);
    return response.data;
  }

  async updateCRIntroduction(crId: number, data: any): Promise<any> {
    const response = await this.client.put(`/customer-requirements/${crId}/introduction`, data);
    return response.data;
  }

  // CR Requirement
  async getCRRequirement(crId: number): Promise<any> {
    const response = await this.client.get(`/customer-requirements/${crId}/requirement`);
    return response.data;
  }

  async updateCRRequirement(crId: number, data: any): Promise<any> {
    const response = await this.client.put(`/customer-requirements/${crId}/requirement`, data);
    return response.data;
  }

  // CR Presentations
  async getCRPresentations(crId: number): Promise<any[]> {
    const response = await this.client.get(`/customer-requirements/${crId}/presentations`);
    return response.data;
  }

  async createCRPresentation(crId: number, data: any): Promise<any> {
    const response = await this.client.post(`/customer-requirements/${crId}/presentations`, data);
    return response.data;
  }

  async updateCRPresentation(crId: number, presId: number, data: any): Promise<any> {
    const response = await this.client.put(`/customer-requirements/${crId}/presentations/${presId}`, data);
    return response.data;
  }

  // CR Demos
  async getCRDemos(crId: number): Promise<any[]> {
    const response = await this.client.get(`/customer-requirements/${crId}/demos`);
    return response.data;
  }

  async createCRDemo(crId: number, data: any): Promise<any> {
    const response = await this.client.post(`/customer-requirements/${crId}/demos`, data);
    return response.data;
  }

  async updateCRDemo(crId: number, demoId: number, data: any): Promise<any> {
    const response = await this.client.put(`/customer-requirements/${crId}/demos/${demoId}`, data);
    return response.data;
  }

  // CR Proposals
  async getCRProposals(crId: number): Promise<any[]> {
    const response = await this.client.get(`/customer-requirements/${crId}/proposals`);
    return response.data;
  }

  async createCRProposal(crId: number, data: any): Promise<any> {
    const response = await this.client.post(`/customer-requirements/${crId}/proposals`, data);
    return response.data;
  }

  async updateCRProposal(crId: number, proposalId: number, data: any): Promise<any> {
    const response = await this.client.put(`/customer-requirements/${crId}/proposals/${proposalId}`, data);
    return response.data;
  }

  // CR Agreements
  async getCRAgreements(crId: number): Promise<any[]> {
    const response = await this.client.get(`/customer-requirements/${crId}/agreements`);
    return response.data;
  }

  async createCRAgreement(crId: number, data: any): Promise<any> {
    const response = await this.client.post(`/customer-requirements/${crId}/agreements`, data);
    return response.data;
  }

  async updateCRAgreement(crId: number, agreementId: number, data: any): Promise<any> {
    const response = await this.client.put(`/customer-requirements/${crId}/agreements/${agreementId}`, data);
    return response.data;
  }

  // CR Call Logs
  async getCRCallLogs(crId: number): Promise<any[]> {
    const response = await this.client.get(`/customer-requirements/${crId}/call-logs`);
    return response.data;
  }

  async createCRCallLog(crId: number, data: any): Promise<any> {
    const response = await this.client.post(`/customer-requirements/${crId}/call-logs`, data);
    return response.data;
  }

  async updateCRCallLog(crId: number, logId: number, data: any): Promise<any> {
    const response = await this.client.put(`/customer-requirements/${crId}/call-logs/${logId}`, data);
    return response.data;
  }

  // CR Documents
  async getCRDocuments(crId: number, tabName?: string): Promise<any[]> {
    const params = tabName ? { tab_name: tabName } : {};
    const response = await this.client.get(`/customer-requirements/${crId}/documents`, { params });
    return response.data;
  }

  async uploadCRDocument(crId: number, file: File, tabName: string, subTabName?: string, description?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tab_name', tabName);
    if (subTabName) formData.append('sub_tab_name', subTabName);
    if (description) formData.append('description', description);
    const response = await this.client.post(`/customer-requirements/${crId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deleteCRDocument(crId: number, docId: number): Promise<void> {
    await this.client.delete(`/customer-requirements/${crId}/documents/${docId}`);
  }

  // CR Activities
  async getCRActivities(crId: number, tabName?: string): Promise<any[]> {
    const params = tabName ? { tab_name: tabName } : {};
    const response = await this.client.get(`/customer-requirements/${crId}/activities`, { params });
    return response.data;
  }

  async createCRActivity(crId: number, data: any): Promise<any> {
    const response = await this.client.post(`/customer-requirements/${crId}/activities`, data);
    return response.data;
  }

  async updateCRActivity(crId: number, activityId: number, data: any): Promise<any> {
    const response = await this.client.put(`/customer-requirements/${crId}/activities/${activityId}`, data);
    return response.data;
  }

  async deleteCRActivity(crId: number, activityId: number): Promise<void> {
    await this.client.delete(`/customer-requirements/${crId}/activities/${activityId}`);
  }

  // CR Memos
  async getCRMemos(crId: number, tabName?: string): Promise<any[]> {
    const params = tabName ? { tab_name: tabName } : {};
    const response = await this.client.get(`/customer-requirements/${crId}/memos`, { params });
    return response.data;
  }

  async createCRMemo(crId: number, data: any): Promise<any> {
    const response = await this.client.post(`/customer-requirements/${crId}/memos`, data);
    return response.data;
  }

  async updateCRMemo(crId: number, memoId: number, data: any): Promise<any> {
    const response = await this.client.put(`/customer-requirements/${crId}/memos/${memoId}`, data);
    return response.data;
  }

  async deleteCRMemo(crId: number, memoId: number): Promise<void> {
    await this.client.delete(`/customer-requirements/${crId}/memos/${memoId}`);
  }

  // CR Contacts
  async getCRContacts(crId: number): Promise<any[]> {
    const response = await this.client.get(`/customer-requirements/${crId}/contacts`);
    return response.data;
  }

  // CR Email History
  async getCREmailHistory(crId: number, tabName?: string): Promise<any[]> {
    const params = tabName ? { tab_name: tabName } : {};
    const response = await this.client.get(`/customer-requirements/${crId}/emails`, { params });
    return response.data;
  }

  async getCREmailDetail(crId: number, emailId: number): Promise<any> {
    const response = await this.client.get(`/customer-requirements/${crId}/emails/${emailId}`);
    return response.data;
  }

  async sendCREmail(crId: number, data: {
    tab_name: string;
    template_id?: number;
    template_name?: string;
    to_email: string;
    cc_email?: string;
    bcc_email?: string;
    email_name?: string;
    subject: string;
    content: string;
    attachment_ids?: number[];
  }): Promise<any> {
    const response = await this.client.post(`/customer-requirements/${crId}/emails`, data);
    return response.data;
  }

  async deleteCREmail(crId: number, emailId: number): Promise<void> {
    await this.client.delete(`/customer-requirements/${crId}/emails/${emailId}`);
  }

  // CR Diligence Short Form (Pre-Demo Business Questionnaire)
  async getCRDiligenceShortForm(crId: number): Promise<any> {
    const response = await this.client.get(`/customer-requirements/${crId}/diligence-short-form`);
    return response.data;
  }

  async updateCRDiligenceShortForm(crId: number, data: any): Promise<any> {
    const response = await this.client.put(`/customer-requirements/${crId}/diligence-short-form`, data);
    return response.data;
  }

  async createCRDiligenceShortForm(crId: number, data: any): Promise<any> {
    const response = await this.client.post(`/customer-requirements/${crId}/diligence-short-form`, data);
    return response.data;
  }

  // CR Meeting Calendar (Meeting Date & Time)
  async getCRMeetingCalendar(crId: number): Promise<any> {
    const response = await this.client.get(`/customer-requirements/${crId}/meeting-calendar`);
    return response.data;
  }

  // PDF Generation
  async generateCRPDF(crId: number, tabName: string): Promise<void> {
    const response = await this.client.get(`/customer-requirements/${crId}/generate-pdf/${tabName}`, {
      responseType: 'blob'
    });
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CR_${crId}_${tabName}_${new Date().toISOString().slice(0,10)}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  // ============ Public Forms (no authentication required) ============

  async getPublicDiligenceForm(leadId: number): Promise<any> {
    const response = await this.client.get(`/public/forms/diligence/${leadId}`);
    return response.data;
  }

  async updatePublicDiligenceForm(leadId: number, data: any): Promise<any> {
    const response = await this.client.put(`/public/forms/diligence/${leadId}`, data);
    return response.data;
  }

  async getPublicCustomerRequirement(leadId: number): Promise<any> {
    const response = await this.client.get(`/public/forms/customer-requirement/${leadId}`);
    return response.data;
  }

  async getPublicMeetingCalendar(leadId: number): Promise<any> {
    const response = await this.client.get(`/public/forms/meeting-calendar/${leadId}`);
    return response.data;
  }

  async updatePublicMeetingCalendar(leadId: number, data: any): Promise<any> {
    const response = await this.client.put(`/public/forms/meeting-calendar/${leadId}`, data);
    return response.data;
  }

  // ============ Presentation Meeting (Public) ============
  async getPublicPresentationMeeting(leadId: number): Promise<any> {
    const response = await this.client.get(`/public/forms/presentation-meeting/${leadId}`);
    return response.data;
  }

  async updatePublicPresentationMeeting(leadId: number, data: any): Promise<any> {
    const response = await this.client.put(`/public/forms/presentation-meeting/${leadId}`, data);
    return response.data;
  }

  // ============ Option Master ============

  // Options (Categories)
  async getOptions(): Promise<any[]> {
    const response = await this.client.get('/options');
    return response.data;
  }

  async getOptionsWithDropdowns(): Promise<any[]> {
    const response = await this.client.get('/options/with-dropdowns');
    return response.data;
  }

  async getOption(optionId: number): Promise<any> {
    const response = await this.client.get(`/options/${optionId}`);
    return response.data;
  }

  async createOption(data: { title: string }): Promise<any> {
    const response = await this.client.post('/options', data);
    return response.data;
  }

  async updateOption(optionId: number, data: { title?: string }): Promise<any> {
    const response = await this.client.put(`/options/${optionId}`, data);
    return response.data;
  }

  async deleteOption(optionId: number): Promise<void> {
    await this.client.delete(`/options/${optionId}`);
  }

  // Option Dropdowns
  async getOptionDropdowns(optionId: number, status?: string): Promise<any[]> {
    const params = status ? { status } : {};
    const response = await this.client.get(`/options/${optionId}/dropdowns`, { params });
    return response.data;
  }

  async createOptionDropdown(optionId: number, data: {
    name: string;
    option_id: number;
    status?: string;
    default_value?: boolean;
    company_id?: number;
  }): Promise<any> {
    const response = await this.client.post(`/options/${optionId}/dropdowns`, data);
    return response.data;
  }

  async updateOptionDropdown(optionId: number, dropdownId: number, data: {
    name?: string;
    status?: string;
    default_value?: boolean;
    company_id?: number;
  }): Promise<any> {
    const response = await this.client.put(`/options/${optionId}/dropdowns/${dropdownId}`, data);
    return response.data;
  }

  async deleteOptionDropdown(optionId: number, dropdownId: number): Promise<void> {
    await this.client.delete(`/options/${optionId}/dropdowns/${dropdownId}`);
  }

  // Utility - Get dropdown values by option title
  async getDropdownValuesByTitle(optionTitle: string, activeOnly: boolean = true): Promise<any[]> {
    const response = await this.client.get(`/options/dropdown-values/${encodeURIComponent(optionTitle)}`, {
      params: { active_only: activeOnly }
    });
    return response.data;
  }

  async getOptionByTitle(title: string): Promise<any> {
    const response = await this.client.get(`/options/by-title/${encodeURIComponent(title)}`);
    return response.data;
  }

  // ============ Location (Countries, States, Cities) ============

  // Countries
  async getCountries(status?: string): Promise<any[]> {
    const params = status ? { status } : {};
    const response = await this.client.get('/location/countries', { params });
    return response.data;
  }

  async getCountry(countryId: number): Promise<any> {
    const response = await this.client.get(`/location/countries/${countryId}`);
    return response.data;
  }

  async createCountry(data: { name: string; code?: string; status?: string }): Promise<any> {
    const response = await this.client.post('/location/countries', data);
    return response.data;
  }

  async updateCountry(countryId: number, data: { name?: string; code?: string; status?: string }): Promise<any> {
    const response = await this.client.put(`/location/countries/${countryId}`, data);
    return response.data;
  }

  async deleteCountry(countryId: number): Promise<void> {
    await this.client.delete(`/location/countries/${countryId}`);
  }

  // States
  async getStates(countryId?: number, status?: string): Promise<any[]> {
    const params: any = {};
    if (countryId) params.country_id = countryId;
    if (status) params.status = status;
    const response = await this.client.get('/location/states', { params });
    return response.data;
  }

  async getState(stateId: number): Promise<any> {
    const response = await this.client.get(`/location/states/${stateId}`);
    return response.data;
  }

  async createState(data: { name: string; country_id: number; code?: string; status?: string }): Promise<any> {
    const response = await this.client.post('/location/states', data);
    return response.data;
  }

  async updateState(stateId: number, data: { name?: string; country_id?: number; code?: string; status?: string }): Promise<any> {
    const response = await this.client.put(`/location/states/${stateId}`, data);
    return response.data;
  }

  async deleteState(stateId: number): Promise<void> {
    await this.client.delete(`/location/states/${stateId}`);
  }

  // Cities
  async getCities(stateId?: number, status?: string): Promise<any[]> {
    const params: any = {};
    if (stateId) params.state_id = stateId;
    if (status) params.status = status;
    const response = await this.client.get('/location/cities', { params });
    return response.data;
  }

  async getCity(cityId: number): Promise<any> {
    const response = await this.client.get(`/location/cities/${cityId}`);
    return response.data;
  }

  async createCity(data: { name: string; state_id: number; status?: string }): Promise<any> {
    const response = await this.client.post('/location/cities', data);
    return response.data;
  }

  async updateCity(cityId: number, data: { name?: string; state_id?: number; status?: string }): Promise<any> {
    const response = await this.client.put(`/location/cities/${cityId}`, data);
    return response.data;
  }

  async deleteCity(cityId: number): Promise<void> {
    await this.client.delete(`/location/cities/${cityId}`);
  }

  // ============ CRI Email Templates ============

  async getCRIEmailTemplates(tab?: string, companyId?: number): Promise<any[]> {
    const params: any = {};
    if (tab) params.tab = tab;
    if (companyId) params.company_id = companyId;
    const response = await this.client.get('/cri-email-templates', { params });
    return response.data;
  }

  async getDistinctEmailFormats(): Promise<string[]> {
    const response = await this.client.get('/cri-email-templates/distinct-formats');
    return response.data;
  }

  async getEmailTemplatesByFormat(formatValue: string): Promise<any[]> {
    const response = await this.client.get(`/cri-email-templates/by-format/${encodeURIComponent(formatValue)}`);
    return response.data;
  }

  async getCRIEmailTemplate(templateId: number): Promise<any> {
    const response = await this.client.get(`/cri-email-templates/${templateId}`);
    return response.data;
  }

  async createCRIEmailTemplate(data: any): Promise<any> {
    const response = await this.client.post('/cri-email-templates', data);
    return response.data;
  }

  async updateCRIEmailTemplate(templateId: number, data: any): Promise<any> {
    const response = await this.client.put(`/cri-email-templates/${templateId}`, data);
    return response.data;
  }

  async deleteCRIEmailTemplate(templateId: number): Promise<void> {
    await this.client.delete(`/cri-email-templates/${templateId}`);
  }
}

export const api = new ApiService();
export default api;
