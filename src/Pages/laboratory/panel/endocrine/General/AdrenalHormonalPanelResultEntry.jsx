import React from "react";
import EndocrinePanelResultEntry from "../EndocrinePanelResultEntry";
import { ADRENAL } from "../EndocrinePanelRegistry";

export default function AdrenalHormonalPanelResultEntry(props) {
  return (
    <EndocrinePanelResultEntry
      {...props}
      title="Adrenal Hormonal Panel"
      analytes={ADRENAL}
    />
  );
}
