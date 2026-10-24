import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { z } from 'zod'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(100, { message: 'Name is too long.' }),
  company: z.string().trim().max(100).optional().nullable(),
  email: z
    .string()
    .trim()
    .email({ message: 'Please provide a valid email address.' })
    .max(120),
  phone: z.string().trim().max(30).optional().nullable(),
  message: z
    .string()
    .trim()
    .min(10, { message: 'Message must be at least 10 characters.' })
    .max(5000, { message: 'Message cannot exceed 5000 characters.' }),
  hp_website: z.string().optional().nullable(), // Honeypot field
  form_rendered_at: z.number().optional().nullable(), // Time-on-form tracking
  turnstile_token: z.string().optional().nullable(),
})

export async function POST(request: Request) {
  try {
    const rawBody = await request.json()

    // 1. Honeypot check: silently succeed if a bot fills the hidden field
    if (rawBody.hp_website && typeof rawBody.hp_website === 'string' && rawBody.hp_website.length > 0) {
      console.warn('[contact/route] Honeypot triggered. Silently dropping request.')
      return NextResponse.json({ success: true })
    }

    // 2. Minimum time-on-form check (bots submit in < 1.5 seconds)
    if (rawBody.form_rendered_at && typeof rawBody.form_rendered_at === 'number') {
      const elapsed = Date.now() - rawBody.form_rendered_at
      if (elapsed < 1500) {
        console.warn('[contact/route] Submission too fast:', elapsed, 'ms')
        return NextResponse.json(
          {
            success: false,
            error: 'submission_too_fast',
            message: 'Submission was too fast. Please take a moment before submitting.',
          },
          { status: 400 }
        )
      }
    }

    // 3. Zod validation at the boundary
    const parseResult = contactSchema.safeParse(rawBody)
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parseResult.error.issues) {
        const fieldName = issue.path[0] as string
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message
        }
      }
      return NextResponse.json(
        {
          success: false,
          error: 'validation_error',
          errors: fieldErrors,
        },
        { status: 400 }
      )
    }

    const data = parseResult.data

    // 4. Cloudflare Turnstile verification (if configured in environment)
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
    if (turnstileSecret && data.turnstile_token) {
      try {
        const verifyRes = await fetch(
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              secret: turnstileSecret,
              response: data.turnstile_token,
            }),
          }
        )
        const outcome = await verifyRes.json()
        if (!outcome.success) {
          console.warn('[contact/route] Turnstile verification failed:', outcome)
          return NextResponse.json(
            {
              success: false,
              error: 'bot_check_failed',
              message: 'Verification failed. Please refresh the page and try again.',
            },
            { status: 400 }
          )
        }
      } catch (err) {
        console.error('[contact/route] Turnstile network error:', err)
      }
    }

    // 5. Rate limiting: Postgres-backed count on salted ip_hash (max 5 submissions per hour)
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1'

    const salt = process.env.CONTACT_IP_SALT || 'manish_portfolio_salt_fallback'
    const ipHash = crypto
      .createHash('sha256')
      .update(`${clientIp}:${salt}`)
      .digest('hex')

    const adminClient = createAdminClient()

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count, error: countError } = await adminClient
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', oneHourAgo)

    if (countError) {
      console.error('[contact/route] Rate limit count query error:', countError.message)
    } else if (count !== null && count >= 5) {
      return NextResponse.json(
        {
          success: false,
          error: 'rate_limit',
          message: 'Too many requests. Please wait a moment and try again.',
        },
        { status: 429 }
      )
    }

    // 6. Insert submission row using the server-side service role client
    const { error: insertError } = await adminClient
      .from('contact_submissions')
      .insert({
        name: data.name,
        company: data.company || null,
        email: data.email,
        phone: data.phone || null,
        message: data.message,
        status: 'new',
        ip_hash: ipHash,
        meta: {
          userAgent: request.headers.get('user-agent') || 'unknown',
          referer: request.headers.get('referer') || '',
        },
      })

    if (insertError) {
      console.error('[contact/route] Database insert error:', insertError.message)
      return NextResponse.json(
        {
          success: false,
          error: 'server_error',
          message: 'Something went wrong. Try again or email directly.',
        },
        { status: 500 }
      )
    }

    // 7. Notification email via Resend (if configured)
    const resendKey = process.env.RESEND_API_KEY
    const notifyEmail = process.env.CONTACT_NOTIFY_EMAIL
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

    if (resendKey && notifyEmail) {
      try {
        const resend = new Resend(resendKey)
        await resend.emails.send({
          from: fromEmail,
          to: notifyEmail,
          replyTo: data.email,
          subject: `Portfolio Contact: ${data.name}${data.company ? ` (${data.company})` : ''}`,
          text: `Name: ${data.name}\nEmail: ${data.email}\nCompany: ${data.company || 'None'}\nPhone: ${data.phone || 'None'}\n\nMessage:\n${data.message}`,
        })
      } catch (emailErr) {
        console.error('[contact/route] Resend notification delivery failed:', emailErr)
        // Note: we still return success to the user because the record was safely persisted in Postgres!
      }
    }

    return NextResponse.json({
      success: true,
      message: "Message sent. I'll reply within a day or two.",
    })
  } catch (err: any) {
    console.error('[contact/route] Unhandled exception:', err)
    return NextResponse.json(
      {
        success: false,
        error: 'server_error',
        message: 'Something went wrong. Try again or email directly.',
      },
      { status: 500 }
    )
  }
}
