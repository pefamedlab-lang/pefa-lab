import {
  buildOrgan,
  finalizeReport,
} from "../reportBuilder";

/* ==========================================================
   FEMALE PELVIC ULTRASOUND REPORT
========================================================== */

export function generatePelvicReport(data = {}) {
  const report = [];

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
          "Urinary bladder calculus demonstrated",

        data.bladder_mass === "Present" &&
          "Urinary bladder mass demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No focal urinary bladder abnormality is demonstrated.",

      notes: data.bladder_notes,
    })
  );

  /* ==========================
     UTERUS
  ========================== */

  report.push(
    ...buildOrgan({
      title: "UTERUS:",
      subject: "The uterus",

      descriptions: [
        data.uterus_position &&
  `is ${data.uterus_position.toLowerCase()} in position`,

        data.uterus_size &&
          `${data.uterus_size.toLowerCase()} in size`,

        data.myometrium &&
          data.myometrium !== "Normal" &&
          `has ${data.myometrium.toLowerCase()} myometrial echotexture`,
      ].filter(Boolean),

      abnormalities: [
        data.fibroid === "Present" &&
          "Uterine fibroids are demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No focal uterine abnormality is demonstrated.",

      notes: data.uterus_notes,
    })
  );

  /* ==========================
     ENDOMETRIUM
  ========================== */

  report.push(
    ...buildOrgan({
      title: "ENDOMETRIUM:",
      subject: "The endometrium",

      descriptions: [
        data.endometrium_thickness &&
          `measures ${data.endometrium_thickness} mm`,

        data.endometrium &&
          `appears ${data.endometrium.toLowerCase()}`,
      ].filter(Boolean),

      abnormalities: [],

      normalStatement: "",

      notes: data.endometrium_notes,
    })
  );

  /* ==========================
     RIGHT OVARY
  ========================== */

  report.push(
    ...buildOrgan({
      title: "RIGHT OVARY:",
      subject: "The right ovary",

      descriptions: [
        data.right_ovary_size &&
          `is ${data.right_ovary_size.toLowerCase()} in size`,

        data.right_ovary &&
          `has a ${data.right_ovary.toLowerCase()} appearance`,
      ].filter(Boolean),

      abnormalities: [
        data.right_ovary_cyst === "Present" &&
          "A right ovarian cyst is demonstrated",

        data.right_ovary_mass === "Present" &&
          "A right ovarian mass is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No focal right ovarian lesion is demonstrated.",

      notes: data.right_ovary_notes,
    })
  );

  /* ==========================
     LEFT OVARY
  ========================== */

  report.push(
    ...buildOrgan({
      title: "LEFT OVARY:",
      subject: "The left ovary",

      descriptions: [
        data.left_ovary_size &&
          `is ${data.left_ovary_size.toLowerCase()} in size`,

        data.left_ovary &&
          `has a ${data.left_ovary.toLowerCase()} appearance`,
      ].filter(Boolean),

      abnormalities: [
        data.left_ovary_cyst === "Present" &&
          "A left ovarian cyst is demonstrated",

        data.left_ovary_mass === "Present" &&
          "A left ovarian mass is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No focal left ovarian lesion is demonstrated.",

      notes: data.left_ovary_notes,
    })
  );

  /* ==========================
     POUCH OF DOUGLAS
  ========================== */

  report.push(
    ...buildOrgan({
      title: "POUCH OF DOUGLAS:",
      subject: "The pouch of Douglas",

      descriptions: [],

      abnormalities: [
        data.pouchOfDouglas === "Minimal" &&
          "Minimal free fluid demonstrated",

        data.pouchOfDouglas === "Moderate" &&
          "Moderate free fluid is demonstrated",

        data.pouchOfDouglas === "Large" &&
          "Large volume free fluid is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No free fluid is demonstrated within the pouch of Douglas.",

      notes: data.pelvic_notes,
    })
  );

  return finalizeReport(report);
}