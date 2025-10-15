# Email Service Configuration using SendGrid
# This file contains email service configuration for the password reset functionality

import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Ensure .env is loaded even when this module is imported directly
load_dotenv()

class EmailService:
    def __init__(self):
        # Do NOT hardcode sender; require FROM_EMAIL from env
        self.sendgrid_api_key = os.getenv('SENDGRID_API_KEY', '')
        self.from_email = os.getenv('FROM_EMAIL', '')
        self.from_name = os.getenv('FROM_NAME', 'PLANGRID Team')
        self.frontend_base_url = os.getenv('FRONTEND_BASE_URL', 'http://localhost:3000')
        # Mailgun config (alternative provider)
        self.mailgun_api_key = os.getenv('MAILGUN_API_KEY', '')
        self.mailgun_domain = os.getenv('MAILGUN_DOMAIN', '')
        # Brevo (Sendinblue) HTTP API
        self.brevo_api_key = os.getenv('BREVO_API_KEY', '')
        # Generic SMTP (Brevo/Sendinblue, Mailjet, SES SMTP, etc.)
        self.smtp_host = os.getenv('SMTP_HOST', '')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_user = os.getenv('SMTP_USER', '')
        self.smtp_pass = os.getenv('SMTP_PASS', '')
        self.smtp_use_tls = os.getenv('SMTP_USE_TLS', 'true').lower() == 'true'
        # Optional fallback toggle: try other providers if one fails
        self.email_fallback = os.getenv('EMAIL_FALLBACK', 'false').lower() == 'true'
        # Twilio SMS
        self.twilio_sid = os.getenv('TWILIO_ACCOUNT_SID', '')
        self.twilio_token = os.getenv('TWILIO_AUTH_TOKEN', '')
        self.twilio_from = os.getenv('TWILIO_FROM_NUMBER', '')
        
    def is_configured(self):
        """Check if email service is properly configured"""
        return bool((self.brevo_api_key or self.sendgrid_api_key or (self.mailgun_api_key and self.mailgun_domain) or (self.smtp_host and self.smtp_user and self.smtp_pass)) and self.from_email)
    
    def _refresh_from_env(self):
        """Reload env variables in case they were loaded after module import."""
        self.sendgrid_api_key = os.getenv('SENDGRID_API_KEY', self.sendgrid_api_key)
        self.from_email = os.getenv('FROM_EMAIL', self.from_email)
        self.from_name = os.getenv('FROM_NAME', self.from_name)
        self.frontend_base_url = os.getenv('FRONTEND_BASE_URL', self.frontend_base_url)
        self.twilio_sid = os.getenv('TWILIO_ACCOUNT_SID', self.twilio_sid)
        self.twilio_token = os.getenv('TWILIO_AUTH_TOKEN', self.twilio_token)
        self.twilio_from = os.getenv('TWILIO_FROM_NUMBER', self.twilio_from)
    
    def send_password_reset_email(self, email, reset_token, username):
        """Send password reset email using SendGrid"""
        if not self.is_configured():
            # Try lazy refresh once
            self._refresh_from_env()
        if not self.is_configured():
            print("SendGrid not configured. Missing variables:")
            print("  SENDGRID_API_KEY set:", bool(self.sendgrid_api_key))
            print("  FROM_EMAIL:", repr(self.from_email))
            print(f"Would send reset link to {email}: {self.frontend_base_url.rstrip('/')}/reset-password?token={reset_token}")
            return True  # Return True for development purposes
            
        try:
            # Create the email content
            reset_url = f"{self.frontend_base_url.rstrip('/')}/reset-password?token={reset_token}"
            
            # HTML email template
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset - PLANGRID</title>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }}
                    .header {{
                        background: linear-gradient(135deg, #2563eb, #1d4ed8);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 8px 8px 0 0;
                    }}
                    .content {{
                        background: #f8fafc;
                        padding: 30px;
                        border-radius: 0 0 8px 8px;
                    }}
                    .button {{
                        display: inline-block;
                        background: #2563eb;
                        color: white;
                        padding: 12px 24px;
                        text-decoration: none;
                        border-radius: 6px;
                        margin: 20px 0;
                        font-weight: bold;
                    }}
                    .button:hover {{
                        background: #1d4ed8;
                    }}
                    .footer {{
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e2e8f0;
                        font-size: 14px;
                        color: #64748b;
                    }}
                    .warning {{
                        background: #fef3c7;
                        border: 1px solid #f59e0b;
                        color: #92400e;
                        padding: 15px;
                        border-radius: 6px;
                        margin: 20px 0;
                    }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🔐 Password Reset Request</h1>
                    <p>PLANGRID Material Forecast Portal</p>
                </div>
                
                <div class="content">
                    <h2>Hello {username}!</h2>
                    
                    <p>You have requested to reset your password for your PLANGRID account.</p>
                    
                    <p>To reset your password, please click the button below:</p>
                    
                    <div style="text-align: center;">
                        <a href="{reset_url}" class="button">Reset My Password</a>
                    </div>
                    
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; background: #e2e8f0; padding: 10px; border-radius: 4px; font-family: monospace;">
                        {reset_url}
                    </p>
                    
                    <div class="warning">
                        <strong>⚠️ Important Security Information:</strong>
                        <ul>
                            <li>This link will expire in <strong>1 hour</strong></li>
                            <li>The link can only be used <strong>once</strong></li>
                            <li>If you didn't request this reset, please ignore this email</li>
                        </ul>
                    </div>
                    
                    <p>If you're having trouble with the button above, copy and paste the URL into your web browser.</p>
                </div>
                
                <div class="footer">
                    <p>This email was sent by PLANGRID Material Forecast Portal.</p>
                    <p>If you have any questions, please contact our support team.</p>
                </div>
            </body>
            </html>
            """
            
            # Plain text version
            text_content = f"""
            Hello {username},
            
            You have requested to reset your password for your PLANGRID account.
            
            To reset your password, please click on the following link:
            {reset_url}
            
            This link will expire in 1 hour for security reasons.
            
            If you did not request this password reset, please ignore this email.
            
            Best regards,
            PLANGRID Team
            """
            
            # Try SendGrid first if configured (uses HTTPS, works on all platforms)
            if self.sendgrid_api_key:
                try:
                    message = Mail(
                        from_email=(self.from_email, self.from_name),
                        to_emails=email,
                        subject='Password Reset Request - PLANGRID',
                        html_content=html_content,
                        plain_text_content=text_content
                    )
                    sg = SendGridAPIClient(api_key=self.sendgrid_api_key)
                    response = sg.send(message)
                    print(f"SendGrid sent to {email}. Status: {response.status_code}")
                    return True
                except Exception as e:
                    print(f"SendGrid error: {e}")
                    import traceback
                    traceback.print_exc()
                    if not self.email_fallback:
                        return False
            
            # Try Brevo HTTP API if configured
            if self.brevo_api_key:
                try:
                    resp = requests.post(
                        "https://api.brevo.com/v3/smtp/email",
                        headers={
                            "api-key": self.brevo_api_key,
                            "Content-Type": "application/json"
                        },
                        json={
                            "sender": {"email": self.from_email, "name": self.from_name},
                            "to": [{"email": email}],
                            "subject": "Password Reset Request - PLANGRID",
                            "htmlContent": html_content,
                            "textContent": text_content
                        },
                        timeout=20
                    )
                    if 200 <= resp.status_code < 300:
                        print(f"Brevo HTTP sent to {email}. Status: {resp.status_code}")
                        return True
                    else:
                        print(f"Brevo HTTP error {resp.status_code}: {resp.text}")
                        if not self.email_fallback:
                            return False
                except Exception as e:
                    print(f"Brevo HTTP exception: {e}")
                    if not self.email_fallback:
                        return False

            # Next prefer SMTP (e.g., Brevo SMTP) if configured
            if self.smtp_host and self.smtp_user and self.smtp_pass:
                try:
                    msg = MIMEMultipart('alternative')
                    msg['From'] = f"{self.from_name} <{self.from_email}>"
                    msg['To'] = email
                    msg['Subject'] = 'Password Reset Request - PLANGRID'
                    msg.attach(MIMEText(text_content, 'plain'))
                    msg.attach(MIMEText(html_content, 'html'))
                    server = smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=20)
                    if self.smtp_use_tls:
                        server.starttls()
                    server.login(self.smtp_user, self.smtp_pass)
                    server.sendmail(self.from_email, [email], msg.as_string())
                    server.quit()
                    print(f"SMTP sent to {email} via {self.smtp_host}:{self.smtp_port}")
                    return True
                except Exception as e:
                    print(f"SMTP error: {e}")
                    # If SMTP was explicitly configured, don't silently fall back unless enabled
                    if not self.email_fallback:
                        return False

            # Next, try Mailgun if configured
            if self.mailgun_api_key and self.mailgun_domain:
                resp = requests.post(
                    f"https://api.mailgun.net/v3/{self.mailgun_domain}/messages",
                    auth=("api", self.mailgun_api_key),
                    data={
                        "from": f"{self.from_name} <{self.from_email}>",
                        "to": [email],
                        "subject": "Password Reset Request - PLANGRID",
                        "text": text_content,
                        "html": html_content,
                    },
                    timeout=15,
                )
                if resp.status_code >= 200 and resp.status_code < 300:
                    print(f"Mailgun sent to {email}. Status: {resp.status_code}")
                    return True
                else:
                    print(f"Mailgun error {resp.status_code}: {resp.text}")
                    if not self.email_fallback:
                        return False
            
            # No email provider worked
            print("No email provider successfully sent the password reset email")
            return False
        except Exception as e:
            print(f"Error sending password reset email: {e}")
            return False

    def send_password_reset_sms(self, to_phone: str, reset_token: str, username: str) -> bool:
        """Send password reset link via SMS using Twilio"""
        try:
            self._refresh_from_env()
            if not (self.twilio_sid and self.twilio_token and self.twilio_from):
                print("Twilio not configured: missing SID/token/from number")
                return False
            from twilio.rest import Client
            client = Client(self.twilio_sid, self.twilio_token)
            reset_url = f"{self.frontend_base_url.rstrip('/')}/reset-password?token={reset_token}"
            body = f"PLANGRID: Hi {username}, reset your password: {reset_url} (valid 1 hr)"
            msg = client.messages.create(
                body=body,
                from_=self.twilio_from,
                to=to_phone
            )
            print(f"Twilio SMS sent id: {msg.sid}")
            return True
        except Exception as e:
            print(f"Twilio SMS error: {e}")
            return False
    
    def send_generic_email(self, to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
        """Send a generic email using configured email service"""
        if not self.is_configured():
            # Try lazy refresh once
            self._refresh_from_env()
        if not self.is_configured():
            print("Email service not configured. Missing variables:")
            print("  API keys configured:", bool(self.sendgrid_api_key or self.brevo_api_key or self.mailgun_api_key or self.smtp_host))
            print("  FROM_EMAIL:", repr(self.from_email))
            print(f"Would send email to {to_email} with subject: {subject}")
            return True  # Return True for development purposes
            
        try:
            # Use text_content if provided, otherwise create a simple text version
            if not text_content:
                # Simple HTML to text conversion - strip tags
                import re
                text_content = re.sub(r'<[^>]+>', '', html_content)
            
            # Try SendGrid first if configured (uses HTTPS, works on all platforms)
            if self.sendgrid_api_key:
                try:
                    message = Mail(
                        from_email=(self.from_email, self.from_name),
                        to_emails=to_email,
                        subject=subject,
                        html_content=html_content,
                        plain_text_content=text_content
                    )
                    sg = SendGridAPIClient(api_key=self.sendgrid_api_key)
                    response = sg.send(message)
                    print(f"SendGrid sent to {to_email}. Status: {response.status_code}")
                    return True
                except Exception as e:
                    print(f"SendGrid error: {e}")
                    import traceback
                    traceback.print_exc()
                    if not self.email_fallback:
                        return False
            
            # Try Brevo HTTP API if configured
            if self.brevo_api_key:
                try:
                    resp = requests.post(
                        "https://api.brevo.com/v3/smtp/email",
                        headers={
                            "api-key": self.brevo_api_key,
                            "Content-Type": "application/json"
                        },
                        json={
                            "sender": {"email": self.from_email, "name": self.from_name},
                            "to": [{"email": to_email}],
                            "subject": subject,
                            "htmlContent": html_content,
                            "textContent": text_content
                        },
                        timeout=20
                    )
                    if 200 <= resp.status_code < 300:
                        print(f"Brevo HTTP sent to {to_email}. Status: {resp.status_code}")
                        return True
                    else:
                        print(f"Brevo HTTP error {resp.status_code}: {resp.text}")
                        if not self.email_fallback:
                            return False
                except Exception as e:
                    print(f"Brevo HTTP exception: {e}")
                    if not self.email_fallback:
                        return False

            # Try SMTP if configured
            if self.smtp_host and self.smtp_user and self.smtp_pass:
                try:
                    msg = MIMEMultipart('alternative')
                    msg['From'] = f"{self.from_name} <{self.from_email}>"
                    msg['To'] = to_email
                    msg['Subject'] = subject
                    msg.attach(MIMEText(text_content, 'plain'))
                    msg.attach(MIMEText(html_content, 'html'))
                    server = smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=20)
                    if self.smtp_use_tls:
                        server.starttls()
                    server.login(self.smtp_user, self.smtp_pass)
                    server.sendmail(self.from_email, [to_email], msg.as_string())
                    server.quit()
                    print(f"SMTP sent to {to_email} via {self.smtp_host}:{self.smtp_port}")
                    return True
                except Exception as e:
                    print(f"SMTP error: {e}")
                    if not self.email_fallback:
                        return False

            # Try Mailgun if configured
            if self.mailgun_api_key and self.mailgun_domain:
                resp = requests.post(
                    f"https://api.mailgun.net/v3/{self.mailgun_domain}/messages",
                    auth=("api", self.mailgun_api_key),
                    data={
                        "from": f"{self.from_name} <{self.from_email}>",
                        "to": [to_email],
                        "subject": subject,
                        "text": text_content,
                        "html": html_content,
                    },
                    timeout=15,
                )
                if resp.status_code >= 200 and resp.status_code < 300:
                    print(f"Mailgun sent to {to_email}. Status: {resp.status_code}")
                    return True
                else:
                    print(f"Mailgun error {resp.status_code}: {resp.text}")
                    if not self.email_fallback:
                        return False
            
            # No email provider worked
            print("No email provider successfully sent the email")
            return False
        except Exception as e:
            print(f"Error sending email: {e}")
            return False

# Global email service instance
email_service = EmailService()
