#!/usr/bin/env python3
"""
Test script for forgot password functionality
Run this script to test the forgot password API endpoints
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_forgot_password():
    """Test the forgot password endpoint"""
    print("Testing forgot password endpoint...")
    
    # Test with a valid email format
    response = requests.post(f"{BASE_URL}/api/forgot-password", 
                           json={"email": "test@example.com"})
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        print("✓ Forgot password request successful")
        return True
    else:
        print("✗ Forgot password request failed")
        return False

def test_verify_token():
    """Test the verify token endpoint"""
    print("\nTesting verify token endpoint...")
    
    # Test with an invalid token
    response = requests.post(f"{BASE_URL}/api/verify-reset-token", 
                           json={"token": "invalid_token"})
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 400:
        print("✓ Token verification correctly rejected invalid token")
        return True
    else:
        print("✗ Token verification should have rejected invalid token")
        return False

def test_reset_password():
    """Test the reset password endpoint"""
    print("\nTesting reset password endpoint...")
    
    # Test with invalid token and password
    response = requests.post(f"{BASE_URL}/api/reset-password", 
                           json={"token": "invalid_token", "new_password": "newpass123"})
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 400:
        print("✓ Password reset correctly rejected invalid token")
        return True
    else:
        print("✗ Password reset should have rejected invalid token")
        return False

def test_validation():
    """Test input validation"""
    print("\nTesting input validation...")
    
    # Test forgot password without email
    response = requests.post(f"{BASE_URL}/api/forgot-password", json={})
    print(f"Forgot password without email - Status: {response.status_code}")
    
    # Test reset password without token
    response = requests.post(f"{BASE_URL}/api/reset-password", 
                           json={"new_password": "newpass123"})
    print(f"Reset password without token - Status: {response.status_code}")
    
    # Test reset password with short password
    response = requests.post(f"{BASE_URL}/api/reset-password", 
                           json={"token": "test_token", "new_password": "123"})
    print(f"Reset password with short password - Status: {response.status_code}")
    
    print("✓ Input validation tests completed")

def main():
    """Run all tests"""
    print("=" * 50)
    print("FORGOT PASSWORD API TESTS")
    print("=" * 50)
    
    try:
        # Test if server is running
        response = requests.get(f"{BASE_URL}/api/health")
        if response.status_code != 200:
            print("✗ Server is not running. Please start the backend server first.")
            return
        
        print("✓ Server is running")
        
        # Run tests
        test_forgot_password()
        test_verify_token()
        test_reset_password()
        test_validation()
        
        print("\n" + "=" * 50)
        print("ALL TESTS COMPLETED")
        print("=" * 50)
        
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to server. Please make sure the backend is running on http://localhost:5000")
    except Exception as e:
        print(f"✗ Error running tests: {e}")

if __name__ == "__main__":
    main()
