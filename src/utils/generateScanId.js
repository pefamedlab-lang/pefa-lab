import { supabase } from "../supabase";

export async function generateScanId() {
  const year = new Date().getFullYear().toString().slice(-2);

  // Count all scans created this year
  const startOfYear = `20${year}-01-01T00:00:00`;
  const endOfYear = `20${year}-12-31T23:59:59`;

  const { count, error } = await supabase
    .from("ultrasound_results")
    .select("*", {
      count: "exact",
      head: true,
    })
    .gte("created_at", startOfYear)
    .lte("created_at", endOfYear);

  if (error) throw error;

  const serial = String((count || 0) + 1).padStart(3, "0");

  return `USS/${year}/${serial}`;
}