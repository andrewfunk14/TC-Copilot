import { ConfigPatchInput } from '@/lib/schemas'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('config')
    .select('key, value, editable_by_tc')
    .eq('editable_by_tc', true)
    .order('key')

  if (error) {
    return Response.json({ error: `Failed to fetch config: ${error.message}` }, { status: 500 })
  }

  return Response.json(data)
}

export async function PATCH(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = ConfigPatchInput.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  const { key, value } = parsed.data

  // Verify this key is TC-editable before updating
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('config')
    .select('editable_by_tc')
    .eq('key', key)
    .single()

  if (fetchError || !existing) {
    return Response.json({ error: `Config key not found: ${key}` }, { status: 404 })
  }

  if (!existing.editable_by_tc) {
    return Response.json({ error: `Config key is not editable: ${key}` }, { status: 403 })
  }

  const { error: updateError } = await supabaseAdmin
    .from('config')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key)

  if (updateError) {
    return Response.json({ error: `Failed to update config: ${updateError.message}` }, { status: 500 })
  }

  return Response.json({ success: true })
}
