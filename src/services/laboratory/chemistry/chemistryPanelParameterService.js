
/* ==========================================================
   PEFA LAB
   CHEMISTRY PANEL PARAMETER SERVICE
   ----------------------------------------------------------
   PATH:
   src/services/laboratory/chemistry/chemistryPanelParameterService.js

   DIAGNOSTIC VERSION
   ----------------------------------------------------------
   PURPOSE:
   Trace exactly where chemistry panel parameters are being
   lost before reaching ChemistryPanelResultEntry.

   NO testService.js
   NO invented analytes
   NO invented reference ranges
   ========================================================== */

import { supabase } from "../../../supabase";

/* ==========================================================
   HELPERS
   ========================================================== */

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const clean = (value) =>
  String(value ?? "")
    .trim();

const normalizeName = (value) =>
  clean(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

const firstValue = (...values) => {
  for (const value of values) {
    if (
      value !== null &&
      value !== undefined &&
      clean(value) !== ""
    ) {
      return value;
    }
  }

  return null;
};

const toId = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const n = Number(value);

  return Number.isFinite(n)
    ? n
    : null;
};

/* ==========================================================
   DEBUG LOGGER
   ========================================================== */

const DEBUG_PREFIX =
  "[PEFA CHEMISTRY PANEL DEBUG]";

const debug = (...args) => {
  console.log(
    DEBUG_PREFIX,
    ...args
  );
};

const debugGroup = (
  title,
  callback
) => {
  console.group(
    `${DEBUG_PREFIX} ${title}`
  );

  try {
    callback();
  } finally {
    console.groupEnd();
  }
};

/* ==========================================================
   PANEL NORMALIZATION
   ========================================================== */

const canonicalPanelName = (
  value
) => {
  const name =
    normalizeName(value);

  if (!name) {
    return "";
  }

  if (
    name === "lft" ||
    name.includes(
      "liver function"
    ) ||
    name.includes(
      "liver profile"
    ) ||
    name.includes(
      "liver panel"
    )
  ) {
    return "liver function test";
  }

  if (
    name === "rft" ||
    name.includes(
      "renal function"
    ) ||
    name.includes(
      "renal profile"
    ) ||
    name.includes(
      "renal panel"
    ) ||
    name.includes(
      "kidney function"
    ) ||
    name === "kft"
  ) {
    return "renal function test";
  }

  if (
    name === "flp" ||
    name.includes(
      "lipid profile"
    ) ||
    name.includes(
      "lipid panel"
    ) ||
    name.includes(
      "fasting lipid"
    )
  ) {
    return "lipid profile";
  }

  return name;
};

/* ==========================================================
   PANEL NAME CANDIDATES
   ========================================================== */

const panelNameCandidates = (
  value
) => {
  const original =
    clean(value);

  const canonical =
    canonicalPanelName(
      original
    );

  const candidates = [];

  const add = (value) => {
    const name =
      clean(value);

    if (!name) {
      return;
    }

    const exists =
      candidates.some(
        (item) =>
          normalizeName(item) ===
          normalizeName(name)
      );

    if (!exists) {
      candidates.push(name);
    }
  };

  add(original);

  if (
    canonical ===
    "liver function test"
  ) {
    add(
      "Liver Function Test"
    );
    add(
      "Liver Function Profile"
    );
    add("Liver Profile");
    add("LFT");
  }

  if (
    canonical ===
    "renal function test"
  ) {
    add(
      "Renal Function Test"
    );
    add(
      "Renal Function Profile"
    );
    add("Renal Profile");
    add("RFT");
    add("KFT");
    add(
      "Kidney Function Test"
    );
  }

  if (
    canonical ===
    "lipid profile"
  ) {
    add("Lipid Profile");
    add(
      "Fasting Lipid Profile"
    );
    add("Lipid Panel");
    add("FLP");
  }

  return candidates;
};

/* ==========================================================
   TEST IDENTITY
   ========================================================== */

const getTestName = (
  test
) =>
  firstValue(
    test?.test_name,
    test?.testName,
    test?.name,
    test?.service_name,
    test?.serviceName,
    test?.masterTest?.test_name,
    test?.master_test?.test_name,
    test?.masterTest?.name,
    test?.master_test?.name,
    ""
  );

const getPanelName = (
  test,
  explicitName
) =>
  firstValue(
    explicitName,
    test?.panel_name,
    test?.panelName,
    test?.parent_panel_name,
    test?.parentPanelName,
    test?.panel?.panel_name,
    test?.panel?.test_name,
    test?.masterTest?.panel_name,
    test?.master_test?.panel_name,
    ""
  );

const getPanelId = (
  test
) => {
  const id =
    firstValue(
      test?.panel_id,
      test?.panelId,
      test?.parent_panel_id,
      test?.parentPanelId,
      test?.panel?.id,
      test?.masterTest?.panel_id,
      test?.master_test?.panel_id
    );

  return toId(id);
};

/* ==========================================================
   MASTER TEST UNWRAPPER
   ========================================================== */

const unwrapMaster = (
  row
) => {
  if (!isObject(row)) {
    return null;
  }

  const nested =
    row.master_tests ||
    row.master_test ||
    row.masterTest ||
    null;

  if (isObject(nested)) {
    return {
      ...nested,

      panel_test_id:
        row.panel_test_id ??
        row.id ??
        null,

      panel_id:
        row.panel_id ??
        nested.panel_id ??
        null,

      test_id:
        row.test_id ??
        nested.id ??
        null,

      display_order:
        row.display_order ??
        nested.display_order ??
        null,
    };
  }

  return {
    ...row,

    panel_test_id:
      row.panel_test_id ??
      row.id ??
      null,

    test_id:
      row.test_id ??
      row.id ??
      null,
  };
};

/* ==========================================================
   PARAMETER NAME
   ========================================================== */

const getParameterName = (
  row
) => {
  const source =
    unwrapMaster(row);

  if (!source) {
    return "";
  }

  return clean(
    firstValue(
      source.test_name,
      source.testName,
      source.name,
      source.parameter_name,
      source.parameterName
    )
  );
};

/* ==========================================================
   PARAMETER SUMMARY
   ========================================================== */

const summarizeRows = (
  rows
) =>
  (Array.isArray(rows)
    ? rows
    : []
  ).map(
    (row, index) => {
      const source =
        unwrapMaster(row);

      return {
        index,

        id:
          source?.id ??
          null,

        test_id:
          source?.test_id ??
          null,

        panel_id:
          source?.panel_id ??
          null,

        panel_test_id:
          source?.panel_test_id ??
          null,

        test_name:
          getParameterName(row),

        unit:
          firstValue(
            source?.unit,
            source?.units,
            ""
          ),

        reference_range:
          firstValue(
            source?.reference_range,
            source?.referenceRange,
            source?.normal_range,
            source?.normalRange,
            ""
          ),

        male_range:
          firstValue(
            source?.male_range,
            source?.maleRange,
            ""
          ),

        female_range:
          firstValue(
            source?.female_range,
            source?.femaleRange,
            ""
          ),

        display_order:
          source?.display_order ??
          null,

        panel_name:
          source?.panel_name ??
          "",
      };
    }
  );

/* ==========================================================
   DATABASE SOURCE 1
   ----------------------------------------------------------
   panel_tests
   ========================================================== */

async function loadPanelTests(
  panelId
) {
  debug(
    "STEP 1 — loadPanelTests()",
    {
      panelId,
      type: typeof panelId,
    }
  );

  if (panelId === null) {
    debug(
      "STEP 1 SKIPPED — panelId is null"
    );

    return {
      rows: [],
      error: null,
    };
  }

  const result =
    await supabase
      .from("panel_tests")
      .select(
        "id, panel_id, test_id, display_order"
      )
      .eq(
        "panel_id",
        panelId
      )
      .order(
        "display_order",
        {
          ascending: true,
        }
      );

  debugGroup(
    "STEP 1 RESULT — panel_tests",
    () => {
      console.log(
        "error:",
        result.error
      );

      console.log(
        "row count:",
        result.data?.length ??
          0
      );

      console.table(
        result.data || []
      );
    }
  );

  if (result.error) {
    return {
      rows: [],
      error:
        result.error,
    };
  }

  const relations =
    Array.isArray(
      result.data
    )
      ? result.data
      : [];

  if (
    relations.length === 0
  ) {
    return {
      rows: [],
      error: null,
    };
  }

  const ids = [
    ...new Set(
      relations
        .map(
          (row) =>
            toId(
              row.test_id
            )
        )
        .filter(
          (id) =>
            id !== null
        )
    ),
  ];

  debug(
    "STEP 1 — panel_tests test IDs:",
    ids
  );

  if (ids.length === 0) {
    return {
      rows: [],
      error: null,
    };
  }

  const masterResult =
    await supabase
      .from("master_tests")
      .select("*")
      .in(
        "id",
        ids
      );

  debugGroup(
    "STEP 1B RESULT — master_tests by panel_tests.test_id",
    () => {
      console.log(
        "error:",
        masterResult.error
      );

      console.log(
        "row count:",
        masterResult.data
          ?.length ?? 0
      );

      console.table(
        summarizeRows(
          masterResult.data
        )
      );
    }
  );

  if (
    masterResult.error
  ) {
    return {
      rows: [],
      error:
        masterResult.error,
    };
  }

  const byId =
    new Map(
      (
        masterResult.data ||
        []
      ).map(
        (row) => [
          Number(row.id),
          row,
        ]
      )
    );

  const rows =
    relations
      .map(
        (relation) => ({
          ...relation,

          master_tests:
            byId.get(
              Number(
                relation.test_id
              )
            ) ||
            null,
        })
      )
      .filter(
        (row) =>
          row.master_tests
      );

  debugGroup(
    "STEP 1C — FINAL panel_tests JOIN",
    () => {
      console.log(
        "joined count:",
        rows.length
      );

      console.table(
        summarizeRows(rows)
      );
    }
  );

  return {
    rows,
    error: null,
  };
}

/* ==========================================================
   DATABASE SOURCE 2
   ----------------------------------------------------------
   master_tests.panel_id
   ========================================================== */

async function loadMasterByPanelId(
  panelId
) {
  debug(
    "STEP 2 — loadMasterByPanelId()",
    {
      panelId,
      type: typeof panelId,
    }
  );

  if (panelId === null) {
    debug(
      "STEP 2 SKIPPED — panelId is null"
    );

    return {
      rows: [],
      error: null,
    };
  }

  const result =
    await supabase
      .from("master_tests")
      .select("*")
      .eq(
        "panel_id",
        panelId
      )
      .order(
        "display_order",
        {
          ascending: true,
        }
      );

  debugGroup(
    "STEP 2 RESULT — master_tests.panel_id",
    () => {
      console.log(
        "query panel_id:",
        panelId
      );

      console.log(
        "error:",
        result.error
      );

      console.log(
        "row count:",
        result.data?.length ??
          0
      );

      console.table(
        summarizeRows(
          result.data
        )
      );
    }
  );

  return {
    rows:
      Array.isArray(
        result.data
      )
        ? result.data
        : [],

    error:
      result.error ||
      null,
  };
}

/* ==========================================================
   DATABASE SOURCE 3
   ----------------------------------------------------------
   master_tests.panel_name
   ========================================================== */

async function loadMasterByPanelName(
  panelName
) {
  const candidates =
    panelNameCandidates(
      panelName
    );

  debug(
    "STEP 3 — loadMasterByPanelName()",
    {
      panelName,
      candidates,
    }
  );

  const allRows = [];
  let lastError =
    null;

  for (
    const candidate of candidates
  ) {
    const result =
      await supabase
        .from("master_tests")
        .select("*")
        .ilike(
          "panel_name",
          candidate
        )
        .order(
          "display_order",
          {
            ascending: true,
          }
        );

    debugGroup(
      `STEP 3 RESULT — master_tests.panel_name = "${candidate}"`,
      () => {
        console.log(
          "error:",
          result.error
        );

        console.log(
          "row count:",
          result.data
            ?.length ?? 0
        );

        console.table(
          summarizeRows(
            result.data
          )
        );
      }
    );

    if (result.error) {
      lastError =
        result.error;
      continue;
    }

    if (
      Array.isArray(
        result.data
      )
    ) {
      allRows.push(
        ...result.data
      );
    }
  }

  return {
    rows: allRows,
    error:
      allRows.length > 0
        ? null
        : lastError,
  };
}

/* ==========================================================
   DEDUPLICATION
   ========================================================== */

const mergeParameters = (
  rows
) => {
  const byId =
    new Map();

  const byName =
    new Map();

  (
    Array.isArray(rows)
      ? rows
      : []
  ).forEach(
    (row, index) => {
      const source =
        unwrapMaster(row);

      if (!source) {
        return;
      }

      const name =
        getParameterName(row);

      if (!name) {
        return;
      }

      const normalized =
        normalizeName(name);

      const id =
        toId(
          source.id ??
            source.test_id
        );

      const parameter = {
        ...source,

        id,

        test_id:
          source.test_id ??
          id,

        master_test_id:
          id,

        test_name:
          name,

        testName:
          name,

        name,

        unit:
          firstValue(
            source.unit,
            source.units,
            ""
          ) ?? "",

        reference_range:
          firstValue(
            source.reference_range,
            source.referenceRange,
            source.normal_range,
            source.normalRange,
            ""
          ) ?? "",

        male_range:
          firstValue(
            source.male_range,
            source.maleRange,
            ""
          ) ?? "",

        female_range:
          firstValue(
            source.female_range,
            source.femaleRange,
            ""
          ) ?? "",

        child_range:
          firstValue(
            source.child_range,
            source.childRange,
            ""
          ) ?? "",

        elderly_range:
          firstValue(
            source.elderly_range,
            source.elderlyRange,
            ""
          ) ?? "",

        display_order:
          source.display_order ??
          index,
      };

      /*
       * ID-level merge.
       */
      if (id !== null) {
        const idKey =
          String(id);

        const previous =
          byId.get(
            idKey
          );

        byId.set(
          idKey,
          {
            ...(previous ||
              {}),
            ...parameter,
          }
        );
      }

      /*
       * Name-level merge.
       */
      const previousByName =
        byName.get(
          normalized
        );

      byName.set(
        normalized,
        {
          ...(previousByName ||
            {}),
          ...parameter,
        }
      );
    }
  );

  const output =
    Array.from(
      byName.values()
    );

  return output.sort(
    (a, b) => {
      const ao =
        Number(
          a.display_order
        );

      const bo =
        Number(
          b.display_order
        );

      if (
        Number.isFinite(ao) &&
        Number.isFinite(bo)
      ) {
        return ao - bo;
      }

      if (
        Number.isFinite(ao)
      ) {
        return -1;
      }

      if (
        Number.isFinite(bo)
      ) {
        return 1;
      }

      return String(
        a.test_name
      ).localeCompare(
        String(
          b.test_name
        )
      );
    }
  );
};

/* ==========================================================
   FINAL RESOLVER
   ========================================================== */

export async function getChemistryPanelParameters({
  test = null,
  panelName = "",
  panelId = null,
} = {}) {
  debugGroup(
    "========== CHEMISTRY PANEL RESOLUTION START ==========",
    () => {
      console.log(
        "test object:",
        test
      );

      console.log(
        "explicit panelName:",
        panelName
      );

      console.log(
        "explicit panelId:",
        panelId
      );
    }
  );

  const resolvedPanelName =
    clean(
      getPanelName(
        test,
        panelName
      ) ||
        getTestName(test)
    );

  const resolvedPanelId =
    toId(panelId) ??
    getPanelId(test);

  const canonical =
    canonicalPanelName(
      resolvedPanelName
    );

  debugGroup(
    "RESOLVED PANEL IDENTITY",
    () => {
      console.log({
        resolvedPanelName,
        resolvedPanelId,
        canonical,
        testName:
          getTestName(test),
        originalTest:
          test,
      });
    }
  );

  /*
   * ----------------------------------------------------------
   * LOAD ALL THREE DATABASE SOURCES
   * ----------------------------------------------------------
   */

  /*
   * FAST PATH:
   * Panel-ID sources are authoritative when a panel ID exists.
   * Only query panel_name when the ID-based sources return no
   * usable rows. This removes several unnecessary sequential
   * ilike requests and materially reduces the "Loading chemistry
   * parameters…" delay.
   */
  const [
    panelTests,
    masterByPanelId,
  ] = await Promise.all([
    loadPanelTests(
      resolvedPanelId
    ),
    loadMasterByPanelId(
      resolvedPanelId
    ),
  ]);

  let masterByPanelName = {
    rows: [],
    error: null,
  };

  const idRows =
    [
      ...panelTests.rows,
      ...masterByPanelId.rows,
    ];

  if (
    idRows.length === 0
  ) {
    masterByPanelName =
      await loadMasterByPanelName(
        resolvedPanelName
      );
  }

  /* ========================================================
     SOURCE COUNTS
     ======================================================== */

  debugGroup(
    "========== SOURCE COUNTS ==========",
    () => {
      console.log({
        panelTests:
          panelTests.rows.length,

        masterByPanelId:
          masterByPanelId.rows.length,

        masterByPanelName:
          masterByPanelName.rows.length,
      });
    }
  );

  /* ========================================================
     SOURCE NAMES
     ======================================================== */

  debugGroup(
    "========== SOURCE PARAMETER NAMES ==========",
    () => {
      console.log(
        "panel_tests:",
        panelTests.rows.map(
          getParameterName
        )
      );

      console.log(
        "master_tests.panel_id:",
        masterByPanelId.rows.map(
          getParameterName
        )
      );

      console.log(
        "master_tests.panel_name:",
        masterByPanelName.rows.map(
          getParameterName
        )
      );
    }
  );

  /* ========================================================
     MERGE EVERYTHING
     ======================================================== */

  const combined = [
    ...panelTests.rows,
    ...masterByPanelId.rows,
    ...masterByPanelName.rows,
  ];

  debug(
    "COMBINED RAW ROW COUNT:",
    combined.length
  );

  debugGroup(
    "========== COMBINED RAW PARAMETERS ==========",
    () => {
      console.table(
        summarizeRows(
          combined
        )
      );
    }
  );

  /*
   * Remove parent panel itself.
   */
  const childRows =
    combined.filter(
      (row) => {
        const name =
          normalizeName(
            getParameterName(
              row
            )
          );

        return (
          name &&
          name !==
            canonical
        );
      }
    );

  debug(
    "CHILD ROW COUNT BEFORE DEDUPE:",
    childRows.length
  );

  let finalData =
    mergeParameters(
      childRows
    );

  /*
   * RFT must NOT contain Uric Acid.
   * This filters only the resolved UI parameter list and does
   * not alter the Supabase database or existing result payload.
   */
  if (
    canonical ===
    "renal function test"
  ) {
    finalData =
      finalData.filter(
        (row) => {
          const name =
            normalizeName(
              row.test_name
            );

          return !(
            name === "uric acid" ||
            name === "serum uric acid" ||
            name.includes("uric acid")
          );
        }
      );
  }

  /* ========================================================
     FINAL PARAMETER LIST
     ======================================================== */

  debugGroup(
    "========== FINAL MERGED PARAMETERS ==========",
    () => {
      console.log(
        "FINAL COUNT:",
        finalData.length
      );

      console.table(
        finalData.map(
          (row) => ({
            id:
              row.id,

            test_name:
              row.test_name,

            unit:
              row.unit,

            reference_range:
              row.reference_range,

            male_range:
              row.male_range,

            female_range:
              row.female_range,

            child_range:
              row.child_range,

            elderly_range:
              row.elderly_range,

            panel_id:
              row.panel_id,

            display_order:
              row.display_order,
          })
        )
      );
    }
  );

  /* ========================================================
     FINAL NAME ARRAY
     ======================================================== */

  const finalNames =
    finalData.map(
      (row) =>
        row.test_name
    );

  console.log(
    `${DEBUG_PREFIX} FINAL PARAMETER NAMES:`,
    finalNames
  );

  /* ========================================================
     LFT-SPECIFIC DIAGNOSTIC
     ======================================================== */

  if (
    canonical ===
    "liver function test"
  ) {
    const expectedCandidates =
      [
        "AST",
        "ALT",
        "ALP",
        "GGT",
        "Total Protein",
        "Albumin",
        "Total Bilirubin",
        "Direct Bilirubin",
        "Indirect Bilirubin",
        "Globulin",
        "A/G Ratio",
      ];

    debugGroup(
      "========== LFT DIAGNOSTIC ==========",
      () => {
        console.log(
          "LFT final count:",
          finalData.length
        );

        console.log(
          "LFT final names:",
          finalNames
        );

        console.log(
          "Possible LFT parameters found:"
        );

        expectedCandidates.forEach(
          (expected) => {
            const found =
              finalNames.some(
                (name) =>
                  normalizeName(
                    name
                  ) ===
                  normalizeName(
                    expected
                  )
              );

            console.log(
              `${found ? "FOUND" : "MISSING"} — ${expected}`
            );
          }
        );
      }
    );
  }

  /* ========================================================
     RETURN
     ======================================================== */

  const response = {
    data: finalData,

    parameters:
      finalData,

    panelTests:
      finalData,

    panel_tests:
      finalData,

    error:
      finalData.length > 0
        ? null
        : (
            panelTests.error ||
            masterByPanelId.error ||
            masterByPanelName.error ||
            new Error(
              `No chemistry parameters found for ${resolvedPanelName}.`
            )
          ),
  };

  debugGroup(
    "========== CHEMISTRY PANEL RESOLUTION END ==========",
    () => {
      console.log(
        "RETURNING:",
        response
      );
    }
  );

  return response;
}

/* ==========================================================
   CONVENIENCE FUNCTIONS
   ========================================================== */

export async function getChemistryPanelParametersByName(
  panelName
) {
  return getChemistryPanelParameters({
    panelName,
  });
}

export async function getChemistryPanelParametersById(
  panelId,
  panelName = ""
) {
  return getChemistryPanelParameters({
    panelId,
    panelName,
  });
}

/* ==========================================================
   DEFAULT EXPORT
   ========================================================== */

export default {
  getChemistryPanelParameters,
  getChemistryPanelParametersByName,
  getChemistryPanelParametersById,
};