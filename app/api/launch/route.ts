import { z } from 'zod'
import { getConfig, getTransaction, supabaseAdmin } from '@/lib/supabase'
import { createMondayRows } from '@/lib/monday'
import { createDriveFolders } from '@/lib/drive'
import { generateEmails } from '@/app/api/emails/route'

const LaunchInput = z.object({
  transactionId: z.string().uuid(),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = LaunchInput.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'transactionId (UUID) is required' }, { status: 422 })
  }

  const { transactionId } = parsed.data

  const [config, transaction] = await Promise.all([
    getConfig([
      'monday_buyer_config',
      'drive_buyer_config',
      'office_context',
      'email_tone_and_style',
      'email_signature',
      'tc_custom_instructions',
      'deposit_link',
      'email_template_title_lender_buyer',
      'email_template_sellers_agent_buyer',
      'email_template_client_buyer_residential',
      'email_template_client_buyer_land',
      'tc_monday_user_id',
    ]),
    getTransaction(transactionId),
  ])

  const mondayConfig = JSON.parse(config.monday_buyer_config || '{}')
  const driveConfig = JSON.parse(config.drive_buyer_config || '{}')

  const [mondayResult, driveResult, emailsResult] = await Promise.allSettled([
    createMondayRows(transaction, mondayConfig, config.tc_monday_user_id),
    createDriveFolders(transaction, driveConfig),
    generateEmails(transaction, config),
  ])

  const monday = mondayResult.status === 'fulfilled'
    ? { success: true, ...mondayResult.value }
    : { success: false, error: mondayResult.reason?.message ?? 'Monday.com failed' }

  const drive = driveResult.status === 'fulfilled'
    ? driveResult.value
    : { success: false, error: driveResult.reason?.message ?? 'Drive failed' }

  const emails = emailsResult.status === 'fulfilled'
    ? emailsResult.value
    : { success: false, error: emailsResult.reason?.message ?? 'Email generation failed' }

  // Persist any successful integration IDs back to the transaction
  const updates: Record<string, string> = {}
  if (monday.success && 'checklist_item_id' in monday) updates.monday_checklist_id = monday.checklist_item_id!
  if (monday.success && 'clients_item_id' in monday) updates.monday_clients_id = monday.clients_item_id!
  if (drive.success && 'drive_folder_id' in drive) updates.drive_folder_id = drive.drive_folder_id!
  if (drive.success && 'drive_folder_url' in drive) updates.drive_folder_url = drive.drive_folder_url!

  if (Object.keys(updates).length > 0) {
    await supabaseAdmin.from('transactions').update(updates).eq('id', transactionId)
  }

  return Response.json({ monday, drive, emails })
}
