/* ==========================================================
   PEFA LAB
   FLP — FASTING / LIPID PROFILE
   ----------------------------------------------------------
   IMPORTANT
   ----------------------------------------------------------
   The DATABASE supplies the panel parameters.
   This wrapper does NOT hard-code the parameter list or units.

   The calculation engine only calculates values for parameters
   that actually exist in master_tests.
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

const safeDivide = (a, b) => {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) {
    return "";
  }
  return (a / b).toFixed(2);
};

const calculateFLP = (values = {}) => {
  const output = {};

  const tc = numberValue(values, [
    "total_cholesterol",
    "cholesterol",
  ]);

  const tg = numberValue(values, [
    "triglycerides",
    "triglyceride",
  ]);

  const hdl = numberValue(values, [
    "hdl",
    "hdl_cholesterol",
  ]);

  const suppliedVldl = numberValue(values, [
    "vldl",
    "vldl_cholesterol",
  ]);

  const vldl =
    suppliedVldl !== null
      ? suppliedVldl
      : tg !== null
      ? tg / 5
      : null;

  if (
    vldl !== null &&
    hasKey(values, ["vldl", "vldl_cholesterol"])
  ) {
    const key = hasKey(values, ["vldl_cholesterol"])
      ? "vldl_cholesterol"
      : "vldl";
    output[key] = vldl.toFixed(2);
  }

  if (
    tc !== null &&
    hdl !== null &&
    vldl !== null &&
    hasKey(values, ["ldl", "ldl_cholesterol"])
  ) {
    const ldl = tc - hdl - vldl;
    const key = hasKey(values, ["ldl_cholesterol"])
      ? "ldl_cholesterol"
      : "ldl";
    output[key] = ldl.toFixed(2);
  }

  if (
    tc !== null &&
    hdl !== null &&
    hasKey(values, ["non_hdl", "non_hdl_cholesterol"])
  ) {
    const key = hasKey(values, ["non_hdl_cholesterol"])
      ? "non_hdl_cholesterol"
      : "non_hdl";
    output[key] = (tc - hdl).toFixed(2);
  }

  if (tc !== null && hdl !== null) {
    const ratio = safeDivide(tc, hdl);
    if (ratio !== "" && hasKey(values, [
      "chol_hdl_ratio",
      "cholesterol_hdl_ratio",
      "cholesterol_hdl_ratio",
    ])) {
      const key = hasKey(values, ["cholesterol_hdl_ratio"])
        ? "cholesterol_hdl_ratio"
        : hasKey(values, ["chol_hdl_ratio"])
        ? "chol_hdl_ratio"
        : "cholesterol_hdl_ratio";
      output[key] = ratio;
    }
  }

  if (tc !== null && hdl !== null && vldl !== null) {
    const ldl = tc - hdl - vldl;

    if (hasKey(values, ["ldl_hdl_ratio", "ldl_hdl_ratio"])) {
      const ratio = safeDivide(ldl, hdl);
      if (ratio !== "") output["ldl_hdl_ratio"] = ratio;
    }
  }

  if (tg !== null && hdl !== null) {
    const ratio = safeDivide(tg, hdl);
    if (ratio !== "" && hasKey(values, [
      "triglycerides_hdl_ratio",
      "tg_hdl_ratio",
    ])) {
      output[
        hasKey(values, ["triglycerides_hdl_ratio"])
          ? "triglycerides_hdl_ratio"
          : "tg_hdl_ratio"
      ] = ratio;
    }
  }

  return output;
};

export default function FLPPanelResultEntry(props) {
  const calculationEngine = useMemo(
    () => ({ calculate: calculateFLP }),
    []
  );

  return (
    <ChemistryPanelResultEntry
      {...props}
      title="FLP — Fasting/Lipid Profile"
      panelName="Lipid Profile"
      calculationEngine={calculationEngine}
    />
  );
}
