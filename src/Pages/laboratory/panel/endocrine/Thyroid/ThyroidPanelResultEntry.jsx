import React from "react";
import EndocrinePanelResultEntry from "../EndocrinePanelResultEntry";
import { THYROID } from "../EndocrinePanelRegistry";

export default function ThyroidPanelResultEntry(props) {
  return (
    <EndocrinePanelResultEntry
      {...props}
      title="Thyroid Function Profile"
      analytes={THYROID}
    />
  );
}

export { THYROID as ANALYTES };
