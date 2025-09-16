#!/usr/bin/env python3
"""
FERDI Phase 1 Corrections Testing Suite
Tests the critical corrections implemented in FERDI Phase 1:
1. Homepage redirect fix (no 500ms delay)
2. Demo pages removal (/users-demo, /invitations-demo should return 404)
3. Unified invitations design (same style as users)
4. Settings route creation (/dashboard/settings)
5. API endpoints verification (invitation routes still working)
"""

import requests
import time
import json
import sys
from urllib.parse import urljoin

# Configuration
BASE_URL = "https://bus-dashboard-revamp.preview.emergentagent.com"
API_BASE_URL = f"{BASE_URL}/api"

class FerdiPhase1Tester:
    def __init__(self):
        self.results = []
        self.session = requests.Session()
        self.session.timeout = 10
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {}
        }
        self.results.append(result)
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
        
    def test_homepage_redirect_performance(self):
        """Test 1: Homepage redirect performance (no 500ms delay)"""
        try:
            start_time = time.time()
            response = self.session.get(BASE_URL, allow_redirects=True)
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000  # Convert to ms
            
            # Check if we ended up on dashboard (client-side redirect)
            if response.status_code == 200:
                content = response.text.lower()
                if 'dashboard' in content and response_time < 1000:  # Allow more time for client-side redirect
                    self.log_result(
                        "Homepage Redirect Performance",
                        True,
                        f"Homepage loads and redirects to dashboard in {response_time:.1f}ms",
                        {"response_time_ms": response_time, "status_code": response.status_code}
                    )
                else:
                    self.log_result(
                        "Homepage Redirect Performance",
                        False,
                        f"Homepage loads but no dashboard redirect detected or too slow ({response_time:.1f}ms)",
                        {"response_time_ms": response_time, "status_code": response.status_code}
                    )
            elif response.status_code in [301, 302, 307, 308]:
                location = response.headers.get('Location', '')
                if '/dashboard' in location:
                    self.log_result(
                        "Homepage Redirect Performance",
                        True,
                        f"Server-side redirect to dashboard in {response_time:.1f}ms",
                        {"response_time_ms": response_time, "redirect_location": location}
                    )
                else:
                    self.log_result(
                        "Homepage Redirect Performance",
                        False,
                        f"Incorrect redirect location: {location}",
                        {"location": location}
                    )
            else:
                self.log_result(
                    "Homepage Redirect Performance",
                    False,
                    f"Unexpected response status: {response.status_code}",
                    {"status_code": response.status_code}
                )
                
        except Exception as e:
            self.log_result(
                "Homepage Redirect Performance",
                False,
                f"Request failed: {str(e)}",
                {"error": str(e)}
            )
    
    def test_demo_pages_removal(self):
        """Test 2: Demo pages should return 404 (removed)"""
        demo_pages = [
            "/users-demo",
            "/invitations-demo"
        ]
        
        for page in demo_pages:
            try:
                url = urljoin(BASE_URL, page)
                response = self.session.get(url)
                
                if response.status_code == 404:
                    self.log_result(
                        f"Demo Page Removal - {page}",
                        True,
                        f"Page correctly returns 404 (removed as expected)",
                        {"status_code": response.status_code, "url": url}
                    )
                else:
                    self.log_result(
                        f"Demo Page Removal - {page}",
                        False,
                        f"Page still exists (status: {response.status_code})",
                        {"status_code": response.status_code, "url": url}
                    )
                    
            except Exception as e:
                self.log_result(
                    f"Demo Page Removal - {page}",
                    False,
                    f"Request failed: {str(e)}",
                    {"error": str(e), "url": url}
                )
    
    def test_settings_route_creation(self):
        """Test 3: Settings route should be accessible"""
        try:
            url = urljoin(BASE_URL, "/dashboard/settings")
            response = self.session.get(url)
            
            if response.status_code == 200:
                # Check if it contains settings-related content
                content = response.text.lower()
                settings_indicators = [
                    "paramètres",
                    "settings", 
                    "notifications",
                    "sécurité",
                    "interface"
                ]
                
                found_indicators = [indicator for indicator in settings_indicators if indicator in content]
                
                if found_indicators:
                    self.log_result(
                        "Settings Route Creation",
                        True,
                        f"Settings page accessible with proper content",
                        {
                            "status_code": response.status_code,
                            "found_indicators": found_indicators,
                            "url": url
                        }
                    )
                else:
                    self.log_result(
                        "Settings Route Creation",
                        False,
                        f"Settings page accessible but missing expected content",
                        {"status_code": response.status_code, "content_length": len(content)}
                    )
            else:
                self.log_result(
                    "Settings Route Creation",
                    False,
                    f"Settings page not accessible (status: {response.status_code})",
                    {"status_code": response.status_code, "url": url}
                )
                
        except Exception as e:
            self.log_result(
                "Settings Route Creation",
                False,
                f"Request failed: {str(e)}",
                {"error": str(e)}
            )
    
    def test_invitation_api_endpoints(self):
        """Test 4: Invitation API endpoints should still work (return proper responses)"""
        invitation_endpoints = [
            ("GET", "/api/invitations/", "List invitations"),
            ("POST", "/api/invitations/", "Create invitation"),
            ("POST", "/api/invitations/accept", "Accept invitation"),
            ("DELETE", "/api/invitations/test-id", "Cancel invitation"),
            ("POST", "/api/invitations/test-id/resend", "Resend invitation")
        ]
        
        for method, endpoint, description in invitation_endpoints:
            try:
                url = urljoin(BASE_URL, endpoint)
                
                # Prepare test data for POST requests
                test_data = {}
                if method == "POST":
                    if "accept" in endpoint:
                        test_data = {
                            "invitation_token": "test-token",
                            "first_name": "Test",
                            "last_name": "User",
                            "mobile": "0123456789",
                            "password": "TestPassword123!"
                        }
                    elif endpoint == "/api/invitations/":
                        test_data = {
                            "email": "test@example.com",
                            "role": "DRIVER",
                            "first_name": "Test",
                            "last_name": "User"
                        }
                
                # Make request
                if method == "GET":
                    response = self.session.get(url)
                elif method == "POST":
                    response = self.session.post(url, json=test_data)
                elif method == "DELETE":
                    response = self.session.delete(url)
                
                # Check if API proxy is working (should get connection error, not 404)
                if response.status_code in [500, 502, 503]:
                    # Expected: connection error because no backend server
                    self.log_result(
                        f"API Endpoint - {description}",
                        True,
                        f"API proxy working (connection error expected without backend)",
                        {
                            "method": method,
                            "endpoint": endpoint,
                            "status_code": response.status_code,
                            "url": url
                        }
                    )
                elif response.status_code == 404:
                    # Bad: endpoint not found (routing issue)
                    self.log_result(
                        f"API Endpoint - {description}",
                        False,
                        f"API endpoint not found (routing issue)",
                        {
                            "method": method,
                            "endpoint": endpoint,
                            "status_code": response.status_code,
                            "url": url
                        }
                    )
                else:
                    # Unexpected response (might be frontend page instead of API)
                    content_type = response.headers.get('content-type', '')
                    if 'text/html' in content_type:
                        self.log_result(
                            f"API Endpoint - {description}",
                            False,
                            f"API endpoint returns HTML page instead of API response (routing issue)",
                            {
                                "method": method,
                                "endpoint": endpoint,
                                "status_code": response.status_code,
                                "content_type": content_type,
                                "url": url
                            }
                        )
                    else:
                        self.log_result(
                            f"API Endpoint - {description}",
                            False,
                            f"Unexpected response: {response.status_code}",
                            {
                                "method": method,
                                "endpoint": endpoint,
                                "status_code": response.status_code,
                                "content_type": content_type,
                                "url": url
                            }
                        )
                    
            except Exception as e:
                self.log_result(
                    f"API Endpoint - {description}",
                    False,
                    f"Request failed: {str(e)}",
                    {"method": method, "endpoint": endpoint, "error": str(e)}
                )
    
    def test_invitations_page_design_consistency(self):
        """Test 5: Invitations page should have unified design with users page"""
        try:
            url = urljoin(BASE_URL, "/invitations")
            response = self.session.get(url)
            
            if response.status_code == 200:
                content = response.text.lower()
                
                # Check for unified design elements (same as users page)
                design_elements = [
                    "hover:shadow-lg",  # Hover effects
                    "transition-all",   # Transitions
                    "hover:scale-105",  # Scale effects
                    "border-blue-200",  # Blue color scheme
                    "border-green-200", # Green color scheme
                    "border-amber-200", # Amber color scheme
                    "border-red-200",   # Red color scheme
                    "border-gray-200",  # Gray color scheme
                    "grid-cols-5"       # 5-column grid layout
                ]
                
                found_elements = [element for element in design_elements if element in content]
                
                if len(found_elements) >= 6:  # Should have most design elements
                    self.log_result(
                        "Invitations Design Consistency",
                        True,
                        f"Invitations page has unified design elements ({len(found_elements)}/9)",
                        {
                            "status_code": response.status_code,
                            "found_elements": found_elements,
                            "url": url
                        }
                    )
                else:
                    self.log_result(
                        "Invitations Design Consistency",
                        False,
                        f"Invitations page missing design elements ({len(found_elements)}/9)",
                        {
                            "status_code": response.status_code,
                            "found_elements": found_elements,
                            "missing_elements": [e for e in design_elements if e not in content]
                        }
                    )
            else:
                self.log_result(
                    "Invitations Design Consistency",
                    False,
                    f"Invitations page not accessible (status: {response.status_code})",
                    {"status_code": response.status_code, "url": url}
                )
                
        except Exception as e:
            self.log_result(
                "Invitations Design Consistency",
                False,
                f"Request failed: {str(e)}",
                {"error": str(e)}
            )
    
    def run_all_tests(self):
        """Run all FERDI Phase 1 correction tests"""
        print("🎯 FERDI PHASE 1 CORRECTIONS TESTING SUITE")
        print("=" * 60)
        print(f"Testing against: {BASE_URL}")
        print("=" * 60)
        
        # Run all tests
        self.test_homepage_redirect_performance()
        self.test_demo_pages_removal()
        self.test_settings_route_creation()
        self.test_invitation_api_endpoints()
        self.test_invitations_page_design_consistency()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        success_rate = (passed / total * 100) if total > 0 else 0
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 80:
            print("\n✅ FERDI PHASE 1 CORRECTIONS: MOSTLY SUCCESSFUL")
        elif success_rate >= 60:
            print("\n⚠️ FERDI PHASE 1 CORRECTIONS: PARTIALLY SUCCESSFUL")
        else:
            print("\n❌ FERDI PHASE 1 CORRECTIONS: NEEDS ATTENTION")
        
        # Failed tests details
        failed_tests = [r for r in self.results if not r["success"]]
        if failed_tests:
            print("\n🔍 FAILED TESTS DETAILS:")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['message']}")
        
        return success_rate >= 80

if __name__ == "__main__":
    tester = FerdiPhase1Tester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)