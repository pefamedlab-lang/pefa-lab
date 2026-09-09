import React from "react";

/**
 * Atomic A4 laboratory report page.
 * Panels and special tests are never allowed to flow into the next
 * report block. Single-test groups may be split only when the group
 * itself is longer than one page.
 */
export default function PrintPage({
  children,
  className = "",
  forceBreakBefore = false,
}) {
  return (
    <section
      className={[
        "pefa-print-page",
        forceBreakBefore ? "pefa-print-page--break-before" : "",
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </section>
  );
}
