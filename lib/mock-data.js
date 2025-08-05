// Mock data for testing the FERDI application without backend
export const MOCK_DATA = {
  // Sample company data
  company: {
    id: 'comp-12345-67890',
    name: 'Transport Bretagne SARL',
    company_code: 'BRE-12345-ABC',
    siret: '12345678901234',
    address: '15 Rue de la Gare',
    city: 'Quimper',
    postal_code: '29000',
    country: 'France',
    phone: '0298554433',
    email: 'contact@transport-bretagne.fr',
    website: 'https://www.transport-bretagne.fr',
    status: 'active',
    subscription_plan: '2',
    max_users: 20,
    max_vehicles: 20,
    created_at: '2024-01-15T10:00:00Z',
  },

  // Sample users with different roles
  users: [
    {
      id: 'user-admin-001',
      email: 'manager@transport-bretagne.fr',
      first_name: 'Jean',
      last_name: 'Dupont',
      full_name: 'Jean Dupont',
      mobile: '0612345678',
      role: '2', // ADMIN
      status: '1', // Active
      is_active: true,
      created_at: '2024-01-15T10:00:00Z',
      last_login_at: '2024-12-15T09:30:00Z',
    },
    {
      id: 'user-dispatcher-001',
      email: 'marie.martin@transport-bretagne.fr',
      first_name: 'Marie',
      last_name: 'Martin',
      full_name: 'Marie Martin',
      mobile: '0687654321',
      role: '3', // AUTOCARISTE
      status: '1', // Active
      is_active: true,
      created_at: '2024-01-20T14:00:00Z',
      last_login_at: '2024-12-14T16:45:00Z',
    },
    {
      id: 'user-driver-001',
      email: 'pierre.bernard@transport-bretagne.fr',
      first_name: 'Pierre',
      last_name: 'Bernard',
      full_name: 'Pierre Bernard',
      mobile: '0698765432',
      role: '4', // CHAUFFEUR
      status: '1', // Active
      is_active: true,
      created_at: '2024-02-01T08:00:00Z',
      last_login_at: '2024-12-15T07:15:00Z',
    },
    {
      id: 'user-driver-002',
      email: 'sophie.dubois@transport-bretagne.fr',
      first_name: 'Sophie',
      last_name: 'Dubois',
      full_name: 'Sophie Dubois',
      mobile: '0634567890',
      role: '4', // CHAUFFEUR
      status: '1', // Active
      is_active: true,
      created_at: '2024-02-10T11:00:00Z',
      last_login_at: '2024-12-13T18:20:00Z',
    },
    {
      id: 'user-driver-003',
      email: 'lucas.moreau@transport-bretagne.fr',
      first_name: 'Lucas',
      last_name: 'Moreau',
      full_name: 'Lucas Moreau',
      mobile: '0645678901',
      role: '4', // CHAUFFEUR
      status: '2', // Inactive
      is_active: false,
      created_at: '2024-03-01T09:00:00Z',
      last_login_at: '2024-11-30T12:00:00Z',
    },
  ],

  // Authentication responses
  loginSuccess: {
    access_token: 'mock-jwt-token-12345',
    token_type: 'bearer',
  },

  // Registration responses
  companyRegistrationSuccess: {
    company: null, // Will be filled with company data
    company_code: 'BRE-12345-ABC',
    manager_id: 'user-admin-001',
    message: 'Entreprise créée avec succès. Votre code entreprise est BRE-12345-ABC',
  },

  userRegistrationSuccess: {
    id: 'user-new-001',
    email: 'nouveau@transport-bretagne.fr',
    first_name: 'Nouveau',
    last_name: 'Utilisateur',
    full_name: 'Nouveau Utilisateur',
    mobile: '0612345678',
    role: '4',
    status: '1',
    is_active: true,
    created_at: new Date().toISOString(),
    last_login_at: null,
  },

  // Error responses
  errors: {
    invalidCredentials: {
      detail: 'Email ou mot de passe incorrect',
    },
    invalidCompanyCode: {
      detail: 'Code entreprise invalide ou inexistant',
    },
    emailAlreadyExists: {
      detail: 'Cette adresse email est déjà utilisée',
    },
    siretAlreadyExists: {
      detail: 'Ce SIRET est déjà enregistré',
    },
    unauthorized: {
      detail: 'Token d\'accès invalide ou expiré',
    },
    forbidden: {
      detail: 'Vous n\'avez pas les permissions pour cette action',
    },
    notFound: {
      detail: 'Ressource non trouvée',
    },
    serverError: {
      detail: 'Erreur interne du serveur. Veuillez réessayer plus tard.',
    },
  },

  // Valid test credentials for mock mode
  testCredentials: {
    manager: {
      email: 'manager@transport-bretagne.fr',
      password: 'SecurePass123!',
    },
    dispatcher: {
      email: 'marie.martin@transport-bretagne.fr',
      password: 'DispatcherPass123!',
    },
    driver: {
      email: 'pierre.bernard@transport-bretagne.fr',
      password: 'DriverPass123!',
    },
  },

  // Valid company codes for testing
  validCompanyCodes: ['BRE-12345-ABC', 'PAR-67890-XYZ', 'LYO-11111-DEF'],
}

// Helper functions for mock data
export const mockHelpers = {
  // Find user by email
  findUserByEmail: (email) => {
    return MOCK_DATA.users.find(user => user.email === email)
  },

  // Validate company code format
  isValidCompanyCodeFormat: (code) => {
    const regex = /^[A-Z]{3}-\d{5}-[A-Z0-9]{3}$/
    return regex.test(code)
  },

  // Check if company code exists
  companyCodeExists: (code) => {
    return MOCK_DATA.validCompanyCodes.includes(code)
  },

  // Generate new user ID
  generateUserId: () => {
    return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },

  // Generate new company code
  generateCompanyCode: () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const alphanumeric = letters + numbers
    
    const prefix = Array.from({length: 3}, () => letters[Math.floor(Math.random() * letters.length)]).join('')
    const middle = Array.from({length: 5}, () => numbers[Math.floor(Math.random() * numbers.length)]).join('')
    const suffix = Array.from({length: 3}, () => alphanumeric[Math.floor(Math.random() * alphanumeric.length)]).join('')
    
    return `${prefix}-${middle}-${suffix}`
  },

  // Simulate API delay
  delay: (ms = 1000) => {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  // Create successful response
  successResponse: (data, status = 200) => ({
    ok: true,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  }),

  // Create error response
  errorResponse: (error, status = 400) => ({
    ok: false,
    status,
    json: () => Promise.resolve(error),
    text: () => Promise.resolve(JSON.stringify(error)),
  }),
}

// Mock API implementation
export const mockAPI = {
  // Company registration
  registerCompany: async (data) => {
    await mockHelpers.delay(1500)
    
    // Check if SIRET already exists
    if (data.company.siret === MOCK_DATA.company.siret) {
      return mockHelpers.errorResponse(MOCK_DATA.errors.siretAlreadyExists, 400)
    }
    
    // Check if manager email already exists
    if (mockHelpers.findUserByEmail(data.manager_email)) {
      return mockHelpers.errorResponse(MOCK_DATA.errors.emailAlreadyExists, 400)
    }
    
    // Generate new company code
    const companyCode = mockHelpers.generateCompanyCode()
    
    const response = {
      ...MOCK_DATA.companyRegistrationSuccess,
      company: {
        ...data.company,
        id: `comp-${Date.now()}`,
        company_code: companyCode,
        status: 'active',
        max_users: 20,
        max_vehicles: 20,
        created_at: new Date().toISOString(),
      },
      company_code: companyCode,
      manager_id: mockHelpers.generateUserId(),
      message: `Entreprise créée avec succès. Votre code entreprise est ${companyCode}`,
    }
    
    return mockHelpers.successResponse(response)
  },

  // User registration
  registerUser: async (data) => {
    await mockHelpers.delay(1200)
    
    // Validate company code format
    if (!mockHelpers.isValidCompanyCodeFormat(data.company_code)) {
      return mockHelpers.errorResponse(MOCK_DATA.errors.invalidCompanyCode, 400)
    }
    
    // Check if company code exists
    if (!mockHelpers.companyCodeExists(data.company_code)) {
      return mockHelpers.errorResponse(MOCK_DATA.errors.invalidCompanyCode, 400)
    }
    
    // Check if email already exists
    if (mockHelpers.findUserByEmail(data.email)) {
      return mockHelpers.errorResponse(MOCK_DATA.errors.emailAlreadyExists, 400)
    }
    
    const newUser = {
      ...MOCK_DATA.userRegistrationSuccess,
      id: mockHelpers.generateUserId(),
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      full_name: `${data.first_name} ${data.last_name}`,
      mobile: data.mobile,
      role: data.role,
    }
    
    return mockHelpers.successResponse(newUser)
  },

  // Login
  login: async (email, password) => {
    await mockHelpers.delay(800)
    
    // Check credentials
    const validCredentials = Object.values(MOCK_DATA.testCredentials).find(
      cred => cred.email === email && cred.password === password
    )
    
    if (!validCredentials) {
      return mockHelpers.errorResponse(MOCK_DATA.errors.invalidCredentials, 401)
    }
    
    return mockHelpers.successResponse(MOCK_DATA.loginSuccess)
  },

  // Get current user
  getCurrentUser: async (token) => {
    await mockHelpers.delay(500)
    
    if (!token || token !== 'mock-jwt-token-12345') {
      return mockHelpers.errorResponse(MOCK_DATA.errors.unauthorized, 401)
    }
    
    // Return first admin user as default logged in user
    return mockHelpers.successResponse(MOCK_DATA.users[0])
  },

  // Get company
  getCompany: async (token, userRole = null) => {
    await mockHelpers.delay(500)
    
    if (!token || token !== 'mock-jwt-token-12345') {
      return mockHelpers.errorResponse(MOCK_DATA.errors.unauthorized, 401)
    }
    
    // For admin users, ensure they get their company data
    // In a real backend, this would be handled by user's company association
    return mockHelpers.successResponse(MOCK_DATA.company)
  },

  // Get users list
  getUsers: async (token, userRole) => {
    await mockHelpers.delay(700)
    
    if (!token || token !== 'mock-jwt-token-12345') {
      return mockHelpers.errorResponse(MOCK_DATA.errors.unauthorized, 401)
    }
    
    // Check if user has permission (only admin and super admin)
    if (userRole !== '1' && userRole !== '2') {
      return mockHelpers.errorResponse(MOCK_DATA.errors.forbidden, 403)
    }
    
    return mockHelpers.successResponse({
      data: MOCK_DATA.users,
      count: MOCK_DATA.users.length,
    })
  },
}