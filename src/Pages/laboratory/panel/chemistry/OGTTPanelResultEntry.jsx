/* ==========================================================
   PEFA LAB
   OGTT — ORAL GLUCOSE TOLERANCE TEST
   ----------------------------------------------------------
   PATH:
   src/pages/laboratory/panel/chemistry/
   OGTTPanelResultEntry.jsx

   ARCHITECTURE
   ----------------------------------------------------------
   Dedicated wrapper for the OGTT panel.

   This component does NOT:
      - query testService.js
      - query Supabase directly
      - create laboratory results
      - invent reference ranges
      - invent units
      - calculate flags

   The unified panel parameter service/resolver supplies the
   authoritative parameters and their metadata.

   ChemistryPanelResultEntry owns the common result-entry UI.
   ========================================================== */

import React from "react";

import ChemistryPanelResultEntry
  from "./ChemistryPanelResultEntry";


/* ==========================================================
   PANEL IDENTITY
   ========================================================== */

const PANEL_TITLE =
  "OGTT — Oral Glucose Tolerance Test";


/* ==========================================================
   COMPONENT
   ========================================================== */

export default function OGTTPanelResultEntry(
  props
) {
  return (
    <ChemistryPanelResultEntry
      {...props}
      title={PANEL_TITLE}
      panelName="Oral Glucose Tolerance Test"
    />
  );
}


/* ==========================================================
   PUBLIC CONSTANTS
   ========================================================== */

export {
  PANEL_TITLE,
};