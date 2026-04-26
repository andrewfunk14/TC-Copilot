'use client'

import { useState } from 'react'
import type { EmailDraft } from '@/lib/schemas'

interface EmailCardsProps {
  drafts: EmailDraft[]
  onRegenerate?: (type: string) => void
}

export default function EmailCards({ drafts, onRegenerate }: EmailCardsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {drafts.map(draft => (
        <EmailCard key={draft.type} draft={draft} onRegenerate={onRegenerate} />
      ))}
    </div>
  )
}

function EmailCard({
  draft,
  onRegenerate,
}: {
  draft: EmailDraft
  onRegenerate?: (type: string) => void
}) {
  const [subjectCopied, setSubjectCopied] = useState(false)
  const [bodyCopied, setBodyCopied] = useState(false)
  const [body, setBody] = useState(draft.body)

  const labelMap: Record<string, string> = {
    title_lender_buyer: 'Title & Lender',
    sellers_agent_buyer: "Seller's Agent",
    client_buyer: 'Client',
  }

  async function copySubject() {
    await navigator.clipboard.writeText(draft.subject)
    setSubjectCopied(true)
    setTimeout(() => setSubjectCopied(false), 2000)
  }

  async function copyBody() {
    await navigator.clipboard.writeText(body)
    setBodyCopied(true)
    setTimeout(() => setBodyCopied(false), 2000)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">
          {labelMap[draft.type] ?? draft.type}
        </span>
        {onRegenerate && (
          <button
            onClick={() => onRegenerate(draft.type)}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Regenerate
          </button>
        )}
      </div>

      {/* Subject */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
        <div className="flex items-center gap-2">
          <p className="flex-1 text-sm text-gray-800 bg-gray-50 rounded px-2 py-1.5 truncate">
            {draft.subject}
          </p>
          <button
            onClick={copySubject}
            className={`flex-shrink-0 text-xs px-2 py-1 rounded font-medium transition-colors ${
              subjectCopied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {subjectCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-500 mb-1">Body</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={12}
          className="w-full text-xs text-gray-800 border border-gray-200 rounded-lg px-2 py-1.5 resize-none font-mono"
        />
        <button
          onClick={copyBody}
          className={`mt-1.5 w-full text-xs py-1.5 rounded font-medium transition-colors ${
            bodyCopied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {bodyCopied ? 'Copied!' : 'Copy Body'}
        </button>
      </div>

      {/* Attachment reminder */}
      <div className="text-xs text-gray-500 border-t border-gray-100 pt-2">
        <p className="font-medium mb-1">Attach before sending:</p>
        <ul className="list-disc list-inside space-y-0.5">
          {draft.type === 'title_lender_buyer' && (
            <>
              <li>Buyer&apos;s info sheet PDF</li>
              <li>Fully executed purchase agreement</li>
              <li>Earnest money receipt</li>
            </>
          )}
          {draft.type === 'sellers_agent_buyer' && (
            <>
              <li>Fully executed purchase agreement</li>
              <li>Earnest money deposit confirmation</li>
            </>
          )}
          {draft.type === 'client_buyer' && (
            <>
              <li>Buyer&apos;s timeline / next steps checklist</li>
              <li>Earnest money instructions</li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}
