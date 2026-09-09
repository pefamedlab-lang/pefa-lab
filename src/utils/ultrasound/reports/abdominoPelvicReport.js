// =======================================================
// ABDOMINO-PELVIC ULTRASOUND REPORT
// =======================================================
import {
  buildOrgan,
  finalizeReport,
} from "../reportBuilder";

export function generateAbdominoPelvicReport(data = {}) {
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
     COMMON BILE DUCT
  ===================================================== */

  report.push(
    ...buildOrgan({
      title: "COMMON BILE DUCT:",
      subject: "The common bile duct",

      descriptions: [
        data.cbd === "Normal" &&
          "is normal in calibre",

        data.cbd === "Not Well Visualized" &&
          "is not well visualized",
      ],

      abnormalities: [
        data.cbd === "Dilated" &&
          "Common bile duct dilatation",

        data.cbd === "Calculus Seen" &&
          "Choledocholithiasis is demonstrated",

        data.cbd === "Obstructed" &&
          "Features of biliary obstruction",
      ],

      normalStatement:
        "No significant common bile duct abnormality is demonstrated.",

      notes: data.cbdNote,
    })
  );

  /* =====================================================
     PORTAL VEIN
  ===================================================== */

  report.push(
    ...buildOrgan({
      title: "PORTAL VEIN:",
      subject: "The portal vein",

      descriptions: [
        data.portalVein === "Normal" &&
          "is normal in calibre with normal hepatopetal flow",

        data.portalVein === "Not Well Visualized" &&
          "is not well visualized",
      ],

      abnormalities: [
        data.portalVein === "Dilated" &&
          "Portal vein dilatation",

        data.portalVein === "Thrombosis" &&
          "Portal vein thrombosis",

        data.portalVein === "Portal Hypertension" &&
          "Features of portal hypertension",
      ],

      normalStatement:
        "No portal venous abnormality is demonstrated.",

      notes: data.portalVeinNote,
    })
  );

  /* =====================================================
     ABDOMINAL AORTA
  ===================================================== */

  report.push(
    ...buildOrgan({
      title: "ABDOMINAL AORTA:",
      subject: "The abdominal aorta",

      descriptions: [
        data.aorta === "Normal" &&
          "is normal in calibre",

        data.aorta === "Not Well Visualized" &&
          "is not well visualized",
      ],

      abnormalities: [
        data.aorta === "Aneurysm" &&
          "An abdominal aortic aneurysm is demonstrated",

        data.aorta === "Atherosclerotic" &&
          "Atherosclerotic changes are demonstrated",

        data.aorta === "Dilated" &&
          "Mild dilatation of the abdominal aorta",
      ],

      normalStatement:
        "No significant abnormality of the abdominal aorta is demonstrated.",

      notes: data.aortaNote,
    })
  );

  /* =====================================================
     INFERIOR VENA CAVA
  ===================================================== */

  report.push(
    ...buildOrgan({
      title: "INFERIOR VENA CAVA:",
      subject: "The inferior vena cava",

      descriptions: [
        data.ivc === "Normal" &&
          "is normal in calibre",

        data.ivc === "Not Well Visualized" &&
          "is not well visualized",
      ],

      abnormalities: [
        data.ivc === "Dilated" &&
          "A dilated inferior vena cava is demonstrated",

        data.ivc === "Collapsed" &&
          "The inferior vena cava is collapsed",

        data.ivc === "Thrombosis" &&
          "Inferior vena cava thrombosis is demonstrated",
      ],

      normalStatement:
        "No significant abnormality of the inferior vena cava is demonstrated.",

      notes: data.ivcNote,
    })
  );

  /* =====================================================
     STOMACH
  ===================================================== */

  report.push(
    ...buildOrgan({
      title: "STOMACH:",
      subject: "The stomach",

      descriptions: [
        data.stomach === "Normal" &&
          "appears sonographically unremarkable",

        data.stomach === "Not Well Visualized" &&
          "is not well visualized",
      ],

      abnormalities: [
        data.stomach === "Distended" &&
          "Gastric distension is demonstrated",

        data.stomach === "Wall Thickening" &&
          "Diffuse gastric wall thickening is demonstrated",

        data.stomach === "Mass" &&
          "A gastric mass is demonstrated",
      ],

      normalStatement:
        "No significant gastric abnormality is demonstrated.",

      notes: data.stomachNote,
    })
  );

  /* =====================================================
     BOWEL LOOPS
  ===================================================== */

  report.push(
    ...buildOrgan({
      title: "BOWEL LOOPS:",
      subject: "The visualized bowel loops",

      descriptions: [
        data.bowelLoops === "Normal" &&
          "appear normal",

        data.bowelLoops === "Not Well Visualized" &&
          "are not well visualized",
      ],

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
      ],

      normalStatement:
        "No significant bowel abnormality is demonstrated.",

      notes: data.bowelLoopsNote,
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
          "A right renal calculus is demonstrated",

        data.right_mass === "Present" &&
          "A focal right renal mass is demonstrated",
      ],

      normalStatement:
        "No hydronephrosis, renal calculus or focal right renal mass is demonstrated.",

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
          "A left renal calculus is demonstrated",

        data.left_mass === "Present" &&
          "A focal left renal mass is demonstrated",
      ],

      normalStatement:
        "No hydronephrosis, renal calculus or focal left renal mass is demonstrated.",

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

  /* ==========================
     UTERUS
  ========================== */

  report.push(
    ...buildOrgan({
      title: "UTERUS:",
      subject: "The uterus",

      descriptions: [
        data.uterus_position &&
          `is ${data.uterus_position.toLowerCase()}`,

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
          `has ${data.right_ovary.toLowerCase()} appearance`,
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
          `has ${data.left_ovary.toLowerCase()} appearance`,
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
          "Minimal free fluid is demonstrated",

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