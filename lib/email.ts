import nodemailer from 'nodemailer'

interface BookingEmailData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  serviceType: string
  appointmentType: string
  preferredDate: string
  preferredTime?: string | null
  endDate?: string | null
  serviceLocation: string
  fullAddress: string
  condition?: string | null
  medicalHistory?: string | null
  useDirectBilling: boolean
  insuranceProvider?: string | null
  policyNumber?: string | null
  groupNumber?: string | null
  emergencyContact?: string | null
  specialInstructions?: string | null
  dateOfBirth?: string | null
}

// Create transporter - configure with your email service
const createTransporter = () => {
  // For Gmail, you'll need to use an App Password
  // For other services, adjust the configuration accordingly
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD, // Use App Password for Gmail
    },
  })
}

export const sendBookingConfirmationEmail = async (bookingData: BookingEmailData) => {
  try {
    const transporter = createTransporter()

    // Email to the customer
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
            .info-label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmation</h1>
              <p>Thank you for choosing our physiotherapy services!</p>
            </div>
            <div class="content">
              <p>Dear ${bookingData.firstName} ${bookingData.lastName},</p>
              <p>We have received your booking request and will contact you shortly to confirm your appointment.</p>
              
              <div class="info-section">
                <div class="info-label">Appointment Details</div>
                <p><strong>Service:</strong> ${bookingData.serviceType.replace('-', ' ')}</p>
                <p><strong>Type:</strong> ${bookingData.appointmentType.replace('-', ' ')}</p>
                <p><strong>Date Range:</strong> ${bookingData.endDate 
                  ? `${new Date(bookingData.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - ${new Date(bookingData.endDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                  : new Date(bookingData.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                }</p>
                <p><strong>Location:</strong> ${bookingData.serviceLocation.replace('-', ' ')}</p>
                <p><strong>Address:</strong> ${bookingData.fullAddress}</p>
              </div>

              <div class="info-section">
                <div class="info-label">Contact Information</div>
                <p><strong>Email:</strong> ${bookingData.email}</p>
                <p><strong>Phone:</strong> ${bookingData.phoneNumber}</p>
              </div>

              ${bookingData.useDirectBilling ? `
              <div class="info-section">
                <div class="info-label">Insurance Information</div>
                <p><strong>Provider:</strong> ${bookingData.insuranceProvider || 'N/A'}</p>
                <p><strong>Policy Number:</strong> ${bookingData.policyNumber || 'N/A'}</p>
              </div>
              ` : ''}

              <p>Our team will review your request and contact you within 24 hours to confirm your appointment.</p>
              <p>If you have any questions, please don't hesitate to contact us at (587) 586-5566 or reply to this email.</p>
              
              <div class="footer">
                <p>Best regards,<br>Physio Rehab Team</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Email to admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 700px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #f5576c; }
            .info-label { font-weight: bold; color: #f5576c; margin-bottom: 10px; font-size: 16px; }
            .info-row { margin: 8px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Booking Request</h1>
              <p>A new therapy booking has been submitted</p>
            </div>
            <div class="content">
              <div class="info-section">
                <div class="info-label">Patient Information</div>
                <div class="info-row"><strong>Name:</strong> ${bookingData.firstName} ${bookingData.lastName}</div>
                <div class="info-row"><strong>Email:</strong> ${bookingData.email}</div>
                <div class="info-row"><strong>Phone:</strong> ${bookingData.phoneNumber}</div>
                ${bookingData.dateOfBirth ? `<div class="info-row"><strong>Date of Birth:</strong> ${new Date(bookingData.dateOfBirth).toLocaleDateString()}</div>` : ''}
                ${bookingData.emergencyContact ? `<div class="info-row"><strong>Emergency Contact:</strong> ${bookingData.emergencyContact}</div>` : ''}
              </div>

              <div class="info-section">
                <div class="info-label">Appointment Details</div>
                <div class="info-row"><strong>Service Type:</strong> ${bookingData.serviceType.replace('-', ' ')}</div>
                <div class="info-row"><strong>Appointment Type:</strong> ${bookingData.appointmentType.replace('-', ' ')}</div>
                <div class="info-row"><strong>Date Range:</strong> ${bookingData.endDate 
                  ? `${new Date(bookingData.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - ${new Date(bookingData.endDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                  : new Date(bookingData.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                }</div>
                <div class="info-row"><strong>Service Location:</strong> ${bookingData.serviceLocation.replace('-', ' ')}</div>
                <div class="info-row"><strong>Full Address:</strong> ${bookingData.fullAddress}</div>
              </div>

              ${bookingData.condition || bookingData.medicalHistory ? `
              <div class="info-section">
                <div class="info-label">Medical Information</div>
                ${bookingData.condition ? `<div class="info-row"><strong>Condition/Reason:</strong> ${bookingData.condition}</div>` : ''}
                ${bookingData.medicalHistory ? `<div class="info-row"><strong>Medical History:</strong> ${bookingData.medicalHistory}</div>` : ''}
              </div>
              ` : ''}

              ${bookingData.useDirectBilling ? `
              <div class="info-section">
                <div class="info-label">Insurance Information</div>
                <div class="info-row"><strong>Provider:</strong> ${bookingData.insuranceProvider || 'N/A'}</div>
                <div class="info-row"><strong>Policy Number:</strong> ${bookingData.policyNumber || 'N/A'}</div>
                ${bookingData.groupNumber ? `<div class="info-row"><strong>Group Number:</strong> ${bookingData.groupNumber}</div>` : ''}
              </div>
              ` : ''}

              ${bookingData.specialInstructions ? `
              <div class="info-section">
                <div class="info-label">Special Instructions</div>
                <div class="info-row">${bookingData.specialInstructions}</div>
              </div>
              ` : ''}

              <div class="footer">
                <p>Please review this booking in the admin dashboard.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email to customer
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: bookingData.email,
      subject: 'Booking Confirmation - Physio Rehab',
      html: customerEmailHtml,
    })

    // Send email to admin
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: 'abhishekverman3459@gmail.com',
      subject: `New Booking Request - ${bookingData.firstName} ${bookingData.lastName}`,
      html: adminEmailHtml,
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    // Don't throw error - email failure shouldn't break booking creation
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export const sendPasswordResetEmail = async (email: string, resetToken: string, firstName?: string) => {
  try {
    const transporter = createTransporter()
    
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/${resetToken}`
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .button:hover { opacity: 0.9; }
            .info-section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .warning { color: #e74c3c; font-size: 12px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
              <p>We received a request to reset your password</p>
            </div>
            <div class="content">
              <p>Dear ${firstName || 'User'},</p>
              <p>You recently requested to reset your password for your Physio Rehab account. Click the button below to reset it:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              
              <div class="warning">
                <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
                <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
              </div>
              
              <div class="footer">
                <p>Best regards,<br>Physio Rehab Team</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Password Reset Request - Physio Rehab',
      html: emailHtml,
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export const sendAdminPasswordResetEmail = async (email: string, resetToken: string, name?: string) => {
  try {
    const transporter = createTransporter()
    
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/reset-password/${resetToken}`
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .button:hover { opacity: 0.9; }
            .info-section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .warning { color: #e74c3c; font-size: 12px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Admin Password Reset Request</h1>
              <p>We received a request to reset your admin password</p>
            </div>
            <div class="content">
              <p>Dear ${name || 'Admin'},</p>
              <p>You recently requested to reset your password for your Physio Rehab admin account. Click the button below to reset it:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              
              <div class="warning">
                <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
                <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
              </div>
              
              <div class="footer">
                <p>Best regards,<br>Physio Rehab Team</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Admin Password Reset Request - Physio Rehab',
      html: emailHtml,
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error sending admin password reset email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
