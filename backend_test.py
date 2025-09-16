#!/usr/bin/env python3
"""
FERDI Authentication API Optimization Test Suite
===============================================

Tests the authentication API call optimization implemented in FERDI.
Measures API call reduction, cache efficiency, and performance improvements.

OBJECTIVES:
- Verify elimination of double API calls during authentication
- Test smart cache system with 15min TTL
- Measure authentication performance improvements
- Validate protection against concurrent calls
"""

import requests
import json
import time
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import os
from urllib.parse import urljoin

# Configuration
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://bus-dashboard-revamp.preview.emergentagent.com')
API_BASE_URL = f"{BASE_URL}/api"
USE_MOCK_DATA = os.getenv('NEXT_PUBLIC_USE_MOCK_DATA', 'true').lower() == 'true'

# Test credentials from review request
TEST_EMAIL = "manager@transport-bretagne.fr"
TEST_PASSWORD = "SecurePass123!"

class APICallTracker:
    """Track API calls to measure optimization effectiveness"""
    
    def __init__(self):
        self.calls = []
        self.start_time = None
        self.end_time = None
    
    def start_tracking(self):
        """Start tracking API calls"""
        self.calls = []
        self.start_time = time.time()
        print(f"🔍 Starting API call tracking at {datetime.now().strftime('%H:%M:%S')}")
    
    def stop_tracking(self):
        """Stop tracking and return results"""
        self.end_time = time.time()
        duration = self.end_time - self.start_time
        print(f"⏱️ Tracking stopped. Duration: {duration:.2f}s, Total calls: {len(self.calls)}")
        return {
            'total_calls': len(self.calls),
            'duration': duration,
            'calls': self.calls,
            'calls_per_second': len(self.calls) / duration if duration > 0 else 0
        }
    
    def log_call(self, method: str, url: str, status_code: int, response_time: float, cached: bool = False):
        """Log an API call"""
        call_info = {
            'timestamp': time.time(),
            'method': method,
            'url': url,
            'status_code': status_code,
            'response_time': response_time,
            'cached': cached
        }
        self.calls.append(call_info)
        cache_indicator = "💾 CACHED" if cached else "🌐 API"
        print(f"  {cache_indicator} {method} {url} -> {status_code} ({response_time:.3f}s)")

class FerdiAuthTester:
    """FERDI Authentication Optimization Tester"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.timeout = 30
        self.tracker = APICallTracker()
        self.auth_token = None
        
        # Headers for API requests
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'FERDI-Auth-Tester/1.0'
        })
    
    def make_request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """Make an API request with tracking"""
        url = urljoin(API_BASE_URL, endpoint)
        start_time = time.time()
        
        try:
            response = self.session.request(method, url, **kwargs)
            response_time = time.time() - start_time
            
            # Check if response indicates cached data
            cached = 'x-cache' in response.headers or 'cache-hit' in response.headers.get('x-ferdi-cache', '')
            
            self.tracker.log_call(method, endpoint, response.status_code, response_time, cached)
            return response
            
        except requests.exceptions.RequestException as e:
            response_time = time.time() - start_time
            self.tracker.log_call(method, endpoint, 0, response_time)
            raise e
    
    def test_login_flow(self) -> Dict:
        """Test complete login flow and measure API calls"""
        print("\n🔐 Testing Login Flow Optimization")
        print("=" * 50)
        
        self.tracker.start_tracking()
        
        try:
            # Step 1: Login request
            print("1️⃣ Performing login...")
            login_data = {
                'grant_type': 'password',
                'username': TEST_EMAIL,
                'password': TEST_PASSWORD,
                'scope': '',
                'client_id': '',
                'client_secret': ''
            }
            
            # Convert to form data for OAuth2
            form_data = '&'.join([f"{k}={v}" for k, v in login_data.items()])
            
            login_response = self.make_request(
                'POST', 
                '/auth/login',
                data=form_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if login_response.status_code == 200:
                try:
                    token_data = login_response.json()
                    self.auth_token = token_data.get('access_token')
                    if self.auth_token:
                        self.session.headers['Authorization'] = f'Bearer {self.auth_token}'
                        print(f"✅ Login successful, token obtained")
                    else:
                        print(f"⚠️ Login response missing access_token: {token_data}")
                except json.JSONDecodeError:
                    print(f"⚠️ Login response not JSON: {login_response.text[:200]}")
            else:
                print(f"❌ Login failed: {login_response.status_code} - {login_response.text[:200]}")
            
            # Step 2: Get user profile (should be called once)
            print("2️⃣ Fetching user profile...")
            user_response = self.make_request('GET', '/users/me')
            
            # Step 3: Get company data (should be called once)  
            print("3️⃣ Fetching company data...")
            company_response = self.make_request('GET', '/companies/me')
            
            # Step 4: Simulate second auth check (should use cache)
            print("4️⃣ Simulating second auth check (should use cache)...")
            time.sleep(0.1)  # Small delay to simulate real usage
            user_response_2 = self.make_request('GET', '/users/me')
            company_response_2 = self.make_request('GET', '/companies/me')
            
        except Exception as e:
            print(f"❌ Login flow test failed: {e}")
        
        results = self.tracker.stop_tracking()
        
        # Analyze results
        auth_calls = [call for call in results['calls'] if '/auth/' in call['url']]
        user_calls = [call for call in results['calls'] if '/users/me' in call['url']]
        company_calls = [call for call in results['calls'] if '/companies/me' in call['url']]
        cached_calls = [call for call in results['calls'] if call['cached']]
        
        analysis = {
            'total_api_calls': results['total_calls'],
            'auth_calls': len(auth_calls),
            'user_profile_calls': len(user_calls),
            'company_calls': len(company_calls),
            'cached_calls': len(cached_calls),
            'cache_hit_rate': len(cached_calls) / results['total_calls'] * 100 if results['total_calls'] > 0 else 0,
            'total_duration': results['duration'],
            'average_response_time': sum(call['response_time'] for call in results['calls']) / len(results['calls']) if results['calls'] else 0
        }
        
        print(f"\n📊 Login Flow Analysis:")
        print(f"   Total API calls: {analysis['total_api_calls']} (Target: ≤2)")
        print(f"   Auth calls: {analysis['auth_calls']}")
        print(f"   User profile calls: {analysis['user_profile_calls']}")
        print(f"   Company calls: {analysis['company_calls']}")
        print(f"   Cached responses: {analysis['cached_calls']}")
        print(f"   Cache hit rate: {analysis['cache_hit_rate']:.1f}%")
        print(f"   Total duration: {analysis['total_duration']:.3f}s")
        print(f"   Avg response time: {analysis['average_response_time']:.3f}s")
        
        return analysis
    
    def test_concurrent_auth_calls(self) -> Dict:
        """Test protection against concurrent authentication calls"""
        print("\n🔄 Testing Concurrent Auth Call Protection")
        print("=" * 50)
        
        self.tracker.start_tracking()
        
        def make_auth_request(thread_id: int):
            """Make authentication request in separate thread"""
            try:
                print(f"🧵 Thread {thread_id}: Starting auth request")
                response = self.make_request('GET', '/users/me')
                print(f"🧵 Thread {thread_id}: Response {response.status_code}")
                return response.status_code
            except Exception as e:
                print(f"🧵 Thread {thread_id}: Error {e}")
                return 0
        
        # Launch 5 concurrent authentication requests
        threads = []
        results = []
        
        for i in range(5):
            thread = threading.Thread(target=lambda i=i: results.append(make_auth_request(i)))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        tracking_results = self.tracker.stop_tracking()
        
        analysis = {
            'concurrent_requests': 5,
            'total_api_calls': tracking_results['total_calls'],
            'successful_responses': len([r for r in results if r == 200]),
            'protection_effective': tracking_results['total_calls'] < 5,  # Should be fewer calls due to protection
            'duration': tracking_results['duration']
        }
        
        print(f"\n📊 Concurrent Auth Analysis:")
        print(f"   Concurrent requests sent: {analysis['concurrent_requests']}")
        print(f"   Total API calls made: {analysis['total_api_calls']}")
        print(f"   Successful responses: {analysis['successful_responses']}")
        print(f"   Protection effective: {'✅ Yes' if analysis['protection_effective'] else '❌ No'}")
        print(f"   Duration: {analysis['duration']:.3f}s")
        
        return analysis
    
    def test_cache_efficiency(self) -> Dict:
        """Test smart cache system efficiency"""
        print("\n💾 Testing Smart Cache System")
        print("=" * 50)
        
        # Test 1: Fresh data fetch
        print("1️⃣ Fetching fresh data...")
        self.tracker.start_tracking()
        
        response1 = self.make_request('GET', '/users/me')
        
        results1 = self.tracker.stop_tracking()
        
        # Test 2: Immediate cache hit (should be cached)
        print("2️⃣ Testing immediate cache hit...")
        time.sleep(0.1)
        self.tracker.start_tracking()
        
        response2 = self.make_request('GET', '/users/me')
        
        results2 = self.tracker.stop_tracking()
        
        # Test 3: Multiple rapid requests (should all use cache)
        print("3️⃣ Testing multiple rapid requests...")
        self.tracker.start_tracking()
        
        for i in range(3):
            self.make_request('GET', '/users/me')
            time.sleep(0.05)
        
        results3 = self.tracker.stop_tracking()
        
        analysis = {
            'fresh_fetch_calls': results1['total_calls'],
            'cache_hit_calls': results2['total_calls'],
            'rapid_requests_calls': results3['total_calls'],
            'cache_working': results2['total_calls'] == 0 or any(call['cached'] for call in results2['calls']),
            'rapid_cache_efficiency': len([call for call in results3['calls'] if call['cached']]) / results3['total_calls'] * 100 if results3['total_calls'] > 0 else 0
        }
        
        print(f"\n📊 Cache Efficiency Analysis:")
        print(f"   Fresh fetch calls: {analysis['fresh_fetch_calls']}")
        print(f"   Cache hit test calls: {analysis['cache_hit_calls']}")
        print(f"   Rapid requests calls: {analysis['rapid_requests_calls']}")
        print(f"   Cache system working: {'✅ Yes' if analysis['cache_working'] else '❌ No'}")
        print(f"   Rapid cache efficiency: {analysis['rapid_cache_efficiency']:.1f}%")
        
        return analysis
    
    def test_mock_data_performance(self) -> Dict:
        """Test performance with mock data enabled"""
        print("\n🧪 Testing Mock Data Performance")
        print("=" * 50)
        
        if not USE_MOCK_DATA:
            print("⚠️ Mock data not enabled, skipping test")
            return {'skipped': True, 'reason': 'Mock data not enabled'}
        
        self.tracker.start_tracking()
        
        # Test complete authentication flow with mock data
        try:
            # Login
            login_response = self.make_request('POST', '/auth/login', json={
                'email': TEST_EMAIL,
                'password': TEST_PASSWORD
            })
            
            # Get user data
            user_response = self.make_request('GET', '/users/me')
            
            # Get company data
            company_response = self.make_request('GET', '/companies/me')
            
            # Test cache hit
            user_response_2 = self.make_request('GET', '/users/me')
            
        except Exception as e:
            print(f"❌ Mock data test failed: {e}")
        
        results = self.tracker.stop_tracking()
        
        analysis = {
            'total_calls': results['total_calls'],
            'average_response_time': sum(call['response_time'] for call in results['calls']) / len(results['calls']) if results['calls'] else 0,
            'fastest_response': min(call['response_time'] for call in results['calls']) if results['calls'] else 0,
            'slowest_response': max(call['response_time'] for call in results['calls']) if results['calls'] else 0,
            'mock_data_enabled': USE_MOCK_DATA
        }
        
        print(f"\n📊 Mock Data Performance Analysis:")
        print(f"   Total API calls: {analysis['total_calls']}")
        print(f"   Average response time: {analysis['average_response_time']:.3f}s")
        print(f"   Fastest response: {analysis['fastest_response']:.3f}s")
        print(f"   Slowest response: {analysis['slowest_response']:.3f}s")
        print(f"   Mock data enabled: {'✅ Yes' if analysis['mock_data_enabled'] else '❌ No'}")
        
        return analysis
    
    def run_comprehensive_test(self) -> Dict:
        """Run all authentication optimization tests"""
        print("🚀 FERDI Authentication API Optimization Test Suite")
        print("=" * 60)
        print(f"📍 Base URL: {BASE_URL}")
        print(f"🧪 Mock Data: {'Enabled' if USE_MOCK_DATA else 'Disabled'}")
        print(f"👤 Test User: {TEST_EMAIL}")
        print(f"⏰ Test Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        results = {}
        
        try:
            # Test 1: Login Flow Optimization
            results['login_flow'] = self.test_login_flow()
            
            # Test 2: Concurrent Call Protection
            results['concurrent_protection'] = self.test_concurrent_auth_calls()
            
            # Test 3: Cache Efficiency
            results['cache_efficiency'] = self.test_cache_efficiency()
            
            # Test 4: Mock Data Performance
            results['mock_performance'] = self.test_mock_data_performance()
            
        except Exception as e:
            print(f"❌ Test suite failed: {e}")
            results['error'] = str(e)
        
        # Overall analysis
        print("\n🎯 OVERALL OPTIMIZATION ANALYSIS")
        print("=" * 50)
        
        login_calls = results.get('login_flow', {}).get('total_api_calls', 0)
        cache_hit_rate = results.get('cache_efficiency', {}).get('rapid_cache_efficiency', 0)
        concurrent_protection = results.get('concurrent_protection', {}).get('protection_effective', False)
        
        # Determine optimization success
        optimization_success = (
            login_calls <= 2 and  # Target: ≤2 API calls for login
            cache_hit_rate >= 50 and  # Target: ≥50% cache hit rate
            concurrent_protection  # Target: Protection against concurrent calls
        )
        
        print(f"🎯 API Call Reduction: {'✅ SUCCESS' if login_calls <= 2 else '❌ NEEDS IMPROVEMENT'} ({login_calls} calls)")
        print(f"💾 Cache Efficiency: {'✅ SUCCESS' if cache_hit_rate >= 50 else '❌ NEEDS IMPROVEMENT'} ({cache_hit_rate:.1f}%)")
        print(f"🛡️ Concurrent Protection: {'✅ SUCCESS' if concurrent_protection else '❌ NEEDS IMPROVEMENT'}")
        print(f"🏆 Overall Optimization: {'✅ SUCCESS' if optimization_success else '❌ NEEDS IMPROVEMENT'}")
        
        results['overall'] = {
            'optimization_successful': optimization_success,
            'api_call_reduction': login_calls <= 2,
            'cache_efficiency_good': cache_hit_rate >= 50,
            'concurrent_protection_working': concurrent_protection,
            'test_timestamp': datetime.now().isoformat()
        }
        
        return results

def main():
    """Main test execution"""
    tester = FerdiAuthTester()
    results = tester.run_comprehensive_test()
    
    # Save results to file
    with open('/app/auth_optimization_test_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n📄 Test results saved to: /app/auth_optimization_test_results.json")
    
    return results

if __name__ == "__main__":
    main()