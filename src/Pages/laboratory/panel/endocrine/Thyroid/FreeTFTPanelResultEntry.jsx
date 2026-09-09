import React from "react";
import EndocrinePanelResultEntry from "../EndocrinePanelResultEntry";

/*
 * PEFA LAB — FREE THYROID FUNCTION TEST
 * Reference metadata is supplied directly so the endocrine
 * engine can flag results even when child master metadata is empty.
 */
const ANALYTES = [
  {
    key: "free_t3",
    name: "Free T3",
    unit: "pg/mL",
    reference_value: "2.0 - 4.4",
    reference_range: "2.0 - 4.4",
    referenceRanges: [
      { min: 2.0, max: 4.4, text: "2.0 - 4.4", source: "PEFA thyroid panel" },
    ],
  },
  {
    key: "free_t4",
    name: "Free T4",
    unit: "ng/dL",
    reference_value: "0.8 - 1.8",
    reference_range: "0.8 - 1.8",
    referenceRanges: [
      { min: 0.8, max: 1.8, text: "0.8 - 1.8", source: "PEFA thyroid panel" },
    ],
  },
  {
    key: "tsh",
    name: "TSH",
    unit: "µIU/mL",
    reference_value: "0.4 - 4.0",
    reference_range: "0.4 - 4.0",
    referenceRanges: [
      { min: 0.4, max: 4.0, text: "0.4 - 4.0", source: "PEFA thyroid panel" },
    ],
  },
];

export default function FreeTFTPanelResultEntry(props) {
  return (
    <EndocrinePanelResultEntry
      {...props}
      title="Free TFT — Thyroid Function Test"
      analytes={ANALYTES}
    />
  );
}

export { ANALYTES };
