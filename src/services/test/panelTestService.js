/* ==========================================================
   PEFA LAB
   PANEL TEST SERVICE
   ----------------------------------------------------------
   PURPOSE
   ----------------------------------------------------------
   Database compatibility layer for panel-test relationships.

   This module is intentionally isolated from:

      master_tests
      registered-test normalization
      result enrichment
      panel identity

   It provides safe access to panel_tests and related panel
   records without deciding whether an arbitrary registered
   test is itself a panel.

   IMPORTANT
   ----------------------------------------------------------
   panel_id means:

      "this test belongs to this panel"

   It does NOT automatically mean:

      "this record IS the panel"

   Panel identity is handled by testIdentity.js.
   ========================================================== */

import { supabase } from "../../supabase";


/* ==========================================================
   BASIC HELPERS
   ========================================================== */

function toNumericId(
  value
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number =
    Number(
      value
    );

  return Number.isFinite(
    number
  )
    ? number
    : null;
}


function normalizeText(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(
    value
  ).trim();
}


/* ==========================================================
   NORMALIZE PANEL TEST ROW
   ========================================================== */

function normalizePanelTestRow(
  row
) {
  if (
    !row ||
    typeof row !==
      "object"
  ) {
    return null;
  }

  const id =
    toNumericId(
      row.id
    );

  const panelId =
    toNumericId(
      row.panel_id ??
      row.panelId ??
      row.parent_panel_id ??
      row.parentPanelId
    );

  const testId =
    toNumericId(
      row.test_id ??
      row.testId ??
      row.master_test_id ??
      row.masterTestId
    );

  const displayOrder =
    row.display_order ??
    row.displayOrder ??
    row.sort_order ??
    row.sortOrder ??
    null;

  const testName =
    normalizeText(
      row.test_name ??
      row.testName ??
      row.name
    );

  return {
    ...row,

    id,

    panel_id:
      panelId,

    panelId:
      panelId,

    parent_panel_id:
      panelId,

    parentPanelId:
      panelId,

    test_id:
      testId,

    testId:
      testId,

    test_name:
      testName,

    testName:
      testName,

    display_order:
      displayOrder,

    displayOrder:
      displayOrder,

    is_panel_child:
      true,

    isPanelChild:
      true,

    is_panel:
      false,

    isPanel:
      false,
  };
}


/* ==========================================================
   GET PANEL BY ID
   ----------------------------------------------------------
   Retrieves a panel record from master_tests.

   We deliberately do NOT use panel_id here because a
   panel_id belongs to children.
   ========================================================== */

export async function getPanelById(
  panelId
) {
  const id =
    toNumericId(
      panelId
    );

  if (
    id === null
  ) {
    return {
      data: null,
      error: null,
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "master_tests"
    )
    .select(
      "*"
    )
    .eq(
      "id",
      id
    )
    .maybeSingle();

  if (
    error
  ) {
    console.error(
      "[panelTestService] getPanelById failed:",
      error
    );
  }

  return {
    data:
      data ??
      null,

    error:
      error ??
      null,
  };
}


/* ==========================================================
   GET PANEL TESTS
   ----------------------------------------------------------
   Primary source:

      panel_tests.panel_id
   ========================================================== */

export async function getPanelTests(
  panelId
) {
  const id =
    toNumericId(
      panelId
    );

  if (
    id === null
  ) {
    return {
      data: [],
      error: null,
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "panel_tests"
    )
    .select(
      "*"
    )
    .eq(
      "panel_id",
      id
    )
    .order(
      "display_order",
      {
        ascending:
          true,
      }
    );

  if (
    error
  ) {
    console.error(
      "[panelTestService] getPanelTests failed:",
      error
    );
  }

  return {
    data:
      Array.isArray(
        data
      )
        ? data
            .map(
              normalizePanelTestRow
            )
            .filter(
              Boolean
            )
        : [],

    error:
      error ??
      null,
  };
}


/* ==========================================================
   GET ONE PANEL TEST
   ========================================================== */

export async function getPanelTestById(
  id
) {
  const testId =
    toNumericId(
      id
    );

  if (
    testId === null
  ) {
    return {
      data: null,
      error: null,
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "panel_tests"
    )
    .select(
      "*"
    )
    .eq(
      "id",
      testId
    )
    .maybeSingle();

  if (
    error
  ) {
    console.error(
      "[panelTestService] getPanelTestById failed:",
      error
    );
  }

  return {
    data:
      normalizePanelTestRow(
        data
      ),

    error:
      error ??
      null,
  };
}


/* ==========================================================
   CREATE PANEL TEST
   ----------------------------------------------------------
   Compatibility API.

   Expected input:

   {
     panel_id,
     test_id,
     display_order
   }
   ========================================================== */

export async function createPanelTest(
  panelTest
) {
  if (
    !panelTest ||
    typeof panelTest !==
      "object"
  ) {
    return {
      data: null,
      error: new Error(
        "Panel test data is required."
      ),
    };
  }

  const panelId =
    toNumericId(
      panelTest.panel_id ??
      panelTest.panelId
    );

  const testId =
    toNumericId(
      panelTest.test_id ??
      panelTest.testId ??
      panelTest.master_test_id ??
      panelTest.masterTestId
    );

  if (
    panelId === null
  ) {
    return {
      data: null,
      error: new Error(
        "panel_id is required."
      ),
    };
  }

  if (
    testId === null
  ) {
    return {
      data: null,
      error: new Error(
        "test_id is required."
      ),
    };
  }

  const payload = {
    ...panelTest,

    panel_id:
      panelId,

    test_id:
      testId,

    display_order:
      panelTest.display_order ??
      panelTest.displayOrder ??
      null,
  };

  delete payload.panelId;
  delete payload.testId;
  delete payload.masterTestId;
  delete payload.displayOrder;

  const {
    data,
    error,
  } = await supabase
    .from(
      "panel_tests"
    )
    .insert(
      payload
    )
    .select(
      "*"
    )
    .maybeSingle();

  if (
    error
  ) {
    console.error(
      "[panelTestService] createPanelTest failed:",
      error
    );
  }

  return {
    data:
      normalizePanelTestRow(
        data
      ),

    error:
      error ??
      null,
  };
}


/* ==========================================================
   UPDATE PANEL TEST
   ========================================================== */

export async function updatePanelTest(
  id,
  updates
) {
  const testId =
    toNumericId(
      id
    );

  if (
    testId === null
  ) {
    return {
      data: null,
      error: new Error(
        "Panel test ID is required."
      ),
    };
  }

  if (
    !updates ||
    typeof updates !==
      "object"
  ) {
    return {
      data: null,
      error: new Error(
        "Update data is required."
      ),
    };
  }

  const payload = {
    ...updates,
  };

  /*
   * Normalize known aliases.
   */
  if (
    payload.panelId !==
    undefined &&
    payload.panel_id ===
      undefined
  ) {
    payload.panel_id =
      toNumericId(
        payload.panelId
      );
  }

  if (
    payload.testId !==
    undefined &&
    payload.test_id ===
      undefined
  ) {
    payload.test_id =
      toNumericId(
        payload.testId
      );
  }

  if (
    payload.displayOrder !==
      undefined &&
    payload.display_order ===
      undefined
  ) {
    payload.display_order =
      payload.displayOrder;
  }

  delete payload.panelId;
  delete payload.testId;
  delete payload.masterTestId;
  delete payload.displayOrder;

  const {
    data,
    error,
  } = await supabase
    .from(
      "panel_tests"
    )
    .update(
      payload
    )
    .eq(
      "id",
      testId
    )
    .select(
      "*"
    )
    .maybeSingle();

  if (
    error
  ) {
    console.error(
      "[panelTestService] updatePanelTest failed:",
      error
    );
  }

  return {
    data:
      normalizePanelTestRow(
        data
      ),

    error:
      error ??
      null,
  };
}


/* ==========================================================
   DELETE PANEL TEST
   ========================================================== */

export async function deletePanelTest(
  id
) {
  const testId =
    toNumericId(
      id
    );

  if (
    testId === null
  ) {
    return {
      data: null,
      error: new Error(
        "Panel test ID is required."
      ),
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "panel_tests"
    )
    .delete()
    .eq(
      "id",
      testId
    )
    .select(
      "*"
    )
    .maybeSingle();

  if (
    error
  ) {
    console.error(
      "[panelTestService] deletePanelTest failed:",
      error
    );
  }

  return {
    data:
      normalizePanelTestRow(
        data
      ),

    error:
      error ??
      null,
  };
}


/* ==========================================================
   DEFAULT EXPORT
   ========================================================== */

const panelTestService = {
  getPanelById,
  getPanelTests,
  getPanelTestById,

  createPanelTest,
  updatePanelTest,
  deletePanelTest,
};

export default panelTestService;