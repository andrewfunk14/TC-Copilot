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
    team: extraction.team_detection.team ?? '',
    kw_side: extraction.kw_side ?? 'buyer',
    transaction_type: extraction.transaction_type ?? 'residential',
    client_name: extraction.client_name ?? '',
    client_email: extraction.client_email ?? '',
    property_address: extraction.property_address ?? '',
    agent_name: extraction.agent_name ?? '',
    agent_email: extraction.agent_email ?? '',
    agent_office_address: extraction.agent_office_address ?? '',
    tc_name: extraction.tc_name ?? '',
    contract_date: extraction.contract_date ?? '',
    close_date: extraction.close_date ?? '',
    purchase_price: extraction.purchase_price?.toString() ?? '',
    mls_number: extraction.mls_number ?? '',
    lender_name: extraction.lender_name ?? '',
    lender_email: extraction.lender_email ?? '',
    title_company: extraction.title_company ?? '',
    title_officer_name: extraction.title_officer_name ?? '',
    title_officer_email: extraction.title_officer_email ?? '',
    sellers_agent_name: extraction.sellers_agent_name ?? '',
    sellers_agent_email: extraction.sellers_agent_email ?? '',
    notes: extraction.notes_content ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uncertainFields = new Set(extraction.uncertain_fields)

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  const allRequiredFilled = REQUIRED_FIELDS.every(f => form[f as keyof typeof form])
  const teamSelected = !!form.team
  const canConfirm = allRequiredFilled && teamSelected

  async function handleConfirm() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
          short_address: null,
        }),
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
    const isEmpty = !value && REQUIRED_FIELDS.includes(name)
    if (isEmpty) return 'border-red-400 bg-white'
    if (isUncertain) return 'border-amber-400 bg-amber-50'
    return 'border-gray-300 bg-white'
  }

  const confidence = extraction.team_detection.confidence
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
            className={`w-full border rounded-lg px-3 py-2 text-sm ${!form.team ? 'border-red-400' : 'border-gray-300'}`}
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

      {/* Client */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Client</h2>
        <Field label="Client Name *" name="client_name" value={form.client_name} onChange={set} uncertain={uncertainFields.has('client_name')} fieldClass={fieldClass('client_name', form.client_name)} />
        <Field label="Client Email" name="client_email" value={form.client_email} onChange={set} uncertain={uncertainFields.has('client_email')} fieldClass={fieldClass('client_email', form.client_email)} />
      </section>

      {/* Property */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Property</h2>
        <Field label="Property Address *" name="property_address" value={form.property_address} onChange={set} uncertain={uncertainFields.has('property_address')} fieldClass={fieldClass('property_address', form.property_address)} />
        <Field label="MLS #" name="mls_number" value={form.mls_number} onChange={set} uncertain={uncertainFields.has('mls_number')} fieldClass={fieldClass('mls_number', form.mls_number)} />
        <Field label="Purchase Price *" name="purchase_price" value={form.purchase_price} onChange={set} uncertain={uncertainFields.has('purchase_price')} fieldClass={fieldClass('purchase_price', form.purchase_price)} type="number" />
        <Field label="Contract Date" name="contract_date" value={form.contract_date} onChange={set} uncertain={uncertainFields.has('contract_date')} fieldClass={fieldClass('contract_date', form.contract_date)} type="date" />
        <Field label="Close Date *" name="close_date" value={form.close_date} onChange={set} uncertain={uncertainFields.has('close_date')} fieldClass={fieldClass('close_date', form.close_date)} type="date" />
      </section>

      {/* Agent */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Agent</h2>
        <Field label="Agent Name *" name="agent_name" value={form.agent_name} onChange={set} uncertain={uncertainFields.has('agent_name')} fieldClass={fieldClass('agent_name', form.agent_name)} />
        <Field label="Agent Email" name="agent_email" value={form.agent_email} onChange={set} uncertain={uncertainFields.has('agent_email')} fieldClass={fieldClass('agent_email', form.agent_email)} />
        <Field label="Agent Office Address" name="agent_office_address" value={form.agent_office_address} onChange={set} uncertain={uncertainFields.has('agent_office_address')} fieldClass={fieldClass('agent_office_address', form.agent_office_address)} />
        <Field label="TC Name" name="tc_name" value={form.tc_name} onChange={set} uncertain={uncertainFields.has('tc_name')} fieldClass={fieldClass('tc_name', form.tc_name)} />
      </section>

      {/* Lender */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Lender</h2>
        <Field label="Lender Name" name="lender_name" value={form.lender_name} onChange={set} uncertain={uncertainFields.has('lender_name')} fieldClass={fieldClass('lender_name', form.lender_name)} />
        <Field label="Lender Email" name="lender_email" value={form.lender_email} onChange={set} uncertain={uncertainFields.has('lender_email')} fieldClass={fieldClass('lender_email', form.lender_email)} />
      </section>

      {/* Title */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Title</h2>
        <Field label="Title Company" name="title_company" value={form.title_company} onChange={set} uncertain={uncertainFields.has('title_company')} fieldClass={fieldClass('title_company', form.title_company)} />
        <Field label="Title Officer Name" name="title_officer_name" value={form.title_officer_name} onChange={set} uncertain={uncertainFields.has('title_officer_name')} fieldClass={fieldClass('title_officer_name', form.title_officer_name)} />
        <Field label="Title Officer Email" name="title_officer_email" value={form.title_officer_email} onChange={set} uncertain={uncertainFields.has('title_officer_email')} fieldClass={fieldClass('title_officer_email', form.title_officer_email)} />
      </section>

      {/* Seller's Agent */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Seller&apos;s Agent</h2>
        <Field label="Seller's Agent Name" name="sellers_agent_name" value={form.sellers_agent_name} onChange={set} uncertain={uncertainFields.has('sellers_agent_name')} fieldClass={fieldClass('sellers_agent_name', form.sellers_agent_name)} />
        <Field label="Seller's Agent Email" name="sellers_agent_email" value={form.sellers_agent_email} onChange={set} uncertain={uncertainFields.has('sellers_agent_email')} fieldClass={fieldClass('sellers_agent_email', form.sellers_agent_email)} />
      </section>

      {/* Notes */}
      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-800 mb-3">Notes</h2>
        <textarea
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
        />
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
        className={`w-full border rounded-lg px-3 py-2 text-sm ${fieldClass}`}
      />
    </div>
  )
}
