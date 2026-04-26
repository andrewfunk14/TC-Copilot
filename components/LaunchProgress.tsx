'use client'

interface IntegrationStatus {
  state: 'pending' | 'success' | 'error'
  detail?: string
  error?: string
}

interface LaunchProgressProps {
  monday: IntegrationStatus
  drive: IntegrationStatus
  emails: IntegrationStatus
  onRetryMonday: () => void
  onRetryDrive: () => void
  onRetryEmails: () => void
}

export default function LaunchProgress({
  monday, drive, emails,
  onRetryMonday, onRetryDrive, onRetryEmails,
}: LaunchProgressProps) {
  return (
    <div className="space-y-3">
      <StatusRow label="Monday.com" status={monday} onRetry={onRetryMonday} />
      <StatusRow label="Google Drive" status={drive} onRetry={onRetryDrive} />
      <StatusRow label="Email Drafts" status={emails} onRetry={onRetryEmails} />
    </div>
  )
}

function StatusRow({
  label,
  status,
  onRetry,
}: {
  label: string
  status: IntegrationStatus
  onRetry: () => void
}) {
  return (
    <div className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl">
      <div className="flex-shrink-0 mt-0.5">
        {status.state === 'pending' && (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
        {status.state === 'success' && (
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {status.state === 'error' && (
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {status.state === 'success' && status.detail && (
          <p className="text-xs text-gray-500 mt-0.5">{status.detail}</p>
        )}
        {status.state === 'error' && status.error && (
          <p className="text-xs text-red-600 mt-0.5">{status.error}</p>
        )}
      </div>

      {status.state === 'error' && (
        <button
          onClick={onRetry}
          className="flex-shrink-0 text-xs font-medium text-blue-600 hover:text-blue-800 underline"
        >
          Retry
        </button>
      )}
    </div>
  )
}
