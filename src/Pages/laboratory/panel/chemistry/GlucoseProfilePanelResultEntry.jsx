/* ==========================================================
   PEFA LAB
   GLUCOSE PROFILE PANEL RESULT ENTRY
   ----------------------------------------------------------
   PATH:
   src/pages/laboratory/panel/chemistry/
   GlucoseProfilePanelResultEntry.jsx

   ARCHITECTURE
   ----------------------------------------------------------
   This is a dedicated wrapper for the Glucose Profile panel.

   The authoritative analytes/parameters should come from the
   unified panel parameter resolver/service.

   This component does NOT:
      - query testService.js
      - query Supabase directly
      - invent reference ranges
      - invent units
      - calculate laboratory flags

   ChemistryPanelResultEntry owns the common UI/behavior.
   ========================================================== */

import React from "react";

import ChemistryPanelResultEntry
  from "./ChemistryPanelResultEntry";


/* ==========================================================
   PANEL IDENTITY
   ========================================================== */

const PANEL_TITLE =
  "Glucose Profile";


/* ==========================================================
   COMPONENT
   ========================================================== */

export default function GlucoseProfilePanelResultEntry(
  props
) {
  return (
    <ChemistryPanelResultEntry
      {...props}
      title={PANEL_TITLE}
      panelName={PANEL_TITLE}
    />
  );
}


/* ==========================================================
   PUBLIC CONSTANTS
   ========================================================== */

export {
  PANEL_TITLE,
};