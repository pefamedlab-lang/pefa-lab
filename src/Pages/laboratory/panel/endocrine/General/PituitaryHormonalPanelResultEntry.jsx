import React from "react";
import EndocrinePanelResultEntry from "../EndocrinePanelResultEntry";
import { PITUITARY } from "../EndocrinePanelRegistry";

export default function PituitaryHormonalPanelResultEntry(props) {
  return (
    <EndocrinePanelResultEntry
      {...props}
      title="Pituitary Hormonal Profile"
      analytes={PITUITARY}
    />
  );
}

export { PITUITARY as ANALYTES };
