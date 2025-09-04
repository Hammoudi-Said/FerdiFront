#!/usr/bin/env python3
"""
FERDI Backend API Testing Suite - User Management APIs
Testing the user management endpoints according to OpenAPI v3.1.0 specification
"""

import requests
import json
import sys
from datetime import datetime
import uuid

# Configuration
BACKEND_URL = "http://localhost:8000"  # From .env.local NEXT_PUBLIC_BASE_URL
API_BASE = f"{BACKEND_URL}/api/v1"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_test_header(title):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}{title}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.ENDC}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.ENDC}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.ENDC}")

class UserManagementAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.test_results = []
        self.created_user_ids = []
        
    def log_result(self, test_name, success, message, response=None):
        """Log test result"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat()
        }
        if response:
            result['status_code'] = response.status_code
            result['response_time'] = getattr(response, 'elapsed', None)
        
        self.test_results.append(result)
        
        if success:
            print_success(f"{test_name}: {message}")
        else:
            print_error(f"{test_name}: {message}")
            
    def test_get_users_list(self):
        """Test GET /api/v1/users/ - Liste des utilisateurs"""
        print_test_header("Testing GET /api/v1/users/ - Liste des utilisateurs")
        
        try:
            # Test basic list
            response = self.session.get(f"{API_BASE}/users/")
            
            if response.status_code == 200:
                data = response.json()
                self.log_result(
                    "GET /users/ - Basic List", 
                    True, 
                    f"Successfully retrieved users list. Count: {len(data.get('items', []))}"
                )
                
                # Test with pagination parameters
                response_paginated = self.session.get(f"{API_BASE}/users/", params={
                    'skip': 0,
                    'limit': 10
                })
                
                if response_paginated.status_code == 200:
                    self.log_result(
                        "GET /users/ - With Pagination", 
                        True, 
                        "Successfully retrieved users with pagination parameters"
                    )
                else:
                    self.log_result(
                        "GET /users/ - With Pagination", 
                        False, 
                        f"Failed with status {response_paginated.status_code}"
                    )
                    
                # Test with search parameters
                response_search = self.session.get(f"{API_BASE}/users/", params={
                    'search': 'admin',
                    'role': 'admin',
                    'is_active': True
                })
                
                if response_search.status_code == 200:
                    self.log_result(
                        "GET /users/ - With Search Filters", 
                        True, 
                        "Successfully retrieved users with search filters"
                    )
                else:
                    self.log_result(
                        "GET /users/ - With Search Filters", 
                        False, 
                        f"Failed with status {response_search.status_code}"
                    )
                    
            elif response.status_code == 502:
                self.log_result(
                    "GET /users/ - Basic List", 
                    False, 
                    "502 Bad Gateway - No backend server running (expected without FastAPI server)"
                )
            else:
                self.log_result(
                    "GET /users/ - Basic List", 
                    False, 
                    f"Failed with status {response.status_code}: {response.text}"
                )
                
        except requests.exceptions.ConnectionError:
            self.log_result(
                "GET /users/ - Basic List", 
                False, 
                "Connection error - Backend server not accessible"
            )
        except Exception as e:
            self.log_result(
                "GET /users/ - Basic List", 
                False, 
                f"Unexpected error: {str(e)}"
            )

    def test_create_user(self):
        """Test POST /api/v1/users/ - Créer un utilisateur"""
        print_test_header("Testing POST /api/v1/users/ - Créer un utilisateur")
        
        # Test data for user creation
        test_users = [
            {
                "email": "jean.dupont@ferdi-test.com",
                "first_name": "Jean",
                "last_name": "Dupont",
                "mobile": "+33123456789",
                "role": "driver",
                "password": "SecurePass123!",
                "is_active": True
            },
            {
                "email": "marie.martin@ferdi-test.com", 
                "first_name": "Marie",
                "last_name": "Martin",
                "mobile": "+33987654321",
                "role": "dispatcher",
                "password": "SecurePass456!",
                "is_active": True
            }
        ]
        
        for i, user_data in enumerate(test_users):
            try:
                response = self.session.post(f"{API_BASE}/users/", json=user_data)
                
                if response.status_code == 201:
                    created_user = response.json()
                    user_id = created_user.get('id')
                    if user_id:
                        self.created_user_ids.append(user_id)
                    
                    self.log_result(
                        f"POST /users/ - Create User {i+1}", 
                        True, 
                        f"Successfully created user: {user_data['email']}"
                    )
                elif response.status_code == 502:
                    self.log_result(
                        f"POST /users/ - Create User {i+1}", 
                        False, 
                        "502 Bad Gateway - No backend server running (expected without FastAPI server)"
                    )
                else:
                    self.log_result(
                        f"POST /users/ - Create User {i+1}", 
                        False, 
                        f"Failed with status {response.status_code}: {response.text}"
                    )
                    
            except requests.exceptions.ConnectionError:
                self.log_result(
                    f"POST /users/ - Create User {i+1}", 
                    False, 
                    "Connection error - Backend server not accessible"
                )
            except Exception as e:
                self.log_result(
                    f"POST /users/ - Create User {i+1}", 
                    False, 
                    f"Unexpected error: {str(e)}"
                )

    def test_update_user(self):
        """Test PATCH /api/v1/users/{user_id} - Modifier un utilisateur"""
        print_test_header("Testing PATCH /api/v1/users/{user_id} - Modifier un utilisateur")
        
        # Use a test UUID for user ID
        test_user_id = str(uuid.uuid4())
        
        update_data = {
            "first_name": "Jean-Updated",
            "last_name": "Dupont-Updated", 
            "mobile": "+33111222333",
            "is_active": False
        }
        
        try:
            response = self.session.patch(f"{API_BASE}/users/{test_user_id}", json=update_data)
            
            if response.status_code == 200:
                updated_user = response.json()
                self.log_result(
                    "PATCH /users/{user_id} - Update User", 
                    True, 
                    f"Successfully updated user {test_user_id}"
                )
            elif response.status_code == 404:
                self.log_result(
                    "PATCH /users/{user_id} - Update User", 
                    True, 
                    f"404 Not Found for user {test_user_id} (expected for test UUID)"
                )
            elif response.status_code == 502:
                self.log_result(
                    "PATCH /users/{user_id} - Update User", 
                    False, 
                    "502 Bad Gateway - No backend server running (expected without FastAPI server)"
                )
            else:
                self.log_result(
                    "PATCH /users/{user_id} - Update User", 
                    False, 
                    f"Failed with status {response.status_code}: {response.text}"
                )
                
        except requests.exceptions.ConnectionError:
            self.log_result(
                "PATCH /users/{user_id} - Update User", 
                False, 
                "Connection error - Backend server not accessible"
            )
        except Exception as e:
            self.log_result(
                "PATCH /users/{user_id} - Update User", 
                False, 
                f"Unexpected error: {str(e)}"
            )

    def test_delete_user(self):
        """Test DELETE /api/v1/users/{user_id} - Supprimer un utilisateur"""
        print_test_header("Testing DELETE /api/v1/users/{user_id} - Supprimer un utilisateur")
        
        # Use a test UUID for user ID
        test_user_id = str(uuid.uuid4())
        
        try:
            response = self.session.delete(f"{API_BASE}/users/{test_user_id}")
            
            if response.status_code == 204:
                self.log_result(
                    "DELETE /users/{user_id} - Delete User", 
                    True, 
                    f"Successfully deleted user {test_user_id}"
                )
            elif response.status_code == 404:
                self.log_result(
                    "DELETE /users/{user_id} - Delete User", 
                    True, 
                    f"404 Not Found for user {test_user_id} (expected for test UUID)"
                )
            elif response.status_code == 502:
                self.log_result(
                    "DELETE /users/{user_id} - Delete User", 
                    False, 
                    "502 Bad Gateway - No backend server running (expected without FastAPI server)"
                )
            else:
                self.log_result(
                    "DELETE /users/{user_id} - Delete User", 
                    False, 
                    f"Failed with status {response.status_code}: {response.text}"
                )
                
        except requests.exceptions.ConnectionError:
            self.log_result(
                "DELETE /users/{user_id} - Delete User", 
                False, 
                "Connection error - Backend server not accessible"
            )
        except Exception as e:
            self.log_result(
                "DELETE /users/{user_id} - Delete User", 
                False, 
                f"Unexpected error: {str(e)}"
            )

    def test_bulk_operations(self):
        """Test POST /api/v1/users/bulk - Opérations en lot"""
        print_test_header("Testing POST /api/v1/users/bulk - Opérations en lot")
        
        # Test different bulk operations
        bulk_operations = [
            {
                "operation": "activate",
                "user_ids": [str(uuid.uuid4()), str(uuid.uuid4())],
                "description": "Bulk Activate Users"
            },
            {
                "operation": "deactivate", 
                "user_ids": [str(uuid.uuid4()), str(uuid.uuid4())],
                "description": "Bulk Deactivate Users"
            },
            {
                "operation": "lock",
                "user_ids": [str(uuid.uuid4())],
                "description": "Bulk Lock User"
            },
            {
                "operation": "unlock",
                "user_ids": [str(uuid.uuid4())],
                "description": "Bulk Unlock User"
            }
        ]
        
        for operation in bulk_operations:
            try:
                response = self.session.post(f"{API_BASE}/users/bulk", json=operation)
                
                if response.status_code == 200:
                    result = response.json()
                    self.log_result(
                        f"POST /users/bulk - {operation['description']}", 
                        True, 
                        f"Successfully executed bulk operation: {operation['operation']}"
                    )
                elif response.status_code == 502:
                    self.log_result(
                        f"POST /users/bulk - {operation['description']}", 
                        False, 
                        "502 Bad Gateway - No backend server running (expected without FastAPI server)"
                    )
                else:
                    self.log_result(
                        f"POST /users/bulk - {operation['description']}", 
                        False, 
                        f"Failed with status {response.status_code}: {response.text}"
                    )
                    
            except requests.exceptions.ConnectionError:
                self.log_result(
                    f"POST /users/bulk - {operation['description']}", 
                    False, 
                    "Connection error - Backend server not accessible"
                )
            except Exception as e:
                self.log_result(
                    f"POST /users/bulk - {operation['description']}", 
                    False, 
                    f"Unexpected error: {str(e)}"
                )

    def test_additional_user_endpoints(self):
        """Test additional user management endpoints"""
        print_test_header("Testing Additional User Management Endpoints")
        
        test_user_id = str(uuid.uuid4())
        
        # Test GET /users/{user_id} - Get user by ID
        try:
            response = self.session.get(f"{API_BASE}/users/{test_user_id}")
            
            if response.status_code == 200:
                self.log_result(
                    "GET /users/{user_id} - Get User by ID", 
                    True, 
                    f"Successfully retrieved user {test_user_id}"
                )
            elif response.status_code == 404:
                self.log_result(
                    "GET /users/{user_id} - Get User by ID", 
                    True, 
                    f"404 Not Found for user {test_user_id} (expected for test UUID)"
                )
            elif response.status_code == 502:
                self.log_result(
                    "GET /users/{user_id} - Get User by ID", 
                    False, 
                    "502 Bad Gateway - No backend server running (expected without FastAPI server)"
                )
            else:
                self.log_result(
                    "GET /users/{user_id} - Get User by ID", 
                    False, 
                    f"Failed with status {response.status_code}: {response.text}"
                )
                
        except requests.exceptions.ConnectionError:
            self.log_result(
                "GET /users/{user_id} - Get User by ID", 
                False, 
                "Connection error - Backend server not accessible"
            )
        except Exception as e:
            self.log_result(
                "GET /users/{user_id} - Get User by ID", 
                False, 
                f"Unexpected error: {str(e)}"
            )

        # Test PATCH /users/{user_id}/role - Update user role
        role_data = {"role": "admin"}
        try:
            response = self.session.patch(f"{API_BASE}/users/{test_user_id}/role", json=role_data)
            
            if response.status_code == 200:
                self.log_result(
                    "PATCH /users/{user_id}/role - Update User Role", 
                    True, 
                    f"Successfully updated role for user {test_user_id}"
                )
            elif response.status_code == 404:
                self.log_result(
                    "PATCH /users/{user_id}/role - Update User Role", 
                    True, 
                    f"404 Not Found for user {test_user_id} (expected for test UUID)"
                )
            elif response.status_code == 502:
                self.log_result(
                    "PATCH /users/{user_id}/role - Update User Role", 
                    False, 
                    "502 Bad Gateway - No backend server running (expected without FastAPI server)"
                )
            else:
                self.log_result(
                    "PATCH /users/{user_id}/role - Update User Role", 
                    False, 
                    f"Failed with status {response.status_code}: {response.text}"
                )
                
        except requests.exceptions.ConnectionError:
            self.log_result(
                "PATCH /users/{user_id}/role - Update User Role", 
                False, 
                "Connection error - Backend server not accessible"
            )
        except Exception as e:
            self.log_result(
                "PATCH /users/{user_id}/role - Update User Role", 
                False, 
                f"Unexpected error: {str(e)}"
            )

        # Test PATCH /users/{user_id}/status - Update user status
        status_data = {"is_active": False, "is_locked": True}
        try:
            response = self.session.patch(f"{API_BASE}/users/{test_user_id}/status", json=status_data)
            
            if response.status_code == 200:
                self.log_result(
                    "PATCH /users/{user_id}/status - Update User Status", 
                    True, 
                    f"Successfully updated status for user {test_user_id}"
                )
            elif response.status_code == 404:
                self.log_result(
                    "PATCH /users/{user_id}/status - Update User Status", 
                    True, 
                    f"404 Not Found for user {test_user_id} (expected for test UUID)"
                )
            elif response.status_code == 502:
                self.log_result(
                    "PATCH /users/{user_id}/status - Update User Status", 
                    False, 
                    "502 Bad Gateway - No backend server running (expected without FastAPI server)"
                )
            else:
                self.log_result(
                    "PATCH /users/{user_id}/status - Update User Status", 
                    False, 
                    f"Failed with status {response.status_code}: {response.text}"
                )
                
        except requests.exceptions.ConnectionError:
            self.log_result(
                "PATCH /users/{user_id}/status - Update User Status", 
                False, 
                "Connection error - Backend server not accessible"
            )
        except Exception as e:
            self.log_result(
                "PATCH /users/{user_id}/status - Update User Status", 
                False, 
                f"Unexpected error: {str(e)}"
            )

    def test_api_proxy_configuration(self):
        """Test that the Next.js API proxy is correctly configured"""
        print_test_header("Testing Next.js API Proxy Configuration")
        
        # Test if the proxy is forwarding requests correctly
        try:
            # Make request to Next.js API proxy
            proxy_url = "http://localhost:3000/api/users/"
            response = requests.get(proxy_url, timeout=10)
            
            if response.status_code == 500:
                # Check if it's a connection error (expected when no backend)
                try:
                    error_data = response.json()
                    if "Erreur de connexion au serveur" in error_data.get('message', ''):
                        self.log_result(
                            "Next.js API Proxy Configuration", 
                            True, 
                            "API proxy correctly configured - returns connection error as expected (no backend server)"
                        )
                    else:
                        self.log_result(
                            "Next.js API Proxy Configuration", 
                            False, 
                            f"Unexpected error response: {error_data}"
                        )
                except:
                    self.log_result(
                        "Next.js API Proxy Configuration", 
                        False, 
                        f"500 error but couldn't parse JSON response: {response.text}"
                    )
            else:
                self.log_result(
                    "Next.js API Proxy Configuration", 
                    False, 
                    f"Unexpected status code {response.status_code} from proxy"
                )
                
        except requests.exceptions.ConnectionError:
            self.log_result(
                "Next.js API Proxy Configuration", 
                False, 
                "Cannot connect to Next.js frontend (port 3000) - frontend not running"
            )
        except Exception as e:
            self.log_result(
                "Next.js API Proxy Configuration", 
                False, 
                f"Unexpected error testing proxy: {str(e)}"
            )

    def run_all_tests(self):
        """Run all user management API tests"""
        print_test_header("FERDI Backend API Testing - User Management")
        print_info(f"Testing backend at: {BACKEND_URL}")
        print_info(f"API base URL: {API_BASE}")
        print_info("Testing user management endpoints according to OpenAPI v3.1.0 specification")
        
        # Run all tests
        self.test_get_users_list()
        self.test_create_user()
        self.test_update_user()
        self.test_delete_user()
        self.test_bulk_operations()
        self.test_additional_user_endpoints()
        self.test_api_proxy_configuration()
        
        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print_test_header("TEST SUMMARY")
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r['success']])
        failed_tests = total_tests - passed_tests
        
        print_info(f"Total tests: {total_tests}")
        print_success(f"Passed: {passed_tests}")
        print_error(f"Failed: {failed_tests}")
        
        if failed_tests > 0:
            print_warning("\nFailed tests:")
            for result in self.test_results:
                if not result['success']:
                    print_error(f"  - {result['test']}: {result['message']}")
        
        # Check for backend server status
        backend_errors = [r for r in self.test_results if 'Backend server not accessible' in r['message'] or '502 Bad Gateway' in r['message']]
        if backend_errors:
            print_warning(f"\n⚠️  CRITICAL ISSUE DETECTED:")
            print_warning(f"   {len(backend_errors)} tests failed due to missing backend server")
            print_warning(f"   Expected FastAPI server at: {BACKEND_URL}")
            print_warning(f"   All user management APIs require backend implementation")
        
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        print_info(f"\nSuccess rate: {success_rate:.1f}%")
        
        return success_rate >= 80

def main():
    """Main test execution"""
    tester = UserManagementAPITester()
    success = tester.run_all_tests()
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()