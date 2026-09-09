import { supabase } from "../supabase";

/* ==========================================================
   RESULT RECORDS SERVICE
   NEW RESULT DASHBOARD
========================================================== */

/**
 * Load all saved laboratory results.
 *
 * This service intentionally does NOT use:
 *
 * - groupResultRecords
 * - testService
 * - PrintRouter
 * - ResultRecords
 * - old dashboard helpers
 *
 * It retrieves the raw saved result records and leaves
 * normalization to the new result normalizer.
 */
export async function getResultRecords() {
  try {
    const {
      data,
      error,
    } = await supabase
      .from("patient_results")
      .select("*")
      .order(
        "reported_at",
        {
          ascending: false,
        }
      );

    if (error) {
      console.error(
        "[New Result Records] Load error:",
        error
      );

      return {
        data: [],
        error,
      };
    }

    return {
      data: Array.isArray(data)
        ? data
        : [],
      error: null,
    };

  } catch (error) {
    console.error(
      "[New Result Records] Unexpected error:",
      error
    );

    return {
      data: [],
      error,
    };
  }
}


/**
 * Load results for one laboratory number.
 */
export async function getResultRecordsByLabNumber(
  labNumber
) {
  const value =
    String(
      labNumber ?? ""
    ).trim();

  if (!value) {
    return {
      data: [],
      error: null,
    };
  }

  try {
    const {
      data,
      error,
    } = await supabase
      .from("patient_results")
      .select("*")
      .eq(
        "lab_number",
        value
      )
      .order(
        "reported_at",
        {
          ascending: false,
        }
      );

    if (error) {
      console.error(
        "[New Result Records] Patient result load error:",
        error
      );

      return {
        data: [],
        error,
      };
    }

    return {
      data: Array.isArray(data)
        ? data
        : [],
      error: null,
    };

  } catch (error) {
    console.error(
      "[New Result Records] Unexpected patient result error:",
      error
    );

    return {
      data: [],
      error,
    };
  }
}