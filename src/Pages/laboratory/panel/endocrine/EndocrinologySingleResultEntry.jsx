import React from "react";
import EndocrineSingleResultEntry from "./EndocrineSingleResultEntry";

/**
 * PEFA LAB — Endocrinology Single Result Entry
 *
 * Ordinary endocrine single tests use the shared endocrine
 * quantitative-single interface. Department is supplied by
 * master_tests/resolver metadata; it is not hard-coded here.
 */
export default function EndocrinologySingleResultEntry(props) {
  return <EndocrineSingleResultEntry {...props} />;
}
