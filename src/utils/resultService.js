import { supabase } from "../supabase";

/* =====================================================
   GET ALL RESULTS
===================================================== */

export async function getResults() {
  return await supabase
    .from("patient_results")
    .select("*")
    .order("reported_at", {
      ascending: false,
    });
}

/* =====================================================
   AUTHORIZE RESULT
===================================================== */

export async function authorizeResult(id, user) {
  return await supabase
    .from("patient_results")
    .update({
      authorization_status: "Authorized",
      authorized_by:
        user?.full_name ||
        user?.name ||
        "Unknown",
      authorized_at: new Date().toISOString(),
    })
    .eq("id", id);
}

/* =====================================================
   RELEASE RESULT
===================================================== */

export async function releaseResult(id, user) {
  return await supabase
    .from("patient_results")
    .update({
      release_status: "Released",
      released_by:
        user?.full_name ||
        user?.name ||
        "Unknown",
      released_at: new Date().toISOString(),
    })
    .eq("id", id);
}

/* =====================================================
   UPDATE PRINT COUNT
===================================================== */

export async function updatePrintCount(
  row,
  user
) {
  return await supabase
    .from("patient_results")
    .update({
      print_count:
        (row.print_count || 0) + 1,

      last_printed_at:
        new Date().toISOString(),

      last_printed_by:
        user?.full_name ||
        user?.name ||
        "Unknown",
    })
    .eq("id", row.id);
}

/* =====================================================
   UPDATE DOWNLOAD COUNT
===================================================== */

export async function updateDownloadCount(
  row,
  user
) {
  return await supabase
    .from("patient_results")
    .update({
      download_count:
        (row.download_count || 0) + 1,

      last_downloaded_at:
        new Date().toISOString(),

      last_downloaded_by:
        user?.full_name ||
        user?.name ||
        "Unknown",
    })
    .eq("id", row.id);
}