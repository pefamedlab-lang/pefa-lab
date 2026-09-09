import {
  buildOrgan,
  finalizeReport,
} from "../reportBuilder";

/* ==========================================================
   THYROID ULTRASOUND REPORT
========================================================== */

export function generateThyroidReport(data = {}) {
  const report = [];

  /* ==========================
     THYROID GLAND
  ========================== */

  report.push(
    ...buildOrgan({
      title: "THYROID GLAND:",
      subject: "The thyroid gland",

      descriptions: [
        data.thyroid_size &&
          `is ${data.thyroid_size.toLowerCase()} in size`,

        data.thyroid_echo &&
          `has ${data.thyroid_echo.toLowerCase()} echotexture`,

        data.thyroid_vascularity &&
          `shows ${data.thyroid_vascularity.toLowerCase()} vascularity`,
      ].filter(Boolean),

      abnormalities: [
        data.goitre === "Present" &&
          "Diffuse enlargement of the thyroid gland is demonstrated",

        data.thyroid_nodule === "Present" &&
          "A thyroid nodule is demonstrated",

        data.multinodular_goitre === "Present" &&
          "Features are consistent with multinodular goitre",

        data.thyroid_cyst === "Present" &&
          "A thyroid cyst is demonstrated",

        data.calcification === "Present" &&
          "Thyroid calcification is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No focal thyroid lesion is demonstrated.",

      notes: data.thyroid_notes,
    })
  );

  /* ==========================
     RIGHT THYROID LOBE
  ========================== */

  report.push(
    ...buildOrgan({
      title: "RIGHT LOBE:",
      subject: "The right thyroid lobe",

      descriptions: [
        data.right_lobe_size &&
          `measures ${data.right_lobe_size}`,

        data.right_lobe_echo &&
          `has ${data.right_lobe_echo.toLowerCase()} echotexture`,
      ].filter(Boolean),

      abnormalities: [
        data.right_nodule === "Present" &&
          "A right thyroid nodule is demonstrated",

        data.right_cyst === "Present" &&
          "A right thyroid cyst is demonstrated",

        data.right_calcification === "Present" &&
          "Calcification is demonstrated within the right lobe",
      ].filter(Boolean),

      normalStatement:
        "No focal right thyroid lobe lesion is demonstrated.",

      notes: data.right_lobe_notes,
    })
  );

  /* ==========================
     LEFT THYROID LOBE
  ========================== */

  report.push(
    ...buildOrgan({
      title: "LEFT LOBE:",
      subject: "The left thyroid lobe",

      descriptions: [
        data.left_lobe_size &&
          `measures ${data.left_lobe_size}`,

        data.left_lobe_echo &&
          `has ${data.left_lobe_echo.toLowerCase()} echotexture`,
      ].filter(Boolean),

      abnormalities: [
        data.left_nodule === "Present" &&
          "A left thyroid nodule is demonstrated",

        data.left_cyst === "Present" &&
          "A left thyroid cyst is demonstrated",

        data.left_calcification === "Present" &&
          "Calcification is demonstrated within the left lobe",
      ].filter(Boolean),

      normalStatement:
        "No focal left thyroid lobe lesion is demonstrated.",

      notes: data.left_lobe_notes,
    })
  );

  /* ==========================
     ISTHMUS
  ========================== */

  report.push(
    ...buildOrgan({
      title: "ISTHMUS:",
      subject: "The thyroid isthmus",

      descriptions: [
        data.isthmus_thickness &&
          `measures ${data.isthmus_thickness} mm`,
      ].filter(Boolean),

      abnormalities: [
        data.isthmus_nodule === "Present" &&
          "An isthmic thyroid nodule is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "The thyroid isthmus is unremarkable.",

      notes: data.isthmus_notes,
    })
  );

  /* ==========================
     CERVICAL LYMPH NODES
  ========================== */

  report.push(
    ...buildOrgan({
      title: "CERVICAL LYMPH NODES:",
      subject: "The cervical lymph nodes",

      descriptions: [],

      abnormalities: [
        data.cervical_nodes === "Enlarged" &&
          "Enlarged cervical lymph nodes are demonstrated",

        data.cervical_nodes === "Reactive" &&
          "Reactive cervical lymph nodes are demonstrated",

        data.cervical_nodes === "Suspicious" &&
          "Suspicious cervical lymphadenopathy is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No cervical lymphadenopathy is demonstrated.",

      notes: data.cervical_node_notes,
    })
  );

  return finalizeReport(report);
}