'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type TenantProfile = {
  situation: string | null
  employer: string | null
  contract_type: string | null
  income_range: string | null
  occupants: number | null
  guarantor: boolean
  guarantor_name: string | null
  pets: boolean
  presentation: string | null
  updated_at: string
}

const SITUATION_LABELS: Record<string, string> = {
  employed: '💼 Employed (salaried)',
  self_employed: '🏢 Self-employed',
  civil_servant: '🏛️ Civil servant',
  retired: '🏖️ Retired',
  student: '🎓 Student',
  other: '⋯ Other',
}

const CONTRACT_LABELS: Record<string, string> = {
  permanent: 'Permanent contract',
  fixed_term: 'Fixed-term contract',
  freelance: 'Freelance / Independent',
  pension: 'Pension / Retirement income',
  none: 'No contract / Other',
}

const INCOME_LABELS: Record<string, string> = {
  '0-5000': 'Under SCR 5,000 / month',
  '5000-10000': 'SCR 5,000 – 10,000 / month',
  '10000-20000': 'SCR 10,000 – 20,000 / month',
  '20000-40000': 'SCR 20,000 – 40,000 / month',
  '40000+': 'Over SCR 40,000 / month',
  prefer_not: 'Prefer not to say',
}

export default function TenantDossierModal({ userId, name, onClose }: {
  userId: string
  name: string
  onClose: () => void
}) {
  const [profile, setProfile] = useState<TenantProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('tenant_profiles').select('*').eq('user_id', userId).maybeSingle()
      .then(({ data }) => { setProfile(data); setLoading(false) })
  }, [userId])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h3 className="font-bold text-base">🏠 Tenant Dossier</h3>
            <p className="text-xs text-gray-400">{name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center">×</button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="py-8 text-center text-gray-400 text-sm">Loading…</div>
          ) : !profile ? (
            <div className="py-8 text-center">
              <p className="text-3xl mb-2">📄</p>
              <p className="text-sm text-gray-500">This tenant has not filled in their dossier yet.</p>
            </div>
          ) : (
            <div className="space-y-4">

              {profile.situation && (
                <Row icon="💼" label="Situation" value={SITUATION_LABELS[profile.situation] ?? profile.situation} />
              )}
              {profile.employer && (
                <Row icon="🏢" label="Employer" value={profile.employer} />
              )}
              {profile.contract_type && (
                <Row icon="📄" label="Contract" value={CONTRACT_LABELS[profile.contract_type] ?? profile.contract_type} />
              )}
              {profile.income_range && (
                <Row icon="💰" label="Monthly income" value={INCOME_LABELS[profile.income_range] ?? profile.income_range} />
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold">{profile.occupants ?? 1}</p>
                  <p className="text-xs text-gray-500">Occupant{(profile.occupants ?? 1) > 1 ? 's' : ''}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold">{profile.pets ? 'Yes' : 'No'}</p>
                  <p className="text-xs text-gray-500">Pets 🐾</p>
                </div>
              </div>

              <div className={`rounded-xl p-3 flex items-center gap-2 ${profile.guarantor ? 'bg-green-50 border border-green-100' : 'bg-gray-50'}`}>
                <span className="text-xl">{profile.guarantor ? '✅' : '❌'}</span>
                <div>
                  <p className="text-sm font-medium">{profile.guarantor ? 'Has a guarantor' : 'No guarantor'}</p>
                  {profile.guarantor && profile.guarantor_name && (
                    <p className="text-xs text-gray-500">{profile.guarantor_name}</p>
                  )}
                </div>
              </div>

              {profile.presentation && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 font-medium mb-1.5">✍️ Personal presentation</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{profile.presentation}</p>
                </div>
              )}

              <p className="text-[11px] text-gray-400 text-center">
                Last updated {new Date(profile.updated_at).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-[11px] text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-gray-800">{value}</p>
      </div>
    </div>
  )
}
