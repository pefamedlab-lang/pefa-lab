// =======================================================
// ABDOMINAL ULTRASOUND REPORT
// =======================================================

import {
  buildOrgan,
  finalizeReport,
} from "../reportBuilder";

export function generateAbdominalReport(data = {}) {
  const report = [];

  /* =====================================================
     LIVER
  ===================================================== */

  report.push(
    ...buildOrgan({
      title: "LIVER:",
      subject: "The liver",

      descriptions: [
        data.liver_size &&
          `is ${data.liver_size.toLowerCase()} in size`,

        data.liver_echo &&
          `has ${data.liver_echo.toLowerCase()} echotexture`,

        data.liver_surface &&
          `with a ${data.liver_surface.toLowerCase()} surface`,
      ],

      abnormalities: [
        data.liver_mass === "Present" &&
          "A focal hepatic lesion is demonstrated",

        data.biliary &&
          data.biliary !== "Absent" &&
          `${data.biliary.toLowerCase()} intrahepatic biliary duct dilatation`,
      ],

      normalStatement:
        "No focal hepatic lesion or intrahepatic biliary duct dilatation is demonstrated.",

      notes: data.liver_notes,
    })
  );

  /* =====================================================
     GALL BLADDER
  ===================================================== */

  report.push(
    ...buildOrgan({
      title: "GALL BLADDER:",
      subject: "The gall bladder",

      descriptions: [
        data.gb === "Normal" &&
          "is normal in size with normal wall thickness",

        data.gb === "Contracted" &&
          "is contracted",

        data.gb === "Stone Seen" &&
          "contains multiple echogenic calculi with posterior acoustic shadowing",

        data.gb === "Sludge" &&
          "contains biliary sludge",

        data.gb === "Wall Thickening" &&
          "demonstrates diffuse wall thickening",
      ],

      abnormalities: [
        data.gb_wall === "Thickened" &&
          data.gb !== "Wall Thickening" &&
          "Diffuse gall bladder wall thickening",

        data.gb_fluid === "Present" &&
          "Pericholecystic fluid is demonstrated",

        data.gb_murphy === "Positive" &&
          "Positive sonographic Murphy's sign",
      ],

      normalStatement:
        "No gallstones or other significant gall bladder abnormality is demonstrated.",

      notes: data.gb_notes,
    })
  );

  /* =====================================================
     PANCREAS
  ===================================================== */

  report.push(
    ...buildOrgan({
      title: "PANCREAS:",
      subject: "The pancreas",

      descriptions: [
        data.pancreas === "Normal" &&
          "is normal in size, contour and echotexture",

        data.pancreas === "Bulky" &&
          "is bulky",

        data.pancreas === "Atrophic" &&
          "appears atrophic",

        data.pancreas === "Poorly Visualized" &&
          "is poorly visualized due to overlying bowel gas",

        data.pancreas_echo &&
          data.pancreas_echo !== "Normal" &&
          `has ${data.pancreas_echo.toLowerCase()} echogenicity`,
      ],

      abnormalities: [
        data.pancreatic_duct === "Dilated" &&
          "The pancreatic duct is dilated",

        data.pancreas_mass === "Present" &&
          "A pancreatic mass is demonstrated",
      ],

      normalStatement:
        "No focal pancreatic abnormality is demonstrated.",

      notes: data.pancreas_notes,
    })
  );

  /* =====================================================
     SPLEEN
  ===================================================== */

  report.push(
    ...buildOrgan({
      title: "SPLEEN:",
      subject: "The spleen",

      descriptions: [
        data.spleen === "Normal" &&
          "is normal in size and echotexture",

        data.spleen === "Enlarged" &&
          "is enlarged",

        data.spleen_echo &&
          data.spleen_echo !== "Normal" &&
          `has ${data.spleen_echo.toLowerCase()} echotexture`,
      ],

      abnormalities: [
        data.spleen_mass === "Present" &&
          "A focal splenic lesion is demonstrated",
      ],

      normalStatement:
        "No focal splenic abnormality is demonstrated.",

      notes: data.spleen_notes,
    })
  );

  /* =====================================================
     RIGHT KIDNEY
  ===================================================== */

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
      ],

      abnormalities: [
        data.right_hydro &&
          data.right_hydro !== "Absent" &&
          `${data.right_hydro.toLowerCase()} hydronephrosis`,

        data.right_stone === "Present" &&
          "A renal calculus is demonstrated",

        data.right_mass === "Present" &&
          "A focal renal mass is demonstrated",
      ],

      normalStatement:
        "No hydronephrosis, renal calculus or focal renal mass is demonstrated.",

      notes: data.right_kidney_notes,
    })
  );

  /* =====================================================
     LEFT KIDNEY
  ===================================================== */

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
      ],

      abnormalities: [
        data.left_hydro &&
          data.left_hydro !== "Absent" &&
          `${data.left_hydro.toLowerCase()} hydronephrosis`,

        data.left_stone === "Present" &&
          "A renal calculus is demonstrated",

        data.left_mass === "Present" &&
          "A focal renal mass is demonstrated",
      ],

      normalStatement:
        "No hydronephrosis, renal calculus or focal renal mass is demonstrated.",

      notes: data.left_kidney_notes,
    })
  );

  /* =====================================================
     URINARY BLADDER
  ===================================================== */

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
      ],

      abnormalities: [
        data.bladder_stone === "Present" &&
          "A vesical calculus is demonstrated",

        data.bladder_mass === "Present" &&
          "A urinary bladder mass is demonstrated",
      ],

      normalStatement:
        "No focal urinary bladder abnormality is demonstrated.",

      notes: data.bladder_notes,
    })
  );

  return finalizeReport(report);
}