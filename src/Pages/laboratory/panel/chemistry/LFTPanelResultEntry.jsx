/* ==========================================================
   PEFA LAB
   LFT — LIVER FUNCTION TEST
   ----------------------------------------------------------
   IMPORTANT
   ----------------------------------------------------------
   The DATABASE supplies the panel parameters, units and
   reference ranges. This wrapper does NOT hard-code the list.

   Calculations are performed only when the corresponding
   parameter exists in master_tests.
   ========================================================== */

import React, { useMemo } from "react";
import ChemistryPanelResultEntry from "./ChemistryPanelResultEntry";

const numberValue = (values, keys) => {
  for (const key of keys) {
    const value = values?.[key];
    if (value !== "" && value !== null && value !== undefined) {
      const number = Number(value);
      if (Number.isFinite(number)) return number;
    }
  }

  return null;
};

const hasKey = (values, keys) =>
  keys.some((key) => Object.prototype.hasOwnProperty.call(values || {}, key));

const calculateLFT = (values = {}) => {
  const output = {};

  const totalProtein = numberValue(values, [
    "total_protein",
  ]);

  const albumin = numberValue(values, [
    "albumin",
  ]);

  const totalBilirubin = numberValue(values, [
    "total_bilirubin",
    "bilirubin_total",
  ]);

  const directBilirubin = numberValue(values, [
    "direct_bilirubin",
    "bilirubin_direct",
  ]);

  if (
    totalProtein !== null &&
    albumin !== null &&
    hasKey(values, ["globulin"])
  ) {
    output.globulin = (totalProtein - albumin).toFixed(2);
  }

  const globulin =
    numberValue(values, ["globulin"]) ??
    (totalProtein !== null && albumin !== null
      ? totalProtein - albumin
      : null);

  if (
    totalBilirubin !== null &&
    directBilirubin !== null &&
    hasKey(values, [
      "indirect_bilirubin",
      "bilirubin_indirect",
    ])
  ) {
    const key = hasKey(values, ["indirect_bilirubin"])
      ? "indirect_bilirubin"
      : "bilirubin_indirect";

    output[key] = (
      totalBilirubin - directBilirubin
    ).toFixed(2);
  }

  if (
    albumin !== null &&
    globulin !== null &&
    globulin !== 0 &&
    hasKey(values, [
      "a_g_ratio",
      "ag_ratio",
      "albumin_globulin_ratio",
    ])
  ) {
    const key = hasKey(values, ["a_g_ratio"])
      ? "a_g_ratio"
      : hasKey(values, ["albumin_globulin_ratio"])
      ? "albumin_globulin_ratio"
      : "ag_ratio";

    output[key] = (
      albumin / globulin
    ).toFixed(2);
  }

  return output;
};

export default function LFTPanelResultEntry(props) {
  const calculationEngine = useMemo(
    () => ({ calculate: calculateLFT }),
    []
  );

  return (
    <ChemistryPanelResultEntry
      {...props}
      title="LFT — Liver Function Test"
      panelName="Liver Function Test"
      calculationEngine={calculationEngine}
    />
  );
}
