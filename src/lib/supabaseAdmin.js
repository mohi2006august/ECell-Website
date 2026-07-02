// Server-only. Never import this from a <script> tag or any client-side code —
// it holds the Supabase service role key, which bypasses RLS entirely.
// Only import this from files under src/pages/api/.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
