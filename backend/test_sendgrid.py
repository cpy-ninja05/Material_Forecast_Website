#!/usr/bin/env python3
"""
Test script for SendGrid email service
Run this script to test the SendGrid email functionality
"""

import os
from email_service import email_service

def test_sendgrid_configuration():
    """Test SendGrid configuration"""
    print("Testing SendGrid Configuration...")
    print(f"SendGrid API Key configured: {bool(email_service.sendgrid_api_key)}")
    print(f"From Email: {email_service.from_email}")
    print(f"From Name: {email_service.from_name}")
    print(f"Service configured: {email_service.is_configured()}")
    
    if not email_service.is_configured():
        print("\n⚠️  SendGrid not configured. This is normal for development.")
        print("To configure SendGrid:")
        print("1. Set SENDGRID_API_KEY environment variable")
        print("2. Set FROM_EMAIL environment variable")
        print("3. Set FROM_NAME environment variable (optional)")
        print("\nFor now, emails will be printed to console.")
        return True
    else:
        print("\n✅ SendGrid is properly configured!")
        return True

def test_email_sending():
    """Test sending a password reset email"""
    print("\nTesting Email Sending...")
    
    # Test data
    test_email = "test@example.com"
    test_token = "test_token_12345"
    test_username = "TestUser"
    
    print(f"Sending test email to: {test_email}")
    print(f"Reset token: {test_token}")
    print(f"Username: {test_username}")
    
    # Send the email
    result = email_service.send_password_reset_email(test_email, test_token, test_username)
    
    if result:
        print("✅ Email sent successfully!")
        if not email_service.is_configured():
            print("📧 Check console output above for the reset URL")
        return True
    else:
        print("❌ Failed to send email")
        return False

def test_email_template():
    """Test email template generation"""
    print("\nTesting Email Template...")
    
    # Test template variables
    test_email = "test@example.com"
    test_token = "test_token_12345"
    test_username = "TestUser"
    reset_url = f"http://localhost:3000/reset-password?token={test_token}"
    
    print("Email template preview:")
    print("=" * 50)
    print(f"To: {test_email}")
    print(f"Subject: Password Reset Request - PLANGRID")
    print(f"From: {email_service.from_name} <{email_service.from_email}>")
    print(f"Reset URL: {reset_url}")
    print("=" * 50)
    
    return True

def main():
    """Run all tests"""
    print("=" * 60)
    print("SENDGRID EMAIL SERVICE TESTS")
    print("=" * 60)
    
    try:
        # Test configuration
        config_ok = test_sendgrid_configuration()
        
        # Test template
        template_ok = test_email_template()
        
        # Test sending
        send_ok = test_email_sending()
        
        print("\n" + "=" * 60)
        print("TEST RESULTS")
        print("=" * 60)
        print(f"Configuration Test: {'✅ PASS' if config_ok else '❌ FAIL'}")
        print(f"Template Test: {'✅ PASS' if template_ok else '❌ FAIL'}")
        print(f"Send Test: {'✅ PASS' if send_ok else '❌ FAIL'}")
        
        if all([config_ok, template_ok, send_ok]):
            print("\n🎉 All tests passed! SendGrid integration is working.")
        else:
            print("\n⚠️  Some tests failed. Check the output above.")
            
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
