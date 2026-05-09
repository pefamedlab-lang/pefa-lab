import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://tzyfqjguzcnniffgdbhs.supabase.co";

const supabaseAnonKey =
  "sb_publishable__1tLQ4OKyGaG9I1UPtJ66w_9IDn-ocL";

export const supabase =
  createClient(
    supabaseUrl,
    supabaseAnonKey
  );