/* ==========================================================
   PEFA LAB
   LABORATORY RESULT SERVICE
   ----------------------------------------------------------
   PATH:
   src/services/laboratory/laboratoryResultService.js

   PURPOSE:
   - Load existing laboratory results
   - Resolve master test metadata
   - Resolve panel membership
   - Group reported results
   - Update laboratory results
   - Provide result status helpers

   ARCHITECTURE:

   REGISTRATION PORTAL
          |
          v
   registrations
          |
          v
   laboratoryRegistrationService.js
          |
          v
   LaboratoryResultEntry.jsx
          |
          | save
          v
   laboratory_results
          |
          v
   laboratoryResultService.js
          |
          v
   LaboratoryResultDashboard.jsx

   IMPORTANT:
   - Fresh implementation
   - No old dashboard dependencies
   - No old testService
   - No old resultService
   - Registration searching does NOT belong here
   - Supabase comes from ../../supabase
   - laboratory_results is the authoritative result table
   ========================================================== */

import { supabase } from "../../supabase";

/* ==========================================================
   BASIC HELPERS
   ========================================================== */

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const isValidId = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return false;
  }

  return Number.isFinite(Number(value));
};

const uniqueNumbers = (values = []) =>
  [
    ...new Set(
      values
        .filter(isValidId)
        .map(Number)
    ),
  ];

/* ==========================================================
   SAVED RESULT AUTHORITY
   ----------------------------------------------------------
   IMPORTANT:
   This determines whether a laboratory_results row contains
   an actual persisted laboratory result.

   A row with:
     result = null
     result_status = "Pending"

   is NOT a saved report.

   A row with an actual value/object/array in result IS a
   saved report.

   Legacy result columns are also supported:
     result_numeric
     result_value
     value

   The laboratory_results row itself remains authoritative.
   master_tests is NEVER used to determine whether a result
   was saved.
   ========================================================== */

function isPersistedLaboratoryResult(row = {}) {
  if (
    !row ||
    row.id === null ||
    row.id === undefined ||
    row.id === ""
  ) {
    return false;
  }

  const result =
    row.result;

  /* --------------------------------------------------------
     PRIMARY RESULT COLUMN
     -------------------------------------------------------- */

  const hasResult =
    result !== null &&
    result !== undefined &&
    (
      (
        typeof result === "string" &&
        result.trim() !== ""
      ) ||
      (
        typeof result === "number" &&
        Number.isFinite(result)
      ) ||
      typeof result === "boolean" ||
      (
        Array.isArray(result) &&
        result.length > 0
      ) ||
      (
        typeof result === "object" &&
        !Array.isArray(result) &&
        Object.keys(result).length > 0
      )
    );

  /* --------------------------------------------------------
     LEGACY / COMPATIBILITY RESULT COLUMNS
     -------------------------------------------------------- */

  const hasResultNumeric =
    row.result_numeric !== null &&
    row.result_numeric !== undefined &&
    row.result_numeric !== "";

  const hasResultValue =
    row.result_value !== null &&
    row.result_value !== undefined &&
    row.result_value !== "";

  const hasValue =
    row.value !== null &&
    row.value !== undefined &&
    row.value !== "";

  return (
    hasResult ||
    hasResultNumeric ||
    hasResultValue ||
    hasValue
  );
}

/* ==========================================================
   GET SINGLE LABORATORY RESULT
   ----------------------------------------------------------
   Compatibility export used by result-entry components.

   laboratory_results.id is BIGINT, so only numeric IDs are
   accepted here.
   ========================================================== */

export async function getLaboratoryResultById(
  resultId
) {
  if (!isValidId(resultId)) {
    throw new Error(
      "A valid laboratory result ID is required."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("laboratory_results")
    .select("*")
    .eq(
      "id",
      Number(resultId)
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load laboratory result: ${error.message}`
    );
  }

  return data || null;
}

/* ==========================================================
   GET ALL LABORATORY RESULTS
   ----------------------------------------------------------
   Reads ONLY from:
       laboratory_results

   Used by:
   - LaboratoryResultDashboard
   - Result reporting workflow
   ========================================================== */

export async function getLaboratoryResults({
  labNumber = null,
  search = "",
  status = null,
  limit = null,
} = {}) {
  /*
   * IMPORTANT:
   * Do NOT use one fixed .limit(500) query here.
   *
   * laboratory_results can contain many older Pending/empty
   * rows. A fixed first-page query can cause newer saved
   * results to disappear from the Dashboard.
   *
   * When no explicit limit is supplied, all rows are paged.
   */

  const PAGE_SIZE = 1000;

  const requestedLimit =
    Number.isFinite(Number(limit)) &&
    Number(limit) > 0
      ? Number(limit)
      : null;

  const allRows = [];

  let offset = 0;

  while (true) {
    const remaining =
      requestedLimit === null
        ? PAGE_SIZE
        : Math.min(
            PAGE_SIZE,
            requestedLimit -
              allRows.length
          );

    if (remaining <= 0) {
      break;
    }

    let query =
      supabase
        .from("laboratory_results")
        .select("*")
        .order(
          "created_at",
          {
            ascending: true,
          }
        )
        .order(
          "id",
          {
            ascending: true,
          }
        )
        .range(
          offset,
          offset +
            remaining -
            1
        );

    /* ------------------------------------------------------
       EXACT LAB NUMBER FILTER
       ------------------------------------------------------ */

    if (labNumber) {
      query =
        query.eq(
          "lab_number",
          String(
            labNumber
          ).trim()
        );
    }

    /* ------------------------------------------------------
       STATUS FILTER
       ------------------------------------------------------ */

    if (status) {
      query =
        query.eq(
          "result_status",
          status
        );
    }

    const {
      data,
      error,
    } = await query;

    if (error) {
      throw new Error(
        `Failed to load laboratory results: ${error.message}`
      );
    }

    const page =
      Array.isArray(data)
        ? data
        : [];

    allRows.push(
      ...page
    );

    /*
     * Fewer rows than requested means this is the final page.
     */

    if (
      page.length <
      remaining
    ) {
      break;
    }

    offset +=
      page.length;
  }

  let results =
    allRows;

  /* ========================================================
     CLIENT-SIDE SEARCH
     ======================================================== */

  const normalizedSearch =
    normalizeText(
      search
    );

  if (
    normalizedSearch
  ) {
    results =
      results.filter(
        (row) =>
          normalizeText(
            row.lab_number
          ).includes(
            normalizedSearch
          ) ||
          normalizeText(
            row.test_name
          ).includes(
            normalizedSearch
          ) ||
          normalizeText(
            row.test_code
          ).includes(
            normalizedSearch
          ) ||
          normalizeText(
            row.patient_id
          ).includes(
            normalizedSearch
          ) ||
          normalizeText(
            row.patient_name
          ).includes(
            normalizedSearch
          )
      );
  }

  return results;
}

/* ==========================================================
   GET RESULTS BY LAB NUMBER
   ----------------------------------------------------------
   Explicit result lookup.
   ========================================================== */

export async function getLaboratoryResultsByLabNumber(
  labNumber
) {
  if (!labNumber) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from("laboratory_results")
    .select("*")
    .eq(
      "lab_number",
      String(
        labNumber
      ).trim()
    )
    .order(
      "created_at",
      {
        ascending: true,
      }
    );

  if (error) {
    throw new Error(
      `Failed to load results for lab number: ${error.message}`
    );
  }

  return data || [];
}

/* ==========================================================
   GET RESULTS BY PATIENT ID
   ========================================================== */

export async function getLaboratoryResultsByPatientId(
  patientId
) {
  if (!patientId) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from("laboratory_results")
    .select("*")
    .eq(
      "patient_id",
      String(
        patientId
      ).trim()
    )
    .order(
      "created_at",
      {
        ascending: true,
      }
    );

  if (error) {
    throw new Error(
      `Failed to load patient laboratory results: ${error.message}`
    );
  }

  return data || [];
}

/* ==========================================================
   MASTER TESTS
   ========================================================== */

export async function getMasterTestsByIds(
  testIds = []
) {
  const ids =
    uniqueNumbers(
      testIds
    );

  if (!ids.length) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from("master_tests")
    .select("*")
    .in(
      "id",
      ids
    );

  if (error) {
    throw new Error(
      `Failed to load master tests: ${error.message}`
    );
  }

  return data || [];
}

/* ==========================================================
   MASTER TEST BY NAME
   ========================================================== */

export async function getMasterTestByName(
  testName
) {
  if (!testName) {
    return null;
  }

  const name =
    String(
      testName
    ).trim();

  const normalizedName =
    normalizeText(
      name
    );

  const {
    data,
    error,
  } = await supabase
    .from("master_tests")
    .select("*")
    .ilike(
      "test_name",
      name
    );

  if (error) {
    throw new Error(
      `Failed to resolve master test: ${error.message}`
    );
  }

  if (!data?.length) {
    return null;
  }

  /*
   * Prefer exact normalized match.
   *
   * The fallback to data[0] is retained for compatibility
   * with this service's existing contract.
   */

  return (
    data.find(
      (test) =>
        normalizeText(
          test.test_name
        ) ===
        normalizedName
    ) ||
    data[0]
  );
}

/* ==========================================================
   PANEL MEMBERSHIP BY TEST IDS
   ========================================================== */

export async function getPanelTestsByTestIds(
  testIds = []
) {
  const ids =
    uniqueNumbers(
      testIds
    );

  if (!ids.length) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from("panel_tests")
    .select(`
      id,
      panel_id,
      test_id,
      display_order
    `)
    .in(
      "test_id",
      ids
    )
    .order(
      "display_order",
      {
        ascending: true,
      }
    );

  if (error) {
    throw new Error(
      `Failed to load panel relationships: ${error.message}`
    );
  }

  return data || [];
}

/* ==========================================================
   PANEL MEMBERS BY PANEL ID
   ========================================================== */

export async function getPanelTests(
  panelId
) {
  if (!isValidId(panelId)) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from("panel_tests")
    .select(`
      id,
      panel_id,
      test_id,
      display_order
    `)
    .eq(
      "panel_id",
      Number(panelId)
    )
    .order(
      "display_order",
      {
        ascending: true,
      }
    );

  if (error) {
    throw new Error(
      `Failed to load panel members: ${error.message}`
    );
  }

  return data || [];
}

/* ==========================================================
   RESOLVE SINGLE RESULT
   ========================================================== */

export async function resolveLaboratoryResult(
  result
) {
  if (!result) {
    return null;
  }

  let masterTest =
    null;

  /* --------------------------------------------------------
     RESOLVE BY TEST ID
     -------------------------------------------------------- */

  if (
    isValidId(
      result.test_id
    )
  ) {
    const tests =
      await getMasterTestsByIds([
        Number(
          result.test_id
        ),
      ]);

    masterTest =
      tests[0] ||
      null;
  }

  /* --------------------------------------------------------
     FALLBACK TO TEST NAME
     -------------------------------------------------------- */

  if (
    !masterTest &&
    result.test_name
  ) {
    masterTest =
      await getMasterTestByName(
        result.test_name
      );
  }

  /* --------------------------------------------------------
     PANEL MEMBERSHIP
     -------------------------------------------------------- */

  let panelTests =
    [];

  if (
    masterTest?.id
  ) {
    panelTests =
      await getPanelTestsByTestIds([
        masterTest.id,
      ]);
  }

  return {
    ...result,

    masterTest,

    resolvedTestId:
      masterTest?.id ??
      (
        isValidId(
          result.test_id
        )
          ? Number(
              result.test_id
            )
          : null
      ),

    panelTests,
  };
}

/* ==========================================================
   ENRICH RESULT COLLECTION
   ========================================================== */

export async function enrichLaboratoryResults(
  results = []
) {
  if (!results.length) {
    return [];
  }

  /* --------------------------------------------------------
     COLLECT TEST IDS
     -------------------------------------------------------- */

  const testIds =
    uniqueNumbers(
      results.map(
        (row) =>
          row.test_id
      )
    );

  /* --------------------------------------------------------
     LOAD MASTER TESTS
     -------------------------------------------------------- */

  const masterTests =
    await getMasterTestsByIds(
      testIds
    );

  const masterTestsById =
    new Map(
      masterTests.map(
        (test) => [
          Number(
            test.id
          ),
          test,
        ]
      )
    );

  /* --------------------------------------------------------
     NAME FALLBACKS
     -------------------------------------------------------- */

  const unresolvedNames =
    results
      .filter(
        (row) =>
          !isValidId(
            row.test_id
          ) &&
          row.test_name
      )
      .map(
        (row) =>
          row.test_name
      );

  const fallbackTests =
    [];

  for (
    const testName
    of unresolvedNames
  ) {
    const test =
      await getMasterTestByName(
        testName
      );

    if (test) {
      fallbackTests.push(
        test
      );

      masterTestsById.set(
        Number(
          test.id
        ),
        test
      );
    }
  }

  /* --------------------------------------------------------
     RESOLVED TEST IDS
     -------------------------------------------------------- */

  const resolvedTestIds =
    uniqueNumbers(
      results.map(
        (row) => {
          if (
            isValidId(
              row.test_id
            )
          ) {
            return Number(
              row.test_id
            );
          }

          const test =
            fallbackTests.find(
              (item) =>
                normalizeText(
                  item.test_name
                ) ===
                normalizeText(
                  row.test_name
                )
            );

          return test?.id;
        }
      )
    );

  /* --------------------------------------------------------
     LOAD PANEL RELATIONSHIPS
     -------------------------------------------------------- */

  const panelTests =
    await getPanelTestsByTestIds(
      resolvedTestIds
    );

  /* --------------------------------------------------------
     LOAD CHILD PARAMETERS FOR REGISTERED PANELS

     Panel result rows can have test_id = null because the saved
     laboratory_results row represents the panel itself. In that
     case, resolve the panel master by name, then load its
     panel_tests children and their master_tests metadata.

     This is required for the report renderer to choose the
     patient-specific male/female/child/elderly reference range.
     -------------------------------------------------------- */

  const knownPanelNames = new Set([
    "lipid profile",
    "fasting lipid profile",
    "flp",
    "liver function test",
    "liver function",
    "lft",
    "liver profile",
    "renal function test",
    "renal function",
    "rft",
    "kidney function test",
    "renal profile",
    "electrolytes",
    "electrolyte profile",
    "electrolytes urea creatinine",
    "euc",
    "uec",
    "thyroid function test",
    "thyroid function",
    "tft",
    "diabetes profile",
    "complete blood count",
    "full blood count",
    "cbc",
    "fbc",
  ]);

  const panelParameterTests = [];

  const panelMasterIds = uniqueNumbers(
    results
      .filter((row) => {
        const name = normalizeText(row?.test_name);
        const panel = normalizeText(row?.panel_name);
        return knownPanelNames.has(name) || knownPanelNames.has(panel) || Boolean(row?.is_panel || row?.isPanel);
      })
      .map((row) => {
        const direct = row?.masterTest?.id ?? row?.master_test?.id;
        if (isValidId(direct)) return direct;
        const fallback = [...masterTestsById.values()].find(
          (test) => normalizeText(test?.test_name) === normalizeText(row?.test_name)
        );
        return fallback?.id;
      })
  );

  for (const panelMasterId of panelMasterIds) {
    const memberships = await getPanelTests(panelMasterId);
    const childIds = uniqueNumbers(memberships.map((item) => item?.test_id));
    if (!childIds.length) continue;

    const children = await getMasterTestsByIds(childIds);
    const byId = new Map(children.map((test) => [Number(test.id), test]));

    memberships.forEach((membership) => {
      const child = byId.get(Number(membership.test_id));
      if (child) {
        panelParameterTests.push({
          ...child,
          panel_id: membership.panel_id,
          display_order: membership.display_order,
        });
      }
    });
  }

  const panelTestsByTestId =
    new Map();

  for (
    const membership
    of panelTests
  ) {
    const key =
      Number(
        membership.test_id
      );

    if (
      !panelTestsByTestId.has(
        key
      )
    ) {
      panelTestsByTestId.set(
        key,
        []
      );
    }

    panelTestsByTestId
      .get(key)
      .push(
        membership
      );
  }

  /* --------------------------------------------------------
     ENRICH
     -------------------------------------------------------- */

  const enriched =
    results.map(
      (result) => {
        let masterTest =
          null;

        if (
          isValidId(
            result.test_id
          )
        ) {
          masterTest =
            masterTestsById.get(
              Number(
                result.test_id
              )
            );
        }

        if (
          !masterTest &&
          result.test_name
        ) {
          masterTest =
            [
              ...masterTestsById.values(),
            ].find(
              (test) =>
                normalizeText(
                  test.test_name
                ) ===
                normalizeText(
                  result.test_name
                )
            ) ||
            null;
        }

        const resolvedTestId =
          masterTest?.id ??
          (
            isValidId(
              result.test_id
            )
              ? Number(
                  result.test_id
                )
              : null
          );

        return {
          ...result,

          masterTest,

          resolvedTestId,

          panelTests:
            panelTestsByTestId.get(
              Number(
                resolvedTestId
              )
            ) || [],

          panelParameters: panelParameterTests
            .filter((parameter) => {
              if (!isValidId(parameter?.panel_id) || !isValidId(resolvedTestId)) return false;
              return Number(parameter.panel_id) === Number(resolvedTestId);
            })
            .sort((a, b) => Number(a.display_order ?? 999999) - Number(b.display_order ?? 999999)),
        };
      }
    );

  return {
    results:
      enriched,

    masterTests: [
      ...masterTestsById.values(),
    ],

    panelTests,
  };
}

/* ==========================================================
   GROUP RESULTS
   ========================================================== */

export function groupLaboratoryResults(results = []) {
  const groups = new Map();

  const text = (value) => String(value ?? "").trim();
  const normalize = (value) => text(value).replace(/[_-]+/g, " ").replace(/\s+/g, " ").toLowerCase();
  const nameOf = (row) => normalize(row?.test_name || row?.testName || row?.masterTest?.test_name || row?.master_test?.test_name || "");
  const deptOf = (row) => text(row?.department || row?.masterTest?.department || row?.master_test?.department || "Laboratory");
  const canonicalDept = (value) => {
    const v = normalize(value);
    if (v.includes("hematology") || v.includes("haematology")) return "haematology";
    if (v.includes("endocrinology") || v.includes("endocrine")) return "endocrinology";
    if (v === "chemistry" || v.includes("chemical pathology") || v.includes("clinical chemistry") || v.includes("biochemistry")) return "chemical pathology";
    return v;
  };
  const typeOf = (row) => normalize(row?.test_type || row?.testType || row?.masterTest?.test_type || row?.master_test?.test_type || "");
  const panelOf = (row) => normalize(row?.panel_name || row?.panelName || "");
  const specialNames = [
    "widal", "malaria parasite", "malaria parasite microscopy", "routine urinalysis", "urinalysis",
    "urine microscopy", "stool analysis", "semen analysis", "seminal fluid analysis", "blood culture",
    "blood culture mcs", "mcs", "microscopy culture sensitivity", "hvs", "high vaginal swab", "ecs",
    "endocervical swab", "drug screen", "drug screening", "donor screening", "blood grouping", "blood group",
    "crossmatch", "cross matching"
  ];
  const panelNames = [
    "lipid profile", "fasting lipid profile", "flp", "liver function test", "liver function tests", "lft",
    "liver profile", "renal function test", "renal function tests", "rft", "kidney function test",
    "renal profile", "electrolytes", "electrolyte profile", "euc", "uec", "thyroid function test",
    "thyroid function tests", "tft", "diabetes profile", "complete blood count", "full blood count", "cbc", "fbc"
  ];
  const hasKnown = (name, list) => list.some((item) => name === item || name.includes(item));

  const presentationOf = (row) => {
    const name = nameOf(row);
    const type = typeOf(row);
    const template = normalize(row?.template_type || row?.templateType || row?.masterTest?.template_type || row?.master_test?.template_type || "");
    const category = normalize(row?.result_category || row?.masterTest?.result_category || row?.master_test?.result_category || "");

    if (hasKnown(name, specialNames) || hasKnown(panelOf(row), specialNames) || template.includes("special") || template.includes("microscopy") || category.includes("special")) return "special";

    // IMPORTANT: panel_tests membership alone is never used as panel identity.
    // A registered single test remains a single even if it is a child of a panel.
    if (type === "single test" || type === "single" || type === "individual test") return "single";
    if (row?.is_panel === true || row?.isPanel === true || type === "panel" || type === "profile" || hasKnown(name, panelNames) || template.includes("panel") || category.includes("panel")) return "panel";

    return "single";
  };

  for (const result of results) {
    const presentation = presentationOf(result);
    const lab = text(result?.lab_number || result?.labNumber);
    const department = canonicalDept(deptOf(result));

    let key;
    let type;
    let panelId = null;
    let panelName = null;

    if (presentation === "panel") {
      type = "panel";
      panelId = result?.panel_id ?? result?.panelId ?? result?.master_test_id ?? result?.masterTest?.id ?? null;
      panelName = text(result?.panel_name || result?.panelName || result?.masterTest?.panel_name || result?.master_test?.panel_name || result?.test_name || "");
      key = `${lab}::panel::${panelId ?? normalize(panelName)}`;
    } else if (presentation === "special") {
      type = "special";
      key = `${lab}::special::${normalize(result?.test_code || result?.test_name || result?.id)}`;
    } else {
      type = "single";
      // All ordinary single quantitative/qualitative tests in the same lab
      // and department share one report. test_id/panel_tests do not split them.
      key = `${lab}::single::${department}`;
    }

    if (!groups.has(key)) {
      groups.set(key, {
        type,
        panelId,
        panelName,
        department: deptOf(result),
        results: [],
      });
    }

    const group = groups.get(key);
    if (!group.results.some((item) => Number(item?.id) === Number(result?.id))) group.results.push(result);
  }

  for (const group of groups.values()) {
    if (group.type !== "panel") continue;
    group.results.sort((a, b) => {
      const aOrder = a.panelTests?.find((m) => Number(m?.panel_id) === Number(group.panelId))?.display_order ?? 999999;
      const bOrder = b.panelTests?.find((m) => Number(m?.panel_id) === Number(group.panelId))?.display_order ?? 999999;
      return aOrder - bOrder;
    });
  }

  return [...groups.values()];
}

/* ==========================================================
   LOAD RESULT WORKSPACE
   ----------------------------------------------------------
   MAIN DATA SOURCE FOR:
   LaboratoryResultDashboard.jsx

   FLOW:

   laboratory_results
          |
          v
   getLaboratoryResults()
          |
          v
   isPersistedLaboratoryResult()
          |
          v
   enrichLaboratoryResults()
          |
          v
   groupLaboratoryResults()
          |
          v
   Dashboard
   ========================================================== */

export async function getLaboratoryResultWorkspace({
  labNumber = null,
  search = "",
  status = null,
} = {}) {
  let results =
    await getLaboratoryResults({
      labNumber,
      search,
      status,
    });

  /*
   * IMPORTANT:
   *
   * getLaboratoryResults() reads directly from
   * laboratory_results.
   *
   * The workspace is the single boundary that decides
   * which rows represent persisted laboratory reports.
   *
   * The Dashboard must therefore NOT perform another
   * independent saved-result filtering step.
   */

  results =
    results.filter(
      isPersistedLaboratoryResult
    );

  if (!results.length) {
    return {
      results: [],

      masterTests: [],

      panelTests: [],

      groups: [],
    };
  }

  const enriched =
    await enrichLaboratoryResults(
      results
    );

  const groups =
    groupLaboratoryResults(
      enriched.results
    );

  return {
    results:
      enriched.results,

    masterTests:
      enriched.masterTests,

    panelTests:
      enriched.panelTests,

    groups,
  };
}

/* ==========================================================
   UPDATE SINGLE RESULT
   ---------------------------------------------------------- */

export async function updateLaboratoryResult(
  resultId,
  payload
) {
  if (!isValidId(resultId)) {
    throw new Error(
      "A valid laboratory result ID is required."
    );
  }

  if (
    !payload ||
    typeof payload !==
      "object"
  ) {
    throw new Error(
      "A valid result payload is required."
    );
  }

  const updatePayload = {
    ...payload,

    updated_at:
      new Date().toISOString(),
  };

  /*
   * ID must NEVER be included in the
   * update payload.
   */

  delete updatePayload.id;

  const {
    data,
    error,
  } = await supabase
    .from(
      "laboratory_results"
    )
    .update(
      updatePayload
    )
    .eq(
      "id",
      Number(resultId)
    )
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to update laboratory result: ${error.message}`
    );
  }

  return data || null;
}

/* ==========================================================
   UPDATE MULTIPLE RESULTS
   ========================================================== */

export async function updateLaboratoryResults(
  updates = []
) {
  if (
    !Array.isArray(
      updates
    ) ||
    !updates.length
  ) {
    return [];
  }

  const saved = [];

  for (
    const item
    of updates
  ) {
    if (
      !isValidId(
        item?.id
      )
    ) {
      continue;
    }

    const payload = {
      ...item,
    };

    delete payload.id;

    const result =
      await updateLaboratoryResult(
        item.id,
        payload
      );

    if (result) {
      saved.push(
        result
      );
    }
  }

  return saved;
}

/* ==========================================================
   RESULT STATUS
   ========================================================== */

export function getResultStatus(
  result
) {
  if (!result) {
    return "Pending";
  }

  if (
    result.result_status
  ) {
    return result.result_status;
  }

  if (
    result.result !==
      null &&
    result.result !==
      undefined &&
    String(
      result.result
    ).trim() !== ""
  ) {
    return "Entered";
  }

  return "Pending";
}

/* ==========================================================
   RESULT COMPLETION
   ========================================================== */

export function isResultComplete(
  result
) {
  if (!result) {
    return false;
  }

  const value =
    result.result;

  if (
    value === null ||
    value === undefined
  ) {
    return false;
  }

  if (
    typeof value ===
      "string"
  ) {
    return (
      value.trim() !== ""
    );
  }

  if (
    typeof value ===
      "number"
  ) {
    return Number.isFinite(
      value
    );
  }

  if (
    typeof value ===
      "boolean"
  ) {
    return true;
  }

  if (
    Array.isArray(value)
  ) {
    return (
      value.length > 0
    );
  }

  if (
    typeof value ===
      "object"
  ) {
    return (
      Object.keys(
        value
      ).length > 0
    );
  }

  return false;
}

/* ==========================================================
   RESULT DIRTY CHECK
   ========================================================== */

export function hasResultValueChanged(
  currentValue,
  originalValue
) {
  return (
    String(
      currentValue ?? ""
    ) !==
    String(
      originalValue ?? ""
    )
  );
}

/* ==========================================================
   RESULT SUMMARY
   ========================================================== */

export function getLaboratoryResultSummary(
  results = []
) {
  const total =
    results.length;

  const completed =
    results.filter(
      isResultComplete
    ).length;

  const pending =
    total -
    completed;

  const entered =
    results.filter(
      (row) =>
        normalizeText(
          row.result_status
        ) ===
        "entered"
    ).length;

  const verified =
    results.filter(
      (row) =>
        normalizeText(
          row.result_status
        ) ===
        "verified"
    ).length;

  const authorized =
    results.filter(
      (row) =>
        normalizeText(
          row.result_status
        ) ===
        "authorized"
    ).length;

  const released =
    results.filter(
      (row) =>
        normalizeText(
          row.result_status
        ) ===
        "released"
    ).length;

  return {
    total,

    completed,

    pending,

    entered,

    verified,

    authorized,

    released,
  };
}

/* ==========================================================
   CREATE LABORATORY RESULTS FROM REGISTRATION
   ----------------------------------------------------------
   PURPOSE:
   - Convert a saved laboratory registration into result
     records ready for LaboratoryResultEntry.jsx.
   - Result Entry searches REGISTRATIONS.
   - This function creates the corresponding
     laboratory_results records.

   NOTE:
   The actual result is intentionally NULL here because this
   function creates the initial Pending result records.
   ========================================================== */

export async function createLaboratoryResultsFromRegistration(
  registration,
  selectedTests = []
) {
  if (!registration) {
    throw new Error(
      "Laboratory registration is required."
    );
  }

  if (
    !Array.isArray(
      selectedTests
    ) ||
    !selectedTests.length
  ) {
    return [];
  }

  const registrationId =
    registration.id;

  const labNumber =
    registration.lab_number ||
    null;

  const patientId =
    registration.patient_id ||
    null;

  const registrationNumber =
    registration.registration_number ||
    null;

  const rows = [];

  for (
    const test
    of selectedTests
  ) {
    if (!test) {
      continue;
    }

    const testId =
      test.id ??
      test.test_id ??
      null;

    const testName =
      test.test_name ||
      test.name ||
      test.test ||
      null;

    if (
      !testName &&
      !testId
    ) {
      continue;
    }

    rows.push({
      registration_id:
        registrationId,

      registration_number:
        registrationNumber,

      patient_id:
        patientId,

      lab_number:
        labNumber,

      test_id:
        isValidId(testId)
          ? Number(testId)
          : null,

      test_name:
        testName,

      test_code:
        test.test_code ||
        test.code ||
        null,

      department:
        test.department ||
        null,

      result:
        null,

      result_numeric:
        null,

      result_status:
        "Pending",
    });
  }

  if (!rows.length) {
    return [];
  }

  /* --------------------------------------------------------
     INSERT RESULT RECORDS
     -------------------------------------------------------- */

  const {
    data,
    error,
  } = await supabase
    .from(
      "laboratory_results"
    )
    .insert(rows)
    .select("*");

  if (error) {
    throw new Error(
      `Failed to create laboratory result records: ${error.message}`
    );
  }

  return data || [];
}

/* ==========================================================
   DEFAULT EXPORT
   ========================================================== */

export default {
  getLaboratoryResults,

  getLaboratoryResultById,

  getLaboratoryResultsByLabNumber,

  getLaboratoryResultsByPatientId,

  getMasterTestsByIds,

  getMasterTestByName,

  getPanelTestsByTestIds,

  getPanelTests,

  resolveLaboratoryResult,

  enrichLaboratoryResults,

  groupLaboratoryResults,

  getLaboratoryResultWorkspace,

  updateLaboratoryResult,

  updateLaboratoryResults,

  getResultStatus,

  isResultComplete,

  hasResultValueChanged,

  getLaboratoryResultSummary,

  createLaboratoryResultsFromRegistration,
};