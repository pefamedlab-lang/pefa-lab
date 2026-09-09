import React from "react";
import ChemistryPanelResultEntry from "./ChemistryPanelResultEntry";

const ANALYTES = [
  {
    key: "sodium",
    name: "Sodium",
    unit: "mmol/L",
  },
  {
    key: "potassium",
    name: "Potassium",
    unit: "mmol/L",
  },
  {
    key: "chloride",
    name: "Chloride",
    unit: "mmol/L",
  },
  {
    key: "bicarbonate",
    name: "Bicarbonate",
    unit: "mmol/L",
  },
];

export default function SerumElectrolytesPanelResultEntry(props) {
  return (
    <ChemistryPanelResultEntry
      title="Serum Electrolytes"
      analytes={ANALYTES}
      {...props}
    />
  );
}

export { ANALYTES };