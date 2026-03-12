import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM =
  process.env.SMTP_FROM_EMAIL || "Mango's Grill <noreply@mangosgrill.com>";

if (!process.env.SMTP_HOST) {
  console.warn("Missing SMTP_HOST — emails will not be sent.");
}

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

async function sendMail(to: string, subject: string, html: string) {
  return transporter.sendMail({ from: FROM, to, subject, html });
}

/* ------------------------------------------------------------------ */
/*  Email Templates                                                    */
/* ------------------------------------------------------------------ */

export async function sendWelcomeEmail(to: string, firstName: string) {
  return sendMail(
    to,
    `Welcome to Mango's Grill, ${firstName}!`,
    `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2C1810; padding: 32px; text-align: center;">
          <h1 style="color: #C4956A; margin: 0;">Welcome to Mango's Grill!</h1>
        </div>
        <div style="padding: 32px; background: #FAF8F4;">
          <p style="color: #3B2314;">Hi ${firstName},</p>
          <p style="color: #3B2314;">Thank you for joining the Mango's Grill family! We're thrilled to have you.</p>
          <p style="color: #3B2314;">Explore our authentic Venezuelan cuisine and start your culinary journey today.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/menu" style="background: #C4956A; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Browse Our Menu</a>
          </div>
          <p style="color: #6B5D52; font-size: 14px;">— The Mango's Grill Team</p>
        </div>
      </div>
    `
  );
}

export async function sendOrderConfirmation(
  to: string,
  firstName: string,
  orderNumber: string,
  total: number
) {
  return sendMail(
    to,
    `Order Confirmed — ${orderNumber}`,
    `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2C1810; padding: 32px; text-align: center;">
          <h1 style="color: #C4956A; margin: 0;">Order Confirmed!</h1>
        </div>
        <div style="padding: 32px; background: #FAF8F4;">
          <p style="color: #3B2314;">Hi ${firstName},</p>
          <p style="color: #3B2314;">Your order <strong>${orderNumber}</strong> has been confirmed.</p>
          <div style="background: white; border: 1px solid #E8E0D4; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="color: #6B5D52; font-size: 14px; margin: 0;">Order Total</p>
            <p style="color: #C4956A; font-size: 24px; font-weight: bold; margin: 4px 0;">$${total.toFixed(2)}</p>
          </div>
          <p style="color: #3B2314;">We're preparing your delicious Venezuelan feast. You'll receive updates as your order progresses.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders" style="background: #C4956A; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Track Your Order</a>
          </div>
          <p style="color: #6B5D52; font-size: 14px;">— The Mango's Grill Team</p>
        </div>
      </div>
    `
  );
}

export async function sendOrderStatusUpdate(
  to: string,
  firstName: string,
  orderNumber: string,
  status: string
) {
  return sendMail(
    to,
    `Order ${orderNumber} — ${status}`,
    `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2C1810; padding: 32px; text-align: center;">
          <h1 style="color: #C4956A; margin: 0;">Order Update</h1>
        </div>
        <div style="padding: 32px; background: #FAF8F4;">
          <p style="color: #3B2314;">Hi ${firstName},</p>
          <p style="color: #3B2314;">Your order <strong>${orderNumber}</strong> status has been updated to: <strong>${status}</strong></p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders" style="background: #C4956A; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Order Details</a>
          </div>
          <p style="color: #6B5D52; font-size: 14px;">— The Mango's Grill Team</p>
        </div>
      </div>
    `
  );
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return sendMail(
    to,
    "Reset Your Password — Mango's Grill",
    `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2C1810; padding: 32px; text-align: center;">
          <h1 style="color: #C4956A; margin: 0;">Password Reset</h1>
        </div>
        <div style="padding: 32px; background: #FAF8F4;">
          <p style="color: #3B2314;">You requested a password reset for your Mango's Grill account.</p>
          <p style="color: #3B2314;">Click the button below to create a new password. This link expires in 1 hour.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="background: #C4956A; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
          </div>
          <p style="color: #6B5D52; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          <p style="color: #6B5D52; font-size: 14px;">— The Mango's Grill Team</p>
        </div>
      </div>
    `
  );
}

export async function sendReservationConfirmation(
  to: string,
  firstName: string,
  date: string,
  time: string,
  partySize: number,
  location: string
) {
  return sendMail(
    to,
    "Reservation Confirmed — Mango's Grill",
    `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2C1810; padding: 32px; text-align: center;">
          <h1 style="color: #C4956A; margin: 0;">Reservation Confirmed!</h1>
        </div>
        <div style="padding: 32px; background: #FAF8F4;">
          <p style="color: #3B2314;">Hi ${firstName},</p>
          <p style="color: #3B2314;">Your reservation has been confirmed!</p>
          <div style="background: white; border: 1px solid #E8E0D4; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <table style="width: 100%; font-size: 14px; color: #3B2314;">
              <tr><td style="padding: 4px 0; color: #6B5D52;">Date</td><td style="padding: 4px 0; font-weight: 600;">${date}</td></tr>
              <tr><td style="padding: 4px 0; color: #6B5D52;">Time</td><td style="padding: 4px 0; font-weight: 600;">${time}</td></tr>
              <tr><td style="padding: 4px 0; color: #6B5D52;">Party Size</td><td style="padding: 4px 0; font-weight: 600;">${partySize} guests</td></tr>
              <tr><td style="padding: 4px 0; color: #6B5D52;">Location</td><td style="padding: 4px 0; font-weight: 600;">${location}</td></tr>
            </table>
          </div>
          <p style="color: #3B2314;">We look forward to serving you!</p>
          <p style="color: #6B5D52; font-size: 14px;">— The Mango's Grill Team</p>
        </div>
      </div>
    `
  );
}

export async function sendContactEmail(
  email: string,
  phone: string | undefined,
  subject: string,
  message: string,
  recipientEmail?: string
) {
  return sendMail(
    recipientEmail || FROM,
    `Contact Form: ${subject}`,
    `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2C1810; padding: 32px; text-align: center;">
          <h1 style="color: #C4956A; margin: 0;">New Contact Message</h1>
        </div>
        <div style="padding: 32px; background: #FAF8F4;">
          <table style="width: 100%; font-size: 14px; color: #3B2314;">
            <tr><td style="padding: 4px 0; color: #6B5D52; width: 100px;">Email</td><td style="padding: 4px 0; font-weight: 600;">${email}</td></tr>
            ${phone ? `<tr><td style="padding: 4px 0; color: #6B5D52;">Phone</td><td style="padding: 4px 0; font-weight: 600;">${phone}</td></tr>` : ""}
            <tr><td style="padding: 4px 0; color: #6B5D52;">Subject</td><td style="padding: 4px 0; font-weight: 600;">${subject}</td></tr>
          </table>
          <div style="margin-top: 16px; padding: 16px; background: white; border: 1px solid #E8E0D4; border-radius: 8px;">
            <p style="color: #3B2314; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      </div>
    `
  );
}
