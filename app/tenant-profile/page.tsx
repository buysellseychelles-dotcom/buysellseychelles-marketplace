'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const SITUATIONS = [
  { value: 'employed', label: '💼 Employed (salaried)' },
  { value: 'self_employed', label: '🏢 Self-employed / Business owner' },
  { value: 'civil_servant', label: '🏛️ Civil servant / Government employee' },
  { value: 'retired', label: '🏖️ Retired' },
  { value: 'student', label: '🎓 Student' },
  { value: 'other', label: '⋯ Other' },
]

const CONTRACT_TYPES = [
  { value: 'permanent', label: 'Permanent contract' },
  { value: 'fixed_term', label: 'Fixed-term contract' },
  { value: 'freelance', label: 'Freelance / Independent' },
  { value: 'pension', label: 'Pension / Retirement income' },
  { value: 'none', label: 'No contract / Other' },
]

const INCOME_RANGES = [
  { value: '0-5000', label: 'Under SCR 5,000 / month' },
  { value: '5000-10000', label: 'SCR 5,000 – 10,000 / month' },
  { value: '10000-20000', label: 'SCR 10,000 – 20,000 / month' },
  { value: '20000-40000', label: 'SCR 20,000 – 40,000 / month' },
  { value: '40000+', label: 'Over SCR 40,000 / month' },
  { value: 'prefer_not', label: 'Prefer not to say' },
]

export default function TenantProfilePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [situation, setSituation] = useState('')
  const [employer, setEmployer] = useState('')
  const [contractType, setContractType] = useState('')
  const [incomeRange, setIncomeRange] = useState('')
  const [occupants, setOccupants] = useState(1)
  const [hasGuarantor, setHasGuarantor] = useState(false)
  const [guarantorName, setGuarantorName] = useState('')
  const [pets, setPets] = useState(false)
  const [presentation, setPresentation] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('tenant_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        setSituation(data.situation ?? '')
        setEmployer(data.employer ?? '')
        setContractType(data.contract_type ?? '')
        setIncomeRange(data.income_range ?? '')
        setOccupants(data.occupants ?? 1)
        setHasGuarantor(data.guarantor ?? false)
        setGuarantorName(data.guarantor_name ?? '')
        setPets(data.pets ?? false)
        setPresentation(data.presentation ?? '')
      }
      setLoading(false)
    }
    init()
  }, [router])

  const save = async () => {
    if (!userId) return
    setSaving(true)
    await supabase.from('tenant_profiles').upsert({
      user_id: userId,
      situation,
      employer: employer || null,
      contract_type: contractType || null,
      income_range: incomeRange || null,
      occupants,
      guarantor: hasGuarantor,
      guarantor_name: hasGuarantor ? (guarantorName || null) : null,
      pets,
      presentation: presentation || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <p className="text-gray-400">Loading…</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-4">

      <div className="bg-black text-white px-4 py-6 rounded-2xl mb-6 text-center">
        <p className="text-3xl mb-2">🏠</p>
        <h1 className="text-xl font-bold mb-1">Tenant Dossier</h1>
        <p className="text-gray-400 text-sm">This information will be shared with landlords when you apply for a rental.</p>
      </div>

      <div className="space-y-5">

        {/* Situation professionnelle */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <h2 className="font-semibold text-sm mb-3">💼 Professional situation</h2>
          <div className="grid grid-cols-1 gap-2">
            {SITUATIONS.map(s => (
              <button key={s.value} onClick={() => setSituation(s.value)}
                className={`text-left px-4 py-2.5 rounded-xl text-sm border transition-colors ${
                  situation === s.value ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Employeur */}
        {(situation === 'employed' || situation === 'civil_servant' || situation === 'self_employed') && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <h2 className="font-semibold text-sm mb-3">🏢 Employer / Company name</h2>
            <input value={employer} onChange={e => setEmployer(e.target.value)}
              placeholder="e.g. Seychelles Trading Company, Government of Seychelles…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
        )}

        {/* Type de contrat */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <h2 className="font-semibold text-sm mb-3">📄 Contract / Income type</h2>
          <div className="grid grid-cols-1 gap-2">
            {CONTRACT_TYPES.map(c => (
              <button key={c.value} onClick={() => setContractType(c.value)}
                className={`text-left px-4 py-2.5 rounded-xl text-sm border transition-colors ${
                  contractType === c.value ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'
                }`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Revenus */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <h2 className="font-semibold text-sm mb-3">💰 Monthly income (net)</h2>
          <div className="grid grid-cols-1 gap-2">
            {INCOME_RANGES.map(r => (
              <button key={r.value} onClick={() => setIncomeRange(r.value)}
                className={`text-left px-4 py-2.5 rounded-xl text-sm border transition-colors ${
                  incomeRange === r.value ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'
                }`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nb occupants + animaux */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-4">
          <h2 className="font-semibold text-sm">🏡 Rental details</h2>
          <div>
            <label className="text-xs text-gray-500 mb-2 block">Number of occupants (including yourself)</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setOccupants(Math.max(1, occupants - 1))}
                className="w-9 h-9 rounded-full border border-gray-300 text-lg font-medium hover:bg-gray-50">−</button>
              <span className="text-lg font-bold w-8 text-center">{occupants}</span>
              <button onClick={() => setOccupants(Math.min(10, occupants + 1))}
                className="w-9 h-9 rounded-full border border-gray-300 text-lg font-medium hover:bg-gray-50">+</button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">🐾 Pets</p>
              <p className="text-xs text-gray-400">Do you have pets?</p>
            </div>
            <button onClick={() => setPets(!pets)}
              className={`relative w-12 h-6 rounded-full transition-colors ${pets ? 'bg-black' : 'bg-gray-200'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${pets ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Garant */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">🤝 Guarantor</p>
              <p className="text-xs text-gray-400">Someone who guarantees your rent payments</p>
            </div>
            <button onClick={() => setHasGuarantor(!hasGuarantor)}
              className={`relative w-12 h-6 rounded-full transition-colors ${hasGuarantor ? 'bg-black' : 'bg-gray-200'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${hasGuarantor ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          {hasGuarantor && (
            <input value={guarantorName} onChange={e => setGuarantorName(e.target.value)}
              placeholder="Guarantor's name and relationship (e.g. Parent – John Smith)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          )}
        </div>

        {/* Présentation */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <h2 className="font-semibold text-sm mb-3">✍️ Personal presentation</h2>
          <textarea value={presentation} onChange={e => setPresentation(e.target.value)}
            placeholder="Briefly introduce yourself to landlords — who you are, your lifestyle, why you're looking for a rental in the Seychelles…"
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" />
          <p className="text-xs text-gray-400 mt-1">{presentation.length}/500</p>
        </div>

        <button onClick={save} disabled={saving || !situation}
          className="w-full bg-black text-white rounded-2xl py-4 text-sm font-semibold disabled:opacity-50">
          {saving ? 'Saving…' : 'Save my dossier'}
        </button>

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3 text-center">
            ✓ Dossier saved — landlords can now view it when you contact them.
          </div>
        )}

      </div>
    </div>
  )
}
