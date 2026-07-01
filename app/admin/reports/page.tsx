import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdminUser } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const REASON_LABELS: Record<string, string> = {
  fake: 'Fraudulent listing or scam',
  duplicate: 'Duplicate listing',
  inappropriate: 'Inappropriate content',
  prohibited: 'Prohibited item',
  wrong_price: 'Wrong or misleading price',
  other: 'Other',
  'Fraudulent listing': 'Fraudulent listing',
  'Already sold': 'Already sold',
  'Abusive price': 'Abusive price',
  'Inappropriate content': 'Inappropriate content',
  'Duplicate': 'Duplicate',
  'Other': 'Other',
  'Fake profile / scam': 'Fake profile / scam',
  'Harassment or abuse': 'Harassment or abuse',
  'Spam': 'Spam',
}

export default async function ReportsPage() {
  if (!(await isAdminUser())) redirect('/')

  const { data: reports } = await supabase
    .from('reports')
    .select('*, listings(id, title, status), profiles!reports_reported_user_id_fkey(id, full_name, avatar_url)')
    .order('created_at', { ascending: false })

  const pending = (reports ?? []).filter((r: any) => !r.resolved)
  const resolved = (reports ?? []).filter((r: any) => r.resolved)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">

      {/* Nav admin */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-black">← Admin</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-lg font-bold text-gray-900">Reports</h1>
        {pending.length > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
            {pending.length} pending
          </span>
        )}
      </div>

      {(reports ?? []).length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-3xl mb-2">✅</p>
          <p className="text-gray-500 font-medium">No reports</p>
        </div>
      ) : (
        <>
          {/* En attente */}
          {pending.length > 0 && (
            <div className="mb-6">
              <h2 className="font-bold text-sm text-red-600 mb-3">🚨 Pending ({pending.length})</h2>
              <div className="space-y-3">
                {pending.map((r: any) => (
                  <ReportCard key={r.id} report={r} />
                ))}
              </div>
            </div>
          )}

          {/* Traités */}
          {resolved.length > 0 && (
            <div>
              <h2 className="font-bold text-sm text-gray-500 mb-3">Resolved ({resolved.length})</h2>
              <div className="space-y-3 opacity-60">
                {resolved.map((r: any) => (
                  <ReportCard key={r.id} report={r} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ReportCard({ report: r }: { report: any }) {
  const listing = r.listings
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-4">
        {/* Motif */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-50 text-red-700 px-2 py-1 rounded-full">
            🚨 {REASON_LABELS[r.reason] ?? r.reason ?? 'No reason'}
          </span>
          {r.resolved && (
            <span className="text-xs text-green-600 font-medium">✓ Resolved</span>
          )}
        </div>

        {/* Annonce ou profil concerné */}
        {listing ? (
          <Link href={`/listing/${r.listing_id}`} className="block bg-gray-50 rounded-xl px-3 py-2.5 mb-2 hover:bg-gray-100">
            <p className="text-xs text-gray-400 mb-0.5">Reported listing</p>
            <p className="text-sm font-medium text-gray-800 line-clamp-1">{listing.title}</p>
            {listing.status === 'sold' && (
              <span className="text-xs text-red-500 font-medium">● Sold</span>
            )}
          </Link>
        ) : r.reported_user_id ? (
          <Link href={`/seller/${r.reported_user_id}`} className="block bg-orange-50 rounded-xl px-3 py-2.5 mb-2 hover:bg-orange-100">
            <p className="text-xs text-orange-400 mb-0.5">👤 Reported user</p>
            <p className="text-sm font-medium text-gray-800">{r.profiles?.full_name || r.reported_user_id}</p>
          </Link>
        ) : (
          <p className="text-xs text-gray-400 mb-2">Listing deleted</p>
        )}

        {/* Description */}
        {r.description && (
          <p className="text-xs text-gray-500 italic">« {r.description} »</p>
        )}

        <p className="text-[11px] text-gray-400 mt-2">
          {new Date(r.created_at).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Actions */}
      {!r.resolved && listing && (
        <div className="flex border-t border-gray-100">
          <Link
            href={`/listing/${r.listing_id}`}
            className="flex-1 py-2.5 text-center text-xs text-gray-600 font-medium hover:bg-gray-50"
          >
            View listing
          </Link>
          <div className="w-px bg-gray-100" />
          <form action={`/api/admin/resolve-report`} method="POST" className="flex-1">
            <input type="hidden" name="reportId" value={r.id} />
            <button
              type="submit"
              className="w-full py-2.5 text-xs text-green-600 font-medium hover:bg-green-50"
            >
              ✓ Mark resolved
            </button>
          </form>
          <div className="w-px bg-gray-100" />
          <form action={`/api/admin/delete-listing`} method="POST" className="flex-1">
            <input type="hidden" name="listingId" value={r.listing_id} />
            <input type="hidden" name="reportId" value={r.id} />
            <button
              type="submit"
              className="w-full py-2.5 text-xs text-red-500 font-medium hover:bg-red-50"
            >
              Delete listing
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
