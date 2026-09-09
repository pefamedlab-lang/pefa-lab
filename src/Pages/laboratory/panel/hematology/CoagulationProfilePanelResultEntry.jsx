import React from "react";
import HematologyPanelResultEntry from "./HematologyPanelResultEntry";

export default function CoagulationProfilePanelResultEntry(props) {
  return (
    <HematologyPanelResultEntry
      {...props}
      title={props.title || "Coagulation Profile"}
      panelName={props.panelName || "Coagulation Profile"}
    />
  );
}
