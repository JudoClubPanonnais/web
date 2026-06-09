import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/auth-helpers-nextjs'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export function createSupabaseClient() {
  return createClient(url, key)
}

export function createSupabaseBrowserClient() {
  return createBrowserClient(url, key)
}
