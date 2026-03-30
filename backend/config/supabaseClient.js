const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Environment variables
 
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
}

// Public client for auth/queries
 
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Service client for admin/storage (no RLS)
 
const supabaseServiceClient = SUPABASE_SERVICE_KEY 
? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
          autoRefreshToken: false,
          persistSession: false
        }
    })
    : null;
    module.exports = {
        supabaseClient,
        supabaseServiceClient
    };
    /*
    Example .env:
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_ANON_KEY=eyJ...
    SUPABASE_SERVICE_KEY=eyJ...
    */
