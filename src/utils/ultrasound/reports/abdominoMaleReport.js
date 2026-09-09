import {
  buildOrgan,
  finalizeReport,
} from "../reportBuilder";

/* ==========================================================
   ABDOMINO-PELVIC (MALE) ULTRASOUND REPORT
========================================================== */

export function generateAbdominoMaleReport(data = {}) {
  const report = [];

  /* ==========================
     LIVER
  ========================== */

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
      ].filter(Boolean),

      abnormalities: [
        data.liver_mass === "Present" &&
          "A focal hepatic lesion is demonstrated",

        data.biliary &&
          data.biliary !== "Absent" &&
          `${data.biliary} intrahepatic biliary duct dilatation`,
      ].filter(Boolean),

      normalStatement:
        "No focal hepatic lesion or intrahepatic biliary duct dilatation is demonstrated.",

      notes: data.liver_notes,
    })
  );

  /* ==========================
     GALL BLADDER
  ========================== */

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
      ].filter(Boolean),

      abnormalities: [
        data.gb_wall === "Thickened" &&
          data.gb !== "Wall Thickening" &&
          "Gall bladder wall thickening",

        data.gb_fluid === "Present" &&
          "Pericholecystic fluid",

        data.gb_murphy === "Positive" &&
          "Positive sonographic Murphy's sign",
      ].filter(Boolean),

      normalStatement:
        "No gallstones or other significant gall bladder abnormality is demonstrated.",

      notes: data.gb_notes,
    })
  );

  /* ==========================
     COMMON BILE DUCT
  ========================== */

  report.push(
    ...buildOrgan({
      title: "COMMON BILE DUCT:",
      subject: "The common bile duct",

      descriptions: [
        data.cbd === "Normal" &&
          "is normal in calibre",

        data.cbd === "Not Well Visualized" &&
          "is not well visualized",
      ].filter(Boolean),

      abnormalities: [
        data.cbd === "Dilated" &&
          "Common bile duct dilatation",

        data.cbd === "Calculus Seen" &&
          "Choledocholithiasis is demonstrated",

        data.cbd === "Obstructed" &&
          "Features of biliary obstruction",
      ].filter(Boolean),

      normalStatement:
        "No abnormality of the common bile duct is demonstrated.",

      notes: data.cbdNote,
    })
  );

  /* ==========================
     PORTAL VEIN
  ========================== */

  report.push(
    ...buildOrgan({
      title: "PORTAL VEIN:",
      subject: "The portal vein",

      descriptions: [
        data.portalVein === "Normal" &&
          "is normal in calibre with normal hepatopetal flow",

        data.portalVein === "Not Well Visualized" &&
          "is not well visualized",
      ].filter(Boolean),

      abnormalities: [
        data.portalVein === "Dilated" &&
          "Portal vein dilatation",

        data.portalVein === "Thrombosis" &&
          "Portal vein thrombosis",

        data.portalVein === "Portal Hypertension" &&
          "Features of portal hypertension",
      ].filter(Boolean),

      normalStatement:
        "No portal venous abnormality is demonstrated.",

      notes: data.portalVeinNote,
    })
  );

  /* ==========================
     ABDOMINAL AORTA
  ========================== */

  report.push(
    ...buildOrgan({
      title: "ABDOMINAL AORTA:",
      subject: "The abdominal aorta",

      descriptions: [
        data.aorta === "Normal" &&
          "is normal in calibre",

        data.aorta === "Not Well Visualized" &&
          "is not well visualized",
      ].filter(Boolean),

      abnormalities: [
        data.aorta === "Aneurysm" &&
          "An abdominal aortic aneurysm is demonstrated",

        data.aorta === "Atherosclerotic" &&
          "Atherosclerotic changes are demonstrated",

        data.aorta === "Dilated" &&
          "Mild dilatation is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No significant abnormality of the abdominal aorta is demonstrated.",

      notes: data.aortaNote,
    })
  );

  /* ==========================
     INFERIOR VENA CAVA
  ========================== */

  report.push(
    ...buildOrgan({
      title: "INFERIOR VENA CAVA:",
      subject: "The inferior vena cava",

      descriptions: [
        data.ivc === "Normal" &&
          "is normal",

        data.ivc === "Not Well Visualized" &&
          "is not well visualized",
      ].filter(Boolean),

      abnormalities: [
        data.ivc === "Dilated" &&
          "Dilated inferior vena cava",

        data.ivc === "Collapsed" &&
          "Collapsed inferior vena cava",

        data.ivc === "Thrombosis" &&
          "Inferior vena cava thrombosis",
      ].filter(Boolean),

      normalStatement:
        "No significant abnormality of the inferior vena cava is demonstrated.",

      notes: data.ivcNote,
    })
  );

  /* ==========================
     STOMACH
  ========================== */

  report.push(
    ...buildOrgan({
      title: "STOMACH:",
      subject: "The stomach",

      descriptions: [
        data.stomach === "Normal" &&
          "appears unremarkable",

        data.stomach === "Not Well Visualized" &&
          "is not well visualized",
      ].filter(Boolean),

      abnormalities: [
        data.stomach === "Distended" &&
          "Gastric distension is demonstrated",

        data.stomach === "Wall Thickening" &&
          "Diffuse gastric wall thickening is demonstrated",

        data.stomach === "Mass" &&
          "A gastric mass is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No significant gastric abnormality is demonstrated.",

      notes: data.stomachNote,
    })
  );

  /* ==========================
     BOWEL LOOPS
  ========================== */

  report.push(
    ...buildOrgan({
      title: "BOWEL LOOPS:",
      subject: "The visualized bowel loops",

      descriptions: [
        data.bowelLoops === "Normal" &&
          "appear normal",

        data.bowelLoops === "Not Well Visualized" &&
          "are not well visualized",
      ].filter(Boolean),

      abnormalities: [
        data.bowelLoops === "Dilated" &&
          "Dilated bowel loops are demonstrated",

        data.bowelLoops === "Thickened" &&
          "Diffuse bowel wall thickening is demonstrated",

        data.bowelLoops === "Reduced Peristalsis" &&
          "Reduced bowel peristalsis",

        data.bowelLoops === "Increased Peristalsis" &&
          "Increased bowel peristalsis",

        data.bowelLoops === "Mass" &&
          "A bowel-related mass is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No significant bowel abnormality is demonstrated.",

      notes: data.bowelLoopsNote,
    })
  );

  /* ==========================
     PANCREAS
  ========================== */

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
      ].filter(Boolean),

      abnormalities: [
        data.pancreatic_duct === "Dilated" &&
          "Dilated pancreatic duct",

        data.pancreas_mass === "Present" &&
          "A pancreatic mass is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No focal pancreatic abnormality is demonstrated.",

      notes: data.pancreas_notes,
    })
  );

  /* ==========================
     SPLEEN
  ========================== */

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
      ].filter(Boolean),

      abnormalities: [
        data.spleen_mass === "Present" &&
          "A focal splenic lesion is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No focal splenic abnormality is demonstrated.",

      notes: data.spleen_notes,
    })
  );

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
          `${data.right_hydro} hydronephrosis`,

        data.right_stone === "Present" &&
          "A renal calculus is demonstrated",

        data.right_mass === "Present" &&
          "A focal renal mass is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No hydronephrosis, renal calculus or focal renal mass is demonstrated.",

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
          `${data.left_hydro} hydronephrosis`,

        data.left_stone === "Present" &&
          "A renal calculus is demonstrated",

        data.left_mass === "Present" &&
          "A focal renal mass is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No hydronephrosis, renal calculus or focal renal mass is demonstrated.",

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
          "Vesical calculus demonstrated",

        data.bladder_mass === "Present" &&
          "Urinary bladder mass demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No focal urinary bladder abnormality is demonstrated.",

      notes: data.bladder_notes,
    })
  );

  /* ==========================
     PROSTATE
  ========================== */

  report.push(
    ...buildOrgan({
      title: "PROSTATE:",
      subject: "The prostate gland",

      descriptions: [
        data.prostate_size &&
          `is ${data.prostate_size.toLowerCase()} in size`,

        data.prostate_volume &&
          `measures approximately ${data.prostate_volume} ml`,

        data.prostate_echo &&
          `has ${data.prostate_echo.toLowerCase()} echotexture`,
      ].filter(Boolean),

      abnormalities: [
        data.prostate_calcification === "Present" &&
          "Prostatic calcifications demonstrated",

        data.prostate_nodule === "Present" &&
          "Prostatic nodule demonstrated",

        data.prostate_bph === "Present" &&
          "Features of benign prostatic enlargement",

        data.prostate_mass === "Present" &&
          "Prostatic mass demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No focal prostatic abnormality is demonstrated.",

      notes: data.prostate_notes,
    })
  );

  /* ==========================
     SEMINAL VESICLES
  ========================== */

  report.push(
    ...buildOrgan({
      title: "SEMINAL VESICLES:",
      subject: "The seminal vesicles",

      descriptions: [
        data.seminal_vesicles === "Normal" &&
          "appear normal",

        data.seminal_vesicles === "Prominent" &&
          "appear prominent",

        data.seminal_vesicles === "Not Well Visualized" &&
          "are not well visualized",
      ].filter(Boolean),

      abnormalities: [
        data.seminal_cyst === "Present" &&
          "Seminal vesicle cyst demonstrated",

        data.seminal_mass === "Present" &&
          "Seminal vesicle mass demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No significant seminal vesicle abnormality is demonstrated.",

      notes: data.seminal_notes,
    })
  );

  /* ==========================
     RECTOVESICAL POUCH
  ========================== */

  report.push(
    ...buildOrgan({
      title: "RECTOVESICAL POUCH:",
      subject: "The rectovesical pouch",

      descriptions: [],

      abnormalities: [
        data.rectovesical_pouch === "Minimal" &&
          "Minimal free fluid demonstrated",

        data.rectovesical_pouch === "Moderate" &&
          "Moderate free fluid demonstrated",

        data.rectovesical_pouch === "Large" &&
          "Large volume free fluid demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No free fluid is demonstrated within the rectovesical pouch.",

      notes: data.rectovesical_notes,
    })
  );

  return finalizeReport(report);
}