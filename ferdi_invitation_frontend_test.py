#!/usr/bin/env python3
"""
FERDI Invitation System Frontend Testing - Post-Corrections Verification
Tests the invitation system frontend functionality after corrections:
1. Invitation pages accessibility
2. Mock data functionality
3. Permission fixes verification
4. System completeness
"""

import requests
import json
import time
import os
import sys
from datetime import datetime

# Configuration based on review request
BASE_URL = "http://localhost:3000"

class FerdiInvitationFrontendTester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'FERDI-Frontend-Tester/1.0'
        })
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str, details: dict = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details:
            for key, value in details.items():
                print(f"    {key}: {value}")
        print()

    def test_frontend_accessibility(self):
        """Test 1: Verify frontend is accessible"""
        try:
            response = self.session.get(f"{BASE_URL}/", timeout=10)
            
            if response.status_code == 200:
                self.log_test(
                    "Frontend Accessibility",
                    True,
                    "FERDI frontend is accessible and responding",
                    {"status_code": response.status_code, "content_length": len(response.text)}
                )
                return True
            else:
                self.log_test(
                    "Frontend Accessibility",
                    False,
                    f"Frontend returned unexpected status code: {response.status_code}"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Frontend Accessibility",
                False,
                f"Cannot access frontend: {str(e)}"
            )
            return False

    def test_invitations_page_accessibility(self):
        """Test 2: Verify invitations page is accessible"""
        try:
            response = self.session.get(f"{BASE_URL}/invitations", timeout=10)
            
            if response.status_code == 200:
                content = response.text
                
                # Check for invitation-related content
                invitation_indicators = [
                    "invitations",
                    "Invitations",
                    "Nouvelle invitation",
                    "invitation"
                ]
                
                found_indicators = []
                for indicator in invitation_indicators:
                    if indicator in content:
                        found_indicators.append(indicator)
                
                if found_indicators:
                    self.log_test(
                        "Invitations Page Accessibility",
                        True,
                        "Invitations page is accessible and contains invitation content",
                        {"found_indicators": found_indicators}
                    )
                    return True
                else:
                    self.log_test(
                        "Invitations Page Accessibility",
                        False,
                        "Invitations page accessible but missing invitation content",
                        {"checked_indicators": invitation_indicators}
                    )
                    return False
            else:
                self.log_test(
                    "Invitations Page Accessibility",
                    False,
                    f"Invitations page returned status code: {response.status_code}"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Invitations Page Accessibility",
                False,
                f"Cannot access invitations page: {str(e)}"
            )
            return False

    def test_invitations_demo_page(self):
        """Test 3: Verify invitations demo page (mentioned in review request)"""
        try:
            response = self.session.get(f"{BASE_URL}/invitations-demo", timeout=10)
            
            if response.status_code == 200:
                content = response.text
                
                # Check for demo-specific content
                demo_indicators = [
                    "demo",
                    "Demo",
                    "démonstration",
                    "Démonstration",
                    "mock",
                    "test"
                ]
                
                found_indicators = []
                for indicator in demo_indicators:
                    if indicator in content:
                        found_indicators.append(indicator)
                
                self.log_test(
                    "Invitations Demo Page",
                    True,
                    "Invitations demo page is accessible",
                    {"status_code": response.status_code, "found_indicators": found_indicators}
                )
                return True
            else:
                self.log_test(
                    "Invitations Demo Page",
                    False,
                    f"Demo page returned status code: {response.status_code}"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Invitations Demo Page",
                False,
                f"Cannot access demo page: {str(e)}"
            )
            return False

    def test_accept_demo_page(self):
        """Test 4: Verify invitation acceptance demo page"""
        try:
            response = self.session.get(f"{BASE_URL}/invitations/accept-demo", timeout=10)
            
            if response.status_code == 200:
                content = response.text
                
                # Check for acceptance form content
                accept_indicators = [
                    "accept",
                    "accepter",
                    "Accepter",
                    "invitation",
                    "password",
                    "mot de passe",
                    "first_name",
                    "last_name"
                ]
                
                found_indicators = []
                for indicator in accept_indicators:
                    if indicator in content:
                        found_indicators.append(indicator)
                
                if len(found_indicators) >= 3:  # Should find several form-related indicators
                    self.log_test(
                        "Accept Demo Page",
                        True,
                        "Invitation acceptance demo page is accessible and contains form elements",
                        {"found_indicators": found_indicators}
                    )
                    return True
                else:
                    self.log_test(
                        "Accept Demo Page",
                        False,
                        "Accept demo page accessible but missing form content",
                        {"found_indicators": found_indicators}
                    )
                    return False
            else:
                self.log_test(
                    "Accept Demo Page",
                    False,
                    f"Accept demo page returned status code: {response.status_code}"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Accept Demo Page",
                False,
                f"Cannot access accept demo page: {str(e)}"
            )
            return False

    def test_invitation_components_exist(self):
        """Test 5: Verify invitation components exist and have content"""
        try:
            component_files = [
                '/app/components/invitations/create-invitation-modal.jsx',
                '/app/components/invitations/invitations-table.jsx',
                '/app/components/invitations/invitation-accept-form.jsx'
            ]
            
            existing_components = []
            missing_components = []
            
            for file_path in component_files:
                try:
                    with open(file_path, 'r') as f:
                        content = f.read()
                        if len(content) > 500:  # Component should have substantial content
                            existing_components.append(file_path)
                        else:
                            missing_components.append(f"{file_path} (minimal content)")
                except FileNotFoundError:
                    missing_components.append(f"{file_path} (not found)")
            
            if len(existing_components) >= 2:  # Most components should exist
                self.log_test(
                    "Invitation Components Exist",
                    True,
                    f"Invitation components exist with {len(existing_components)}/{len(component_files)} files",
                    {"existing": len(existing_components), "missing": missing_components}
                )
                return True
            else:
                self.log_test(
                    "Invitation Components Exist",
                    False,
                    f"Missing invitation components - only {len(existing_components)}/{len(component_files)} found",
                    {"missing": missing_components}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Invitation Components Exist",
                False,
                f"Error checking components: {str(e)}"
            )
            return False

    def test_mock_data_configuration(self):
        """Test 6: Verify mock data is properly configured"""
        try:
            # Check environment configuration
            with open('/app/.env.local', 'r') as f:
                env_content = f.read()
            
            mock_enabled = 'NEXT_PUBLIC_USE_MOCK_DATA=true' in env_content
            
            # Check if invitation pages have mock data support
            with open('/app/app/invitations/page.js', 'r') as f:
                page_content = f.read()
            
            has_mock_support = 'USE_MOCK_DATA' in page_content and 'mockInvitations' in page_content
            
            # Check if demo page exists
            demo_exists = os.path.exists('/app/app/invitations-demo/page.js')
            
            if mock_enabled and has_mock_support and demo_exists:
                self.log_test(
                    "Mock Data Configuration",
                    True,
                    "Mock data properly configured for invitation system",
                    {
                        "env_enabled": mock_enabled,
                        "page_support": has_mock_support,
                        "demo_exists": demo_exists
                    }
                )
                return True
            else:
                self.log_test(
                    "Mock Data Configuration",
                    False,
                    "Mock data configuration incomplete",
                    {
                        "env_enabled": mock_enabled,
                        "page_support": has_mock_support,
                        "demo_exists": demo_exists
                    }
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Mock Data Configuration",
                False,
                f"Error checking mock data configuration: {str(e)}"
            )
            return False

    def test_permissions_fix_verification(self):
        """Test 7: Verify invitation permissions fix (invitations_manage vs users_manage)"""
        try:
            # Check key files for correct permission usage
            files_to_check = [
                '/app/components/invitations/invitations-table.jsx',
                '/app/app/invitations/page.js',
                '/app/components/invitations/create-invitation-modal.jsx'
            ]
            
            permissions_correct = True
            issues_found = []
            files_checked = 0
            
            for file_path in files_to_check:
                try:
                    with open(file_path, 'r') as f:
                        content = f.read()
                        files_checked += 1
                    
                    # Check for correct permission usage
                    if 'invitations_manage' in content:
                        # Good - using correct permission
                        continue
                    elif 'users_manage' in content and 'invitation' in content.lower():
                        # Bad - still using old permission for invitations
                        permissions_correct = False
                        issues_found.append(f"File {file_path} may still use 'users_manage' for invitations")
                        
                except FileNotFoundError:
                    # File doesn't exist, note but don't fail
                    issues_found.append(f"File {file_path} not found")
                    continue
            
            if permissions_correct and files_checked > 0:
                self.log_test(
                    "Permissions Fix Verification",
                    True,
                    "Invitation permissions appear to be correctly configured",
                    {"files_checked": files_checked, "issues": issues_found}
                )
                return True
            else:
                self.log_test(
                    "Permissions Fix Verification",
                    False,
                    "Issues found with invitation permissions or no files checked",
                    {"files_checked": files_checked, "issues": issues_found}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Permissions Fix Verification",
                False,
                f"Error checking permissions fix: {str(e)}"
            )
            return False

    def test_api_client_integration(self):
        """Test 8: Verify invitationsAPI is properly integrated"""
        try:
            with open('/app/lib/api-client.js', 'r') as f:
                content = f.read()
            
            # Check for invitationsAPI export
            if 'export const invitationsAPI' not in content:
                self.log_test(
                    "API Client Integration",
                    False,
                    "invitationsAPI not exported in api-client.js"
                )
                return False
            
            # Check for required methods
            required_methods = [
                'createInvitation',
                'getInvitations',
                'acceptInvitation',
                'cancelInvitation',
                'resendInvitation'
            ]
            
            missing_methods = []
            for method in required_methods:
                if method not in content:
                    missing_methods.append(method)
            
            if missing_methods:
                self.log_test(
                    "API Client Integration",
                    False,
                    f"Missing methods in invitationsAPI: {', '.join(missing_methods)}"
                )
                return False
            
            self.log_test(
                "API Client Integration",
                True,
                "All invitationsAPI methods properly exported",
                {"methods": required_methods}
            )
            return True
            
        except Exception as e:
            self.log_test(
                "API Client Integration",
                False,
                f"Error checking API client: {str(e)}"
            )
            return False

    def test_french_localization(self):
        """Test 9: Verify French localization in invitation system"""
        try:
            # Check invitation page for French content
            with open('/app/app/invitations/page.js', 'r') as f:
                page_content = f.read()
            
            # Check for French text indicators
            french_indicators = [
                'Nouvelle invitation',
                'Invitations',
                'Créer',
                'Supprimer',
                'Renvoyer',
                'Accepté',
                'En attente',
                'Expiré'
            ]
            
            found_french = []
            for indicator in french_indicators:
                if indicator in page_content:
                    found_french.append(indicator)
            
            # Also check components
            try:
                with open('/app/components/invitations/create-invitation-modal.jsx', 'r') as f:
                    modal_content = f.read()
                
                modal_french = [
                    'Email',
                    'Rôle',
                    'Prénom',
                    'Nom',
                    'Téléphone',
                    'Message'
                ]
                
                for indicator in modal_french:
                    if indicator in modal_content:
                        found_french.append(indicator)
                        
            except FileNotFoundError:
                pass
            
            if len(found_french) >= 4:  # Should find several French terms
                self.log_test(
                    "French Localization",
                    True,
                    "French localization properly implemented in invitation system",
                    {"found_terms": found_french[:6]}  # Show first 6
                )
                return True
            else:
                self.log_test(
                    "French Localization",
                    False,
                    "Limited French localization found",
                    {"found_terms": found_french}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "French Localization",
                False,
                f"Error checking French localization: {str(e)}"
            )
            return False

    def test_system_completeness_after_corrections(self):
        """Test 10: Verify system completeness after corrections"""
        try:
            # Check for all required files and features
            required_elements = {
                "invitation_page": "/app/app/invitations/page.js",
                "demo_page": "/app/app/invitations-demo/page.js",
                "accept_demo": "/app/app/invitations/accept-demo/page.js",
                "create_modal": "/app/components/invitations/create-invitation-modal.jsx",
                "table_component": "/app/components/invitations/invitations-table.jsx",
                "accept_form": "/app/components/invitations/invitation-accept-form.jsx",
                "api_client": "/app/lib/api-client.js",
                "env_config": "/app/.env.local"
            }
            
            existing_elements = {}
            missing_elements = []
            
            for element_name, file_path in required_elements.items():
                try:
                    with open(file_path, 'r') as f:
                        content = f.read()
                        if len(content) > 50:  # File has content
                            existing_elements[element_name] = True
                        else:
                            missing_elements.append(f"{element_name} (empty)")
                except FileNotFoundError:
                    missing_elements.append(f"{element_name} (not found)")
                    existing_elements[element_name] = False
            
            completeness_score = len([v for v in existing_elements.values() if v]) / len(required_elements)
            
            if completeness_score >= 0.8:  # 80% of elements should exist
                self.log_test(
                    "System Completeness After Corrections",
                    True,
                    f"Invitation system appears complete ({completeness_score*100:.0f}% of elements found)",
                    {"completeness": f"{completeness_score*100:.0f}%", "missing": missing_elements}
                )
                return True
            else:
                self.log_test(
                    "System Completeness After Corrections",
                    False,
                    f"Invitation system incomplete ({completeness_score*100:.0f}% of elements found)",
                    {"completeness": f"{completeness_score*100:.0f}%", "missing": missing_elements}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "System Completeness After Corrections",
                False,
                f"Error checking system completeness: {str(e)}"
            )
            return False

    def run_all_tests(self):
        """Run all invitation system frontend tests"""
        print("🎯 FERDI INVITATION SYSTEM - FRONTEND POST-CORRECTIONS TESTING")
        print("=" * 80)
        print(f"Testing Base URL: {BASE_URL}")
        print(f"Focus: Frontend functionality and mock data after corrections")
        print("=" * 80)
        print()
        
        # Run all tests
        test_methods = [
            self.test_frontend_accessibility,
            self.test_invitations_page_accessibility,
            self.test_invitations_demo_page,
            self.test_accept_demo_page,
            self.test_invitation_components_exist,
            self.test_mock_data_configuration,
            self.test_permissions_fix_verification,
            self.test_api_client_integration,
            self.test_french_localization,
            self.test_system_completeness_after_corrections
        ]
        
        passed = 0
        total = len(test_methods)
        
        for test_method in test_methods:
            try:
                if test_method():
                    passed += 1
            except Exception as e:
                self.log_test(
                    test_method.__name__,
                    False,
                    f"Test execution failed: {str(e)}"
                )
            
            # Small delay between tests
            time.sleep(0.2)
        
        # Print summary
        self.print_summary(passed, total)
        return passed, total

    def print_summary(self, passed: int, total: int):
        """Print test summary"""
        print("=" * 80)
        print("📊 FERDI INVITATION SYSTEM FRONTEND TEST SUMMARY")
        print("=" * 80)
        
        success_rate = (passed / total) * 100
        
        print(f"Total Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {total - passed}")
        print(f"Success Rate: {success_rate:.1f}%")
        print()
        
        if total - passed > 0:
            print("❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result['test']}: {result['message']}")
            print()
        
        print("✅ KEY FINDINGS:")
        print("  • Frontend accessibility and page functionality")
        print("  • Mock data configuration and demo pages")
        print("  • Permission fixes verification (invitations_manage)")
        print("  • Component completeness and French localization")
        print("  • System readiness after corrections")
        print()
        
        if success_rate >= 80:
            print("🎉 OVERALL RESULT: INVITATION SYSTEM FRONTEND CORRECTIONS SUCCESSFUL")
        else:
            print("⚠️  OVERALL RESULT: FRONTEND ISSUES DETECTED - REVIEW REQUIRED")
        
        print("=" * 80)

if __name__ == "__main__":
    print("Starting FERDI Invitation System Frontend Post-Corrections Testing...")
    print()
    
    tester = FerdiInvitationFrontendTester()
    passed, total = tester.run_all_tests()
    
    # Save results
    with open('/app/ferdi_invitation_frontend_test_results.json', 'w') as f:
        json.dump({
            'summary': {
                'passed': passed,
                'total': total,
                'success_rate': (passed/total)*100,
                'timestamp': datetime.now().isoformat()
            },
            'tests': tester.test_results
        }, f, indent=2)
    
    sys.exit(0 if passed == total else 1)