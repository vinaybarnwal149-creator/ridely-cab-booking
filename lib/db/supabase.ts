import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "https://xuitnmglqsrxitnwqpyh.supabase.co";
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Public client for client components and frontend queries
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Admin client for secure backend operations (bypasses RLS)
 * ONLY used in server routes and backend services
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

