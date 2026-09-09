import React from "react";
import ChemistryPanelResultEntry from "./ChemistryPanelResultEntry";

const ANALYTES = [
  {
    key: "magnesium",
    name: "Magnesium",
    unit: "mmol/L",
  },
];

export default function SerumMagnesiumPanelResultEntry(props) {
  return (
    <ChemistryPanelResultEntry
      title="Serum Magnesium"
      analytes={ANALYTES}
      {...props}
    />
  );
}

export { ANALYTES };