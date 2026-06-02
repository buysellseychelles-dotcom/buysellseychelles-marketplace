'use client'

export default function BoostPayment({
  listing
}: {
  listing: any
}) {

  const pay = async () => {

    const res = await fetch('/api/stripe', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        title: `Boost : ${listing.title}`,
        amount: 500,
        listingId: listing.id
      })
    })

    const data = await res.json()

    window.location.href = data.url
  }

  return (
    <button
      onClick={pay}
      className="bg-yellow-500 text-white px-4 py-2 rounded"
    >
      🚀 Booster cette annonce — 5€
    </button>
  )
}