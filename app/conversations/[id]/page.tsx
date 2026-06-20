'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/lang-context'
import { t } from '@/lib/i18n'
import { fileTooLarge } from '@/lib/upload-limits'
import TenantDossierModal from '@/components/tenant-dossier-modal'
import ReviewForm from '@/components/review-form'

type Message = { id: string; sender_id: string; message: string; created_at: string; read: boolean }
type Conversation = { id: string; listing_id: string; user_id: string; seller_id: string; listing?: { title: string; status: string; category?: string } }

const DISPUTE_REASONS = [
  'Item not as described',
  'Item never received',
  'Seller unresponsive',
  'Suspected scam or fraud',
  'Buyer never showed up',
  'Other',
]

export default function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { lang } = useLang()
  const bottomRef = useRef<HTMLDivElement>(null)
  const imgInputRef = useRef<HTMLInputElement>(null)

  const [userId, setUserId] = useState<string | null>(null)
  const [conv, setConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [listingStatus, setListingStatus] = useState<string>('active')
  const [markingSold, setMarkingSold] = useState(false)

  // Évaluation mutuelle après transaction
  const [otherUserId, setOtherUserId] = useState<string | null>(null)
  const [reviewedOther, setReviewedOther] = useState(false)
  const [showReview, setShowReview] = useState(false)

  // Block state
  const [iBlockedThem, setIBlockedThem] = useState(false)
  const [theyBlockedMe, setTheyBlockedMe] = useState(false)
  const [blockLoading, setBlockLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Tenant dossier
  const [showDossier, setShowDossier] = useState(false)

  // Dispute state
  const [showDispute, setShowDispute] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeDesc, setDisputeDesc] = useState('')
  const [disputeSending, setDisputeSending] = useState(false)
  const [disputeDone, setDisputeDone] = useState(false)

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    const markRead = (userId: string) =>
      fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: id, userId }),
      }).then(() => window.dispatchEvent(new CustomEvent('bss-messages-read')))
        .catch(() => {})

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: convData } = await supabase
        .from('conversations')
        .select('id, listing_id, user_id, seller_id, listings(title, status, category, listing_images(image_url))')
        .eq('id', id).single()

      if (!convData) { router.push('/conversations'); return }
      setConv({ ...convData, listing: (convData as any).listings })
      setListingStatus((convData as any).listings?.status ?? 'active')

      // Déterminer l'autre utilisateur
      const otherId = convData.seller_id === user.id ? convData.user_id : convData.seller_id
      setOtherUserId(otherId)

      // Vérifier les blocs dans les deux sens + si j'ai déjà noté l'autre pour cette annonce
      const [{ data: myBlock }, { data: theirBlock }, { data: myReview }] = await Promise.all([
        supabase.from('blocks').select('id').eq('blocker_id', user.id).eq('blocked_id', otherId).maybeSingle(),
        supabase.from('blocks').select('id').eq('blocker_id', otherId).eq('blocked_id', user.id).maybeSingle(),
        supabase.from('reviews').select('id').eq('reviewer_id', user.id).eq('seller_id', otherId).eq('listing_id', convData.listing_id).maybeSingle(),
      ])
      setIBlockedThem(!!myBlock)
      setTheyBlockedMe(!!theirBlock)
      setReviewedOther(!!myReview)

      const { data: msgs } = await supabase
        .from('messages').select('id, sender_id, message, created_at, read')
        .eq('conversation_id', id).order('created_at', { ascending: true })

      setMessages(msgs ?? [])
      setLoading(false)

      // Mark existing unread as read via service role (bypasses RLS)
      await markRead(user.id)

      // Subscribe — also mark incoming messages as read immediately
      channel = supabase.channel(`chat-${id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` },
          (payload) => {
            const newMsg = payload.new as Message
            setMessages(prev => [...prev, newMsg])
            if (newMsg.sender_id !== user.id) markRead(user.id)
          })
        .subscribe()
    }

    init()

    return () => { if (channel) supabase.removeChannel(channel) }
  }, [id, router])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async () => {
    if (!text.trim() || !userId || !conv || sending) return
    setSending(true)
    const msgText = text.trim()
    setText('')

    const { error } = await supabase.from('messages').insert({
      conversation_id: id, sender_id: userId, message: msgText, listing_id: conv.listing_id,
    })

    if (!error) {
      await supabase.from('conversations')
        .update({ last_message: msgText, updated_at: new Date().toISOString() }).eq('id', id)
      fetch('/api/notify/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: id, senderId: userId, messageText: msgText }),
      }).catch(() => {})
    }
    setSending(false)
  }

  const sendImage = useCallback(async (file: File) => {
    if (!userId || !conv || sending) return
    const sizeErr = fileTooLarge(file, lang)
    if (sizeErr) {
      alert(sizeErr)
      if (imgInputRef.current) imgInputRef.current.value = ''
      return
    }
    setSending(true)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const fileName = `chat/${conv.id}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('listings').upload(fileName, file)
    if (!uploadError) {
      const { data } = supabase.storage.from('listings').getPublicUrl(fileName)
      const imageMsg = `__img__:${data.publicUrl}`
      const { error } = await supabase.from('messages').insert({
        conversation_id: id, sender_id: userId, message: imageMsg, listing_id: conv.listing_id,
      })
      if (!error) {
        await supabase.from('conversations')
          .update({ last_message: '📷 Photo', updated_at: new Date().toISOString() }).eq('id', id)
      }
    }
    setSending(false)
    if (imgInputRef.current) imgInputRef.current.value = ''
  }, [userId, conv, sending, id, lang])

  const markAsSold = async () => {
    if (!conv || markingSold) return
    setMarkingSold(true)
    // Le vendeur clique → l'acheteur est l'autre participant de la conversation.
    await supabase.from('listings').update({
      status: 'sold',
      buyer_id: conv.user_id,
      sold_at: new Date().toISOString(),
    }).eq('id', conv.listing_id)
    setListingStatus('sold')
    // Invite les deux parties à s'évaluer mutuellement.
    fetch('/api/notify/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: id }),
    }).catch(() => {})
    setMarkingSold(false)
    // Propose immédiatement au vendeur de noter l'acheteur.
    if (!reviewedOther) setShowReview(true)
  }

  const handleReviewDone = () => {
    setShowReview(false)
    setReviewedOther(true)
  }

  const toggleBlock = async () => {
    if (!userId || !conv) return
    const otherId = conv.seller_id === userId ? conv.user_id : conv.seller_id
    setBlockLoading(true)
    setMenuOpen(false)

    if (iBlockedThem) {
      await fetch('/api/block', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ blockerId: userId, blockedId: otherId }) })
      setIBlockedThem(false)
    } else {
      await fetch('/api/block', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ blockerId: userId, blockedId: otherId }) })
      setIBlockedThem(true)
    }
    setBlockLoading(false)
  }

  const submitDispute = async () => {
    if (!disputeReason || !userId || !conv) return
    setDisputeSending(true)
    const otherId = conv.seller_id === userId ? conv.user_id : conv.seller_id
    await fetch('/api/dispute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: id,
        listingId: conv.listing_id,
        reporterId: userId,
        reportedId: otherId,
        reason: disputeReason,
        description: disputeDesc,
      }),
    })
    setDisputeSending(false)
    setDisputeDone(true)
    setShowDispute(false)
  }

  const canSendMessage = !iBlockedThem && !theyBlockedMe

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-56px)]">

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 bg-white border-b border-gray-100 shrink-0">
        <button onClick={() => router.push('/conversations')} className="text-gray-500 hover:text-black p-1 shrink-0">←</button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{conv?.listing?.title ?? 'Listing'}</p>
          <p className="text-xs text-gray-400">{t(lang, 'conversation')}</p>
        </div>

        {conv?.listing_id && (
          <Link href={`/listing/${conv.listing_id}`}
            className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 shrink-0">
            View
          </Link>
        )}
        {userId === conv?.seller_id && conv?.listing?.category === 'immobilier' && (
          <button onClick={() => setShowDossier(true)}
            className="text-xs font-medium text-purple-700 border border-purple-200 bg-purple-50 rounded-lg px-2.5 py-1.5 hover:bg-purple-100 shrink-0">
            📄 Dossier
          </button>
        )}
        {userId === conv?.seller_id && listingStatus !== 'sold' && (
          <button onClick={markAsSold} disabled={markingSold}
            className="text-xs font-medium text-green-700 border border-green-200 bg-green-50 rounded-lg px-2.5 py-1.5 hover:bg-green-100 disabled:opacity-50 shrink-0">
            {markingSold ? '...' : '✓ Sold'}
          </button>
        )}
        {listingStatus === 'sold' && (
          <span className="text-xs font-medium text-red-600 border border-red-200 bg-red-50 rounded-lg px-2.5 py-1.5 shrink-0">SOLD</span>
        )}
        {listingStatus === 'sold' && otherUserId && !reviewedOther && (
          <button onClick={() => setShowReview(true)}
            className="text-xs font-medium text-yellow-700 border border-yellow-300 bg-yellow-50 rounded-lg px-2.5 py-1.5 hover:bg-yellow-100 shrink-0">
            ⭐ {userId === conv?.seller_id ? 'Rate buyer' : 'Rate seller'}
          </button>
        )}

        {/* Menu ⋯ */}
        <div className="relative shrink-0">
          <button onClick={() => setMenuOpen(o => !o)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black rounded-lg hover:bg-gray-100">
            ⋯
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-9 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                <button onClick={() => { setShowDispute(true); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 text-left">
                  ⚠️ Report a problem
                </button>
                <button onClick={toggleBlock} disabled={blockLoading}
                  className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-red-50 text-left ${iBlockedThem ? 'text-gray-500' : 'text-red-600'}`}>
                  🚫 {iBlockedThem ? 'Unblock user' : 'Block user'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bannière bloqué */}
      {(iBlockedThem || theyBlockedMe) && (
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 text-center">
          <p className="text-xs text-gray-500">
            {iBlockedThem
              ? <>You have blocked this user. <button onClick={toggleBlock} className="underline font-medium">Unblock</button></>
              : 'You cannot reply to this person.'}
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">👋</p>
            <p className="text-gray-500 text-sm">{t(lang, 'start_conversation')}</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_id === userId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl text-sm overflow-hidden ${
                msg.message.startsWith('__img__:') ? 'bg-transparent' :
                isMe ? 'bg-black text-white rounded-br-sm px-4 py-2.5' : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100 px-4 py-2.5'
              }`}>
                {msg.message.startsWith('__img__:') ? (
                  <div>
                    <div className="relative w-52 h-40 rounded-2xl overflow-hidden">
                      <Image src={msg.message.slice(8)} alt="Photo" fill className="object-cover" unoptimized />
                    </div>
                    <p className="text-[10px] mt-1 text-gray-400 text-right">
                      {new Date(msg.created_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                      {isMe && <span className="ml-1">{msg.read ? ' ✓✓' : ' ✓'}</span>}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="leading-relaxed">{msg.message}</p>
                    <p className="text-[10px] mt-1 text-gray-400">
                      {new Date(msg.created_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                      {isMe && <span className="ml-1">{msg.read ? ' ✓✓' : ' ✓'}</span>}
                    </p>
                  </>
                )}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Zone de saisie */}
      <div className="px-3 py-3 bg-white border-t border-gray-100 shrink-0">
        {disputeDone && (
          <p className="text-xs text-center text-green-600 font-medium mb-2">✓ Problem reported — our team will review it within 24h.</p>
        )}
        {canSendMessage ? (
          <>
            <div className="flex items-end gap-2">
              <button onClick={() => imgInputRef.current?.click()}
                className="w-11 h-11 border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors shrink-0 text-lg">
                📷
              </button>
              <input ref={imgInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) sendImage(f) }} />
              <textarea value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder={t(lang, 'type_message')} rows={1}
                className="flex-1 border border-gray-300 rounded-2xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black max-h-32"
                style={{ minHeight: '44px' }} />
              <button onClick={sendMessage} disabled={!text.trim() || sending}
                className="w-11 h-11 bg-black text-white rounded-full flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-gray-800 transition-colors">
                {sending ? '...' : '➤'}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1">{t(lang, 'press_enter')}</p>
          </>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-gray-400">
              {iBlockedThem ? 'You blocked this user.' : 'Messaging is unavailable.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal dossier locataire */}
      {showDossier && conv && (
        <TenantDossierModal
          userId={conv.seller_id === userId ? conv.user_id : conv.seller_id}
          name="Tenant"
          onClose={() => setShowDossier(false)}
        />
      )}

      {/* Modal évaluation mutuelle */}
      {showReview && otherUserId && conv && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">⭐ {userId === conv.seller_id ? 'Rate your buyer' : 'Rate the seller'}</h3>
              <button onClick={() => setShowReview(false)} className="text-gray-400 hover:text-black text-xl leading-none">×</button>
            </div>
            <ReviewForm
              sellerId={otherUserId}
              listingId={conv.listing_id}
              asBuyer={userId !== conv.seller_id}
              onDone={handleReviewDone}
            />
          </div>
        </div>
      )}

      {/* Modal litige */}
      {showDispute && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <h3 className="font-bold text-center">⚠️ Report a problem</h3>
            <p className="text-xs text-gray-500 text-center">Our team reviews every report within 24 hours.</p>
            <div className="space-y-2">
              {DISPUTE_REASONS.map(r => (
                <button key={r} onClick={() => setDisputeReason(r)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-colors ${
                    disputeReason === r ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
            <textarea value={disputeDesc} onChange={e => setDisputeDesc(e.target.value)}
              placeholder="Additional details (optional)" rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" />
            <div className="flex gap-3">
              <button onClick={() => setShowDispute(false)}
                className="flex-1 border border-gray-300 rounded-xl py-3 text-sm font-medium">
                Cancel
              </button>
              <button onClick={submitDispute} disabled={!disputeReason || disputeSending}
                className="flex-1 bg-orange-500 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-40">
                {disputeSending ? '...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
