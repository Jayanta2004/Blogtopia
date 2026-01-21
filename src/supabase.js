import { createClient } from '@supabase/supabase-js'

// Use environment variables if available, otherwise fall back to hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vobibodfgwwqzbzqzbsw.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYmlib2RmZ3d3cXpienF6YnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwOTI1OTIsImV4cCI6MjA4MjY2ODU5Mn0.MUNjasH9bwQQpG5yPjDAur1Uboe1orguxZ-0JW6ylWk'

export const supabase = createClient(supabaseUrl, supabaseKey)