import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ucjdeguexkpodgrfqnna.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjamRlZ3VleGtwb2RncmZxbm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTMwMDgsImV4cCI6MjA3NjQ2OTAwOH0.O2QOsgImeXD86Cjzg4UL5O3SsCVRDmw-2jNXCSXXtss';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);