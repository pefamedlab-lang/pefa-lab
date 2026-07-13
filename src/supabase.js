import {
  createClient,
} from "@supabase/supabase-js";

const supabaseUrl =
 "https://tzyfqjguzcnniffgdbhs.supabase.co";

const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6eWZxamd1emNubmlmZmdkYmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzI2NjcsImV4cCI6MjA5Mzg0ODY2N30.tND5-BTiIScU9IgL5YM7m_bWQU-X0oqkfXxPsp7ypZs";

export const supabase =
  createClient(
    supabaseUrl,
    supabaseAnonKey
  );