import { supabase } from "../supabase";

/* ==========================================================
   HELPERS
========================================================== */

function normalizeText(value) {
  return String(value ?? "").trim();
}


/* ==========================================================
   FIRST NON-EMPTY VALUE
========================================================== */

function firstValue(...values) {
  for (const value of values) {
    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return null;
}


/* ==========================================================
   USER
========================================================== */

function getUserName(user = {}) {
  return (
    normalizeText(
      user?.full_name ??
        user?.name ??
        user?.username
    ) || "Unknown"
  );
}


/* ==========================================================
   STRUCTURED RESULT
   ----------------------------------------------------------
   Result metadata is stored inside patient_results.result.

   Supports BOTH:

   1. JSON object
   2. JSON string

   This is important because older records may not have the
   exact same PostgreSQL/result representation.
========================================================== */

function getStructuredResult(row = {}) {
  const rawResult = row?.result;

  if (
    rawResult &&
    typeof rawResult === "object" &&
    !Array.isArray(rawResult)
  ) {
    return rawResult;
  }

  if (
    typeof rawResult === "string"
  ) {
    const value =
      rawResult.trim();

    if (!value) {
      return null;
    }

    try {
      const parsed =
        JSON.parse(value);

      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        return parsed;
      }
    } catch {
      /*
       * Ordinary scalar/text result.
       * Not structured metadata.
       */
    }
  }

  return null;
}


/* ==========================================================
   HAS REAL VALUE
========================================================== */

function hasValue(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return false;
  }

  if (
    typeof value === "string"
  ) {
    return value.trim() !== "";
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (
    Array.isArray(value)
  ) {
    return value.some(
      (item) =>
        hasValue(item)
    );
  }

  if (
    typeof value === "object"
  ) {
    return Object.values(value).some(
      (item) =>
        hasValue(item)
    );
  }

  return false;
}

/* ==========================================================
   HYDRATE RESULT METADATA
   ----------------------------------------------------------
   CRITICAL IDENTITY RECOVERY LAYER.

   Result-entry service stores complete test identity inside
   patient_results.result JSON because the database schema
   may not contain dedicated identity columns.

   This function restores that identity to the top level so:

     ResultRecords
     groupResultRecords()
     PrintRouter
     ResultPreviewModal

   can work with the original registered-test identity.

   IMPORTANT RULES

   1. Existing top-level database values ALWAYS WIN.

   2. Stored result JSON is the fallback.

   3. registered_test_id MUST be restored.

   4. master_test_id MUST be restored.

   5. test_id MUST be restored.

   6. panel_id MUST be restored.

   7. panel_master_test_id MUST be restored.

   8. panel_name MUST be restored.

   9. is_panel MUST only be true when explicit panel
      information exists.

   10. NEVER infer a panel from a parameter/test name.
========================================================== */

function hydrateResultRow(row = {}) {
  if (!row || typeof row !== "object") {
    return row;
  }

  const structuredResult =
    getStructuredResult(row);

  /*
   * There may be old records where result is not an object.
   * Preserve those records exactly rather than destroying
   * their existing top-level information.
   */
  if (!structuredResult) {
    return {
      ...row,
    };
  }


  /* ========================================================
     REGISTERED TEST IDENTITY
     ======================================================== */

  const registeredTestId =
    firstValue(
      row?.registered_test_id,
      row?.registeredTestId,

      structuredResult?.registered_test_id,
      structuredResult?.registeredTestId,

      structuredResult?.registration_test_id,
      structuredResult?.registrationTestId
    );


  /* ========================================================
     CHILD TEST IDENTITY
     ======================================================== */

  const testId =
    firstValue(
      row?.test_id,
      row?.testId,

      structuredResult?.test_id,
      structuredResult?.testId,

      /*
       * IMPORTANT:
       *
       * Do NOT automatically use registered_test_id as
       * test_id.
       *
       * They represent different identities.
       */
      null
    );


  /* ========================================================
     MASTER TEST IDENTITY
     ======================================================== */

  const masterTestId =
    firstValue(
      row?.master_test_id,
      row?.masterTestId,

      structuredResult?.master_test_id,
      structuredResult?.masterTestId
    );


  /* ========================================================
     PANEL MASTER TEST IDENTITY
     ======================================================== */

  const panelMasterTestId =
    firstValue(
      row?.panel_master_test_id,
      row?.panelMasterTestId,

      structuredResult?.panel_master_test_id,
      structuredResult?.panelMasterTestId,

      structuredResult?.parent_panel_master_test_id,
      structuredResult?.parentPanelMasterTestId
    );


  /* ========================================================
     PANEL IDENTITY
     ======================================================== */

  const panelId =
    firstValue(
      row?.panel_id,
      row?.panelId,

      structuredResult?.panel_id,
      structuredResult?.panelId,

      structuredResult?.parent_panel_id,
      structuredResult?.parentPanelId
    );


  /* ========================================================
     PANEL NAME
     ======================================================== */

  const panelName =
    firstValue(
      row?.panel_name,
      row?.panelName,

      structuredResult?.panel_name,
      structuredResult?.panelName,

      structuredResult?.parent_panel_name,
      structuredResult?.parentPanelName
    );


  /* ========================================================
     TEST NAME
     ======================================================== */

  const testName =
    firstValue(
      row?.test_name,
      row?.testName,

      structuredResult?.test_name,
      structuredResult?.testName,

      structuredResult?.parameter
    );


  /* ========================================================
     PANEL STATUS
     ======================================================== */

  const existingPanelFlag =
    firstValue(
      row?.is_panel,
      row?.isPanel,

      structuredResult?.is_panel,
      structuredResult?.isPanel
    );


  const explicitPanelFlag =
    existingPanelFlag === true ||
    existingPanelFlag === 1 ||
    existingPanelFlag === "1" ||
    (
      typeof existingPanelFlag === "string" &&
      existingPanelFlag
        .trim()
        .toLowerCase() === "true"
    );


  /*
   * A result is a panel-child result only when there is
   * actual panel identity OR an explicit panel declaration
   * accompanied by panel identity.
   *
   * We NEVER classify:
   *
   *   GGT
   *   ALT
   *   Creatinine
   *   TSH
   *
   * as panels simply because result is an object.
   */

  const hasPanelIdentity =
    (
      panelId !== null &&
      panelId !== undefined &&
      String(panelId).trim() !== ""
    ) ||
    (
      panelMasterTestId !== null &&
      panelMasterTestId !== undefined &&
      String(panelMasterTestId).trim() !== ""
    ) ||
    (
      panelName !== null &&
      panelName !== undefined &&
      String(panelName).trim() !== ""
    );


  const isPanel =
    hasPanelIdentity &&
    (
      explicitPanelFlag ||
      hasPanelIdentity
    );


  /* ========================================================
     RESULT TYPE
     ======================================================== */

  const resultType =
    firstValue(
      row?.result_type,
      row?.resultType,

      structuredResult?.result_type,
      structuredResult?.resultType
    );


  /* ========================================================
     TEMPLATE
     ======================================================== */

  const templateType =
    firstValue(
      row?.template_type,
      row?.templateType,

      structuredResult?.template_type,
      structuredResult?.templateType
    );


  /* ========================================================
     DEPARTMENT
     ======================================================== */

  const department =
    firstValue(
      row?.department,

      structuredResult?.department,

      row?.result_department,
      row?.resultDepartment
    );


  /* ========================================================
     RESULT CATEGORY
     ======================================================== */

  const resultCategory =
    firstValue(
      row?.result_category,
      row?.resultCategory,

      structuredResult?.result_category,
      structuredResult?.resultCategory
    );


  /* ========================================================
     RETURN HYDRATED RESULT
     ======================================================== */

  return {
    ...row,


    /* ======================================================
       REGISTERED TEST IDENTITY
       ====================================================== */

    registered_test_id:
      registeredTestId ?? null,

    registeredTestId:
      firstValue(
        row?.registeredTestId,
        row?.registered_test_id,
        registeredTestId
      ),


    /* ======================================================
       CHILD TEST IDENTITY
       ====================================================== */

    test_id:
      testId ?? null,

    testId:
      firstValue(
        row?.testId,
        row?.test_id,
        testId
      ),


    /* ======================================================
       MASTER TEST IDENTITY
       ====================================================== */

    master_test_id:
      masterTestId ?? null,

    masterTestId:
      firstValue(
        row?.masterTestId,
        row?.master_test_id,
        masterTestId
      ),


    /* ======================================================
       PANEL MASTER TEST IDENTITY
       ====================================================== */

    panel_master_test_id:
      panelMasterTestId ?? null,

    panelMasterTestId:
      firstValue(
        row?.panelMasterTestId,
        row?.panel_master_test_id,
        panelMasterTestId
      ),


    /* ======================================================
       PANEL IDENTITY
       ====================================================== */

    panel_id:
      panelId ?? null,

    panelId:
      firstValue(
        row?.panelId,
        row?.panel_id,
        panelId
      ),


    panel_name:
      panelName ?? null,

    panelName:
      firstValue(
        row?.panelName,
        row?.panel_name,
        panelName
      ),


    /* ======================================================
       PANEL FLAG
       ====================================================== */

    is_panel:
      isPanel,

    isPanel:
      isPanel,


    /* ======================================================
       TEST NAME
       ====================================================== */

    test_name:
      testName ?? null,

    testName:
      firstValue(
        row?.testName,
        row?.test_name,
        testName
      ),


    /* ======================================================
       REPORT METADATA
       ====================================================== */

    department:
      department ?? null,

    result_category:
      resultCategory ?? null,

    template_type:
      templateType ?? null,

    templateType:
      firstValue(
        row?.templateType,
        row?.template_type,
        templateType
      ),

    result_type:
      resultType ?? null,
  };
}


/* ==========================================================
   HYDRATE RESULT ARRAY
========================================================== */

function hydrateResults(rows = []) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map(
    (row) =>
      hydrateResultRow(row)
  );
}


/* ==========================================================
   GET ALL RESULTS
========================================================== */

export async function getResults() {
  try {

    const {
      data: rawResults,
      error: resultsError,
    } =
      await supabase
        .from("patient_results")
        .select("*")
        .order("reported_at", {
          ascending: false,
        });


    if (resultsError) {

      console.error(
        "[resultService] GET RESULTS ERROR:",
        resultsError
      );

      return {
        data: [],
        error: resultsError,
      };
    }


    if (
      !Array.isArray(rawResults) ||
      rawResults.length === 0
    ) {

      return {
        data: [],
        error: null,
      };
    }


    /* ======================================================
       HYDRATE
    ====================================================== */

    const results =
      hydrateResults(
        rawResults
      );


    /* ======================================================
       REGISTRATION LAB NUMBERS
    ====================================================== */

    const labNumbers = [
      ...new Set(
        results
          .map(
            (row) =>
              normalizeText(
                row?.lab_number
              )
          )
          .filter(Boolean)
      ),
    ];


    let registrations = [];


    /* ======================================================
       LOAD REGISTRATIONS
    ====================================================== */

    if (
      labNumbers.length > 0
    ) {

      const {
        data,
        error:
          registrationError,
      } =
        await supabase
          .from("registrations")
          .select("*")
          .in(
            "lab_number",
            labNumbers
          );


      if (registrationError) {

        console.error(
          "[resultService] REGISTRATION LOOKUP ERROR:",
          registrationError
        );

        return {
          data: results,
          error: null,
        };
      }


      registrations =
        Array.isArray(data)
          ? data
          : [];
    }


    /* ======================================================
       REGISTRATION MAP
    ====================================================== */

    const registrationMap =
      new Map();


    registrations.forEach(
      (registration) => {

        const registrationLabNumber =
          normalizeText(
            registration?.lab_number
          );

        if (
          registrationLabNumber
        ) {

          registrationMap.set(
            registrationLabNumber,
            registration
          );
        }
      }
    );


    /* ======================================================
       MERGE PATIENT DATA
    ====================================================== */

    const mergedResults =
      results.map(
        (result) => {

          const resultLabNumber =
            normalizeText(
              result?.lab_number
            );

          const registration =
            registrationMap.get(
              resultLabNumber
            ) || {};


          return {
            ...result,

            patient_name:
              registration?.full_name ??
              result?.patient_name ??
              "",

            full_name:
              registration?.full_name ??
              result?.full_name ??
              result?.patient_name ??
              "",

            age:
              registration?.age ??
              result?.age ??
              null,

            sex:
              registration?.sex ??
              result?.sex ??
              null,

            phone:
              registration?.phone ??
              result?.phone ??
              null,
          };
        }
      );


    /* ======================================================
       DEBUG
    ====================================================== */

    console.log(
      "[resultService] HYDRATED RESULTS:"
    );

    console.table(
      mergedResults.map(
        (row) => ({

          id:
            row?.id,

          lab_number:
            row?.lab_number,

          registered_test_id:
            row?.registered_test_id,

          master_test_id:
            row?.master_test_id,

          test_id:
            row?.test_id,

          panel_master_test_id:
            row?.panel_master_test_id,

          panel_id:
            row?.panel_id,

          test_name:
            row?.test_name,

          test_type:
            row?.test_type,

          panel_name:
            row?.panel_name,

          is_panel:
            row?.is_panel,

          department:
            row?.department,

          template_type:
            row?.template_type,
        })
      )
    );


    return {
      data:
        mergedResults,

      error: null,
    };

  } catch (error) {

    console.error(
      "[resultService] UNEXPECTED GET RESULTS ERROR:",
      error
    );

    return {
      data: [],
      error,
    };
  }
}


/* ==========================================================
   GET RESULTS FOR ONE PATIENT
========================================================== */

export async function getPatientResults(
  labNumber
) {

  const normalizedLabNumber =
    normalizeText(
      labNumber
    );


  if (!normalizedLabNumber) {

    return {
      data: [],

      error:
        new Error(
          "Lab number is required."
        ),
    };
  }


  try {

    const {
      data: rawData,
      error,
    } =
      await supabase
        .from("patient_results")
        .select("*")
        .eq(
          "lab_number",
          normalizedLabNumber
        )
        .order("reported_at", {
          ascending: true,
        });


    if (error) {

      console.error(
        "[resultService] GET PATIENT RESULTS ERROR:",
        error
      );
    }


    const data =
      hydrateResults(
        Array.isArray(rawData)
          ? rawData
          : []
      );


    /* ======================================================
       IMPORTANT DEBUG
    ====================================================== */

    console.log(
      `[resultService] PATIENT RESULTS — ${normalizedLabNumber}:`
    );

    console.table(
      data.map(
        (row) => ({

          id:
            row?.id,

          registered_test_id:
            row?.registered_test_id,

          master_test_id:
            row?.master_test_id,

          test_id:
            row?.test_id,

          panel_master_test_id:
            row?.panel_master_test_id,

          panel_id:
            row?.panel_id,

          test_name:
            row?.test_name,

          test_type:
            row?.test_type,

          panel_name:
            row?.panel_name,

          is_panel:
            row?.is_panel,

          has_result:
            hasValue(
              row?.result
            ),
        })
      )
    );


    return {
      data,

      error:
        error || null,
    };

  } catch (error) {

    console.error(
      "[resultService] UNEXPECTED GET PATIENT RESULTS ERROR:",
      error
    );

    return {
      data: [],

      error,
    };
  }
}


/* ==========================================================
   GET ONE RESULT
========================================================== */

export async function getExistingResult(
  verificationId
) {

  const normalizedId =
    normalizeText(
      verificationId
    );


  if (!normalizedId) {

    return {
      data: null,

      error:
        new Error(
          "Verification ID is required."
        ),
    };
  }


  try {

    const {
      data: rawData,
      error,
    } =
      await supabase
        .from("patient_results")
        .select("*")
        .eq(
          "verification_id",
          normalizedId
        )
        .maybeSingle();


    if (error) {

      console.error(
        "[resultService] GET EXISTING RESULT ERROR:",
        error
      );
    }


    const data =
      rawData
        ? hydrateResultRow(
            rawData
          )
        : null;


    return {
      data,

      error:
        error || null,
    };

  } catch (error) {

    console.error(
      "[resultService] UNEXPECTED GET EXISTING RESULT ERROR:",
      error
    );

    return {
      data: null,
      error,
    };
  }
}


/* ==========================================================
   SAVE RESULT
========================================================== */

export async function saveResult(
  payload
) {

  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {

    return {
      data: null,

      error:
        new Error(
          "Result payload is required."
        ),
    };
  }


  try {

    const {
      data,
      error,
    } =
      await supabase
        .from("patient_results")
        .insert(payload)
        .select("*")
        .single();


    if (error) {

      console.error(
        "[resultService] SAVE RESULT ERROR:",
        error
      );

      return {
        data: null,
        error,
      };
    }


    return {
      data:
        hydrateResultRow(
          data
        ),

      error: null,
    };

  } catch (error) {

    console.error(
      "[resultService] UNEXPECTED SAVE RESULT ERROR:",
      error
    );

    return {
      data: null,
      error,
    };
  }
}


/* ==========================================================
   UPDATE RESULT
========================================================== */

export async function updateResult(
  id,
  payload
) {

  if (!id) {

    return {
      data: null,

      error:
        new Error(
          "Result ID is required."
        ),
    };
  }


  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {

    return {
      data: null,

      error:
        new Error(
          "Result payload is required."
        ),
    };
  }


  try {

    const {
      data,
      error,
    } =
      await supabase
        .from("patient_results")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();


    if (error) {

      console.error(
        "[resultService] UPDATE RESULT ERROR:",
        error
      );

      return {
        data: null,
        error,
      };
    }


    return {
      data:
        hydrateResultRow(
          data
        ),

      error: null,
    };

  } catch (error) {

    console.error(
      "[resultService] UNEXPECTED UPDATE RESULT ERROR:",
      error
    );

    return {
      data: null,
      error,
    };
  }
}


/* ==========================================================
   AUTHORIZE RESULT
========================================================== */

export async function authorizeResult(
  id,
  user = {}
) {

  if (!id) {

    return {
      data: null,

      error:
        new Error(
          "Result ID is required."
        ),
    };
  }


  try {

    const {
      data,
      error,
    } =
      await supabase
        .from("patient_results")
        .update({

          authorization_status:
            "Authorized",

          authorized_by:
            getUserName(user),

          authorized_at:
            new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();


    if (error) {

      console.error(
        "[resultService] AUTHORIZE RESULT ERROR:",
        error
      );

      return {
        data: null,
        error,
      };
    }


    return {
      data:
        hydrateResultRow(
          data
        ),

      error: null,
    };

  } catch (error) {

    console.error(
      "[resultService] UNEXPECTED AUTHORIZE RESULT ERROR:",
      error
    );

    return {
      data: null,
      error,
    };
  }
}


/* ==========================================================
   RELEASE RESULT
========================================================== */

export async function releaseResult(
  id,
  user = {}
) {

  if (!id) {

    return {
      data: null,

      error:
        new Error(
          "Result ID is required."
        ),
    };
  }


  try {

    const {
      data,
      error,
    } =
      await supabase
        .from("patient_results")
        .update({

          release_status:
            "Released",

          released_by:
            getUserName(user),

          released_at:
            new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();


    if (error) {

      console.error(
        "[resultService] RELEASE RESULT ERROR:",
        error
      );

      return {
        data: null,
        error,
      };
    }


    return {
      data:
        hydrateResultRow(
          data
        ),

      error: null,
    };

  } catch (error) {

    console.error(
      "[resultService] UNEXPECTED RELEASE RESULT ERROR:",
      error
    );

    return {
      data: null,
      error,
    };
  }
}


/* ==========================================================
   UPDATE PRINT COUNT
========================================================== */

export async function updatePrintCount(
  row,
  user = {}
) {

  if (!row?.id) {

    return {
      data: null,

      error:
        new Error(
          "Result ID is required."
        ),
    };
  }


  const currentCount =
    Number(
      row?.print_count
    ) || 0;


  try {

    const {
      data,
      error,
    } =
      await supabase
        .from("patient_results")
        .update({

          print_count:
            currentCount + 1,

          last_printed_at:
            new Date().toISOString(),

          last_printed_by:
            getUserName(user),
        })
        .eq(
          "id",
          row.id
        )
        .select("*")
        .single();


    if (error) {

      console.error(
        "[resultService] UPDATE PRINT COUNT ERROR:",
        error
      );

      return {
        data: null,
        error,
      };
    }


    return {
      data:
        hydrateResultRow(
          data
        ),

      error: null,
    };

  } catch (error) {

    console.error(
      "[resultService] UNEXPECTED UPDATE PRINT COUNT ERROR:",
      error
    );

    return {
      data: null,
      error,
    };
  }
}


/* ==========================================================
   UPDATE DOWNLOAD COUNT
========================================================== */

export async function updateDownloadCount(
  row,
  user = {}
) {

  if (!row?.id) {

    return {
      data: null,

      error:
        new Error(
          "Result ID is required."
        ),
    };
  }


  const currentCount =
    Number(
      row?.download_count
    ) || 0;


  try {

    const {
      data,
      error,
    } =
      await supabase
        .from("patient_results")
        .update({

          download_count:
            currentCount + 1,

          last_downloaded_at:
            new Date().toISOString(),

          last_downloaded_by:
            getUserName(user),
        })
        .eq(
          "id",
          row.id
        )
        .select("*")
        .single();


    if (error) {

      console.error(
        "[resultService] UPDATE DOWNLOAD COUNT ERROR:",
        error
      );

      return {
        data: null,
        error,
      };
    }


    return {
      data:
        hydrateResultRow(
          data
        ),

      error: null,
    };

  } catch (error) {

    console.error(
      "[resultService] UNEXPECTED UPDATE DOWNLOAD COUNT ERROR:",
      error
    );

    return {
      data: null,
      error,
    };
  }
}