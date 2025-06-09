import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test Supabase connection
supabase.from('profiles').select('count', { count: 'exact', head: true })
  .then(({ error }) => {
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
    } else {
      console.log('✅ Supabase connection successful')
    }
  })

// Database types
export interface SavedContent {
  id: string
  user_id: string
  type: 'dm' | 'reply' | 'thread'
  title: string
  content: string
  metadata?: any
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  default_tone: string
  writing_style_handles: string[]
  auto_save: boolean
  tweet_length_limit: number
  x_handle?: string
  created_at: string
  updated_at: string
} 