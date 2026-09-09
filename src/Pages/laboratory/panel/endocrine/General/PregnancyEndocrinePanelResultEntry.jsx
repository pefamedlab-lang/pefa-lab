import React from "react";
import EndocrinePanelResultEntry from "../EndocrinePanelResultEntry";
import { PREGNANCY_ENDOCRINE } from "../EndocrinePanelRegistry";

export default function PregnancyEndocrinePanelResultEntry(props) {
  return (
    <EndocrinePanelResultEntry
      {...props}
      title="Pregnancy Endocrine Panel"
      analytes={PREGNANCY_ENDOCRINE}
    />
  );
}
