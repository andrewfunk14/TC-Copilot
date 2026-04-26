import { z } from 'zod'
import { getConfig, getTransaction } from '@/lib/supabase'
import { createDriveFolders } from '@/lib/drive'

const DriveInput = z.object({
  transactionId: z.string().uuid(),
  agentFolderIdOverride: z.string().optional(),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = DriveInput.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'transactionId (UUID) is required' }, { status: 422 })
  }

  const [config, transaction] = await Promise.all([
    getConfig(['drive_buyer_config']),
    getTransaction(parsed.data.transactionId),
  ])

  try {
    const result = await createDriveFolders(
      transaction,
      JSON.parse(config.drive_buyer_config || '{}'),
      undefined,
      parsed.data.agentFolderIdOverride
    )
    return Response.json(result)
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Drive operation failed'
    return Response.json({ success: false, error }, { status: 500 })
  }
}
