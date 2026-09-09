import React from "react";
import HematologyPanelResultEntry from "./HematologyPanelResultEntry";

export default function IronProfilePanelResultEntry(props) {
  return (
    <HematologyPanelResultEntry
      {...props}
      title={props.title || "Iron Profile"}
      panelName={props.panelName || "Iron Profile"}
    />
  );
}
