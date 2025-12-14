import { Resend } from 'resend'

// Resend client (requires API key)
// In production, use environment variables
const RESEND_API_KEY = 'YOUR_RESEND_API_KEY'

// Create Resend instance
export const resend = new Resend(RESEND_API_KEY)

// Example email sending function
export async function sendWelcomeEmail(to: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use your verified domain in production
      to: [to],
      subject: `Welcome, ${name}!`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h1 style="color: #333;">Welcome to our app, ${name}!</h1>
          <p style="color: #666;">Thank you for signing up. We're excited to have you.</p>
          <a href="https://example.com" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #5EEAD4;
            color: #000;
            text-decoration: none;
            border-radius: 8px;
            margin-top: 16px;
          ">Get Started</a>
        </div>
      `,
    })

    if (error) {
      console.error('[Resend] Error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('[Resend] Exception:', error)
    return { success: false, error }
  }
}

// Example notification email
export async function sendNotificationEmail(to: string, title: string, message: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'notifications@resend.dev',
      to: [to],
      subject: title,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px;">
            <h2 style="color: #333; margin-top: 0;">${title}</h2>
            <p style="color: #666; line-height: 1.6;">${message}</p>
          </div>
        </div>
      `,
    })

    if (error) {
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error }
  }
}
