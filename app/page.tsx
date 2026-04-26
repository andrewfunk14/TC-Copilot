import UploadZone from '@/components/UploadZone'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">TC Copilot</h1>
          <p className="mt-1 text-sm text-gray-500">Upload a buyer info sheet to get started</p>
        </div>
        <UploadZone />
      </div>
    </main>
  )
}
