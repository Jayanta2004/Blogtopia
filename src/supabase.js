import { createClient } from '@supabase/supabase-js'

// Use environment variables if available, otherwise fall back to hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jghyjzmlkeaqvhrjzkrk.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnaHlqem1sa2VhcXZocmp6a3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NDgyNjcsImV4cCI6MjA5OTAyNDI2N30.OK3y9AawRbITqPD_jn7KEVFD7iDhw6r1dbEYbHMCVW8'

export const supabase = createClient(supabaseUrl, supabaseKey)