#!/usr/bin/env python3
"""
FERDI Backend Authentication System Test Suite

This test suite verifies the complete authentication flow for the FERDI 
French bus fleet management system, including:
- Company registration with manager creation
- Employee signup with company codes
- Login/logout with JWT tokens
- Protected routes and role-based access
- API proxy functionality
- User and company data retrieval
- Error handling for invalid credentials/codes
"""

import requests
import json
import time
import os
from urllib.parse import urljoin

# Test configuration
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://99fa6806-2563-4c1e-a2ab-5557c0bc6cab.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

# Test data
TEST_COMPANY_DATA = {
    "company": {
        "name": "Transport Bretagne SARL",
        "address": "15 Rue de la Gare, 29000 Quimper",
        "phone": "02.98.55.44.33",
        "email": "contact@transport-bretagne.fr",
        "siret": "12345678901234"
    },
    "manager_email": "manager@transport-bretagne.fr",
    "manager_password": "SecurePass123!",
    "manager_first_name": "Jean",
    "manager_last_name": "Dupont",
    "manager_phone": "06.12.34.56.78"
}

TEST_EMPLOYEE_DATA = {
    "email": "chauffeur@transport-bretagne.fr",
    "password": "EmployeePass123!",
    "first_name": "Pierre",
    "last_name": "Martin",
    "phone": "06.87.65.43.21",
    "role": "4",  # CHAUFFEUR
    "company_code": ""  # Will be filled after company registration
}

class FERDIBackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'FERDI-Backend-Tester/1.0'
        })
        self.company_code = None
        self.manager_token = None
        self.employee_token = None
        self.manager_user = None
        self.employee_user = None
        self.company_data = None
        
    def log_test(self, test_name, success, message="", details=None):
        """Log test results with consistent formatting"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"\n{status} - {test_name}")
        if message:
            print(f"   Message: {message}")
        if details:
            print(f"   Details: {json.dumps(details, indent=2)}")
        return success

    def test_api_proxy_connectivity(self):
        """Test 1: Verify API proxy is working and forwarding requests correctly"""
        print("\n" + "="*60)
        print("TEST 1: API Proxy Connectivity")
        print("="*60)
        
        try:
            # Test a simple endpoint to verify proxy is working
            response = self.session.get(f"{API_BASE}/users/me")
            
            # We expect 401 (unauthorized) which means the proxy is working
            # and forwarding to the backend correctly
            if response.status_code == 401:
                return self.log_test(
                    "API Proxy Connectivity", 
                    True, 
                    "API proxy is correctly forwarding requests (401 unauthorized as expected)"
                )
            else:
                return self.log_test(
                    "API Proxy Connectivity", 
                    False, 
                    f"Unexpected response code: {response.status_code}",
                    {"response_text": response.text[:500]}
                )
                
        except Exception as e:
            return self.log_test(
                "API Proxy Connectivity", 
                False, 
                f"Connection error: {str(e)}"
            )

    def test_company_registration(self):
        """Test 2: Company registration with manager creation"""
        print("\n" + "="*60)
        print("TEST 2: Company Registration")
        print("="*60)
        
        try:
            response = self.session.post(
                f"{API_BASE}/companies/register",
                json=TEST_COMPANY_DATA
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'company_code' in data:
                    self.company_code = data['company_code']
                    TEST_EMPLOYEE_DATA['company_code'] = self.company_code
                    return self.log_test(
                        "Company Registration", 
                        True, 
                        f"Company registered successfully with code: {self.company_code}",
                        data
                    )
                else:
                    return self.log_test(
                        "Company Registration", 
                        False, 
                        "Registration successful but no company_code returned",
                        data
                    )
            else:
                return self.log_test(
                    "Company Registration", 
                    False, 
                    f"Registration failed with status {response.status_code}",
                    {"response": response.text[:500]}
                )
                
        except Exception as e:
            return self.log_test(
                "Company Registration", 
                False, 
                f"Request error: {str(e)}"
            )

    def test_manager_login(self):
        """Test 3: Manager login with JWT token handling"""
        print("\n" + "="*60)
        print("TEST 3: Manager Login")
        print("="*60)
        
        try:
            # Prepare form data for login (as per the API proxy code)
            form_data = {
                'username': TEST_COMPANY_DATA['manager_email'],
                'password': TEST_COMPANY_DATA['manager_password']
            }
            
            response = self.session.post(
                f"{API_BASE}/login/access-token",
                data=form_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'access_token' in data:
                    self.manager_token = data['access_token']
                    # Set authorization header for future requests
                    self.session.headers.update({
                        'Authorization': f'Bearer {self.manager_token}'
                    })
                    return self.log_test(
                        "Manager Login", 
                        True, 
                        "Manager login successful, JWT token received"
                    )
                else:
                    return self.log_test(
                        "Manager Login", 
                        False, 
                        "Login successful but no access_token returned",
                        data
                    )
            else:
                return self.log_test(
                    "Manager Login", 
                    False, 
                    f"Login failed with status {response.status_code}",
                    {"response": response.text[:500]}
                )
                
        except Exception as e:
            return self.log_test(
                "Manager Login", 
                False, 
                f"Request error: {str(e)}"
            )

    def test_get_current_user(self):
        """Test 4: Get current user data with JWT authentication"""
        print("\n" + "="*60)
        print("TEST 4: Get Current User")
        print("="*60)
        
        if not self.manager_token:
            return self.log_test(
                "Get Current User", 
                False, 
                "No manager token available (previous test failed)"
            )
        
        try:
            response = self.session.get(f"{API_BASE}/users/me")
            
            if response.status_code == 200:
                self.manager_user = response.json()
                return self.log_test(
                    "Get Current User", 
                    True, 
                    f"User data retrieved successfully for {self.manager_user.get('email', 'unknown')}",
                    self.manager_user
                )
            else:
                return self.log_test(
                    "Get Current User", 
                    False, 
                    f"Failed to get user data, status {response.status_code}",
                    {"response": response.text[:500]}
                )
                
        except Exception as e:
            return self.log_test(
                "Get Current User", 
                False, 
                f"Request error: {str(e)}"
            )

    def test_get_company_data(self):
        """Test 5: Get user's company data"""
        print("\n" + "="*60)
        print("TEST 5: Get Company Data")
        print("="*60)
        
        if not self.manager_token:
            return self.log_test(
                "Get Company Data", 
                False, 
                "No manager token available (previous test failed)"
            )
        
        try:
            response = self.session.get(f"{API_BASE}/companies/me")
            
            if response.status_code == 200:
                self.company_data = response.json()
                return self.log_test(
                    "Get Company Data", 
                    True, 
                    f"Company data retrieved successfully for {self.company_data.get('name', 'unknown')}",
                    self.company_data
                )
            else:
                return self.log_test(
                    "Get Company Data", 
                    False, 
                    f"Failed to get company data, status {response.status_code}",
                    {"response": response.text[:500]}
                )
                
        except Exception as e:
            return self.log_test(
                "Get Company Data", 
                False, 
                f"Request error: {str(e)}"
            )

    def test_employee_signup(self):
        """Test 6: Employee signup with company code validation"""
        print("\n" + "="*60)
        print("TEST 6: Employee Signup")
        print("="*60)
        
        if not self.company_code:
            return self.log_test(
                "Employee Signup", 
                False, 
                "No company code available (company registration failed)"
            )
        
        try:
            response = self.session.post(
                f"{API_BASE}/users/signup",
                json=TEST_EMPLOYEE_DATA
            )
            
            if response.status_code == 200:
                data = response.json()
                return self.log_test(
                    "Employee Signup", 
                    True, 
                    f"Employee signup successful for {TEST_EMPLOYEE_DATA['email']}",
                    data
                )
            else:
                return self.log_test(
                    "Employee Signup", 
                    False, 
                    f"Employee signup failed with status {response.status_code}",
                    {"response": response.text[:500]}
                )
                
        except Exception as e:
            return self.log_test(
                "Employee Signup", 
                False, 
                f"Request error: {str(e)}"
            )

    def test_employee_login(self):
        """Test 7: Employee login and role verification"""
        print("\n" + "="*60)
        print("TEST 7: Employee Login")
        print("="*60)
        
        try:
            # Create a new session for employee to avoid token conflicts
            employee_session = requests.Session()
            employee_session.headers.update({
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'FERDI-Backend-Tester/1.0'
            })
            
            form_data = {
                'username': TEST_EMPLOYEE_DATA['email'],
                'password': TEST_EMPLOYEE_DATA['password']
            }
            
            response = employee_session.post(
                f"{API_BASE}/login/access-token",
                data=form_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'access_token' in data:
                    self.employee_token = data['access_token']
                    
                    # Test getting employee user data
                    employee_session.headers.update({
                        'Authorization': f'Bearer {self.employee_token}',
                        'Content-Type': 'application/json'
                    })
                    
                    user_response = employee_session.get(f"{API_BASE}/users/me")
                    if user_response.status_code == 200:
                        self.employee_user = user_response.json()
                        return self.log_test(
                            "Employee Login", 
                            True, 
                            f"Employee login successful, role: {self.employee_user.get('role', 'unknown')}",
                            {"user": self.employee_user}
                        )
                    else:
                        return self.log_test(
                            "Employee Login", 
                            False, 
                            "Login successful but failed to get user data",
                            {"login_response": data, "user_response": user_response.text[:500]}
                        )
                else:
                    return self.log_test(
                        "Employee Login", 
                        False, 
                        "Login successful but no access_token returned",
                        data
                    )
            else:
                return self.log_test(
                    "Employee Login", 
                    False, 
                    f"Employee login failed with status {response.status_code}",
                    {"response": response.text[:500]}
                )
                
        except Exception as e:
            return self.log_test(
                "Employee Login", 
                False, 
                f"Request error: {str(e)}"
            )

    def test_role_based_access(self):
        """Test 8: Role-based access control (admin-only endpoints)"""
        print("\n" + "="*60)
        print("TEST 8: Role-Based Access Control")
        print("="*60)
        
        if not self.manager_token or not self.employee_token:
            return self.log_test(
                "Role-Based Access Control", 
                False, 
                "Missing tokens for role-based testing"
            )
        
        try:
            # Test admin endpoint with manager token (should work)
            manager_session = requests.Session()
            manager_session.headers.update({
                'Authorization': f'Bearer {self.manager_token}',
                'Content-Type': 'application/json',
                'User-Agent': 'FERDI-Backend-Tester/1.0'
            })
            
            manager_response = manager_session.get(f"{API_BASE}/users/")
            
            # Test admin endpoint with employee token (should fail)
            employee_session = requests.Session()
            employee_session.headers.update({
                'Authorization': f'Bearer {self.employee_token}',
                'Content-Type': 'application/json',
                'User-Agent': 'FERDI-Backend-Tester/1.0'
            })
            
            employee_response = employee_session.get(f"{API_BASE}/users/")
            
            # Evaluate results
            manager_success = manager_response.status_code == 200
            employee_blocked = employee_response.status_code in [401, 403]
            
            if manager_success and employee_blocked:
                return self.log_test(
                    "Role-Based Access Control", 
                    True, 
                    f"Manager access: {manager_response.status_code}, Employee blocked: {employee_response.status_code}",
                    {
                        "manager_response_code": manager_response.status_code,
                        "employee_response_code": employee_response.status_code
                    }
                )
            else:
                return self.log_test(
                    "Role-Based Access Control", 
                    False, 
                    f"Role-based access not working correctly. Manager: {manager_response.status_code}, Employee: {employee_response.status_code}",
                    {
                        "manager_response": manager_response.text[:300],
                        "employee_response": employee_response.text[:300]
                    }
                )
                
        except Exception as e:
            return self.log_test(
                "Role-Based Access Control", 
                False, 
                f"Request error: {str(e)}"
            )

    def test_invalid_credentials(self):
        """Test 9: Error handling for invalid credentials"""
        print("\n" + "="*60)
        print("TEST 9: Invalid Credentials Handling")
        print("="*60)
        
        try:
            form_data = {
                'username': 'invalid@email.com',
                'password': 'wrongpassword'
            }
            
            response = self.session.post(
                f"{API_BASE}/login/access-token",
                data=form_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            # Should return 401 or 400 for invalid credentials
            if response.status_code in [400, 401]:
                return self.log_test(
                    "Invalid Credentials Handling", 
                    True, 
                    f"Invalid credentials correctly rejected with status {response.status_code}"
                )
            else:
                return self.log_test(
                    "Invalid Credentials Handling", 
                    False, 
                    f"Unexpected response for invalid credentials: {response.status_code}",
                    {"response": response.text[:500]}
                )
                
        except Exception as e:
            return self.log_test(
                "Invalid Credentials Handling", 
                False, 
                f"Request error: {str(e)}"
            )

    def test_invalid_company_code(self):
        """Test 10: Error handling for invalid company codes"""
        print("\n" + "="*60)
        print("TEST 10: Invalid Company Code Handling")
        print("="*60)
        
        try:
            invalid_employee_data = TEST_EMPLOYEE_DATA.copy()
            invalid_employee_data['company_code'] = 'INVALID123'
            invalid_employee_data['email'] = 'test@invalid.com'
            
            response = self.session.post(
                f"{API_BASE}/users/signup",
                json=invalid_employee_data
            )
            
            # Should return 400 or 404 for invalid company code
            if response.status_code in [400, 404]:
                return self.log_test(
                    "Invalid Company Code Handling", 
                    True, 
                    f"Invalid company code correctly rejected with status {response.status_code}"
                )
            else:
                return self.log_test(
                    "Invalid Company Code Handling", 
                    False, 
                    f"Unexpected response for invalid company code: {response.status_code}",
                    {"response": response.text[:500]}
                )
                
        except Exception as e:
            return self.log_test(
                "Invalid Company Code Handling", 
                False, 
                f"Request error: {str(e)}"
            )

    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print("🚀 Starting FERDI Backend Authentication System Tests")
        print(f"🌐 Testing against: {BASE_URL}")
        print("="*80)
        
        test_results = []
        
        # Run all tests in order
        test_results.append(self.test_api_proxy_connectivity())
        test_results.append(self.test_company_registration())
        test_results.append(self.test_manager_login())
        test_results.append(self.test_get_current_user())
        test_results.append(self.test_get_company_data())
        test_results.append(self.test_employee_signup())
        test_results.append(self.test_employee_login())
        test_results.append(self.test_role_based_access())
        test_results.append(self.test_invalid_credentials())
        test_results.append(self.test_invalid_company_code())
        
        # Summary
        print("\n" + "="*80)
        print("📊 TEST SUMMARY")
        print("="*80)
        
        passed = sum(test_results)
        total = len(test_results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        
        if passed == total:
            print("\n🎉 ALL TESTS PASSED! The FERDI backend authentication system is working correctly.")
        else:
            print(f"\n⚠️  {total - passed} test(s) failed. Please review the detailed output above.")
        
        return passed == total

if __name__ == "__main__":
    tester = FERDIBackendTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)