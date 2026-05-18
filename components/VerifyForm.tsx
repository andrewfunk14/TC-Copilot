'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TransactionExtraction } from '@/lib/schemas'

interface VerifyFormProps {
  extraction: TransactionExtraction
}

const REQUIRED_FIELDS = ['client_name', 'property_address', 'agent_name', 'close_date', 'purchase_price']

export default function VerifyForm({ extraction }: VerifyFormProps) {
  const router = useRouter()
  const [form, setForm] = useState({
    team:                       extraction.team_detection.team ?? '',
    kw_side:                    extraction.kw_side ?? 'buyer',
    transaction_type:           'residential',

    // Buyer / client
    client_name:                extraction.client_name ?? '',
    client_phone:               extraction.client_phone ?? '',
    client_email:               extraction.client_email ?? '',

    // Property
    property_address:           extraction.property_address ?? '',
    mls_number:                 extraction.mls_number ?? '',

    // Contract terms
    purchase_price:             extraction.purchase_price?.toString() ?? '',
    earnest_money:              extraction.earnest_money?.toString() ?? '',
    construction_deposit:       extraction.construction_deposit?.toString() ?? '',
    concessions:                extraction.concessions?.toString() ?? '',
    offer_reference_date:       extraction.offer_reference_date ?? '',
    acceptance_date:            extraction.acceptance_date ?? '',

    // Deadlines
    seller_disclosure_date:     extraction.seller_disclosure_date ?? '',
    due_diligence_date:         extraction.due_diligence_date ?? '',
    financing_date:             extraction.financing_date ?? '',
    close_date:                 extraction.close_date ?? '',

    // Commission
    sac_percent:                extraction.sac_percent?.toString() ?? '',
    bac_percent:                extraction.bac_percent?.toString() ?? '',
    net_or_gross:               extraction.net_or_gross ?? '',
    transaction_fee:            extraction.transaction_fee?.toString() ?? '',

    // Home warranty
    home_warranty:              extraction.home_warranty ?? false,
    home_warranty_paid_by:      extraction.home_warranty_paid_by ?? '',
    home_warranty_amount:       extraction.home_warranty_amount?.toString() ?? '',

    // Seller
    seller_name:                extraction.seller_name ?? '',
    seller_phone:               extraction.seller_phone ?? '',
    seller_email:               extraction.seller_email ?? '',

    // Buyer agent
    agent_name:                 extraction.agent_name ?? '',
    agent_company:              extraction.agent_company ?? '',
    agent_phone:                extraction.agent_phone ?? '',
    agent_email:                extraction.agent_email ?? '',
    agent_office_address:       extraction.agent_office_address ?? '',
    tc_name:                    extraction.tc_name ?? '',

    // Listing agent
    sellers_agent_name:         extraction.sellers_agent_name ?? '',
    sellers_agent_company:      extraction.sellers_agent_company ?? '',
    sellers_agent_phone:        extraction.sellers_agent_phone ?? '',
    sellers_agent_email:        extraction.sellers_agent_email ?? '',

    // Buyer title
    title_company:              extraction.title_company ?? '',
    title_officer_name:         extraction.title_officer_name ?? '',
    title_officer_phone:        extraction.title_officer_phone ?? '',
    title_officer_email:        extraction.title_officer_email ?? '',

    // Seller title
    seller_title_company:       extraction.seller_title_company ?? '',
    seller_title_officer_name:  extraction.seller_title_officer_name ?? '',
    seller_title_officer_phone: extraction.seller_title_officer_phone ?? '',
    seller_title_officer_email: extraction.seller_title_officer_email ?? '',

    // Lender
    lender_company:             extraction.lender_company ?? '',
    lender_name:                extraction.lender_name ?? '',
    lender_phone:               extraction.lender_phone ?? '',
    lender_email:               extraction.lender_email ?? '',

    // Notes
    water_shares_rights:        extraction.water_shares_rights ?? '',
    notes:                      extraction.notes_content ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const uncertainFields = new Set(extraction.uncertain_fields)

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  const allRequiredFilled = REQUIRED_FIELDS.every(f => form[f as keyof typeof form])
  const teamSelected      = !!form.team
  const canConfirm        = allRequiredFilled && teamSelected

  async function handleConfirm() {
    setError(null)
    setLoading(true)
    try {
      const numericFields = [
        'purchase_price', 'earnest_money', 'construction_deposit', 'concessions',
        'sac_percent', 'bac_percent', 'transaction_fee', 'home_warranty_amount',
      ]
      const payload: Record<string, unknown> = { ...form, short_address: null }
      for (const f of numericFields) {
        payload[f] = form[f as keyof typeof form] ? Number(form[f as keyof typeof form]) : null
      }
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to save transaction. Please try again.')
        return
      }
      router.push(`/launch/${data.id}`)
    } catch {
      setError('Could not save transaction. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  function fieldClass(name: string, value: string) {
    const isUncertain = uncertainFields.has(name)
    const isEmpty     = !value && REQUIRED_FIELDS.includes(name)
    if (isEmpty)      return 'border-red-400 bg-white'
    if (isUncertain)  return 'border-amber-400 bg-amber-50'
    return 'border-gray-300 bg-white'
  }

  const confidence        = extraction.team_detection.confidence
  const teamIndicatorClass = confidence === 'high'
    ? 'text-green-600'
    : confidence === 'medium' || confidence === 'low'
    ? 'text-amber-600'
    : 'text-red-600'

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Team + type */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Team &amp; Transaction Type</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
          <select
            value={form.team}
            onChange={e => set('team', e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 bg-white ${!form.team ? 'border-red-400' : 'border-gray-300'}`}
          >
            <option value="">-- Select team --</option>
            <option value="CHR">CHR</option>
            <option value="KW_UTAH">KW Utah</option>
            <option value="KW_IDAHO">KW Idaho</option>
          </select>
          {extraction.team_detection.team && (
            <p className={`mt-1 text-xs ${teamIndicatorClass}`}>
              Auto-detected: {extraction.team_detection.team}
              {confidence === 'medium' && ' — please confirm'}
              {confidence === 'low' && ' — low confidence, verify'}
              {extraction.team_detection.detection_source && ` (${extraction.team_detection.detection_source})`}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
          <div className="flex gap-4">
            {(['residential', 'land'] as const).map(type => (
              <label key={type} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="transaction_type"
                  value={type}
                  checked={form.transaction_type === type}
                  onChange={() => set('transaction_type', type)}
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Buyer / Client */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Buyer / Client</h2>
        <Field label="Client Name *"  name="client_name"  value={form.client_name}  onChange={set} uncertain={uncertainFields.has('client_name')}  fieldClass={fieldClass('client_name', form.client_name)} />
        <Field label="Client Phone"   name="client_phone" value={form.client_phone} onChange={set} uncertain={uncertainFields.has('client_phone')} fieldClass={fieldClass('client_phone', form.client_phone)} />
        <Field label="Client Email"   name="client_email" value={form.client_email} onChange={set} uncertain={uncertainFields.has('client_email')} fieldClass={fieldClass('client_email', form.client_email)} />
      </section>

      {/* Property */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Property</h2>
        <Field label="Property Address *" name="property_address" value={form.property_address} onChange={set} uncertain={uncertainFields.has('property_address')} fieldClass={fieldClass('property_address', form.property_address)} />
        <Field label="MLS #"              name="mls_number"       value={form.mls_number}       onChange={set} uncertain={uncertainFields.has('mls_number')}       fieldClass={fieldClass('mls_number', form.mls_number)} />
      </section>

      {/* Contract Terms */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Contract Terms</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Purchase Price *"      name="purchase_price"      value={form.purchase_price}      onChange={set} uncertain={uncertainFields.has('purchase_price')}      fieldClass={fieldClass('purchase_price', form.purchase_price)}      type="number" />
          <Field label="Earnest Money"          name="earnest_money"        value={form.earnest_money}        onChange={set} uncertain={uncertainFields.has('earnest_money')}        fieldClass={fieldClass('earnest_money', form.earnest_money)}        type="number" />
          <Field label="Construction Deposit"   name="construction_deposit" value={form.construction_deposit} onChange={set} uncertain={uncertainFields.has('construction_deposit')} fieldClass={fieldClass('construction_deposit', form.construction_deposit)} type="number" />
          <Field label="Concessions"            name="concessions"          value={form.concessions}          onChange={set} uncertain={uncertainFields.has('concessions')}          fieldClass={fieldClass('concessions', form.concessions)}          type="number" />
          <Field label="Offer Reference Date"   name="offer_reference_date" value={form.offer_reference_date} onChange={set} uncertain={uncertainFields.has('offer_reference_date')} fieldClass={fieldClass('offer_reference_date', form.offer_reference_date)} type="date" />
          <Field label="Acceptance Date"        name="acceptance_date"      value={form.acceptance_date}      onChange={set} uncertain={uncertainFields.has('acceptance_date')}      fieldClass={fieldClass('acceptance_date', form.acceptance_date)}      type="date" />
        </div>
      </section>

      {/* Deadlines */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Deadlines</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Seller Disclosure"  name="seller_disclosure_date" value={form.seller_disclosure_date} onChange={set} uncertain={uncertainFields.has('seller_disclosure_date')} fieldClass={fieldClass('seller_disclosure_date', form.seller_disclosure_date)} type="date" />
          <Field label="Due Diligence"      name="due_diligence_date"     value={form.due_diligence_date}     onChange={set} uncertain={uncertainFields.has('due_diligence_date')}     fieldClass={fieldClass('due_diligence_date', form.due_diligence_date)}     type="date" />
          <Field label="Financing"          name="financing_date"         value={form.financing_date}         onChange={set} uncertain={uncertainFields.has('financing_date')}         fieldClass={fieldClass('financing_date', form.financing_date)}         type="date" />
          <Field label="Settlement / Close *" name="close_date"           value={form.close_date}             onChange={set} uncertain={uncertainFields.has('close_date')}             fieldClass={fieldClass('close_date', form.close_date)}             type="date" />
        </div>
      </section>

      {/* Commission */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Commission</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="SAC %"           name="sac_percent"    value={form.sac_percent}    onChange={set} uncertain={uncertainFields.has('sac_percent')}    fieldClass={fieldClass('sac_percent', form.sac_percent)}    type="number" />
          <Field label="BAC %"           name="bac_percent"    value={form.bac_percent}    onChange={set} uncertain={uncertainFields.has('bac_percent')}    fieldClass={fieldClass('bac_percent', form.bac_percent)}    type="number" />
          <Field label="Net or Gross"    name="net_or_gross"   value={form.net_or_gross}   onChange={set} uncertain={uncertainFields.has('net_or_gross')}   fieldClass={fieldClass('net_or_gross', form.net_or_gross)} />
          <Field label="Transaction Fee" name="transaction_fee" value={form.transaction_fee} onChange={set} uncertain={uncertainFields.has('transaction_fee')} fieldClass={fieldClass('transaction_fee', form.transaction_fee)} type="number" />
        </div>
      </section>

      {/* Home Warranty */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Home Warranty</h2>
        <div className="flex items-center gap-3">
          <input
            id="home_warranty"
            type="checkbox"
            checked={form.home_warranty}
            onChange={e => setForm(f => ({ ...f, home_warranty: e.target.checked }))}
            className="w-4 h-4 accent-blue-600"
          />
          <label htmlFor="home_warranty" className="text-sm font-medium text-gray-700">Included</label>
        </div>
        {form.home_warranty && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Paid By" name="home_warranty_paid_by" value={form.home_warranty_paid_by} onChange={set} uncertain={uncertainFields.has('home_warranty_paid_by')} fieldClass={fieldClass('home_warranty_paid_by', form.home_warranty_paid_by)} />
            <Field label="Amount"  name="home_warranty_amount"  value={form.home_warranty_amount}  onChange={set} uncertain={uncertainFields.has('home_warranty_amount')}  fieldClass={fieldClass('home_warranty_amount', form.home_warranty_amount)}  type="number" />
          </div>
        )}
      </section>

      {/* Seller */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Seller</h2>
        <Field label="Seller Name"  name="seller_name"  value={form.seller_name}  onChange={set} uncertain={uncertainFields.has('seller_name')}  fieldClass={fieldClass('seller_name', form.seller_name)} />
        <Field label="Seller Phone" name="seller_phone" value={form.seller_phone} onChange={set} uncertain={uncertainFields.has('seller_phone')} fieldClass={fieldClass('seller_phone', form.seller_phone)} />
        <Field label="Seller Email" name="seller_email" value={form.seller_email} onChange={set} uncertain={uncertainFields.has('seller_email')} fieldClass={fieldClass('seller_email', form.seller_email)} />
      </section>

      {/* Buyer Agent */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Buyer Agent</h2>
        <Field label="Agent Name *"     name="agent_name"           value={form.agent_name}          onChange={set} uncertain={uncertainFields.has('agent_name')}          fieldClass={fieldClass('agent_name', form.agent_name)} />
        <Field label="Company"          name="agent_company"         value={form.agent_company}        onChange={set} uncertain={uncertainFields.has('agent_company')}        fieldClass={fieldClass('agent_company', form.agent_company)} />
        <Field label="Agent Phone"      name="agent_phone"           value={form.agent_phone}          onChange={set} uncertain={uncertainFields.has('agent_phone')}          fieldClass={fieldClass('agent_phone', form.agent_phone)} />
        <Field label="Agent Email"      name="agent_email"           value={form.agent_email}          onChange={set} uncertain={uncertainFields.has('agent_email')}          fieldClass={fieldClass('agent_email', form.agent_email)} />
        <Field label="Office Address"   name="agent_office_address"  value={form.agent_office_address} onChange={set} uncertain={uncertainFields.has('agent_office_address')} fieldClass={fieldClass('agent_office_address', form.agent_office_address)} />
        <Field label="TC Name"          name="tc_name"               value={form.tc_name}              onChange={set} uncertain={uncertainFields.has('tc_name')}              fieldClass={fieldClass('tc_name', form.tc_name)} />
      </section>

      {/* Listing Agent */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Listing Agent</h2>
        <Field label="Name"    name="sellers_agent_name"    value={form.sellers_agent_name}    onChange={set} uncertain={uncertainFields.has('sellers_agent_name')}    fieldClass={fieldClass('sellers_agent_name', form.sellers_agent_name)} />
        <Field label="Company" name="sellers_agent_company" value={form.sellers_agent_company} onChange={set} uncertain={uncertainFields.has('sellers_agent_company')} fieldClass={fieldClass('sellers_agent_company', form.sellers_agent_company)} />
        <Field label="Phone"   name="sellers_agent_phone"   value={form.sellers_agent_phone}   onChange={set} uncertain={uncertainFields.has('sellers_agent_phone')}   fieldClass={fieldClass('sellers_agent_phone', form.sellers_agent_phone)} />
        <Field label="Email"   name="sellers_agent_email"   value={form.sellers_agent_email}   onChange={set} uncertain={uncertainFields.has('sellers_agent_email')}   fieldClass={fieldClass('sellers_agent_email', form.sellers_agent_email)} />
      </section>

      {/* Buyer Title Company */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Buyer Title Company</h2>
        <Field label="Company"      name="title_company"       value={form.title_company}       onChange={set} uncertain={uncertainFields.has('title_company')}       fieldClass={fieldClass('title_company', form.title_company)} />
        <Field label="Title Officer" name="title_officer_name" value={form.title_officer_name}  onChange={set} uncertain={uncertainFields.has('title_officer_name')}  fieldClass={fieldClass('title_officer_name', form.title_officer_name)} />
        <Field label="Phone"         name="title_officer_phone" value={form.title_officer_phone} onChange={set} uncertain={uncertainFields.has('title_officer_phone')} fieldClass={fieldClass('title_officer_phone', form.title_officer_phone)} />
        <Field label="Email"         name="title_officer_email" value={form.title_officer_email} onChange={set} uncertain={uncertainFields.has('title_officer_email')} fieldClass={fieldClass('title_officer_email', form.title_officer_email)} />
      </section>

      {/* Seller Title Company */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Seller Title Company</h2>
        <Field label="Company"      name="seller_title_company"       value={form.seller_title_company}       onChange={set} uncertain={uncertainFields.has('seller_title_company')}       fieldClass={fieldClass('seller_title_company', form.seller_title_company)} />
        <Field label="Title Officer" name="seller_title_officer_name" value={form.seller_title_officer_name}  onChange={set} uncertain={uncertainFields.has('seller_title_officer_name')}  fieldClass={fieldClass('seller_title_officer_name', form.seller_title_officer_name)} />
        <Field label="Phone"         name="seller_title_officer_phone" value={form.seller_title_officer_phone} onChange={set} uncertain={uncertainFields.has('seller_title_officer_phone')} fieldClass={fieldClass('seller_title_officer_phone', form.seller_title_officer_phone)} />
        <Field label="Email"         name="seller_title_officer_email" value={form.seller_title_officer_email} onChange={set} uncertain={uncertainFields.has('seller_title_officer_email')} fieldClass={fieldClass('seller_title_officer_email', form.seller_title_officer_email)} />
      </section>

      {/* Lender */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Lender</h2>
        <Field label="Company"     name="lender_company" value={form.lender_company} onChange={set} uncertain={uncertainFields.has('lender_company')} fieldClass={fieldClass('lender_company', form.lender_company)} />
        <Field label="Loan Officer" name="lender_name"   value={form.lender_name}   onChange={set} uncertain={uncertainFields.has('lender_name')}   fieldClass={fieldClass('lender_name', form.lender_name)} />
        <Field label="Phone"        name="lender_phone"  value={form.lender_phone}  onChange={set} uncertain={uncertainFields.has('lender_phone')}  fieldClass={fieldClass('lender_phone', form.lender_phone)} />
        <Field label="Email"        name="lender_email"  value={form.lender_email}  onChange={set} uncertain={uncertainFields.has('lender_email')}  fieldClass={fieldClass('lender_email', form.lender_email)} />
      </section>

      {/* Notes */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Notes</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Water Shares / Rights</label>
          <input
            type="text"
            value={form.water_shares_rights}
            onChange={e => set('water_shares_rights', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Other Notes</label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white resize-none"
          />
        </div>
      </section>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={!canConfirm || loading}
        className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        {loading ? 'Saving...' : 'Confirm & Continue'}
      </button>
    </div>
  )
}

interface FieldProps {
  label: string
  name: string
  value: string
  onChange: (name: string, value: string) => void
  uncertain: boolean
  fieldClass: string
  type?: string
}

function Field({ label, name, value, onChange, uncertain, fieldClass, type = 'text' }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {uncertain && (
          <span className="ml-2 text-amber-600 text-xs font-normal">— verify this value</span>
        )}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(name, e.target.value)}
        placeholder={value === '' && label.includes('*') ? 'Not found — enter manually' : ''}
        className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 ${fieldClass}`}
      />
    </div>
  )
}
