import { TransactionInsert } from '@/lib/schemas'
import { supabaseAdmin } from '@/lib/supabase'

function deriveShortAddress(fullAddress: string | null): string | null {
  if (!fullAddress) return null
  // Extract "1234 Maple St" from "1234 Maple St, Salt Lake City, UT 84101"
  const match = fullAddress.match(/^(\d+\s+[^,]+)/)
  return match ? match[1].trim() : fullAddress
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = TransactionInsert.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  const data = parsed.data
  const short_address = data.short_address ?? deriveShortAddress(data.property_address)

  const { data: row, error } = await supabaseAdmin
    .from('transactions')
    .insert({ ...data, short_address })
    .select('id')
    .single()

  if (error) {
    return Response.json({ error: `Failed to save transaction: ${error.message}` }, { status: 500 })
  }

  return Response.json({ id: row.id }, { status: 201 })
}
