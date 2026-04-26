'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import LaunchProgress from '@/components/LaunchProgress'
import EmailCards from '@/components/EmailCards'
import type { EmailDraft } from '@/lib/schemas'

interface IntegrationStatus {
  state: 'pending' | 'success' | 'error'
  detail?: string
  error?: string
}

interface LaunchState {
  monday: IntegrationStatus
  drive: IntegrationStatus
  emails: IntegrationStatus
  drafts: EmailDraft[]
}

export default function LaunchPage() {
  const { id } = useParams<{ id: string }>()
  const [state, setState] = useState<LaunchState>({
    monday: { state: 'pending' },
    drive: { state: 'pending' },
    emails: { state: 'pending' },
    drafts: [],
  })

  const runLaunch = useCallback(async () => {
    setState({
      monday: { state: 'pending' },
      drive: { state: 'pending' },
      emails: { state: 'pending' },
      drafts: [],
    })

    try {
      const res = await fetch('/api/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: id }),
      })
      const data = await res.json()

      setState({
        monday: data.monday.success
          ? { state: 'success', detail: `Checklist #${data.monday.checklist_item_id} · Clients #${data.monday.clients_item_id}` }
          : { state: 'error', error: data.monday.error ?? 'Monday.com — Failed.' },
        drive: data.drive.success
          ? { state: 'success', detail: data.drive.drive_folder_url ? 'Folder created' : 'Folder ready' }
          : { state: 'error', error: data.drive.error ?? 'Drive operation failed.' },
        emails: data.emails.success
          ? { state: 'success', detail: `${data.emails.drafts?.length ?? 0} drafts ready` }
          : { state: 'error', error: data.emails.error ?? 'Email generation failed.' },
        drafts: data.emails.drafts ?? [],
      })
    } catch {
      setState(s => ({
        ...s,
        monday: { state: 'error', error: 'Could not reach server. Check your connection.' },
        drive: { state: 'error', error: 'Could not reach server. Check your connection.' },
        emails: { state: 'error', error: 'Could not reach server. Check your connection.' },
      }))
    }
  }, [id])

  const retryMonday = useCallback(async () => {
    setState(s => ({ ...s, monday: { state: 'pending' } }))
    try {
      const res = await fetch('/api/monday', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: id }),
      })
      const data = await res.json()
      setState(s => ({
        ...s,
        monday: data.success
          ? { state: 'success', detail: `Checklist #${data.checklist_item_id} · Clients #${data.clients_item_id}` }
          : { state: 'error', error: data.error },
      }))
    } catch {
      setState(s => ({ ...s, monday: { state: 'error', error: 'Request failed.' } }))
    }
  }, [id])

  const retryDrive = useCallback(async () => {
    setState(s => ({ ...s, drive: { state: 'pending' } }))
    try {
      const res = await fetch('/api/drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: id }),
      })
      const data = await res.json()
      setState(s => ({
        ...s,
        drive: data.success
          ? { state: 'success', detail: 'Folder created' }
          : { state: 'error', error: data.error },
      }))
    } catch {
      setState(s => ({ ...s, drive: { state: 'error', error: 'Request failed.' } }))
    }
  }, [id])

  const retryEmails = useCallback(async () => {
    setState(s => ({ ...s, emails: { state: 'pending' } }))
    try {
      const res = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: id }),
      })
      const data = await res.json()
      setState(s => ({
        ...s,
        emails: data.success
          ? { state: 'success', detail: `${data.drafts?.length ?? 0} drafts ready` }
          : { state: 'error', error: data.error },
        drafts: data.drafts ?? s.drafts,
      }))
    } catch {
      setState(s => ({ ...s, emails: { state: 'error', error: 'Request failed.' } }))
    }
  }, [id])

  const regenerateEmail = useCallback(async (type: string) => {
    // Individual email regeneration — call emails route and replace just that draft
    try {
      const res = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: id }),
      })
      const data = await res.json()
      if (data.success && data.drafts) {
        const newDraft = data.drafts.find((d: EmailDraft) => d.type === type)
        if (newDraft) {
          setState(s => ({
            ...s,
            drafts: s.drafts.map(d => d.type === type ? newDraft : d),
          }))
        }
      }
    } catch {
      // Silently fail — drafts still visible
    }
  }, [id])

  useEffect(() => {
    runLaunch()
  }, [runLaunch])

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Launching Transaction</h1>
          <p className="mt-1 text-sm text-gray-500">Setting up Monday.com, Drive, and email drafts...</p>
        </div>

        <LaunchProgress
          monday={state.monday}
          drive={state.drive}
          emails={state.emails}
          onRetryMonday={retryMonday}
          onRetryDrive={retryDrive}
          onRetryEmails={retryEmails}
        />

        {state.drafts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Email Drafts</h2>
            <EmailCards drafts={state.drafts} onRegenerate={regenerateEmail} />
          </div>
        )}
      </div>
    </main>
  )
}
