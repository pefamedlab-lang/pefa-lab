import React from "react";
import ChemistryPanelResultEntry from "./ChemistryPanelResultEntry";

const ANALYTES = [
  {
    key: "ck_mb",
    name: "CK-MB",
    unit: "U/L",
  },
  {
    key: "troponin",
    name: "Troponin",
    unit: "ng/L",
  },
  {
    key: "iron",
    name: "Serum Iron",
    unit: "µmol/L",
  },
  {
    key: "tibc",
    name: "TIBC",
    unit: "µmol/L",
  },
  {
    key: "ferritin",
    name: "Ferritin",
    unit: "ng/mL",
  },
  {
    key: "calcium",
    name: "Calcium",
    unit: "mmol/L",
  },
  {
    key: "magnesium",
    name: "Magnesium",
    unit: "mmol/L",
  },
  {
    key: "phosphate",
    name: "Phosphate",
    unit: "mmol/L",
  },
  {
    key: "uric_acid",
    name: "Uric Acid",
    unit: "mg/dL",
  },
  {
    key: "amylase",
    name: "Amylase",
    unit: "U/L",
  },
  {
    key: "lipase",
    name: "Lipase",
    unit: "U/L",
  },
  {
    key: "d_dimer",
    name: "D-Dimer",
    unit: "mg/L FEU",
  },
];

export default function OtherChemistryPanelsResultEntry(props) {
  return (
    <ChemistryPanelResultEntry
      title="Other Chemistry Panels"
      analytes={ANALYTES}
      {...props}
    />
  );
}

export { ANALYTES };