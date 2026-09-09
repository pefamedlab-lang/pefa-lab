import { supabase } from "../supabase";

/* =========================================================
   LOAD ALL PANELS
   ========================================================= */

export async function getPanels() {
  const { data, error } = await supabase
    .from("master_tests")
    .select("*")
    .eq("is_panel", true)
    .eq("test_type", "Panel")
    .order("test_name", { ascending: true });

  if (error) throw error;

  return data || [];
}

/* =========================================================
   LOAD AVAILABLE INDIVIDUAL TESTS
   ========================================================= */

export async function getAvailableTests() {
  const { data, error } = await supabase
    .from("master_tests")
    .select(`
      id,
      department,
      panel_name,
      test_name,
      test_code,
      test_type,
      result_type,
      result_category,
      unit,
      single_test_price,
      male_range,
      female_range,
      child_range,
      elderly_range,
      reference_value,
      critical_low,
      critical_high,
      options,
      template_type,
      active_status,
      result_template,
      specimen,
      specimen_container,
      turnaround_time,
      methodology,
      instrument,
      decimal_places,
      normal_low,
      normal_high,
      display_order,
      report_group,
      parent_panel,
      is_panel,
      active,
      container
    `)
    .eq("is_panel", false)
    .neq("test_type", "Panel")
    .order("department", { ascending: true })
    .order("test_name", { ascending: true });

  if (error) throw error;

  return data || [];
}

/* =========================================================
   LOAD TESTS INSIDE PANEL
   ========================================================= */

export async function getPanelTests(panelId) {
  if (!panelId) {
    return [];
  }

  const { data, error } = await supabase
    .from("panel_tests")
    .select(`
      id,
      panel_id,
      test_id,
      display_order,
      master_tests!panel_tests_test_id_fkey (
        id,
        department,
        panel_name,
        test_name,
        test_code,
        test_type,
        result_type,
        result_category,
        unit,
        single_test_price,
        male_range,
        female_range,
        child_range,
        elderly_range,
        reference_value,
        critical_low,
        critical_high,
        options,
        template_type,
        active_status,
        result_template,
        specimen,
        specimen_container,
        turnaround_time,
        methodology,
        instrument,
        decimal_places,
        normal_low,
        normal_high,
        display_order,
        report_group,
        parent_panel,
        is_panel,
        active,
        container
      )
    `)
    .eq("panel_id", panelId)
    .order("display_order", {
      ascending: true,
    });

  if (error) {
    console.error(
      "GET PANEL TESTS ERROR:",
      error
    );

    throw error;
  }

  return data || [];
}

/* =========================================================
   CREATE PANEL
   ========================================================= */

export async function createPanel(panel) {
  if (!panel?.test_name?.trim()) {
    throw new Error("Panel name is required.");
  }

  const payload = {
    ...panel,

    test_name: panel.test_name.trim(),

    test_type: "Panel",

    is_panel: true,

    active:
      panel.active !== false,

    active_status:
      panel.active === false
        ? "Inactive"
        : "Active",

    panel_price:
      panel.panel_price === "" ||
      panel.panel_price === null ||
      panel.panel_price === undefined
        ? 0
        : Number(panel.panel_price),

    single_test_price: 0,
  };

  /*
   * Never send database-generated fields.
   */

  delete payload.id;
  delete payload.created_at;

  const {
    data,
    error,
  } = await supabase
    .from("master_tests")
    .insert([payload])
    .select("*")
    .single();

  if (error) {
    console.error(
      "CREATE PANEL ERROR:",
      error
    );

    throw error;
  }

  return data;
}

/* =========================================================
   UPDATE PANEL
   ========================================================= */

export async function updatePanel(
  id,
  panel
) {
  if (!id) {
    throw new Error(
      "Panel ID is required."
    );
  }

  if (!panel?.test_name?.trim()) {
    throw new Error(
      "Panel name is required."
    );
  }

  const payload = {
    ...panel,

    test_name:
      panel.test_name.trim(),

    test_type: "Panel",

    is_panel: true,

    panel_price:
      panel.panel_price === "" ||
      panel.panel_price === null ||
      panel.panel_price === undefined
        ? 0
        : Number(panel.panel_price),

    single_test_price: 0,

    active:
      panel.active !== false,

    active_status:
      panel.active === false
        ? "Inactive"
        : "Active",
  };

  /*
   * Do not update primary key
   * or created_at.
   */

  delete payload.id;
  delete payload.created_at;

  const {
    data,
    error,
  } = await supabase
    .from("master_tests")
    .update(payload)
    .eq("id", id)
    .eq("is_panel", true)
    .select("*")
    .single();

  if (error) {
    console.error(
      "UPDATE PANEL ERROR:",
      error
    );

    throw error;
  }

  return data;
}

/* =========================================================
   DELETE PANEL
   ========================================================= */

export async function deletePanel(id) {
  if (!id) {
    throw new Error(
      "Panel ID is required."
    );
  }

  /*
   * First remove all component tests.
   */

  const {
    error: componentError,
  } = await supabase
    .from("panel_tests")
    .delete()
    .eq("panel_id", id);

  if (componentError) {
    console.error(
      "DELETE PANEL COMPONENTS ERROR:",
      componentError
    );

    throw componentError;
  }

  /*
   * Then remove the panel itself.
   */

  const {
    error,
  } = await supabase
    .from("master_tests")
    .delete()
    .eq("id", id)
    .eq("is_panel", true);

  if (error) {
    console.error(
      "DELETE PANEL ERROR:",
      error
    );

    throw error;
  }

  return true;
}

/* =========================================================
   ADD TEST TO PANEL
   ========================================================= */

export async function addPanelTest(
  panelId,
  testId,
  displayOrder
) {
  if (!panelId || !testId) {
    throw new Error(
      "Panel ID and Test ID are required."
    );
  }

  /*
   * Make sure the panel exists.
   */

  const {
    data: panel,
    error: panelError,
  } = await supabase
    .from("master_tests")
    .select("id")
    .eq("id", panelId)
    .eq("is_panel", true)
    .maybeSingle();

  if (panelError) {
    throw panelError;
  }

  if (!panel) {
    throw new Error(
      "The selected panel does not exist."
    );
  }

  /*
   * Make sure the test exists
   * and is NOT another panel.
   */

  const {
    data: test,
    error: testError,
  } = await supabase
    .from("master_tests")
    .select("id, is_panel, test_type")
    .eq("id", testId)
    .maybeSingle();

  if (testError) {
    throw testError;
  }

  if (!test) {
    throw new Error(
      "The selected test does not exist."
    );
  }

  if (
    test.is_panel === true ||
    test.test_type === "Panel"
  ) {
    throw new Error(
      "A panel cannot be added as a component test."
    );
  }

  /*
   * Check for duplicate.
   */

  const {
    data: existing,
    error: checkError,
  } = await supabase
    .from("panel_tests")
    .select("id")
    .eq("panel_id", panelId)
    .eq("test_id", testId)
    .maybeSingle();

  if (checkError) {
    throw checkError;
  }

  if (existing) {
    throw new Error(
      "This test is already part of the panel."
    );
  }

  /*
   * Determine the next order.
   */

  let nextOrder =
    Number(displayOrder);

  if (
    !Number.isFinite(nextOrder) ||
    nextOrder < 1
  ) {
    const {
      data: lastRow,
      error: lastError,
    } = await supabase
      .from("panel_tests")
      .select("display_order")
      .eq("panel_id", panelId)
      .order("display_order", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (lastError) {
      throw lastError;
    }

    nextOrder =
      Number(
        lastRow?.display_order || 0
      ) + 1;
  }

  /*
   * Insert component.
   */

  const {
    data,
    error,
  } = await supabase
    .from("panel_tests")
    .insert([
      {
        panel_id: panelId,
        test_id: testId,
        display_order: nextOrder,
      },
    ])
    .select("*")
    .single();

  if (error) {
    console.error(
      "ADD PANEL TEST ERROR:",
      error
    );

    throw error;
  }

  return data;
}

/* =========================================================
   REMOVE TEST FROM PANEL
   ========================================================= */

export async function removePanelTest(
  panelId,
  testId
) {
  if (!panelId || !testId) {
    throw new Error(
      "Panel ID and Test ID are required."
    );
  }

  const {
    error,
  } = await supabase
    .from("panel_tests")
    .delete()
    .eq("panel_id", panelId)
    .eq("test_id", testId);

  if (error) {
    console.error(
      "REMOVE PANEL TEST ERROR:",
      error
    );

    throw error;
  }

  /*
   * Re-number remaining components.
   */

  await normalizePanelOrder(
    panelId
  );

  return true;
}

/* =========================================================
   UPDATE SINGLE DISPLAY ORDER
   ========================================================= */

export async function updateDisplayOrder(
  rowId,
  displayOrder
) {
  if (!rowId) {
    throw new Error(
      "Panel test row ID is required."
    );
  }

  const order =
    Number(displayOrder);

  if (
    !Number.isFinite(order) ||
    order < 1
  ) {
    throw new Error(
      "Display order must be a positive number."
    );
  }

  const {
    error,
  } = await supabase
    .from("panel_tests")
    .update({
      display_order: order,
    })
    .eq("id", rowId);

  if (error) {
    throw error;
  }

  return true;
}

/* =========================================================
   UPDATE ENTIRE PANEL ORDER
   ========================================================= */

export async function updatePanelTestOrder(
  panelId,
  orderedTests
) {
  if (!panelId) {
    throw new Error(
      "Panel ID is required."
    );
  }

  if (!Array.isArray(orderedTests)) {
    throw new Error(
      "orderedTests must be an array."
    );
  }

  const updates =
    orderedTests.map(
      (item, index) => {
        if (!item?.test_id) {
          throw new Error(
            "Invalid test in panel order."
          );
        }

        return supabase
          .from("panel_tests")
          .update({
            display_order:
              index + 1,
          })
          .eq(
            "panel_id",
            panelId
          )
          .eq(
            "test_id",
            item.test_id
          );
      }
    );

  const results =
    await Promise.all(updates);

  const failed =
    results.find(
      (result) =>
        result.error
    );

  if (failed) {
    throw failed.error;
  }

  return true;
}

/* =========================================================
   NORMALIZE PANEL ORDER
   ========================================================= */

export async function normalizePanelOrder(
  panelId
) {
  if (!panelId) {
    throw new Error(
      "Panel ID is required."
    );
  }

  const rows =
    await getPanelTests(
      panelId
    );

  const updates =
    rows.map(
      (row, index) =>
        supabase
          .from("panel_tests")
          .update({
            display_order:
              index + 1,
          })
          .eq(
            "id",
            row.id
          )
    );

  if (updates.length === 0) {
    return true;
  }

  const results =
    await Promise.all(
      updates
    );

  const failed =
    results.find(
      (result) =>
        result.error
    );

  if (failed) {
    throw failed.error;
  }

  return true;
}

/* =========================================================
   CLONE PANEL
   ========================================================= */

export async function clonePanel(
  panel,
  tests
) {
  if (!panel?.id) {
    throw new Error(
      "Panel is required."
    );
  }

  /*
   * Copy the panel.
   */

  const panelCopy = {
    ...panel,
  };

  delete panelCopy.id;
  delete panelCopy.created_at;

  panelCopy.test_name =
    `${panel.test_name || "Panel"} Copy`;

  panelCopy.test_code =
    panel.test_code
      ? `${panel.test_code}_COPY`
      : null;

  panelCopy.test_type =
    "Panel";

  panelCopy.is_panel =
    true;

  panelCopy.active =
    true;

  panelCopy.active_status =
    "Active";

  panelCopy.single_test_price =
    0;

  panelCopy.panel_price =
    Number(
      panel.panel_price || 0
    );

  /*
   * Create cloned panel.
   */

  const {
    data: newPanel,
    error,
  } = await supabase
    .from("master_tests")
    .insert([
      panelCopy,
    ])
    .select("*")
    .single();

  if (error) {
    console.error(
      "CLONE PANEL ERROR:",
      error
    );

    throw error;
  }

  /*
   * Copy component tests.
   */

  if (
    Array.isArray(tests) &&
    tests.length > 0
  ) {
    const rows =
      tests.map(
        (item, index) => ({
          panel_id:
            newPanel.id,

          test_id:
            item.test_id,

          display_order:
            index + 1,
        })
      );

    const {
      error: insertError,
    } = await supabase
      .from("panel_tests")
      .insert(rows);

    if (insertError) {
      /*
       * Remove cloned panel
       * if component insertion fails.
       */

      await supabase
        .from("master_tests")
        .delete()
        .eq(
          "id",
          newPanel.id
        );

      throw insertError;
    }
  }

  return newPanel;
}