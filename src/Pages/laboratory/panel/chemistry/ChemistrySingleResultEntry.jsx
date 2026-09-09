/* ==========================================================
   PEFA ENTERPRISE LIS
   ChemistrySingleResultEntry.jsx
   ----------------------------------------------------------
   Unified quantitative single-test wrapper for Chemistry.

   IMPORTANT
   ----------
   Department/test metadata comes from the authoritative master test
   supplied by LaboratoryResultEntry. This component must not overwrite
   the LIS department with a hard-coded value.

   Persistence remains in LaboratoryResultEntry.
   ========================================================== */

import React from "react";
import QuantitativeSingleResultEntry from "../QuantitativeSingleResultEntry";

export default function ChemistrySingleResultEntry(props) {
  return <QuantitativeSingleResultEntry {...props} />;
}
