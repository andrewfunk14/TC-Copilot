'use client'

import { useEffect, useState } from 'react'

interface ConfigRow {
  key: string
  value: string
  editable_by_tc: boolean
}

const KEY_LABELS: Record<string, string> = {
  email_tone_and_style: 'Email Tone & Style',
  email_signature: 'Email Signature',
  tc_custom_instructions: 'Custom Instructions',
  deposit_link: 'Earnest Money Deposit Link',
}

export default function SettingsPage() {
  const [rows, setRows] = useState<ConfigRow[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then((data: ConfigRow[]) => {
        setRows(data)
        setValues(Object.fromEntries(data.map(r => [r.key, r.value])))
      })
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  async function save(key: string) {
    setSaving(s => ({ ...s, [key]: true }))
    setError(null)
    try {
      const res = await fetch('/api/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: values[key] }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Save failed')
        return
      }
      setSaved(s => ({ ...s, [key]: true }))
      setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 3000)
    } catch {
      setError('Save failed — check your connection')
    } finally {
      setSaving(s => ({ ...s, [key]: false }))
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Changes apply to your next email or launch generation.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {rows.map(row => {
          const label = KEY_LABELS[row.key] ?? row.key
          const isCustom = row.key === 'tc_custom_instructions'
          const value = values[row.key] ?? ''

          return (
            <div key={row.key} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-800">{label}</label>
                {isCustom && (
                  <span className={`text-xs ${value.length > 900 ? 'text-red-600' : 'text-gray-400'}`}>
                    {value.length}/1000
                  </span>
                )}
              </div>

              <textarea
                value={value}
                onChange={e => {
                  if (isCustom && e.target.value.length > 1000) return
                  setValues(v => ({ ...v, [row.key]: e.target.value }))
                }}
                rows={isCustom ? 6 : 4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y"
              />

              <div className="flex items-center gap-3">
                <button
                  onClick={() => save(row.key)}
                  disabled={saving[row.key]}
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
                >
                  {saving[row.key] ? 'Saving...' : 'Save'}
                </button>
                {saved[row.key] && (
                  <span className="text-sm text-green-600">
                    Saved — changes apply to your next generation
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
