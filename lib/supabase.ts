import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export type DbSong = {
  id: string;
  user_id: string;
  title: string;
  artist: string;
  key: string;
  mode: string;
  capo: number;
  tempo: number;
  time_signature: string;
  tuning: string;
  sections: any[];
  is_shared: boolean;
  created_at: string;
  updated_at: string;
};
