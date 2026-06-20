import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendPushToUser } from '@/lib/push'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { conversationId, senderId, messageText } = await req.json()

    if (!conversationId || !senderId || !messageText) {
      return NextResponse.json({ ok: false })
    }

    // Récupérer la conversation + l'annonce
    const { data: conv } = await supabase
      .from('conversations')
      .select('user_id, seller_id, listings(title)')
      .eq('id', conversationId)
      .single()

    if (!conv) return NextResponse.json({ ok: false })

    // Le destinataire est l'autre personne
    const recipientId = conv.user_id === senderId ? conv.seller_id : conv.user_id

    // Récupérer l'email du destinataire
    const { data: recipient } = await supabase.auth.admin.getUserById(recipientId)
    const recipientEmail = recipient?.user?.email
    if (!recipientEmail) return NextResponse.json({ ok: false })

    // Récupérer le nom de l'expéditeur
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', senderId)
      .single()

    const senderName = senderProfile?.full_name || 'A user'
    const listingTitle = (conv.listings as any)?.title || 'a listing'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://v0-buysellseychelles-marketplace-ma.vercel.app'

    // Envoyer via Resend API
    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) return NextResponse.json({ ok: false, error: 'Missing RESEND_API_KEY' })

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BuySellSeychelles <noreply@buysellseychelles.com>',
        to: [recipientEmail],
        subject: `💬 New message from ${senderName}`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
            <div style="background:linear-gradient(135deg,#003F87 0%,#003F87 50%,#007A3D 100%);padding:20px;border-radius:12px 12px 0 0;text-align:center">
              <h1 style="color:#fff;margin:0;font-size:20px">🌴 BuySellSeychelles</h1>
            </div>
            <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px;border:1px solid #eee">
              <p style="font-size:16px;font-weight:600;color:#111;margin-top:0">
                💬 ${senderName} sent you a message
              </p>
              <p style="color:#555;font-size:14px">Listing: <strong>${listingTitle}</strong></p>
              <div style="background:#fff;border:1px solid #e5e5e5;border-radius:8px;padding:16px;margin:16px 0">
                <p style="color:#222;font-size:14px;margin:0;line-height:1.6">${messageText}</p>
              </div>
              <a href="${siteUrl}/conversations"
                style="display:inline-block;background:#003F87;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">
                Reply to message →
              </a>
              <p style="color:#999;font-size:12px;margin-top:20px">
                You are receiving this email because you have an account on BuySellSeychelles.
                <br/><a href="${siteUrl}/dashboard" style="color:#999;text-decoration:underline">Manage email preferences</a>
              </p>
            </div>
          </div>
        `,
      }),
    })

    // Notification in-app
    await supabase.from('notifications').insert({
      user_id: recipientId,
      title: `💬 New message from ${senderName}`,
      body: messageText.slice(0, 120),
      link: `/conversations/${conversationId}`,
    })

    // Notification push (même navigateur fermé)
    await sendPushToUser(recipientId, {
      title: `💬 ${senderName}`,
      body: messageText.slice(0, 100),
      url: `/conversations/${conversationId}`,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Notify error:', err)
    return NextResponse.json({ ok: false })
  }
}
