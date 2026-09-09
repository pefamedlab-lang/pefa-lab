/* ==========================================================
   PEFA ENTERPRISE LIS
   SerumCalciumPanelResultEntry.jsx
   ----------------------------------------------------------
   Canonical Serum Calcium panel form.

   AUTHORITATIVE PANEL PARAMETERS
   --------------------------------
   The panel is defined in master_tests/panelParameterService as:
     - Total Calcium (TCA)
     - Ionized Calcium (ICA)
     - Non-ionized Calcium (NCA)

   This wrapper deliberately does NOT add Albumin, Corrected Calcium,
   or any other calculated analyte. The database panel definition is
   the source of truth.

   Persistence remains in LaboratoryResultEntry.
   ========================================================== */

import React from "react";
import ChemistryPanelResultEntry from "./ChemistryPanelResultEntry";

export default function SerumCalciumPanelResultEntry(props) {
  return (
    <ChemistryPanelResultEntry
      {...props}
      title="Serum Calcium"
      panelName="Serum Calcium"
    />
  );
}
