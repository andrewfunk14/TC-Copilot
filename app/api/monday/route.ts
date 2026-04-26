import { z } from 'zod'
import { getConfig, getTransaction } from '@/lib/supabase'
import { createMondayRows } from '@/lib/monday'

const MondayInput = z.object({
  transactionId: z.string().uuid(),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = MondayInput.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'transactionId (UUID) is required' }, { status: 422 })
  }

  const [config, transaction] = await Promise.all([
    getConfig(['monday_buyer_config', 'tc_monday_user_id']),
    getTransaction(parsed.data.transactionId),
  ])

  try {
    const result = await createMondayRows(
      transaction,
      JSON.parse(config.monday_buyer_config || '{}'),
      config.tc_monday_user_id
    )
    return Response.json({ success: true, ...result })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Monday.com failed'
    return Response.json({ success: false, error }, { status: 500 })
  }
}
