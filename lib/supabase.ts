import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side client (uses anon key + RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side admin client (bypasses RLS — server routes only)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function getConfig(keys: string[]): Promise<Record<string, string>> {
  const { data, error } = await supabaseAdmin
    .from('config')
    .select('key, value')
    .in('key', keys)

  if (error) throw new Error(`Failed to fetch config: ${error.message}`)

  return Object.fromEntries((data ?? []).map(row => [row.key, row.value]))
}

export async function getTransaction(id: string) {
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(`Transaction not found: ${error.message}`)
  return data
}
