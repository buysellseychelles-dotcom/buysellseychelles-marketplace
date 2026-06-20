'use client'

export type ExtraFields = {
  make?: string
  model?: string
  year?: string
  mileage?: string
  fuel_type?: string
  gearbox?: string
  condition?: string
  property_type?: string
  bedrooms?: string
  bathrooms?: string
  area_sqm?: string
  furnished?: boolean
  tenure?: string
  contract_type?: string
  salary?: string
  boat_type?: string
}

type Props = {
  category: string
  fields: ExtraFields
  onChange: (fields: ExtraFields) => void
}

const set = (fields: ExtraFields, key: keyof ExtraFields, value: string | boolean) =>
  ({ ...fields, [key]: value })

const PillGroup = ({ label, options, value, onChange }: {
  label: string
  options: string[]
  value?: string
  onChange: (v: string) => void
}) => (
  <div>
    <label className="text-sm font-semibold text-gray-800 block mb-2">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(value === opt ? '' : opt)}
          className={`py-1.5 px-3 rounded-full text-sm font-medium border transition-colors ${
            value === opt ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
          }`}>
          {opt}
        </button>
      ))}
    </div>
  </div>
)

const TextInput = ({ label, placeholder, value, onChange, inputMode }: {
  label: string
  placeholder?: string
  value?: string
  onChange: (v: string) => void
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode']
}) => (
  <div>
    <label className="text-sm font-semibold text-gray-800 block mb-1.5">{label}</label>
    <input
      type="text"
      inputMode={inputMode}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
    />
  </div>
)

export default function CategoryFields({ category, fields, onChange }: Props) {
  const f = fields
  const u = (key: keyof ExtraFields, val: string | boolean) => onChange(set(f, key, val))

  if (category === 'voiture') {
    return (
      <div className="space-y-5 border-t border-gray-100 pt-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Vehicle details</p>
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Brand" placeholder="e.g. Toyota" value={f.make} onChange={v => u('make', v)} />
          <TextInput label="Model" placeholder="e.g. Hilux" value={f.model} onChange={v => u('model', v)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Year" placeholder="e.g. 2020" value={f.year} onChange={v => u('year', v)} inputMode="numeric" />
          <TextInput label="Mileage (km)" placeholder="e.g. 45000" value={f.mileage} onChange={v => u('mileage', v)} inputMode="numeric" />
        </div>
        <PillGroup label="Fuel type" options={['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG']} value={f.fuel_type} onChange={v => u('fuel_type', v)} />
        <PillGroup label="Gearbox" options={['Manual', 'Automatic']} value={f.gearbox} onChange={v => u('gearbox', v)} />
        <PillGroup label="Condition" options={['New', 'Like new', 'Good', 'Fair']} value={f.condition} onChange={v => u('condition', v)} />
      </div>
    )
  }

  if (category === 'immobilier') {
    return (
      <div className="space-y-5 border-t border-gray-100 pt-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Property details</p>
        <PillGroup label="Property type" options={['Apartment', 'House', 'Villa', 'Studio', 'Land', 'Commercial']} value={f.property_type} onChange={v => u('property_type', v)} />
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Area (m²)" placeholder="e.g. 85" value={f.area_sqm} onChange={v => u('area_sqm', v)} inputMode="numeric" />
          <TextInput label="Bedrooms" placeholder="e.g. 3" value={f.bedrooms} onChange={v => u('bedrooms', v)} inputMode="numeric" />
        </div>
        <PillGroup label="Furnished" options={['Furnished', 'Unfurnished']} value={f.furnished === true ? 'Furnished' : f.furnished === false ? 'Unfurnished' : undefined} onChange={v => u('furnished', v === 'Furnished')} />
        <PillGroup label="Tenure" options={['Freehold', 'Leasehold']} value={f.tenure} onChange={v => u('tenure', v)} />
      </div>
    )
  }

  if (category === 'bateau') {
    return (
      <div className="space-y-5 border-t border-gray-100 pt-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Boat details</p>
        <PillGroup label="Type" options={['Fishing boat', 'Sailboat', 'Motorboat', 'Dinghy', 'Catamaran', 'Kayak', 'Other']} value={f.boat_type} onChange={v => u('boat_type', v)} />
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Brand" placeholder="e.g. Yamaha" value={f.make} onChange={v => u('make', v)} />
          <TextInput label="Year" placeholder="e.g. 2018" value={f.year} onChange={v => u('year', v)} inputMode="numeric" />
        </div>
        <PillGroup label="Condition" options={['New', 'Like new', 'Good', 'Fair']} value={f.condition} onChange={v => u('condition', v)} />
      </div>
    )
  }

  if (category === 'emploi') {
    return (
      <div className="space-y-5 border-t border-gray-100 pt-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Job details</p>
        <PillGroup label="Contract type" options={['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']} value={f.contract_type} onChange={v => u('contract_type', v)} />
        <TextInput label="Salary" placeholder="e.g. 8,000 SCR/month" value={f.salary} onChange={v => u('salary', v)} />
      </div>
    )
  }

  if (category === 'moto') {
    return (
      <div className="space-y-5 border-t border-gray-100 pt-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Vehicle details</p>
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Brand" placeholder="e.g. Honda" value={f.make} onChange={v => u('make', v)} />
          <TextInput label="Model" placeholder="e.g. CBR 500" value={f.model} onChange={v => u('model', v)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Year" placeholder="e.g. 2021" value={f.year} onChange={v => u('year', v)} inputMode="numeric" />
          <TextInput label="Mileage (km)" placeholder="e.g. 8000" value={f.mileage} onChange={v => u('mileage', v)} inputMode="numeric" />
        </div>
        <PillGroup label="Condition" options={['New', 'Like new', 'Good', 'Fair']} value={f.condition} onChange={v => u('condition', v)} />
      </div>
    )
  }

  if (category === 'velos') {
    return (
      <div className="space-y-5 border-t border-gray-100 pt-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bicycle details</p>
        <PillGroup label="Type" options={['Road bike', 'Mountain bike', 'City bike', 'Electric bike', 'BMX', 'Children\'s', 'Other']} value={f.boat_type} onChange={v => u('boat_type', v)} />
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Brand" placeholder="e.g. Trek" value={f.make} onChange={v => u('make', v)} />
          <TextInput label="Size / Frame" placeholder="e.g. 54cm / M" value={f.model} onChange={v => u('model', v)} />
        </div>
        <PillGroup label="Condition" options={['New', 'Like new', 'Good', 'Fair']} value={f.condition} onChange={v => u('condition', v)} />
      </div>
    )
  }

  if (category === 'utilitaire' || category === 'pieces_auto') {
    return (
      <div className="space-y-5 border-t border-gray-100 pt-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Details</p>
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Brand" placeholder="e.g. Toyota" value={f.make} onChange={v => u('make', v)} />
          <TextInput label="Model" placeholder="e.g. Hiace" value={f.model} onChange={v => u('model', v)} />
        </div>
        <TextInput label="Year" placeholder="e.g. 2019" value={f.year} onChange={v => u('year', v)} inputMode="numeric" />
        <PillGroup label="Condition" options={['New', 'Like new', 'Good', 'Fair']} value={f.condition} onChange={v => u('condition', v)} />
      </div>
    )
  }

  if (category === 'location' || category === 'location_vacances' || category === 'terrain' || category === 'commercial') {
    return (
      <div className="space-y-5 border-t border-gray-100 pt-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Property details</p>
        {(category === 'location' || category === 'location_vacances') && (
          <PillGroup label="Property type" options={['Apartment', 'House', 'Villa', 'Studio', 'Room']} value={f.property_type} onChange={v => u('property_type', v)} />
        )}
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Area (m²)" placeholder="e.g. 85" value={f.area_sqm} onChange={v => u('area_sqm', v)} inputMode="numeric" />
          {category !== 'terrain' && category !== 'commercial' && (
            <TextInput label="Bedrooms" placeholder="e.g. 2" value={f.bedrooms} onChange={v => u('bedrooms', v)} inputMode="numeric" />
          )}
        </div>
        {(category === 'location' || category === 'location_vacances') && (
          <PillGroup label="Furnished" options={['Furnished', 'Unfurnished']} value={f.furnished === true ? 'Furnished' : f.furnished === false ? 'Unfurnished' : undefined} onChange={v => u('furnished', v === 'Furnished')} />
        )}
      </div>
    )
  }

  if (['telephone', 'informatique', 'tv_audio', 'photo_video', 'jeux_video', 'electronique'].includes(category)) {
    return (
      <div className="space-y-5 border-t border-gray-100 pt-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Item details</p>
        {(category === 'telephone' || category === 'informatique') && (
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Brand" placeholder={category === 'telephone' ? 'e.g. Samsung' : 'e.g. Apple'} value={f.make} onChange={v => u('make', v)} />
            <TextInput label="Model" placeholder={category === 'telephone' ? 'e.g. Galaxy S24' : 'e.g. MacBook Air'} value={f.model} onChange={v => u('model', v)} />
          </div>
        )}
        <PillGroup label="Condition" options={['New', 'Like new', 'Good', 'Fair']} value={f.condition} onChange={v => u('condition', v)} />
      </div>
    )
  }

  if (['ameublement', 'electromenager', 'decoration', 'bricolage', 'jardin', 'maison', 'loisirs', 'musique', 'livres', 'jeux_jouets', 'collection', 'mode', 'mode_femme', 'mode_homme', 'mode_enfant', 'chaussures', 'bijoux'].includes(category)) {
    return (
      <div className="space-y-5 border-t border-gray-100 pt-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Item details</p>
        <PillGroup label="Condition" options={['New', 'Like new', 'Good', 'Fair']} value={f.condition} onChange={v => u('condition', v)} />
      </div>
    )
  }

  return null
}
