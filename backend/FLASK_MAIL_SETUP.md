# Flask-Mail Configuration for Forgot Password Feature

## Required Environment Variables

Add these variables to your `.env` file in the `backend/` directory:

### Email Server Configuration
```env
# SMTP Server Settings
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USE_SSL=false

# Email Credentials
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com

# Optional Settings
MAIL_MAX_EMAILS=100
```

### Frontend URL
```env
# Frontend URL for reset links
FRONTEND_BASE_URL=http://localhost:5173
```

## Email Provider Setup Instructions

### Gmail Setup (Recommended)
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password as `MAIL_PASSWORD`

### Other Email Providers

#### Outlook/Hotmail
```env
MAIL_SERVER=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USE_SSL=false
```

#### Yahoo Mail
```env
MAIL_SERVER=smtp.mail.yahoo.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USE_SSL=false
```

#### Custom SMTP Server
```env
MAIL_SERVER=your-smtp-server.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USE_SSL=false
```

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use App Passwords** instead of regular passwords
3. **Enable TLS/SSL** for secure email transmission
4. **Set appropriate sender email** that users will recognize

## Testing Email Configuration

To test if your email configuration works:

1. **Start your backend server**
2. **Try the forgot password flow**:
   - Go to login page
   - Click "Forgot Password?"
   - Enter a registered email
   - Check your inbox for the reset email

## Troubleshooting

### Common Issues:

1. **Authentication Failed**
   - Check if 2FA is enabled
   - Use App Password instead of regular password
   - Verify email credentials

2. **Connection Timeout**
   - Check firewall settings
   - Verify SMTP server and port
   - Try different TLS/SSL settings

3. **Emails Not Received**
   - Check spam folder
   - Verify sender email is correct
   - Check email provider's sending limits

### Debug Mode
Add this to your `.env` for detailed email logs:
```env
MAIL_DEBUG=true
```

## Production Deployment

For production, consider using:
- **SendGrid** (paid, reliable)
- **Mailgun** (paid, good deliverability)
- **Amazon SES** (AWS, scalable)
- **Brevo (Sendinblue)** (free tier available)

Update the Flask-Mail configuration accordingly for these services.
