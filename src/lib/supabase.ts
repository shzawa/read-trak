import { createClient } from '@supabase/supabase-js'
import invariant from 'tiny-invariant'

const supabaseApiUrl = import.meta.env.VITE_SUPABASE_API_URL
const supabaseApiKey = import.meta.env.VITE_SUPABASE_API_KEY

invariant(supabaseApiUrl, 'SUPABASE_API_URL is required')
invariant(supabaseApiKey, 'SUPABASE_API_KEY is required')

export const supabase = createClient(supabaseApiUrl, supabaseApiKey)
