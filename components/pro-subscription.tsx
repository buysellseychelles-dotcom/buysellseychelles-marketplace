'use client'

export default function ProSubscription() {

  const subscribe = async () => {

    const res = await fetch('/api/stripe-subscription', {
      method: 'POST'
    })

    const data = await res.json()

    window.location.href = data.url
  }

  return (
    <button
      onClick={subscribe}
      className="bg-purple-600 text-white px-4 py-2 rounded"
    >
      ⭐ Go PRO — 230 SCR/month
    </button>
  )
}