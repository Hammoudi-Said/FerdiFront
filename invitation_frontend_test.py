#!/usr/bin/env python3
"""
Frontend Component Testing for FERDI Invitation System
Tests that invitation components and pages are properly implemented
"""

import os
import json
from datetime import datetime

class InvitationFrontendTester:
    def __init__(self):
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'details': details or {}
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        if details:
            for key, value in details.items():
                print(f"   {key}: {value}")
    
    def test_invitation_pages_exist(self):
        """Test that invitation pages exist"""
        test_name = "Invitation Pages Exist"
        
        try:
            pages = [
                '/app/app/invitations/page.js',
                '/app/app/invitations/accept/page.js'
            ]
            
            missing_pages = []
            for page in pages:
                if not os.path.exists(page):
                    missing_pages.append(page)
            
            if not missing_pages:
                self.log_test(test_name, True, 
                    "All invitation pages exist",
                    {'pages': pages})
                return True
            else:
                self.log_test(test_name, False, 
                    f"Missing pages: {', '.join(missing_pages)}")
                return False
                
        except Exception as e:
            self.log_test(test_name, False, f"Error checking pages: {str(e)}")
            return False
    
    def test_invitation_components_exist(self):
        """Test that invitation components exist"""
        test_name = "Invitation Components Exist"
        
        try:
            components = [
                '/app/components/invitations/invitations-table.jsx',
                '/app/components/invitations/invitation-accept-form.jsx',
                '/app/components/invitations/create-invitation-modal.jsx'
            ]
            
            missing_components = []
            for component in components:
                if not os.path.exists(component):
                    missing_components.append(component)
            
            if not missing_components:
                self.log_test(test_name, True, 
                    "All invitation components exist",
                    {'components': components})
                return True
            else:
                self.log_test(test_name, False, 
                    f"Missing components: {', '.join(missing_components)}")
                return False
                
        except Exception as e:
            self.log_test(test_name, False, f"Error checking components: {str(e)}")
            return False
    
    def test_invitation_page_implementation(self):
        """Test invitation management page implementation"""
        test_name = "Invitation Page Implementation"
        
        try:
            with open('/app/app/invitations/page.js', 'r') as f:
                content = f.read()
            
            required_features = {
                'invitationsAPI import': 'invitationsAPI' in content,
                'Mock data support': 'USE_MOCK_DATA' in content and 'mockInvitations' in content,
                'Role-based access': 'RoleGuard' in content,
                'Stats cards': 'stats' in content and 'total' in content,
                'Search functionality': 'searchTerm' in content,
                'Create invitation modal': 'CreateInvitationModal' in content,
                'Invitations table': 'InvitationsTable' in content,
                'Resend functionality': 'handleResendInvitation' in content,
                'Cancel functionality': 'handleCancelInvitation' in content
            }
            
            missing_features = [feature for feature, exists in required_features.items() if not exists]
            
            if not missing_features:
                self.log_test(test_name, True, 
                    "All required features implemented in invitation page",
                    required_features)
                return True
            else:
                self.log_test(test_name, False, 
                    f"Missing features: {', '.join(missing_features)}",
                    required_features)
                return False
                
        except Exception as e:
            self.log_test(test_name, False, f"Error checking page implementation: {str(e)}")
            return False
    
    def test_invitation_accept_page_implementation(self):
        """Test invitation acceptance page implementation"""
        test_name = "Invitation Accept Page Implementation"
        
        try:
            with open('/app/app/invitations/accept/page.js', 'r') as f:
                content = f.read()
            
            required_features = {
                'Token parameter handling': 'useSearchParams' in content and 'token' in content,
                'Accept form component': 'InvitationAcceptForm' in content,
                'Error handling': 'error' in content and 'setError' in content,
                'Success handling': 'success' in content and 'setSuccess' in content,
                'Public access': 'RoleGuard' not in content  # Should be public
            }
            
            missing_features = [feature for feature, exists in required_features.items() if not exists]
            
            if not missing_features:
                self.log_test(test_name, True, 
                    "All required features implemented in acceptance page",
                    required_features)
                return True
            else:
                self.log_test(test_name, False, 
                    f"Missing features: {', '.join(missing_features)}",
                    required_features)
                return False
                
        except Exception as e:
            self.log_test(test_name, False, f"Error checking acceptance page: {str(e)}")
            return False
    
    def test_invitation_table_component(self):
        """Test invitations table component"""
        test_name = "Invitations Table Component"
        
        try:
            with open('/app/components/invitations/invitations-table.jsx', 'r') as f:
                content = f.read()
            
            required_features = {
                'Status badges': 'getStatusBadge' in content,
                'Role information': 'getRoleInfo' in content and 'ROLE_DEFINITIONS' in content,
                'Expiry handling': 'isExpired' in content,
                'Action buttons': 'onResendInvitation' in content and 'onCancelInvitation' in content,
                'Permission checks': 'canResend' in content and 'canCancel' in content,
                'Loading states': 'actionLoading' in content,
                'Empty state': 'Aucune invitation' in content
            }
            
            missing_features = [feature for feature, exists in required_features.items() if not exists]
            
            if not missing_features:
                self.log_test(test_name, True, 
                    "All required features implemented in table component",
                    required_features)
                return True
            else:
                self.log_test(test_name, False, 
                    f"Missing features: {', '.join(missing_features)}",
                    required_features)
                return False
                
        except Exception as e:
            self.log_test(test_name, False, f"Error checking table component: {str(e)}")
            return False
    
    def test_create_invitation_modal(self):
        """Test create invitation modal component"""
        test_name = "Create Invitation Modal"
        
        try:
            with open('/app/components/invitations/create-invitation-modal.jsx', 'r') as f:
                content = f.read()
            
            required_features = {
                'Form validation': 'useForm' in content and 'formErrors' in content,
                'Role filtering': 'getAvailableRoles' in content,
                'Mock data support': 'USE_MOCK_DATA' in content,
                'API integration': 'invitationsAPI.createInvitation' in content,
                'Required fields': 'email' in content and 'role' in content,
                'Optional fields': 'first_name' in content and 'personal_message' in content,
                'Error handling': 'setErrors' in content,
                'Success callback': 'onInvitationCreated' in content
            }
            
            missing_features = [feature for feature, exists in required_features.items() if not exists]
            
            if not missing_features:
                self.log_test(test_name, True, 
                    "All required features implemented in create modal",
                    required_features)
                return True
            else:
                self.log_test(test_name, False, 
                    f"Missing features: {', '.join(missing_features)}",
                    required_features)
                return False
                
        except Exception as e:
            self.log_test(test_name, False, f"Error checking create modal: {str(e)}")
            return False
    
    def test_invitation_accept_form(self):
        """Test invitation acceptance form component"""
        test_name = "Invitation Accept Form"
        
        try:
            with open('/app/components/invitations/invitation-accept-form.jsx', 'r') as f:
                content = f.read()
            
            required_features = {
                'Form validation': 'useForm' in content and 'errors' in content,
                'Required fields': 'first_name' in content and 'last_name' in content and 'mobile' in content and 'password' in content,
                'Password confirmation': 'confirmPassword' in content,
                'Mock data support': 'USE_MOCK_DATA' in content,
                'API integration': 'invitationsAPI.acceptInvitation' in content,
                'Token handling': 'invitation_token' in content,
                'Success handling': 'onSuccess' in content,
                'Error handling': 'onError' in content,
                'Password visibility toggle': 'showPassword' in content
            }
            
            missing_features = [feature for feature, exists in required_features.items() if not exists]
            
            if not missing_features:
                self.log_test(test_name, True, 
                    "All required features implemented in accept form",
                    required_features)
                return True
            else:
                self.log_test(test_name, False, 
                    f"Missing features: {', '.join(missing_features)}",
                    required_features)
                return False
                
        except Exception as e:
            self.log_test(test_name, False, f"Error checking accept form: {str(e)}")
            return False
    
    def test_role_based_access_control(self):
        """Test role-based access control implementation"""
        test_name = "Role-Based Access Control"
        
        try:
            with open('/app/app/invitations/page.js', 'r') as f:
                content = f.read()
            
            # Check for proper role restrictions
            if "allowedRoles={['1', '2']}" in content:
                self.log_test(test_name, True, 
                    "Role-based access control properly implemented - only super_admin and admin can access",
                    {
                        'allowed_roles': ['1 (super_admin)', '2 (admin)'],
                        'access_control': 'RoleGuard component used'
                    })
                return True
            else:
                self.log_test(test_name, False, 
                    "Role-based access control not properly configured")
                return False
                
        except Exception as e:
            self.log_test(test_name, False, f"Error checking role-based access: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all frontend tests"""
        print("=" * 80)
        print("FERDI INVITATION SYSTEM FRONTEND TESTING")
        print("=" * 80)
        print(f"Mock data enabled: {os.getenv('NEXT_PUBLIC_USE_MOCK_DATA', 'false')}")
        print("-" * 80)
        
        tests = [
            self.test_invitation_pages_exist,
            self.test_invitation_components_exist,
            self.test_invitation_page_implementation,
            self.test_invitation_accept_page_implementation,
            self.test_invitation_table_component,
            self.test_create_invitation_modal,
            self.test_invitation_accept_form,
            self.test_role_based_access_control
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
            except Exception as e:
                print(f"❌ FAIL {test.__name__}: Unexpected error: {str(e)}")
        
        print("-" * 80)
        print(f"RESULTS: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
        
        if passed == total:
            print("🎉 ALL FRONTEND TESTS PASSED! Invitation system frontend is properly implemented.")
        else:
            print("⚠️  Some frontend tests failed. Check the details above.")
        
        print("=" * 80)
        
        return passed, total, self.test_results

def main():
    """Main test execution"""
    tester = InvitationFrontendTester()
    passed, total, results = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/invitation_frontend_test_results.json', 'w') as f:
        json.dump({
            'summary': {
                'passed': passed,
                'total': total,
                'success_rate': (passed/total)*100,
                'timestamp': datetime.now().isoformat()
            },
            'tests': results
        }, f, indent=2)
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)