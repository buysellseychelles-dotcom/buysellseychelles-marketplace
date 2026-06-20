import { NextRequest } from 'next/server'
import { rateLimit, getClientIP, tooManyRequests } from '@/lib/rate-limit'

const RESEND_KEY = process.env.RESEND_API_KEY
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY

export async function POST(req: NextRequest) {
  // Rate limit: 3 messages max per hour per IP
  const ip = getClientIP(req)
  const rl = rateLimit(`contact:${ip}`, 3, 60 * 60 * 1000)
  if (!rl.allowed) return tooManyRequests(rl.resetAt)

  const body = await req.json()
  const { name, email, subject, message, recaptchaToken } = body

  if (!name || !email || !subject || !message) {
    return Response.json({ error: 'All fields are required' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Invalid email address' }, { status: 400 })
  }

  // Verify reCAPTCHA token
  if (!recaptchaToken) {
    return Response.json({ error: 'reCAPTCHA token missing' }, { status: 400 })
  }
  if (RECAPTCHA_SECRET) {
    const verify = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${RECAPTCHA_SECRET}&response=${recaptchaToken}`,
    })
    const verifyData = await verify.json()
    if (!verifyData.success) {
      return Response.json({ error: 'reCAPTCHA verification failed' }, { status: 400 })
    }
  }

  if (!RESEND_KEY) {
    console.error('[contact] RESEND_API_KEY not set')
    return Response.json({ error: 'Email service not configured' }, { status: 500 })
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BuySellSeychelles <noreply@buysellseychelles.com>',
        reply_to: `${name} <${email}>`,
        to: ['buysellseychelles@gmail.com'],
        subject: `[Contact] ${subject}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;color:#1a1a1a">
            <div style="background:linear-gradient(135deg,#003F87 0%,#007A3D 100%);padding:20px 24px;border-radius:12px 12px 0 0">
              <h2 style="color:#fff;margin:0;font-size:18px">New contact message — BuySellSeychelles</h2>
            </div>
            <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:80px">Name</td><td style="padding:6px 0;font-size:13px;font-weight:600">${name}</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Email</td><td style="padding:6px 0;font-size:13px"><a href="mailto:${email}" style="color:#003F87">${email}</a></td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Subject</td><td style="padding:6px 0;font-size:13px">${subject}</td></tr>
              </table>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
              <p style="font-size:13px;line-height:1.6;white-space:pre-wrap">${message}</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
              <p style="font-size:11px;color:#9ca3af">Reply directly to this email to respond to ${name}.</p>
            </div>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      console.error('[contact] Resend error:', err)
      return Response.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return Response.json({ ok: true })
  } catch (err: any) {
    console.error('[contact] email error:', err?.message ?? err)
    return Response.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
