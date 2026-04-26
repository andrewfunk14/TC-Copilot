'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import VerifyForm from '@/components/VerifyForm'
import type { TransactionExtraction } from '@/lib/schemas'

export default function VerifyPage() {
  const router = useRouter()
  const [extraction, setExtraction] = useState<TransactionExtraction | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('extraction')
    if (!raw) {
      router.replace('/')
      return
    }
    try {
      setExtraction(JSON.parse(raw))
    } catch {
      router.replace('/')
    }
  }, [router])

  if (!extraction) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-xl font-bold text-gray-900">Verify Transaction Details</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and correct any extracted fields before continuing.
          <span className="ml-2 text-amber-600">Amber fields need verification.</span>
          <span className="ml-2 text-red-600">Red fields are required.</span>
        </p>
      </div>
      <VerifyForm extraction={extraction} />
    </main>
  )
}
