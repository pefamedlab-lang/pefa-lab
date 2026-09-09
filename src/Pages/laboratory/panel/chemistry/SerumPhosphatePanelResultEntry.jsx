import React from "react";
import ChemistryPanelResultEntry from "./ChemistryPanelResultEntry";

const ANALYTES = [
  {
    key: "phosphate",
    name: "Phosphate",
    unit: "mmol/L",
  },
];

export default function SerumPhosphatePanelResultEntry(props) {
  return (
    <ChemistryPanelResultEntry
      title="Serum Phosphate"
      analytes={ANALYTES}
      {...props}
    />
  );
}

export { ANALYTES };