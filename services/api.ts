import { User, UserRole, AdminDashboardData, EmployeeDashboardData, StoredUser, BillingRecord, BillingStatus, Project, DailyWorkReport, NewDailyWorkReportData, LeaveRequest, LeaveStatus, NewLeaveRequestData, EmployeeProfileUpdateData, AttendanceRecord, UserAttendanceStatus, AdminUserUpdateData, InternalMessage, WorkReportFilters, ChangePasswordData, ProjectLogItem } from '../types';

// =====================================================================================
// API Configuration
// =====================================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error("CRITICAL: VITE_API_BASE_URL is not set in your .env.local file. API calls will fail.");
  alert("CRITICAL: VITE_API_BASE_URL is not set. Please check the frontend .env.local file.");
}

const getAuthToken = (): string | null => localStorage.getItem('authToken');

const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers: options.headers || getAuthHeaders() });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
    throw new Error(errorData.message || 'An unknown server error occurred.');
  }
  return response.status === 204 ? (null as T) : (response.json() as Promise<T>);
}

export interface ParsedLoginCredentials { username: string; password?: string; }
export interface ParsedRegisterData { username: string; email: string; password?: string; firstName: string; lastName: string; role: UserRole; profilePictureUrl?: string | null; }

// --- User & Auth ---
export const apiLogin = async (credentials: ParsedLoginCredentials): Promise<{ user: User, token: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
  if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Login failed.'); }
  const data = await response.json();
  if (data.token) localStorage.setItem('authToken', data.token);
  return data;
};
export const apiCreateUser = async (userData: ParsedRegisterData): Promise<{ user: User }> => apiRequest<{ user: User }>('/users', { method: 'POST', body: JSON.stringify(userData) });
export const apiLogout = async (): Promise<void> => { localStorage.removeItem('authToken'); return Promise.resolve(); };
export const apiFetchAllUsers = async (): Promise<User[]> => apiRequest<User[]>('/users');
export const apiFetchUserById = async (userId: string): Promise<User> => apiRequest<User>(`/users/${userId}`);
export const apiUpdateUserProfile = async (userId: string, updates: EmployeeProfileUpdateData): Promise<User> => apiRequest<User>(`/users/${userId}`, { method: 'PUT', body: JSON.stringify(updates) });
export const apiAdminUpdateUser = async (userId: string, updates: AdminUserUpdateData): Promise<User> => apiRequest<User>(`/users/${userId}`, { method: 'PUT', body: JSON.stringify(updates) });
export const apiDeleteUser = async (userIdToDelete: string): Promise<void> => apiRequest<void>(`/users/${userIdToDelete}`, { method: 'DELETE' });
export const apiChangePassword = async (userId: string, data: ChangePasswordData): Promise<void> => apiRequest<void>(`/users/${userId}/change-password`, { method: 'POST', body: JSON.stringify(data) });
export const apiAdminResetPassword = async (userId: string, newPassword: string): Promise<void> => apiRequest<void>(`/users/${userId}/reset-password`, { method: 'POST', body: JSON.stringify({ newPassword }) });


// --- Dashboards ---
export const fetchAdminDashboardData = async (): Promise<AdminDashboardData> => apiRequest<AdminDashboardData>('/dashboard/admin');
export const fetchEmployeeDashboardData = async (): Promise<EmployeeDashboardData> => apiRequest<EmployeeDashboardData>('/dashboard/employee');

// --- Projects ---
export const apiFetchProjects = async (): Promise<Project[]> => apiRequest<Project[]>('/projects');
export const apiFetchProjectById = async (projectId: string): Promise<Project> => apiRequest<Project>(`/projects/${projectId}`);
export const apiAddProject = async (projectData: Omit<Project, 'id'>): Promise<Project> => apiRequest<Project>('/projects', { method: 'POST', body: JSON.stringify(projectData) });
export const apiUpdateProject = async (projectId: string, updates: Partial<Omit<Project, 'id'>>): Promise<Project> => apiRequest<Project>(`/projects/${projectId}`, { method: 'PUT', body: JSON.stringify(updates) });
export const apiDeleteProject = async (projectId: string): Promise<void> => apiRequest<void>(`/projects/${projectId}`, { method: 'DELETE' });

// --- Billing ---
export const apiFetchBillingRecords = async (userId?: string): Promise<BillingRecord[]> => apiRequest<BillingRecord[]>(`/billing-records${userId ? `?userId=${userId}` : ''}`);
export const apiAddBillingRecord = async (recordData: Partial<BillingRecord>): Promise<BillingRecord> => apiRequest<BillingRecord>('/billing-records', { method: 'POST', body: JSON.stringify(recordData) });
export const apiUpdateBillingRecord = async (recordId: string, updates: Partial<BillingRecord>): Promise<BillingRecord> => apiRequest<BillingRecord>(`/billing-records/${recordId}`, { method: 'PUT', body: JSON.stringify(updates) });
export const apiDeleteBillingRecord = async (recordId: string): Promise<void> => apiRequest<void>(`/billing-records/${recordId}`, { method: 'DELETE' });

// --- Work Reports ---
export const apiSubmitDailyWorkReport = async (reportData: NewDailyWorkReportData): Promise<DailyWorkReport> => apiRequest<DailyWorkReport>('/work-reports', { method: 'POST', body: JSON.stringify(reportData) });
export const apiFetchUserDailyWorkReports = async (): Promise<DailyWorkReport[]> => apiRequest<DailyWorkReport[]>('/work-reports');
export const apiFetchAllDailyWorkReports = async (): Promise<DailyWorkReport[]> => apiRequest<DailyWorkReport[]>('/work-reports/all');
export const apiGetDailyWorkReport = async (reportId: string): Promise<DailyWorkReport> => apiRequest<DailyWorkReport>(`/work-reports/${reportId}`);

// --- Leave Requests ---
export const apiApplyForLeave = async (requestData: NewLeaveRequestData): Promise<LeaveRequest> => apiRequest<LeaveRequest>('/leave-requests', { method: 'POST', body: JSON.stringify(requestData) });
export const apiFetchUserLeaveRequests = async (): Promise<LeaveRequest[]> => apiRequest<LeaveRequest[]>('/leave-requests/my-requests');
export const apiFetchAllLeaveRequests = async (): Promise<LeaveRequest[]> => apiRequest<LeaveRequest[]>('/leave-requests');
export const apiUpdateLeaveRequestStatus = async (requestId: string, status: LeaveStatus.APPROVED | LeaveStatus.REJECTED, adminNotes?: string): Promise<LeaveRequest> => apiRequest<LeaveRequest>(`/leave-requests/${requestId}/status`, { method: 'PUT', body: JSON.stringify({ status, adminNotes }) });
export const apiCancelLeaveRequest = async (requestId: string): Promise<LeaveRequest> => apiRequest<LeaveRequest>(`/leave-requests/${requestId}/cancel`, { method: 'PUT' });

// --- Attendance ---
export const apiClockIn = async (): Promise<AttendanceRecord> => apiRequest<AttendanceRecord>('/attendance/clock-in', { method: 'POST', body: JSON.stringify({}) });
export const apiClockOut = async (): Promise<AttendanceRecord> => apiRequest<AttendanceRecord>('/attendance/clock-out', { method: 'POST', body: JSON.stringify({}) });
export const apiGetUserTodayAttendanceStatus = async (): Promise<UserAttendanceStatus> => apiRequest<UserAttendanceStatus>('/attendance/status/me');
export const apiFetchAllAttendanceRecords = async (filters?: { userId?: string, date?: string }): Promise<AttendanceRecord[]> => apiRequest<AttendanceRecord[]>(`/attendance?userId=${filters?.userId || ''}&date=${filters?.date || ''}`);

// --- Messaging ---
export const apiSendInternalMessage = async (messageData: { recipientId: string, content: string }): Promise<InternalMessage> => apiRequest<InternalMessage>('/messages/send', { method: 'POST', body: JSON.stringify(messageData) });
export const apiFetchUserMessages = async (): Promise<InternalMessage[]> => apiRequest<InternalMessage[]>('/messages/my-messages');
export const apiGetUnreadMessageCount = async (): Promise<number> => apiRequest<number>('/messages/unread-count');
export const apiMarkMessageAsRead = async (messageId: string): Promise<void> => apiRequest<void>(`/messages/${messageId}/read`, { method: 'PUT' });
export const apiMarkAllMessagesAsReadForUser = async (): Promise<void> => apiRequest<void>('/messages/read-all', { method: 'POST' });

// --- Logo ---
export const apiUploadLogo = async (logoBlob: Blob): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('logo', logoBlob, 'logo.png');
  const headers = getAuthHeaders();
  delete (headers as any)['Content-Type'];
  const response = await fetch(`${API_BASE_URL}/api/logo`, { method: 'POST', headers: headers, body: formData });
  if (!response.ok) { const errorData = await response.json().catch(() => ({ message: 'Failed to upload logo.' })); throw new Error(errorData.message); }
  return response.json();
};
export const getLogoUrl = (): string => `${API_BASE_URL}/api/logo`;