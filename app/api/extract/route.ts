import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { TransactionExtraction } from '@/lib/schemas'
import { getConfig } from '@/lib/supabase'
import { buildExtractionUserPrompt } from '@/lib/prompts/extract'

async function callClaude(fileContent: { type: 'file'; data: string; mediaType: 'application/pdf' }, prompt: string) {
  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5-20251001'),
    messages: [{
      role: 'user',
      content: [
        fileContent,
        { type: 'text', text: prompt },
      ],
    }],
  })
  // Strip markdown fences if present, then parse
  const json = text.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1]?.trim() ?? text.trim()
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (e) {
    throw new Error(`JSON parse failed. Raw response: ${text.slice(0, 500)}`)
  }
  return TransactionExtraction.parse(parsed)
}

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
    const object = await callClaude(fileContent, userPrompt)
    return Response.json(object)
  } catch (firstErr) {
    console.error('[extract] first attempt failed:', firstErr instanceof Error ? firstErr.message : firstErr)
    try {
      const object = await callClaude(
        fileContent,
        `${userPrompt}\n\nIMPORTANT: Return null for any field you cannot read clearly. Do not guess. Return valid JSON only — no markdown, no explanation.`,
      )
      return Response.json(object)
    } catch (retryErr) {
      const message = retryErr instanceof Error ? retryErr.message : 'Unknown error'
      console.error('[extract] retry failed:', message)
      if (message.includes('overloaded') || message.includes('unavailable')) {
        return Response.json(
          { error: 'AI service temporarily unavailable — try again in 30 seconds.' },
          { status: 503 }
        )
      }
      return Response.json(
        { error: message },
        { status: 422 }
      )
    }
  }
}
