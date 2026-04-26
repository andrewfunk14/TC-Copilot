'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadZone() {
  const router = useRouter()
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null)

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large — max 10MB')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('pdf', file)

      const extractRes = await fetch('/api/extract', { method: 'POST', body: formData })
      const extracted = await extractRes.json()

      if (!extractRes.ok) {
        setError(extracted.error ?? 'Extraction failed')
        return
      }

      // Store extracted data in sessionStorage for the verify screen
      sessionStorage.setItem('extraction', JSON.stringify(extracted))
      sessionStorage.setItem('pdfName', file.name)

      router.push('/verify')
    } catch {
      setError('AI service temporarily unavailable — try again in 30 seconds. Your file is saved.')
    } finally {
      setLoading(false)
    }
  }, [router])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div className="w-full max-w-lg mx-auto">
      <label
        htmlFor="pdf-upload"
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={[
          'flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors',
          dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100',
          loading ? 'pointer-events-none opacity-60' : '',
        ].join(' ')}
      >
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onFileChange}
          disabled={loading}
        />
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600">Extracting transaction data...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center px-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium text-gray-700">Drop buyer info sheet PDF here</p>
            <p className="text-xs text-gray-400">or click to browse — max 10MB</p>
          </div>
        )}
      </label>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
