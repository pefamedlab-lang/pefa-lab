import React from "react";
import EndocrinePanelResultEntry from "../EndocrinePanelResultEntry";
import { FERTILITY } from "../EndocrinePanelRegistry";

export default function FertilityHormonalProfilePanelResultEntry(props) {
  return (
    <EndocrinePanelResultEntry
      {...props}
      title="Fertility Hormonal Profile"
      analytes={FERTILITY}
    />
  );
}

export { FERTILITY as ANALYTES };
