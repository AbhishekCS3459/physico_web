# Email Setup Guide

This guide explains how to configure email notifications for booking submissions.

## Installation

First, install the required dependencies:

```bash
cd physico_web
pnpm install
# or
npm install
```

This will install:

- `nodemailer` - Email sending library
- `@types/nodemailer` - TypeScript types for nodemailer

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```

### Gmail Setup

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Navigate to Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `SMTP_PASSWORD`

### Other Email Providers

For other email providers, adjust the configuration:

**Outlook/Hotmail:**

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

**SendGrid:**

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

**Custom SMTP:**

```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASSWORD=your-password
```

## Email Recipients

When a booking is submitted:

1. **Customer** receives a confirmation email at their provided email address
2. **Admin** receives a notification email at: `abhishekverman3459@gmail.com`

To change the admin email, update the email address in `lib/email.ts`:

```typescript
// Line ~200 in lib/email.ts
to: 'abhishekverman3459@gmail.com',
```

## Testing

After setting up the environment variables:

1. Submit a test booking through the booking form
2. Check the customer's email inbox for confirmation
3. Check `abhishekverman3459@gmail.com` for the admin notification

## Troubleshooting

### Emails not sending

1. **Check environment variables** are set correctly
2. **Verify SMTP credentials** are correct
3. **Check spam folder** - emails might be filtered
4. **Review server logs** for error messages
5. **Test SMTP connection** using a simple Node.js script

### Common Errors

- **"Invalid login"**: Check your email and password (use App Password for Gmail)
- **"Connection timeout"**: Verify SMTP_HOST and SMTP_PORT
- **"Authentication failed"**: Ensure 2FA is enabled and App Password is used (for Gmail)

## Security Notes

- Never commit `.env.local` to version control
- Use App Passwords instead of your main account password
- Consider using environment-specific email services in production
- Rate limit email sending to prevent abuse

