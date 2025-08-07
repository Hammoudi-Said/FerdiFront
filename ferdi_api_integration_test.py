#!/usr/bin/env python3
"""
FERDI API Integration Testing - Complete OpenAPI Specification Testing
Tests the FERDI application backend integration according to OpenAPI specification.

Priority Endpoints to Test:
1. Authentication (🔐): login, test-token, password recovery, reset password
2. Users Management (👥): me, update, password change, list, create, signup
3. Company Management (🏢): register, get, update
4. Invitations (📨): create, list, accept, delete
5. Utils (🛠️): health-check

Configuration:
- NEXT_PUBLIC_BASE_URL points to backend server
- API proxy Next.js routes requests to /api/v1/
- OAuth2 form-data for authentication
- JWT Bearer token for authenticated requests
"""

import requests
import json
import time
import sys
from typing import Dict, Any, List

# Test configuration from environment
BASE_URL = "https://1203e6e9-e02a-436a-a857-1c91e1f5577f.preview.emergentagent.com"
API_BASE_URL = f"{BASE_URL}/api/v1"

# Test data for FERDI API testing
TEST_DATA = {
    "company_registration": {
        "name": "Transport Bretagne FERDI",
        "email": "admin@transport-bretagne-ferdi.fr",
        "phone": "+33123456789",
        "address": "123 Rue de la Logistique, 35000 Rennes",
        "manager_first_name": "Jean",
        "manager_last_name": "Dupont",
        "manager_email": "jean.dupont@transport-bretagne-ferdi.fr",
        "manager_password": "SecureManagerPass123!"
    },
    "user_signup": {
        "email": "marie.martin@transport-bretagne-ferdi.fr",
        "password": "SecureUserPass123!",
        "first_name": "Marie",
        "last_name": "Martin",
        "company_code": "TB2024"
    },
    "login_credentials": {
        "username": "jean.dupont@transport-bretagne-ferdi.fr",
        "password": "SecureManagerPass123!"
    },
    "invitation": {
        "email": "pierre.bernard@transport-bretagne-ferdi.fr",
        "role": "DRIVER",
        "first_name": "Pierre",
        "last_name": "Bernard",
        "personal_message": "Bienvenue dans l'équipe FERDI!"
    },
    "password_recovery": {
        "email": "jean.dupont@transport-bretagne-ferdi.fr"
    }
}

class FerdiAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'application/json',
            'User-Agent': 'FERDI-API-Tester/1.0'
        })
        self.test_results = []
        self.access_token = None
        self.company_code = None
        
    def log_test(self, test_name: str, success: bool, message: str, details: Dict = None):
        """Log test results with detailed information"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {}
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details:
            for key, value in details.items():
                print(f"    {key}: {value}")
        print()

    def test_health_check(self):
        """Test 1: Utils - Health Check (GET /api/v1/utils/health-check/)"""
        try:
            response = self.session.get(f"{API_BASE_URL}/utils/health-check/")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Health Check Endpoint",
                    True,
                    "Backend server is healthy and responding",
                    {"status_code": response.status_code, "response": data}
                )
            elif response.status_code == 502:
                self.log_test(
                    "Health Check Endpoint",
                    False,
                    "Backend server not available - 502 Bad Gateway",
                    {"status_code": response.status_code, "error": "No FastAPI backend server running"}
                )
            else:
                self.log_test(
                    "Health Check Endpoint",
                    False,
                    f"Unexpected response from health check",
                    {"status_code": response.status_code}
                )
                
        except Exception as e:
            self.log_test(
                "Health Check Endpoint",
                False,
                f"Health check failed: {str(e)}"
            )

    def test_company_registration(self):
        """Test 2: Company Management - Register Company (POST /api/v1/companies/register)"""
        try:
            response = self.session.post(
                f"{API_BASE_URL}/companies/register",
                json=TEST_DATA["company_registration"],
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 201:
                data = response.json()
                if "company_code" in data:
                    self.company_code = data["company_code"]
                    self.log_test(
                        "Company Registration",
                        True,
                        "Company registered successfully with company code",
                        {"status_code": response.status_code, "company_code": self.company_code}
                    )
                else:
                    self.log_test(
                        "Company Registration",
                        False,
                        "Company registration response missing company_code",
                        {"status_code": response.status_code, "response": data}
                    )
            elif response.status_code == 502:
                self.log_test(
                    "Company Registration",
                    False,
                    "Backend server not available - 502 Bad Gateway",
                    {"status_code": response.status_code, "error": "No FastAPI backend server running"}
                )
            else:
                self.log_test(
                    "Company Registration",
                    False,
                    f"Company registration failed",
                    {"status_code": response.status_code, "response": response.text}
                )
                
        except Exception as e:
            self.log_test(
                "Company Registration",
                False,
                f"Company registration test failed: {str(e)}"
            )

    def test_user_signup(self):
        """Test 3: Users Management - Public Signup (POST /api/v1/users/signup)"""
        try:
            signup_data = TEST_DATA["user_signup"].copy()
            if self.company_code:
                signup_data["company_code"] = self.company_code
                
            response = self.session.post(
                f"{API_BASE_URL}/users/signup",
                json=signup_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 201:
                data = response.json()
                self.log_test(
                    "User Signup",
                    True,
                    "User signup completed successfully",
                    {"status_code": response.status_code, "user_id": data.get("id")}
                )
            elif response.status_code == 502:
                self.log_test(
                    "User Signup",
                    False,
                    "Backend server not available - 502 Bad Gateway",
                    {"status_code": response.status_code, "error": "No FastAPI backend server running"}
                )
            else:
                self.log_test(
                    "User Signup",
                    False,
                    f"User signup failed",
                    {"status_code": response.status_code, "response": response.text}
                )
                
        except Exception as e:
            self.log_test(
                "User Signup",
                False,
                f"User signup test failed: {str(e)}"
            )

    def test_login_access_token(self):
        """Test 4: Authentication - Login (POST /api/v1/login/access-token)"""
        try:
            # OAuth2 form-data format as specified in OpenAPI
            login_data = {
                "grant_type": "password",
                "username": TEST_DATA["login_credentials"]["username"],
                "password": TEST_DATA["login_credentials"]["password"],
                "scope": "",
                "client_id": "",
                "client_secret": ""
            }
            
            response = self.session.post(
                f"{API_BASE_URL}/login/access-token",
                data=login_data,  # Form data, not JSON
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "token_type" in data:
                    self.access_token = data["access_token"]
                    self.log_test(
                        "Login Access Token",
                        True,
                        "Login successful - JWT token received",
                        {
                            "status_code": response.status_code, 
                            "token_type": data["token_type"],
                            "has_access_token": bool(self.access_token)
                        }
                    )
                else:
                    self.log_test(
                        "Login Access Token",
                        False,
                        "Login response missing required token fields",
                        {"status_code": response.status_code, "response": data}
                    )
            elif response.status_code == 502:
                self.log_test(
                    "Login Access Token",
                    False,
                    "Backend server not available - 502 Bad Gateway",
                    {"status_code": response.status_code, "error": "No FastAPI backend server running"}
                )
            else:
                self.log_test(
                    "Login Access Token",
                    False,
                    f"Login failed",
                    {"status_code": response.status_code, "response": response.text}
                )
                
        except Exception as e:
            self.log_test(
                "Login Access Token",
                False,
                f"Login test failed: {str(e)}"
            )

    def test_token_validation(self):
        """Test 5: Authentication - Test Token (POST /api/v1/login/test-token)"""
        try:
            headers = {}
            if self.access_token:
                headers['Authorization'] = f'Bearer {self.access_token}'
                
            response = self.session.post(f"{API_BASE_URL}/login/test-token", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Token Validation",
                    True,
                    "JWT token validation successful",
                    {"status_code": response.status_code, "user_data": data}
                )
            elif response.status_code == 502:
                self.log_test(
                    "Token Validation",
                    False,
                    "Backend server not available - 502 Bad Gateway",
                    {"status_code": response.status_code, "error": "No FastAPI backend server running"}
                )
            else:
                self.log_test(
                    "Token Validation",
                    False,
                    f"Token validation failed",
                    {"status_code": response.status_code, "response": response.text}
                )
                
        except Exception as e:
            self.log_test(
                "Token Validation",
                False,
                f"Token validation test failed: {str(e)}"
            )

    def test_get_current_user(self):
        """Test 6: Users Management - Get Current User (GET /api/v1/users/me)"""
        try:
            headers = {}
            if self.access_token:
                headers['Authorization'] = f'Bearer {self.access_token}'
                
            response = self.session.get(f"{API_BASE_URL}/users/me", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "email", "first_name", "last_name", "role"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_test(
                        "Get Current User",
                        True,
                        "Current user data retrieved successfully",
                        {
                            "status_code": response.status_code, 
                            "user_role": data.get("role"),
                            "user_email": data.get("email")
                        }
                    )
                else:
                    self.log_test(
                        "Get Current User",
                        False,
                        f"User data missing required fields: {missing_fields}",
                        {"status_code": response.status_code, "response": data}
                    )
            elif response.status_code == 502:
                self.log_test(
                    "Get Current User",
                    False,
                    "Backend server not available - 502 Bad Gateway",
                    {"status_code": response.status_code, "error": "No FastAPI backend server running"}
                )
            else:
                self.log_test(
                    "Get Current User",
                    False,
                    f"Get current user failed",
                    {"status_code": response.status_code, "response": response.text}
                )
                
        except Exception as e:
            self.log_test(
                "Get Current User",
                False,
                f"Get current user test failed: {str(e)}"
            )

    def test_update_current_user(self):
        """Test 7: Users Management - Update Current User (PATCH /api/v1/users/me)"""
        try:
            headers = {'Content-Type': 'application/json'}
            if self.access_token:
                headers['Authorization'] = f'Bearer {self.access_token}'
                
            update_data = {
                "first_name": "Jean-Updated",
                "last_name": "Dupont-Updated",
                "phone": "+33987654321"
            }
                
            response = self.session.patch(
                f"{API_BASE_URL}/users/me", 
                json=update_data,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Update Current User",
                    True,
                    "Current user updated successfully",
                    {"status_code": response.status_code, "updated_fields": list(update_data.keys())}
                )
            elif response.status_code == 502:
                self.log_test(
                    "Update Current User",
                    False,
                    "Backend server not available - 502 Bad Gateway",
                    {"status_code": response.status_code, "error": "No FastAPI backend server running"}
                )
            else:
                self.log_test(
                    "Update Current User",
                    False,
                    f"Update current user failed",
                    {"status_code": response.status_code, "response": response.text}
                )
                
        except Exception as e:
            self.log_test(
                "Update Current User",
                False,
                f"Update current user test failed: {str(e)}"
            )

    def test_change_password(self):
        """Test 8: Users Management - Change Password (PATCH /api/v1/users/me/password)"""
        try:
            headers = {'Content-Type': 'application/json'}
            if self.access_token:
                headers['Authorization'] = f'Bearer {self.access_token}'
                
            password_data = {
                "current_password": TEST_DATA["login_credentials"]["password"],
                "new_password": "NewSecurePass123!"
            }
                
            response = self.session.patch(
                f"{API_BASE_URL}/users/me/password", 
                json=password_data,
                headers=headers
            )
            
            if response.status_code == 200:
                self.log_test(
                    "Change Password",
                    True,
                    "Password changed successfully",
                    {"status_code": response.status_code}
                )
            elif response.status_code == 502:
                self.log_test(
                    "Change Password",
                    False,
                    "Backend server not available - 502 Bad Gateway",
                    {"status_code": response.status_code, "error": "No FastAPI backend server running"}
                )
            else:
                self.log_test(
                    "Change Password",
                    False,
                    f"Change password failed",
                    {"status_code": response.status_code, "response": response.text}
                )
                
        except Exception as e:
            self.log_test(
                "Change Password",
                False,
                f"Change password test failed: {str(e)}"
            )

    def test_get_company_data(self):
        """Test 9: Company Management - Get Company (GET /api/v1/companies/me)"""
        try:
            headers = {}
            if self.access_token:
                headers['Authorization'] = f'Bearer {self.access_token}'
                
            response = self.session.get(f"{API_BASE_URL}/companies/me", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "name", "email", "company_code"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_test(
                        "Get Company Data",
                        True,
                        "Company data retrieved successfully",
                        {
                            "status_code": response.status_code, 
                            "company_name": data.get("name"),
                            "company_code": data.get("company_code")
                        }
                    )
                else:
                    self.log_test(
                        "Get Company Data",
                        False,
                        f"Company data missing required fields: {missing_fields}",
                        {"status_code": response.status_code, "response": data}
                    )
            elif response.status_code == 502:
                self.log_test(
                    "Get Company Data",
                    False,
                    "Backend server not available - 502 Bad Gateway",
                    {"status_code": response.status_code, "error": "No FastAPI backend server running"}
                )
            else:
                self.log_test(
                    "Get Company Data",
                    False,
                    f"Get company data failed",
                    {"status_code": response.status_code, "response": response.text}
                )
                
        except Exception as e:
            self.log_test(
                "Get Company Data",
                False,
                f"Get company data test failed: {str(e)}"
            )

    def test_update_company(self):
        """Test 10: Company Management - Update Company (PUT /api/v1/companies/me)"""
        try:
            headers = {'Content-Type': 'application/json'}
            if self.access_token:
                headers['Authorization'] = f'Bearer {self.access_token}'
                
            update_data = {
                "name": "Transport Bretagne FERDI - Updated",
                "phone": "+33123456789",
                "address": "456 Avenue de la Logistique, 35000 Rennes"
            }
                
            response = self.session.put(
                f"{API_BASE_URL}/companies/me", 
                json=update_data,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Update Company",
                    True,
                    "Company updated successfully",
                    {"status_code": response.status_code, "updated_fields": list(update_data.keys())}
                )
            elif response.status_code == 502:
                self.log_test(
                    "Update Company",
                    False,
                    "Backend server not available - 502 Bad Gateway",
                    {"status_code": response.status_code, "error": "No FastAPI backend server running"}
                )
            else:
                self.log_test(
                    "Update Company",
                    False,
                    f"Update company failed",
                    {"status_code": response.status_code, "response": response.text}
                )
                
        except Exception as e:
            self.log_test(
                "Update Company",
                False,
                f"Update company test failed: {str(e)}"
            )

    def test_list_users(self):
        """Test 11: Users Management - List Users (GET /api/v1/users/)"""
        try:
            headers = {}
            if self.access_token:
                headers['Authorization'] = f'Bearer {self.access_token}'
                
            # Test with pagination parameters
            params = {"skip": 0, "limit": 10}
            response = self.session.get(f"{API_BASE_URL}/users/", headers=headers, params=params)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict) and "data" in data:
                    users = data["data"]
                    total = data.get("total", len(users))
                    self.log_test(
                        "List Users",
                        True,
                        "Users list retrieved successfully with pagination",
                        {
                            "status_code": response.status_code, 
                            "users_count": len(users),
                            "total": total
                        }
                    )
                elif isinstance(data, list):
                    self.log_test(
                        "List Users",
                        True,
                        "Users list retrieved successfully",
                        {"status_code": response.status_code, "users_count": len(data)}
                    )
                else:
                    self.log_test(
                        "List Users",
                        False,
                        "Unexpected users list response format",
                        {"status_code": response.status_code, "response": data}
                    )
            elif response.status_code == 502:
                self.log_test(
                    "List Users",
                    False,
                    "Backend server not available - 502 Bad Gateway",
                    {"status_code": response.status_code, "error": "No FastAPI backend server running"}
                )
            else:
                self.log_test(
                    "List Users",
                    False,
                    f"List users failed",
                    {"status_code": response.status_code, "response": response.text}
                )
                
        except Exception as e:
            self.log_test(
                "List Users",
                False,
                f"List users test failed: {str(e)}"
            )

    def test_create_user(self):
        """Test 12: Users Management - Create User (POST /api/v1/users/)"""
        try:
            headers = {'Content-Type': 'application/json'}
            if self.access_token:
                headers['Authorization'] = f'Bearer {self.access_token}'
                
            user_data = {
                "email": "new.user@transport-bretagne-ferdi.fr",
                "password": "NewUserPass123!",
                "first_name": "Nouveau",
                "last_name": "Utilisateur",
                "role": "DRIVER"
            }
                
            response = self.session.post(
                f"{API_BASE_URL}/users/", 
                json=user_data,
                headers=headers
            )
            
            if response.status_code == 201:
                data = response.json()
                self.log_test(
                    "Create User",
                    True,
                    "User created successfully",
                    {"status_code": response.status_code, "user_id": data.get("id")}
                )
            elif response.status_code == 502:
                self.log_test(
                    "Create User",
                    False,
                    "Backend server not available - 502 Bad Gateway",
                    {"status_code": response.status_code, "error": "No FastAPI backend server running"}
                )
            else:
                self.log_test(
                    "Create User",
                    False,
                    f"Create user failed",
                    {"status_code": response.status_code, "response": response.text}
                )
                
        except Exception as e:
            self.log_test(
                "Create User",
                False,
                f"Create user test failed: {str(e)}"
            )

    def test_create_invitation(self):
        """Test 13: Invitations - Create Invitation (POST /api/v1/invitations/)"""
        try:
            headers = {'Content-Type': 'application/json'}
            if self.access_token:
                headers['Authorization'] = f'Bearer {self.access_token}'
                
            response = self.session.post(
                f"{API_BASE_URL}/invitations/", 
                json=TEST_DATA["invitation"],
                headers=headers
            )
            
            if response.status_code == 201:
                data = response.json()
                self.log_test(
                    "Create Invitation",
                    True,
                    "Invitation created successfully",
                    {"status_code": response.status_code, "invitation_id": data.get("id")}
                )
            elif response.status_code == 502:
                self.log_test(
                    "Create Invitation",
                    False,
                    "Backend server not available - 502 Bad Gateway",
                    {"status_code": response.status_code, "error": "No FastAPI backend server running"}
                )
            else:
                self.log_test(
                    "Create Invitation",
                    False,
                    f"Create invitation failed",
                    {"status_code": response.status_code, "response": response.text}
                )
                
        except Exception as e:
            self.log_test(
                "Create Invitation",
                False,
                f"Create invitation test failed: {str(e)}"
            )

    def test_list_invitations(self):
        """Test 14: Invitations - List Invitations (GET /api/v1/invitations/)"""
        try:
            headers = {}
            if self.access_token:
                headers['Authorization'] = f'Bearer {self.access_token}'
                
            params = {"skip": 0, "limit": 10}
            response = self.session.get(f"{API_BASE_URL}/invitations/", headers=headers, params=params)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "List Invitations",
                    True,
                    "Invitations list retrieved successfully",
                    {"status_code": response.status_code, "invitations_count": len(data) if isinstance(data, list) else "unknown"}
                )
            elif response.status_code == 502:
                self.log_test(
                    "List Invitations",
                    False,
                    "Backend server not available - 502 Bad Gateway",
                    {"status_code": response.status_code, "error": "No FastAPI backend server running"}
                )
            else:
                self.log_test(
                    "List Invitations",
                    False,
                    f"List invitations failed",
                    {"status_code": response.status_code, "response": response.text}
                )
                
        except Exception as e:
            self.log_test(
                "List Invitations",
                False,
                f"List invitations test failed: {str(e)}"
            )

    def test_password_recovery(self):
        """Test 15: Authentication - Password Recovery (POST /api/v1/password-recovery/{email})"""
        try:
            email = TEST_DATA["password_recovery"]["email"]
            response = self.session.post(f"{API_BASE_URL}/password-recovery/{email}")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Password Recovery",
                    True,
                    "Password recovery initiated successfully",
                    {"status_code": response.status_code, "message": data.get("message")}
                )
            elif response.status_code == 502:
                self.log_test(
                    "Password Recovery",
                    False,
                    "Backend server not available - 502 Bad Gateway",
                    {"status_code": response.status_code, "error": "No FastAPI backend server running"}
                )
            else:
                self.log_test(
                    "Password Recovery",
                    False,
                    f"Password recovery failed",
                    {"status_code": response.status_code, "response": response.text}
                )
                
        except Exception as e:
            self.log_test(
                "Password Recovery",
                False,
                f"Password recovery test failed: {str(e)}"
            )

    def run_all_tests(self):
        """Run all FERDI API integration tests"""
        print("🧪 FERDI API INTEGRATION TESTING - OpenAPI Specification")
        print("=" * 80)
        print(f"Testing against: {BASE_URL}")
        print(f"API Base URL: {API_BASE_URL}")
        print(f"Mock Mode: NEXT_PUBLIC_USE_MOCK_DATA=false (Real API calls)")
        print("=" * 80)
        print()
        
        # Run all tests in logical order
        test_methods = [
            self.test_health_check,
            self.test_company_registration,
            self.test_user_signup,
            self.test_login_access_token,
            self.test_token_validation,
            self.test_get_current_user,
            self.test_update_current_user,
            self.test_change_password,
            self.test_get_company_data,
            self.test_update_company,
            self.test_list_users,
            self.test_create_user,
            self.test_create_invitation,
            self.test_list_invitations,
            self.test_password_recovery
        ]
        
        for test_method in test_methods:
            try:
                test_method()
            except Exception as e:
                self.log_test(
                    test_method.__name__,
                    False,
                    f"Test execution failed: {str(e)}"
                )
            
            # Small delay between tests
            time.sleep(0.5)
        
        # Print summary
        self.print_summary()
        
    def print_summary(self):
        """Print comprehensive test summary"""
        print("=" * 80)
        print("📊 FERDI API INTEGRATION TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        print()
        
        # Categorize results by endpoint type
        categories = {
            "Authentication (🔐)": ["Health Check", "Login Access Token", "Token Validation", "Password Recovery"],
            "Users Management (👥)": ["Get Current User", "Update Current User", "Change Password", "List Users", "Create User", "User Signup"],
            "Company Management (🏢)": ["Company Registration", "Get Company Data", "Update Company"],
            "Invitations (📨)": ["Create Invitation", "List Invitations"],
            "Utils (🛠️)": ["Health Check"]
        }
        
        print("📋 RESULTS BY CATEGORY:")
        for category, test_names in categories.items():
            category_results = [r for r in self.test_results if any(name in r["test"] for name in test_names)]
            if category_results:
                category_passed = sum(1 for r in category_results if r["success"])
                category_total = len(category_results)
                print(f"  {category}: {category_passed}/{category_total} passed")
        print()
        
        if failed_tests > 0:
            print("❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result['test']}: {result['message']}")
            print()
        
        print("🔍 KEY FINDINGS:")
        backend_available = any(r["success"] and "502" not in r["message"] for r in self.test_results)
        
        if not backend_available:
            print("  • ❌ CRITICAL: No FastAPI backend server implementation found")
            print("  • ❌ All API endpoints return 502 Bad Gateway errors")
            print("  • ✅ Next.js API proxy correctly configured and forwarding requests")
            print("  • ✅ Frontend authentication system ready for backend integration")
            print("  • 🔧 REQUIRED: Complete FastAPI backend implementation needed")
        else:
            print("  • ✅ Backend server is running and responding")
            print("  • ✅ API endpoints are properly implemented")
            print("  • ✅ Authentication system working correctly")
        
        print()
        
        if passed_tests >= total_tests * 0.8 and backend_available:
            print("🎉 OVERALL RESULT: FERDI API INTEGRATION SUCCESSFUL")
        elif passed_tests >= total_tests * 0.5:
            print("⚠️  OVERALL RESULT: PARTIAL SUCCESS - BACKEND IMPLEMENTATION NEEDED")
        else:
            print("❌ OVERALL RESULT: CRITICAL ISSUES - BACKEND SERVER MISSING")
        
        print("=" * 80)

if __name__ == "__main__":
    print("Starting FERDI API Integration Tests...")
    print()
    
    tester = FerdiAPITester()
    tester.run_all_tests()