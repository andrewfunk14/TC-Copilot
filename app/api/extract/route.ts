import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { TransactionExtraction } from '@/lib/schemas'
import { getConfig } from '@/lib/supabase'
import { buildExtractionUserPrompt } from '@/lib/prompts/extract'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('pdf') as File | null

  if (!file || file.type !== 'application/pdf') {
    return Response.json({ error: 'Please upload a PDF file' }, { status: 400 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: 'File too large — max 10MB' }, { status: 400 })
  }

  const config = await getConfig(['chr_agent_names'])
  const chrAgentNames: string[] = JSON.parse(config.chr_agent_names || '[]')
  const userPrompt = buildExtractionUserPrompt(chrAgentNames)
  const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')

  const fileContent = { type: 'file' as const, data: base64, mediaType: 'application/pdf' as const }

  try {
    const { object } = await generateObject({
      model: anthropic('claude-sonnet-4-6'),
      schema: TransactionExtraction,
      messages: [{
        role: 'user' as const,
        content: [fileContent, { type: 'text' as const, text: userPrompt }],
      }],
    })
    return Response.json(object)
  } catch {
    // Retry once with stricter instruction
    try {
      const retryArgs = {
        model: anthropic('claude-sonnet-4-6'),
        schema: TransactionExtraction,
        messages: [{
          role: 'user' as const,
          content: [
            fileContent,
            {
              type: 'text' as const,
              text: `${userPrompt}\n\nIMPORTANT: Return null for any field you cannot read clearly. Do not guess. Every field must match the schema exactly.`,
            },
          ],
        }],
      }
      const { object } = await generateObject(retryArgs)
      return Response.json(object)
    } catch (retryErr) {
      const message = retryErr instanceof Error ? retryErr.message : 'Unknown error'
      if (message.includes('overloaded') || message.includes('unavailable')) {
        return Response.json(
          { error: 'AI service temporarily unavailable — try again in 30 seconds. Your file is saved.' },
          { status: 503 }
        )
      }
      return Response.json(
        { error: 'Could not read this PDF — please check the file or enter details manually.' },
        { status: 422 }
      )
    }
  }
}
