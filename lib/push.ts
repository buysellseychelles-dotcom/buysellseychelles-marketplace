import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string },
) {
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', userId)

  if (!subs || subs.length === 0) return

  const message = JSON.stringify(payload)

  await Promise.allSettled(
    subs.map(async (row) => {
      try {
        await webpush.sendNotification(row.subscription, message)
      } catch (err: any) {
        // Abonnement expiré ou invalide → on supprime
        if (err.statusCode === 404 || err.statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('subscription', row.subscription)
        }
      }
    }),
  )
}

// Envoie une notification push aux appareils mobiles (Expo Push Service)
export async function sendExpoPushToUser(
  userId: string,
  payload: { title: string; body: string; data?: Record<string, unknown> },
) {
  const { data: tokens } = await supabase
    .from('expo_push_tokens')
    .select('token')
    .eq('user_id', userId)

  if (!tokens || tokens.length === 0) return

  const messages = tokens.map((row) => ({
    to: row.token,
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {},
    sound: 'default',
    priority: 'high',
  }))

  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(messages.length === 1 ? messages[0] : messages),
  })

  // Nettoie les tokens invalides retournés par Expo
  if (res.ok) {
    const json = await res.json().catch(() => null)
    const results: any[] = Array.isArray(json?.data) ? json.data : (json?.data ? [json.data] : [])
    const badTokens = tokens
      .filter((_, i) => results[i]?.status === 'error' && results[i]?.details?.error === 'DeviceNotRegistered')
      .map((r) => r.token)
    if (badTokens.length > 0) {
      await supabase.from('expo_push_tokens').delete().in('token', badTokens)
    }
  }
}
