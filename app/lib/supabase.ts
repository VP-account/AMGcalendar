import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.DATABASE_URL!;
const supabaseAnonKey = process.env.NEXTAUTH_SECRET!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
