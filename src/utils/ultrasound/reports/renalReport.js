import {
  buildOrgan,
  finalizeReport,
} from "../reportBuilder";

/* ==========================================================
   RENAL ULTRASOUND REPORT
========================================================== */

export function generateRenalReport(data = {}) {
  const report = [];

  /* ==========================
     RIGHT KIDNEY
  ========================== */

  report.push(
    ...buildOrgan({
      title: "RIGHT KIDNEY:",
      subject: "The right kidney",

      descriptions: [
        data.right_kidney_length &&
          `measures ${data.right_kidney_length} cm in length`,

        data.right_cortex &&
          `has ${data.right_cortex.toLowerCase()} cortical thickness`,

        data.right_cmd &&
          `with ${data.right_cmd.toLowerCase()} corticomedullary differentiation`,
      ].filter(Boolean),

      abnormalities: [
        data.right_hydro &&
          data.right_hydro !== "Absent" &&
          `${data.right_hydro} hydronephrosis is demonstrated`,

        data.right_stone === "Present" &&
          "A right renal calculus is demonstrated",

        data.right_mass === "Present" &&
          "A focal right renal mass is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No hydronephrosis, renal calculus or focal renal lesion is demonstrated.",

      notes: data.right_kidney_notes,
    })
  );

  /* ==========================
     LEFT KIDNEY
  ========================== */

  report.push(
    ...buildOrgan({
      title: "LEFT KIDNEY:",
      subject: "The left kidney",

      descriptions: [
        data.left_kidney_length &&
          `measures ${data.left_kidney_length} cm in length`,

        data.left_cortex &&
          `has ${data.left_cortex.toLowerCase()} cortical thickness`,

        data.left_cmd &&
          `with ${data.left_cmd.toLowerCase()} corticomedullary differentiation`,
      ].filter(Boolean),

      abnormalities: [
        data.left_hydro &&
          data.left_hydro !== "Absent" &&
          `${data.left_hydro} hydronephrosis is demonstrated`,

        data.left_stone === "Present" &&
          "A left renal calculus is demonstrated",

        data.left_mass === "Present" &&
          "A focal left renal mass is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No hydronephrosis, renal calculus or focal renal lesion is demonstrated.",

      notes: data.left_kidney_notes,
    })
  );

  /* ==========================
     URINARY BLADDER
  ========================== */

  report.push(
    ...buildOrgan({
      title: "URINARY BLADDER:",
      subject: "The urinary bladder",

      descriptions: [
        data.bladder_distension &&
          `is ${data.bladder_distension.toLowerCase()}`,

        data.bladder_wall === "Thickened" &&
          "has diffuse wall thickening",

        data.post_void &&
          `has a post-void residual volume of ${data.post_void} ml`,
      ].filter(Boolean),

      abnormalities: [
        data.bladder_stone === "Present" &&
          "A vesical calculus is demonstrated",

        data.bladder_mass === "Present" &&
          "A urinary bladder mass is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No focal urinary bladder abnormality is demonstrated.",

      notes: data.bladder_notes,
    })
  );

  return finalizeReport(report);
}