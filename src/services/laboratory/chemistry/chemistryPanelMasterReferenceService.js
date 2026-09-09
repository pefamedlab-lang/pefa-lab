/* ==========================================================
   PEFA LAB
   CHEMISTRY PANEL MASTER-TEST REFERENCE SERVICE
   ----------------------------------------------------------
   PATH:
   src/services/laboratory/chemistry/
   chemistryPanelMasterReferenceService.js

   PURPOSE
   ----------------------------------------------------------
   Directly resolve panel child analytes from:
      panel_tests -> master_tests

   IMPORTANT
   ----------------------------------------------------------
   - Does NOT import testService.js.
   - Does NOT invent reference ranges.
   - master_tests is authoritative for metadata.
   - Supports panel_id, master_test_id, panel_name and
     common panel aliases.
   ========================================================== */

import { supabase } from "../../../supabase";

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

const numericId = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const first = (...values) => {
  for (const value of values) {
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      return value;
    }
  }
  return null;
};

const panelAliases = (name) => {
  const n = normalize(name);
  const aliases = new Set();
  if (n) aliases.add(n);

  if (n === "lft" || n.includes("liver function")) {
    ["lft", "liver function test", "liver function profile", "liver profile"].forEach(x => aliases.add(x));
  }

  if (n === "flp" || n.includes("lipid profile") || n.includes("lipid panel")) {
    ["flp", "lipid profile", "full lipid profile", "complete lipid profile", "lipid panel"].forEach(x => aliases.add(x));
  }

  if (n === "rft" || n.includes("renal function")) {
    ["rft", "renal function test", "renal function profile", "renal profile"].forEach(x => aliases.add(x));
  }

  if (n === "serum electrolytes" || n === "ue" || n === "ues" || n === "eucr" || n === "uecs") {
    ["ue", "ues", "eucr", "uecs", "serum electrolytes", "electrolyte profile", "urea electrolytes", "urea and electrolytes"].forEach(x => aliases.add(x));
  }

  return [...aliases];
};

const normalizeMaster = (row, relation = {}) => {
  const master = row?.master_tests || row?.master_test || row?.masterTest || row || {};

  return {
    ...master,
    panel_test_id: row?.id ?? master.panel_test_id,
    panel_id: row?.panel_id ?? master.panel_id,
    test_id: row?.test_id ?? master.id,
    display_order: row?.display_order ?? master.display_order,
  };
};

async function loadByPanelId(panelId) {
  const id = numericId(panelId);
  if (id === null) return [];

  const related = await supabase
    .from("panel_tests")
    .select(`
      id,
      panel_id,
      test_id,
      display_order,
      master_tests!panel_tests_test_id_fkey(*)
    `)
    .eq("panel_id", id)
    .order("display_order", { ascending: true });

  if (!related.error && Array.isArray(related.data) && related.data.length) {
    return related.data.map(normalizeMaster);
  }

  const rows = await supabase
    .from("panel_tests")
    .select("id, panel_id, test_id, display_order")
    .eq("panel_id", id)
    .order("display_order", { ascending: true });

  if (rows.error || !Array.isArray(rows.data) || !rows.data.length) {
    return [];
  }

  const ids = rows.data
    .map(r => numericId(r.test_id))
    .filter(id => id !== null);

  if (!ids.length) return [];

  const masters = await supabase
    .from("master_tests")
    .select("*")
    .in("id", ids);

  if (masters.error || !Array.isArray(masters.data)) return [];

  const map = new Map(masters.data.map(m => [Number(m.id), m]));

  return rows.data.map(row => ({
    ...row,
    ...(map.get(Number(row.test_id)) || {}),
    master_tests: map.get(Number(row.test_id)) || null,
  }));
}

async function loadByPanelName(panelName) {
  const aliases = panelAliases(panelName);
  if (!aliases.length) return [];

  for (const alias of aliases) {
    const result = await supabase
      .from("master_tests")
      .select("*")
      .ilike("panel_name", alias);

    if (!result.error && Array.isArray(result.data) && result.data.length) {
      const rows = result.data
        .filter(row => normalize(row?.panel_name) === normalize(alias))
        .filter(row => {
          const name = normalize(row?.test_name);
          const panel = normalize(row?.panel_name);
          return name && name !== panel;
        })
        .sort((a, b) => Number(a.display_order || 999999) - Number(b.display_order || 999999));

      if (rows.length) return rows;
    }
  }

  return [];
}

async function loadPanelMaster(id) {
  const numeric = numericId(id);
  if (numeric === null) return null;

  const result = await supabase
    .from("master_tests")
    .select("*")
    .eq("id", numeric)
    .maybeSingle();

  if (result.error || !result.data) return null;

  const row = result.data;
  const isPanel =
    row.is_panel === true ||
    normalize(row.test_type) === "panel" ||
    normalize(row.test_type) === "profile";

  return isPanel ? row : null;
}

export async function loadChemistryPanelParameters({
  test = {},
  panelName = "",
  panelId = null,
} = {}) {
  const suppliedPanelId = first(
    panelId,
    test?.panel_id,
    test?.panelId,
    test?.masterTest?.panel_id,
    test?.master_test?.panel_id
  );

  if (suppliedPanelId !== null && suppliedPanelId !== undefined) {
    const byId = await loadByPanelId(suppliedPanelId);
    if (byId.length) return byId;
  }

  const possibleMasterId = first(
    test?.master_test_id,
    test?.masterTestId,
    test?.masterTest?.id,
    test?.master_test?.id
  );

  if (possibleMasterId !== null && possibleMasterId !== undefined) {
    const master = await loadPanelMaster(possibleMasterId);
    if (master?.id) {
      const byId = await loadByPanelId(master.id);
      if (byId.length) return byId;
    }
  }

  const testId = first(test?.id, test?.test_id, test?.testId);
  if (testId !== null && testId !== undefined) {
    const master = await loadPanelMaster(testId);
    if (master?.id) {
      const byId = await loadByPanelId(master.id);
      if (byId.length) return byId;
    }
  }

  const name = first(
    panelName,
    test?.panel_name,
    test?.panelName,
    test?.masterTest?.panel_name,
    test?.master_test?.panel_name,
    test?.test_name,
    test?.name
  );

  return loadByPanelName(name);
}

export default loadChemistryPanelParameters;
