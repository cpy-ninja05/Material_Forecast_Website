# Email Service Configuration using SendGrid
# This file contains email service configuration for the password reset functionality

import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

class EmailService:
    def __init__(self):
        self.sendgrid_api_key = os.getenv('SENDGRID_API_KEY', '')
        self.from_email = os.getenv('FROM_EMAIL', 'noreply@plangrid.com')
        self.from_name = os.getenv('FROM_NAME', 'PLANGRID Team')
        
    def is_configured(self):
        """Check if email service is properly configured"""
        return bool(self.sendgrid_api_key)
    
    def send_password_reset_email(self, email, reset_token, username):
        """Send password reset email using SendGrid"""
        if not self.is_configured():
            print(f"SendGrid not configured. Would send reset link to {email}: http://localhost:3000/reset-password?token={reset_token}")
            return True  # Return True for development purposes
            
        try:
            # Create the email content
            reset_url = f"http://localhost:3000/reset-password?token={reset_token}"
            
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
            
            # Create the email message
            message = Mail(
                from_email=(self.from_email, self.from_name),
                to_emails=email,
                subject='Password Reset Request - PLANGRID',
                html_content=html_content,
                plain_text_content=text_content
            )
            
            # Send the email
            sg = SendGridAPIClient(api_key=self.sendgrid_api_key)
            response = sg.send(message)
            
            print(f"Password reset email sent to {email}. Status: {response.status_code}")
            return True
            
        except Exception as e:
            print(f"Error sending email via SendGrid: {e}")
            return False

# Global email service instance
email_service = EmailService()
