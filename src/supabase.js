import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mvkcgrextvxlzkqsyscm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12a2NncmV4dHZ4bHprcXN5c2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjIwNDcsImV4cCI6MjA4ODc5ODA0N30.dvVbB0E5F-vhZMYlzIl4r-N1jOrRgrNZsp4xbDI_Nho'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    detectSessionInUrl: true,
    flowType: 'pkce',
    persistSession: true,
  }
})
