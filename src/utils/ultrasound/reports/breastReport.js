import {
  buildOrgan,
  finalizeReport,
} from "../reportBuilder";

/* ==========================================================
   BREAST ULTRASOUND REPORT
========================================================== */

export function generateBreastReport(data = {}) {
  const report = [];

  /* ==========================
     RIGHT BREAST
  ========================== */

  report.push(
    ...buildOrgan({
      title: "RIGHT BREAST:",
      subject: "The right breast",

      descriptions: [
        data.right_breast_echo &&
          `shows ${data.right_breast_echo.toLowerCase()} fibroglandular echotexture`,

        data.right_skin === "Normal" &&
          "with normal skin thickness",

        data.right_nipple === "Normal" &&
          "and a normal nipple-areolar complex",
      ].filter(Boolean),

      abnormalities: [
        data.right_mass === "Present" &&
          "A right breast mass is demonstrated",

        data.right_cyst === "Present" &&
          "A right breast cyst is demonstrated",

        data.right_calcification === "Present" &&
          "Calcifications are demonstrated",

        data.right_duct === "Dilated" &&
          "Dilated ducts are demonstrated",

        data.right_abscess === "Present" &&
          "A right breast abscess is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No focal right breast lesion is demonstrated.",

      notes: data.right_breast_notes,
    })
  );

  /* ==========================
     LEFT BREAST
  ========================== */

  report.push(
    ...buildOrgan({
      title: "LEFT BREAST:",
      subject: "The left breast",

      descriptions: [
        data.left_breast_echo &&
          `shows ${data.left_breast_echo.toLowerCase()} fibroglandular echotexture`,

        data.left_skin === "Normal" &&
          "with normal skin thickness",

        data.left_nipple === "Normal" &&
          "and a normal nipple-areolar complex",
      ].filter(Boolean),

      abnormalities: [
        data.left_mass === "Present" &&
          "A left breast mass is demonstrated",

        data.left_cyst === "Present" &&
          "A left breast cyst is demonstrated",

        data.left_calcification === "Present" &&
          "Calcifications are demonstrated",

        data.left_duct === "Dilated" &&
          "Dilated ducts are demonstrated",

        data.left_abscess === "Present" &&
          "A left breast abscess is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No focal left breast lesion is demonstrated.",

      notes: data.left_breast_notes,
    })
  );

  /* ==========================
     AXILLAE / BILATERAL FINDINGS
  ========================== */

  report.push(
    ...buildOrgan({
      title: "AXILLAE:",
      subject: "The axillary regions",

      descriptions: [
        data.axillary_nodes === "Normal" &&
          "show no enlarged lymph nodes",
      ].filter(Boolean),

      abnormalities: [
        data.right_axillary_node === "Present" &&
          "Enlarged right axillary lymph nodes are demonstrated",

        data.left_axillary_node === "Present" &&
          "Enlarged left axillary lymph nodes are demonstrated",

        data.bilateral_axillary_nodes === "Present" &&
          "Bilateral enlarged axillary lymph nodes are demonstrated",

        data.skin_thickening === "Present" &&
          "Diffuse skin thickening is demonstrated",

        data.subcutaneous_oedema === "Present" &&
          "Subcutaneous oedema is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No axillary lymphadenopathy is demonstrated.",

      notes: data.axillary_notes,
    })
  );

  /* ==========================
     ADDITIONAL FINDINGS
  ========================== */

  report.push(
    ...buildOrgan({
      title: "ADDITIONAL FINDINGS:",
      subject: "The breasts",

      descriptions: [],

      abnormalities: [
        data.implant === "Present" &&
          "Breast implant(s) are noted and appear intact",

        data.implant_rupture === "Present" &&
          "Features are suspicious for implant rupture",

        data.implant_contracture === "Present" &&
          "Capsular contracture is demonstrated",

        data.chest_wall_invasion === "Present" &&
          "Chest wall involvement is demonstrated",

        data.bilateral_mass === "Present" &&
          "Bilateral breast masses are demonstrated",
      ].filter(Boolean),

      normalStatement: "",

      notes: data.additional_notes,
    })
  );

  return finalizeReport(report);

}