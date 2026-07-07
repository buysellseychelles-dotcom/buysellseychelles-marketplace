import { supabase } from '@/lib/supabase'

// Marque toutes les notifications de l'utilisateur comme lues et prévient
// les badges (cloche du header, etc.) de se remettre à zéro immédiatement.
export async function markAllNotificationsRead(userId: string) {
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
  window.dispatchEvent(new CustomEvent('bss-notifs-read'))
}