import { api } from '@/lib/api'

// Users API
export const usersAPI = {
  // Get user profile
  getProfile: () => api.get('/users/me'),
  
  // Update user profile
  updateProfile: (data) => api.patch('/users/me', data),
  
  // Change password
  changePassword: (data) => api.patch('/users/me/password', data),
  
  // Get all users (admin only)
  getUsers: (params = {}) => api.get('/users/', { params }),
  
  // Create user
  createUser: (data) => api.post('/users/', data),
  
  // Update user
  updateUser: (userId, data) => api.put(`/users/${userId}`, data),
  
  // Delete user
  deleteUser: (userId) => api.delete(`/users/${userId}`),
  
  // Get user by ID
  getUserById: (userId) => api.get(`/users/${userId}`),
}

// Invitations API
export const invitationsAPI = {
  // Create invitation (admin only)
  createInvitation: (data) => api.post('/invitations/', data),
  
  // List invitations
  getInvitations: (params = {}) => api.get('/invitations/', { params }),
  
  // Accept invitation (public endpoint, no auth required)
  acceptInvitation: (data) => api.post('/invitations/accept', data),
  
  // Cancel invitation
  cancelInvitation: (invitationId) => api.delete(`/invitations/${invitationId}`),
  
  // Resend invitation
  resendInvitation: (invitationId) => api.post(`/invitations/${invitationId}/resend`),
}

// Company API
export const companyAPI = {
  // Get company info
  getCompany: () => api.get('/companies/me'),
  
  // Update company
  updateCompany: (data) => api.put('/companies/me', data),
  
  // Get company statistics
  getCompanyStats: () => api.get('/companies/me/stats'),
}

// Vehicles API
export const vehiclesAPI = {
  // Get all vehicles
  getVehicles: (params = {}) => api.get('/vehicles/', { params }),
  
  // Create vehicle
  createVehicle: (data) => api.post('/vehicles/', data),
  
  // Update vehicle
  updateVehicle: (vehicleId, data) => api.put(`/vehicles/${vehicleId}`, data),
  
  // Delete vehicle
  deleteVehicle: (vehicleId) => api.delete(`/vehicles/${vehicleId}`),
  
  // Get vehicle by ID
  getVehicleById: (vehicleId) => api.get(`/vehicles/${vehicleId}`),
  
  // Update vehicle status
  updateVehicleStatus: (vehicleId, status) => api.put(`/vehicles/${vehicleId}/status`, { status }),
  
  // Get vehicle maintenance history
  getVehicleMaintenance: (vehicleId) => api.get(`/vehicles/${vehicleId}/maintenance`),
  
  // Add maintenance record
  addMaintenanceRecord: (vehicleId, data) => api.post(`/vehicles/${vehicleId}/maintenance`, data),
}

// Missions API
export const missionsAPI = {
  // Get all missions
  getMissions: (params = {}) => api.get('/missions/', { params }),
  
  // Create mission
  createMission: (data) => api.post('/missions/', data),
  
  // Update mission
  updateMission: (missionId, data) => api.put(`/missions/${missionId}`, data),
  
  // Delete mission
  deleteMission: (missionId) => api.delete(`/missions/${missionId}`),
  
  // Get mission by ID
  getMissionById: (missionId) => api.get(`/missions/${missionId}`),
  
  // Update mission status
  updateMissionStatus: (missionId, status) => api.put(`/missions/${missionId}/status`, { status }),
  
  // Assign driver to mission
  assignDriver: (missionId, driverId) => api.put(`/missions/${missionId}/assign-driver`, { driver_id: driverId }),
  
  // Assign vehicle to mission
  assignVehicle: (missionId, vehicleId) => api.put(`/missions/${missionId}/assign-vehicle`, { vehicle_id: vehicleId }),
  
  // Get missions by date range
  getMissionsByDateRange: (startDate, endDate, params = {}) => 
    api.get('/missions/date-range', { 
      params: { 
        start_date: startDate, 
        end_date: endDate, 
        ...params 
      } 
    }),
  
  // Get driver missions
  getDriverMissions: (driverId, params = {}) => api.get(`/drivers/${driverId}/missions`, { params }),
}

// Dashboard API
export const dashboardAPI = {
  // Get dashboard stats
  getStats: () => api.get('/dashboard/stats'),
  
  // Get upcoming missions
  getUpcomingMissions: (limit = 10) => api.get('/dashboard/upcoming-missions', { params: { limit } }),
  
  // Get available vehicles
  getAvailableVehicles: () => api.get('/dashboard/available-vehicles'),
  
  // Get available drivers
  getAvailableDrivers: () => api.get('/dashboard/available-drivers'),
  
  // Get recent activities
  getRecentActivities: (limit = 20) => api.get('/dashboard/activities', { params: { limit } }),
}

// Planning API
export const planningAPI = {
  // Get planning data for date range
  getPlanning: (startDate, endDate, params = {}) => 
    api.get('/planning/', { 
      params: { 
        start_date: startDate, 
        end_date: endDate, 
        ...params 
      } 
    }),
  
  // Get driver availability
  getDriverAvailability: (driverId, startDate, endDate) => 
    api.get(`/planning/drivers/${driverId}/availability`, {
      params: { start_date: startDate, end_date: endDate }
    }),
  
  // Get vehicle availability
  getVehicleAvailability: (vehicleId, startDate, endDate) => 
    api.get(`/planning/vehicles/${vehicleId}/availability`, {
      params: { start_date: startDate, end_date: endDate }
    }),
  
  // Update planning
  updatePlanning: (data) => api.put('/planning/', data),
}