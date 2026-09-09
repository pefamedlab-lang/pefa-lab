import React from "react";
import EndocrinePanelResultEntry from "../EndocrinePanelResultEntry";

/*
 * PEFA LAB — TOTAL THYROID FUNCTION TEST
 * Reference metadata is supplied directly so the endocrine
 * engine can flag results even when child master metadata is empty.
 */
const ANALYTES = [
  {
    key: "total_t3",
    name: "Total T3",
    unit: "ng/mL",
    reference_value: "80 - 200",
    reference_range: "80 - 200",
    referenceRanges: [
      { min: 80, max: 200, text: "80 - 200", source: "PEFA thyroid panel" },
    ],
  },
  {
    key: "total_t4",
    name: "Total T4",
    unit: "µg/dL",
    reference_value: "4.5 - 11.7",
    reference_range: "4.5 - 11.7",
    referenceRanges: [
      { min: 4.5, max: 11.7, text: "4.5 - 11.7", source: "PEFA thyroid panel" },
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

export default function TotalTFTPanelResultEntry(props) {
  return (
    <EndocrinePanelResultEntry
      {...props}
      title="Total TFT — Thyroid Function Test"
      analytes={ANALYTES}
    />
  );
}

export { ANALYTES };
