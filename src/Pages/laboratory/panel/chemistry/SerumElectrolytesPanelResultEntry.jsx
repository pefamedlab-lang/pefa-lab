import React from "react";
import ChemistryPanelResultEntry from "./ChemistryPanelResultEntry";

const ANALYTES = [
  {
    key: "sodium",
    name: "Sodium",
    test_name: "Sodium",
    unit: "mmol/L",
    reference_value: "135 - 145",
    calculated: false,
    readOnly: false,
  },
  {
    key: "potassium",
    name: "Potassium",
    test_name: "Potassium",
    unit: "mmol/L",
    reference_value: "3.5 - 5.1",
    calculated: false,
    readOnly: false,
  },
  {
    key: "chloride",
    name: "Chloride",
    test_name: "Chloride",
    unit: "mmol/L",
    reference_value: "98 - 107",
    calculated: false,
    readOnly: false,
  },
  {
    key: "bicarbonate",
    name: "Bicarbonate",
    test_name: "Bicarbonate",
    unit: "mmol/L",
    reference_value: "22 - 29",
    calculated: false,
    readOnly: false,
  },
];

export default function SerumElectrolytesPanelResultEntry(props) {
  return (
    <ChemistryPanelResultEntry
      title="Serum Electrolytes"
      panelName="Serum Electrolytes"
      analytes={ANALYTES}
      parameters={ANALYTES}
      {...props}
    />
  );
}

export { ANALYTES };
