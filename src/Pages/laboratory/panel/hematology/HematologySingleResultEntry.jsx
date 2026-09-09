import React from "react";
import QuantitativeSingleResultEntry from "../QuantitativeSingleResultEntry";

export default function HematologySingleResultEntry(props) {
  return (
    <QuantitativeSingleResultEntry
      {...props}
      department="Haematology"
    />
  );
}
