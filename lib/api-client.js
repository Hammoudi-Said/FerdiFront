import { api } from '@/lib/api'

// ===========================
// 🔐 AUTHENTICATION API
// ===========================
export const authAPI = {
  // Login with OAuth2 form data
  login: async (email, password) => {
    const formData = new URLSearchParams()
    formData.append('grant_type', 'password')
    formData.append('username', email)
    formData.append('password', password)
    formData.append('scope', '')
    formData.append('client_id', '')
    formData.append('client_secret', '')

    return api.post('/login/access-token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  },

  // Test token validity
  testToken: () => api.post('/login/test-token'),

  // Request password recovery
  recoverPassword: (email) => api.post(`/password-recovery/${email}`),

  // Reset password with token
  resetPassword: (data) => api.post('/reset-password/', data),
}

// ===========================
// 👥 USERS MANAGEMENT API
// ===========================
export const usersAPI = {
  // === User Profile Management ===
  // Get current user profile (GET /api/v1/users/me)
  getProfile: () => api.get('/users/me'),
  
  // Update current user profile (PATCH /api/v1/users/me)
  updateProfile: (data) => api.patch('/users/me', data),
  
  // Change current user password (PATCH /api/v1/users/me/password)
  changePassword: (data) => api.patch('/users/me/password', data),

  // Delete current user account (DELETE /api/v1/users/me)
  deleteMyAccount: () => api.delete('/users/me'),

  // === User Management (Admin) ===
  // Get all users with pagination (GET /api/v1/users/)
  getUsers: (params = {}) => api.get('/users/', { params }),
  
  // Create new user (POST /api/v1/users/)
  createUser: (data) => api.post('/users/', data),

  // Get user by ID (GET /api/v1/users/{user_id})
  getUserById: (userId) => api.get(`/users/${userId}`),
  
  // Update user (PATCH /api/v1/users/{user_id})
  updateUser: (userId, data) => api.patch(`/users/${userId}`, data),
  
  // Delete user (DELETE /api/v1/users/{user_id})
  deleteUser: (userId) => api.delete(`/users/${userId}`),

  // Update user role (PATCH /api/v1/users/{user_id}/role)
  updateUserRole: (userId, data) => api.patch(`/users/${userId}/role`, data),

  // Update user status (PATCH /api/v1/users/{user_id}/status)
  updateUserStatus: (userId, data) => api.patch(`/users/${userId}/status`, data),

  // === Public User Registration ===
  // Public user signup (POST /api/v1/users/signup)
  signup: (data) => api.post('/users/signup', data),

  // === User Permissions Management ===
  // Get user permissions (GET /api/v1/users/{user_id}/permissions)
  getUserPermissions: (userId) => api.get(`/users/${userId}/permissions`),

  // Grant user permission (POST /api/v1/users/{user_id}/permissions)
  grantUserPermission: (userId, permission, expiresAt = null) => 
    api.post(`/users/${userId}/permissions`, null, {
      params: { permission, expires_at: expiresAt }
    }),

  // Revoke user permission (DELETE /api/v1/users/{user_id}/permissions/{permission})
  revokeUserPermission: (userId, permission) => 
    api.delete(`/users/${userId}/permissions/${permission}`),

  // === Session Management ===
  // Get current user sessions (GET /api/v1/users/me/sessions)
  getMySessions: () => api.get('/users/me/sessions'),

  // Terminate specific session (DELETE /api/v1/users/me/sessions/{session_id})
  terminateMySession: (sessionId) => api.delete(`/users/me/sessions/${sessionId}`),

  // Terminate all current user sessions (DELETE /api/v1/users/me/sessions)
  terminateAllMySessions: () => api.delete('/users/me/sessions'),

  // === Admin Session Management ===
  // Get user sessions (admin) (GET /api/v1/users/{user_id}/sessions)
  getUserSessions: (userId) => api.get(`/users/${userId}/sessions`),

  // Terminate user sessions (admin) (DELETE /api/v1/users/{user_id}/sessions)
  terminateUserSessions: (userId) => api.delete(`/users/${userId}/sessions`),

  // === Reports and Analytics ===
  // Get current user activity report (GET /api/v1/users/me/activity-report)
  getMyActivityReport: (days = 30) => api.get('/users/me/activity-report', { params: { days } }),

  // Get user security audit (admin) (GET /api/v1/users/{user_id}/security-audit)
  getUserSecurityAudit: (userId) => api.get(`/users/${userId}/security-audit`),

  // === Bulk Operations ===
  // Bulk user operations (POST /api/v1/users/bulk-operation)
  bulkUserOperation: (data) => api.post('/users/bulk-operation', data),
}

// ===========================
// 🏢 COMPANY MANAGEMENT API
// ===========================
export const companyAPI = {
  // Register new company with manager (POST /api/v1/companies/register)
  register: (data) => api.post('/companies/register', data),

  // Get current user's company (GET /api/v1/companies/me)
  getMyCompany: () => api.get('/companies/me'),

  // Update current user's company (PUT /api/v1/companies/me)
  updateMyCompany: (data) => api.put('/companies/me', data),

  // Get company by ID (GET /api/v1/companies/{company_id})
  getCompanyById: (companyId) => api.get(`/companies/${companyId}`),

  // Update company (PUT /api/v1/companies/{company_id})
  updateCompany: (companyId, data) => api.put(`/companies/${companyId}`, data),

  // Delete company (DELETE /api/v1/companies/{company_id})
  deleteCompany: (companyId) => api.delete(`/companies/${companyId}`),

  // Get company by code (GET /api/v1/companies/code/{company_code})
  getCompanyByCode: (companyCode) => api.get(`/companies/code/${companyCode}`),

  // List all companies (admin only) (GET /api/v1/companies/)
  listCompanies: (params = {}) => api.get('/companies/', { params }),

  // Legacy alias for backwards compatibility
  getCompany: () => api.get('/companies/me'),
  updateCompany: (data) => api.put('/companies/me', data),
}

// ===========================
// 📨 INVITATIONS API
// ===========================
export const invitationsAPI = {
  // Create invitation (POST /api/v1/invitations/)
  createInvitation: (data) => api.post('/invitations/', data),
  
  // List invitations (GET /api/v1/invitations/)
  getInvitations: (params = {}) => api.get('/invitations/', { params }),
  
  // Accept invitation - PUBLIC ENDPOINT (POST /api/v1/invitations/accept)
  acceptInvitation: (data) => {
    // Remove auth header for public endpoint
    const config = { headers: {} }
    delete config.headers.Authorization
    return api.post('/invitations/accept', data, config)
  },
  
  // Cancel invitation (DELETE /api/v1/invitations/{invitation_id})
  cancelInvitation: (invitationId) => api.delete(`/invitations/${invitationId}`),
  
  // Resend invitation (POST /api/v1/invitations/{invitation_id}/resend)
  resendInvitation: (invitationId) => api.post(`/invitations/${invitationId}/resend`),
}

// ===========================
// 📱 SESSIONS API
// ===========================
export const sessionsAPI = {
  // Refresh access token (POST /api/v1/sessions/refresh)
  refreshToken: (data) => api.post('/sessions/refresh', data),

  // Get current user's active sessions (GET /api/v1/sessions/me)
  getMySessions: () => api.get('/sessions/me'),

  // Terminate specific session (DELETE /api/v1/sessions/{session_id})
  terminateSession: (sessionId) => api.delete(`/sessions/${sessionId}`),

  // Terminate all sessions except current (DELETE /api/v1/sessions/)
  terminateAllSessions: () => api.delete('/sessions/'),

  // === Admin Endpoints ===
  // Cleanup expired sessions (GET /api/v1/sessions/admin/cleanup)
  cleanupExpiredSessions: () => api.get('/sessions/admin/cleanup'),

  // Get user sessions (admin) (GET /api/v1/sessions/admin/user/{user_id})
  getUserSessionsAdmin: (userId) => api.get(`/sessions/admin/user/${userId}`),

  // Terminate user sessions (admin) (DELETE /api/v1/sessions/admin/user/{user_id})
  terminateUserSessionsAdmin: (userId) => api.delete(`/sessions/admin/user/${userId}`),
}

// ===========================
// 📊 AUDIT API
// ===========================
export const auditAPI = {
  // === Personal Audit Logs ===
  // Get current user's access logs (GET /api/v1/audit/me/logs)
  getMyAccessLogs: (params = {}) => api.get('/audit/me/logs', { params }),

  // Get current user's activity report (GET /api/v1/audit/me/activity)
  getMyActivityReport: (days = 30) => api.get('/audit/me/activity', { params: { days } }),

  // === Admin Audit Endpoints ===
  // Get user access logs (admin) (GET /api/v1/audit/user/{user_id}/logs)
  getUserAccessLogs: (userId, params = {}) => api.get(`/audit/user/${userId}/logs`, { params }),

  // Get company access logs (GET /api/v1/audit/company/logs)
  getCompanyAccessLogs: (params = {}) => api.get('/audit/company/logs', { params }),

  // Get user security audit (GET /api/v1/audit/user/{user_id}/security)
  getUserSecurityAudit: (userId) => api.get(`/audit/user/${userId}/security`),

  // Get system audit stats (super admin) (GET /api/v1/audit/system/stats)
  getSystemAuditStats: () => api.get('/audit/system/stats'),
}

// ===========================
// 🛠️ UTILITIES API
// ===========================
export const utilsAPI = {
  // Health check (GET /api/v1/utils/health-check/)
  healthCheck: () => api.get('/utils/health-check/'),

  // Test email (POST /api/v1/utils/test-email/)
  testEmail: (emailTo) => api.post('/utils/test-email/', null, {
    params: { email_to: emailTo }
  }),
}

// ===========================
// 🚗 VEHICLES API (Not in OpenAPI - Placeholder)
// ===========================
export const vehiclesAPI = {
  // Note: These endpoints are not defined in the provided OpenAPI spec
  // They are placeholders for future implementation
  getVehicles: (params = {}) => api.get('/vehicles/', { params }),
  createVehicle: (data) => api.post('/vehicles/', data),
  updateVehicle: (vehicleId, data) => api.put(`/vehicles/${vehicleId}`, data),
  deleteVehicle: (vehicleId) => api.delete(`/vehicles/${vehicleId}`),
  getVehicleById: (vehicleId) => api.get(`/vehicles/${vehicleId}`),
  updateVehicleStatus: (vehicleId, status) => api.put(`/vehicles/${vehicleId}/status`, { status }),
  getVehicleMaintenance: (vehicleId) => api.get(`/vehicles/${vehicleId}/maintenance`),
  addMaintenanceRecord: (vehicleId, data) => api.post(`/vehicles/${vehicleId}/maintenance`, data),
}

// ===========================
// 🚌 MISSIONS API (Not in OpenAPI - Placeholder)
// ===========================
export const missionsAPI = {
  // Note: These endpoints are not defined in the provided OpenAPI spec
  // They are placeholders for future implementation
  getMissions: (params = {}) => api.get('/missions/', { params }),
  createMission: (data) => api.post('/missions/', data),
  updateMission: (missionId, data) => api.put(`/missions/${missionId}`, data),
  deleteMission: (missionId) => api.delete(`/missions/${missionId}`),
  getMissionById: (missionId) => api.get(`/missions/${missionId}`),
  updateMissionStatus: (missionId, status) => api.put(`/missions/${missionId}/status`, { status }),
  assignDriver: (missionId, driverId) => api.put(`/missions/${missionId}/assign-driver`, { driver_id: driverId }),
  assignVehicle: (missionId, vehicleId) => api.put(`/missions/${missionId}/assign-vehicle`, { vehicle_id: vehicleId }),
  getMissionsByDateRange: (startDate, endDate, params = {}) => 
    api.get('/missions/date-range', { 
      params: { 
        start_date: startDate, 
        end_date: endDate, 
        ...params 
      } 
    }),
  getDriverMissions: (driverId, params = {}) => api.get(`/drivers/${driverId}/missions`, { params }),
}

// ===========================
// 📊 DASHBOARD API (Not in OpenAPI - Placeholder)
// ===========================
export const dashboardAPI = {
  // Note: These endpoints are not defined in the provided OpenAPI spec
  // They are placeholders for future implementation
  getStats: () => api.get('/dashboard/stats'),
  getUpcomingMissions: (limit = 10) => api.get('/dashboard/upcoming-missions', { params: { limit } }),
  getAvailableVehicles: () => api.get('/dashboard/available-vehicles'),
  getAvailableDrivers: () => api.get('/dashboard/available-drivers'),
  getRecentActivities: (limit = 20) => api.get('/dashboard/activities', { params: { limit } }),
}

// ===========================
// 📅 PLANNING API (Not in OpenAPI - Placeholder)
// ===========================
export const planningAPI = {
  // Note: These endpoints are not defined in the provided OpenAPI spec
  // They are placeholders for future implementation
  getPlanning: (startDate, endDate, params = {}) => 
    api.get('/planning/', { 
      params: { 
        start_date: startDate, 
        end_date: endDate, 
        ...params 
      } 
    }),
  getDriverAvailability: (driverId, startDate, endDate) => 
    api.get(`/planning/drivers/${driverId}/availability`, {
      params: { start_date: startDate, end_date: endDate }
    }),
  getVehicleAvailability: (vehicleId, startDate, endDate) => 
    api.get(`/planning/vehicles/${vehicleId}/availability`, {
      params: { start_date: startDate, end_date: endDate }
    }),
  updatePlanning: (data) => api.put('/planning/', data),
}

// ===========================
// LEGACY COMPATIBILITY
// ===========================
// Keep some legacy exports for backwards compatibility
export { usersAPI as users }
export { companyAPI as company }
export { invitationsAPI as invitations }
export { sessionsAPI as sessions }
export { authAPI as auth }
export { auditAPI as audit }
export { utilsAPI as utils }