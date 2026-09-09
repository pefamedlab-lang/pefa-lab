import React from "react";
import ChemistryPanelResultEntry from "./ChemistryPanelResultEntry";

const ANALYTES = [
  { key: "total_protein", name: "Total Protein", unit: "g/dL" },
  { key: "albumin", name: "Albumin", unit: "g/dL" },
  { key: "globulin", name: "Globulin", unit: "g/dL" },
  { key: "albumin_globulin_ratio", name: "Albumin/Globulin Ratio", unit: "ratio" }
];

export default function ProteinProfilePanelResultEntry(props) {
  return <ChemistryPanelResultEntry title="Protein Profile" analytes={ANALYTES} {...props} />;
}

export { ANALYTES };
