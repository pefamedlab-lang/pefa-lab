import React from "react";
import EndocrinePanelResultEntry from "../EndocrinePanelResultEntry";
import { PANCREATIC_ENDOCRINE } from "../EndocrinePanelRegistry";

export default function PancreaticEndocrinePanelResultEntry(props) {
  return (
    <EndocrinePanelResultEntry
      {...props}
      title="Pancreatic Endocrine Profile"
      analytes={PANCREATIC_ENDOCRINE}
    />
  );
}

export { PANCREATIC_ENDOCRINE as ANALYTES };
