import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { assembleSystemPrompt } from '@/lib/prompt-assembly'
import { buildEmailUserPrompt, type EmailType } from '@/lib/prompts/emails'
import { getConfig, getTransaction } from '@/lib/supabase'
import type { Transaction, EmailDraft } from '@/lib/schemas'

const EmailsInput = z.object({
  transactionId: z.string().uuid(),
})

async function generateSingleEmail(
  type: EmailType,
  transaction: Transaction,
  template: string,
  systemPrompt: string
): Promise<EmailDraft> {
  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-6'),
    system: systemPrompt,
    prompt: buildEmailUserPrompt(type, transaction, template),
  })

  // Parse the JSON response from Claude
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error(`Could not parse email response for ${type}`)
  const parsed = JSON.parse(match[0]) as EmailDraft
  return { type: parsed.type ?? type, subject: parsed.subject, body: parsed.body }
}

export async function generateEmails(
  transaction: Transaction,
  config: Record<string, string>
): Promise<{ success: boolean; drafts?: EmailDraft[]; error?: string }> {
  const systemPrompt = assembleSystemPrompt(
    ['office_context', 'email_tone_and_style', 'email_signature', 'tc_custom_instructions'],
    config
  )

  const clientTemplate = transaction.transaction_type === 'land'
    ? config.email_template_client_buyer_land
    : config.email_template_client_buyer_residential

  const emailJobs: [EmailType, string][] = [
    ['title_lender_buyer', config.email_template_title_lender_buyer],
    ['sellers_agent_buyer', config.email_template_sellers_agent_buyer],
    ['client_buyer', clientTemplate],
  ]

  const results = await Promise.allSettled(
    emailJobs.map(([type, template]) =>
      generateSingleEmail(type, transaction, template, systemPrompt)
    )
  )

  const drafts: EmailDraft[] = []
  const errors: string[] = []

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      drafts.push(result.value)
    } else {
      errors.push(`${emailJobs[i][0]}: ${result.reason?.message ?? 'Failed'}`)
    }
  })

  if (drafts.length === 0) {
    return { success: false, error: errors.join('; ') }
  }

  return { success: true, drafts }
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = EmailsInput.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'transactionId (UUID) is required' }, { status: 422 })
  }

  const [config, transaction] = await Promise.all([
    getConfig([
      'office_context',
      'email_tone_and_style',
      'email_signature',
      'tc_custom_instructions',
      'email_template_title_lender_buyer',
      'email_template_sellers_agent_buyer',
      'email_template_client_buyer_residential',
      'email_template_client_buyer_land',
    ]),
    getTransaction(parsed.data.transactionId),
  ])

  const result = await generateEmails(transaction, config)

  if (!result.success) {
    return Response.json(result, { status: 500 })
  }

  return Response.json(result)
}
