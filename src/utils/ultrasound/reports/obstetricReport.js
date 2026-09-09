import {
  buildOrgan,
  finalizeReport,
} from "../reportBuilder";

/* ==========================================================
   OBSTETRIC ULTRASOUND REPORT
========================================================== */

export function generateObstetricReport(data = {}) {
  const report = [];

  /* ==========================
     GESTATIONAL SAC
  ========================== */

  report.push(
    ...buildOrgan({
      title: "GESTATIONAL SAC:",
      subject: "The gestational sac",

      descriptions: [
        data.sac_location &&
          `is ${data.sac_location.toLowerCase()}`,

        data.sac_shape &&
          `is ${data.sac_shape.toLowerCase()} in shape`,

        data.gestational_age &&
          `corresponds to ${data.gestational_age}`,

        data.mean_sac_diameter &&
          `with a mean sac diameter of ${data.mean_sac_diameter} mm`,
      ].filter(Boolean),

      abnormalities: [
        data.subchorionic_haematoma === "Present" &&
          "A subchorionic haematoma is demonstrated",

        data.irregular_sac === "Present" &&
          "The gestational sac appears irregular",
      ].filter(Boolean),

      normalStatement:
        "An intrauterine gestational sac is demonstrated.",

      notes: data.gestational_sac_notes,
    })
  );

  /* ==========================
     EMBRYO / FETUS
  ========================== */

  report.push(
    ...buildOrgan({
      title: "FETUS:",
      subject: "The fetus",

      descriptions: [
        data.number_of_fetuses &&
          `${data.number_of_fetuses} fetus${data.number_of_fetuses > 1 ? "es are" : " is"} demonstrated`,

        data.presentation &&
          `is in ${data.presentation.toLowerCase()} presentation`,

        data.lie &&
          `with ${data.lie.toLowerCase()} lie`,

        data.fetal_movements === "Present" &&
          "demonstrates active fetal movements",
      ].filter(Boolean),

      abnormalities: [
        data.fetal_movements === "Absent" &&
          "No fetal movements are demonstrated",
      ].filter(Boolean),

      normalStatement: "",

      notes: data.fetal_notes,
    })
  );

  /* ==========================
     FETAL CARDIAC ACTIVITY
  ========================== */

  report.push(
    ...buildOrgan({
      title: "FETAL HEART:",
      subject: "The fetal heart",

      descriptions: [
        data.fetal_heart === "Present" &&
          "cardiac activity is present",

        data.fetal_heart_rate &&
          `with a heart rate of ${data.fetal_heart_rate} bpm`,
      ].filter(Boolean),

      abnormalities: [
        data.fetal_heart === "Absent" &&
          "No fetal cardiac activity is demonstrated",

        data.fetal_heart_rate &&
          Number(data.fetal_heart_rate) < 110 &&
          `Fetal bradycardia (${data.fetal_heart_rate} bpm)`,

        data.fetal_heart_rate &&
          Number(data.fetal_heart_rate) > 160 &&
          `Fetal tachycardia (${data.fetal_heart_rate} bpm)`,
      ].filter(Boolean),

      normalStatement: "",

      notes: data.fetal_heart_notes,
    })
  );

  /* ==========================
     PLACENTA
  ========================== */

  report.push(
    ...buildOrgan({
      title: "PLACENTA:",
      subject: "The placenta",

      descriptions: [
        data.placenta_site &&
          `is ${data.placenta_site.toLowerCase()}`,

        data.placenta_grade &&
          `is Grade ${data.placenta_grade}`,

        data.placenta_distance &&
          `with its lower edge ${data.placenta_distance} cm from the internal cervical os`,
      ].filter(Boolean),

      abnormalities: [
        data.placenta_previa === "Present" &&
          "Placenta praevia is demonstrated",

        data.placental_abruption === "Present" &&
          "Features are suspicious for placental abruption",
      ].filter(Boolean),

      normalStatement:
        "The placenta appears normal in location and maturity.",

      notes: data.placenta_notes,
    })
  );

  /* ==========================
     AMNIOTIC FLUID
  ========================== */

  report.push(
    ...buildOrgan({
      title: "AMNIOTIC FLUID:",
      subject: "The amniotic fluid",

      descriptions: [
        data.afi &&
          `has an amniotic fluid index (AFI) of ${data.afi} cm`,

        data.liquor &&
          `is ${data.liquor.toLowerCase()}`,
      ].filter(Boolean),

      abnormalities: [
        data.liquor === "Oligohydramnios" &&
          "Oligohydramnios is demonstrated",

        data.liquor === "Polyhydramnios" &&
          "Polyhydramnios is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "Amniotic fluid volume is adequate.",

      notes: data.amniotic_fluid_notes,
    })
  );

  /* ==========================
     CERVIX
  ========================== */

  report.push(
    ...buildOrgan({
      title: "CERVIX:",
      subject: "The cervix",

      descriptions: [
        data.cervical_length &&
          `measures ${data.cervical_length} mm`,

        data.cervix === "Closed" &&
          "is closed",

        data.cervix === "Long and Closed" &&
          "is long and closed",
      ].filter(Boolean),

      abnormalities: [
        data.cervix === "Open" &&
          "The cervical os is open",

        data.cervical_funneling === "Present" &&
          "Cervical funneling is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "The cervix appears normal.",

      notes: data.cervix_notes,
    })
  );

  /* ==========================
     UMBILICAL CORD
  ========================== */

  report.push(
    ...buildOrgan({
      title: "UMBILICAL CORD:",
      subject: "The umbilical cord",

      descriptions: [
        data.cord_vessels &&
          `contains ${data.cord_vessels}`,

        data.cord_insertion &&
          `with ${data.cord_insertion.toLowerCase()} insertion`,
      ].filter(Boolean),

      abnormalities: [
        data.nuchal_cord === "Present" &&
          "A nuchal cord is demonstrated",

        data.true_knot === "Present" &&
          "A true knot of the umbilical cord is demonstrated",

        data.two_vessel_cord === "Present" &&
          "A two-vessel umbilical cord is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "The umbilical cord appears unremarkable.",

      notes: data.cord_notes,
    })
  );

  /* ==========================
     FETAL BIOMETRY
  ========================== */

  report.push(
    ...buildOrgan({
      title: "FETAL BIOMETRY:",
      subject: "Fetal biometry",

      descriptions: [
        data.bpd &&
          `Biparietal diameter (BPD) measures ${data.bpd} mm`,

        data.hc &&
          `Head circumference (HC) measures ${data.hc} mm`,

        data.ac &&
          `Abdominal circumference (AC) measures ${data.ac} mm`,

        data.fl &&
          `Femur length (FL) measures ${data.fl} mm`,
      ].filter(Boolean),

      abnormalities: [],

      normalStatement: "",

      notes: data.biometry_notes,
    })
  );

  /* ==========================
     ESTIMATED FETAL WEIGHT
  ========================== */

  report.push(
    ...buildOrgan({
      title: "ESTIMATED FETAL WEIGHT:",
      subject: "The estimated fetal weight",

      descriptions: [
        data.estimated_weight &&
          `is approximately ${data.estimated_weight} g`,

        data.growth_percentile &&
          `corresponding to the ${data.growth_percentile} percentile`,
      ].filter(Boolean),

      abnormalities: [
        data.growth_restriction === "Present" &&
          "Features are suggestive of fetal growth restriction",

        data.macrosomia === "Present" &&
          "Features are suggestive of fetal macrosomia",
      ].filter(Boolean),

      normalStatement: "",

      notes: data.weight_notes,
    })
  );

  /* ==========================
     FETAL ANATOMY
  ========================== */

  report.push(
    ...buildOrgan({
      title: "FETAL ANATOMY:",
      subject: "The fetal anatomy",

      descriptions: [
        data.anatomy === "Normal" &&
          "appears grossly normal for the stated gestational age",

        data.spine === "Normal" &&
          "The spine appears intact",

        data.cranium === "Normal" &&
          "The cranium appears normal",

        data.heart === "Normal" &&
          "The four-chamber view of the heart is satisfactory",

        data.stomach === "Visualized" &&
          "The stomach bubble is visualized",

        data.kidneys === "Visualized" &&
          "Both kidneys are visualized",

        data.bladder === "Visualized" &&
          "The urinary bladder is visualized",
      ].filter(Boolean),

      abnormalities: [
        data.congenital_anomaly === "Present" &&
          "A congenital fetal anomaly is demonstrated",

        data.soft_marker === "Present" &&
          "A fetal soft marker is demonstrated",
      ].filter(Boolean),

      normalStatement: "",

      notes: data.anatomy_notes,
    })
  );

  /* ==========================
     MATERNAL FINDINGS
  ========================== */

  report.push(
    ...buildOrgan({
      title: "MATERNAL FINDINGS:",
      subject: "Maternal pelvic structures",

      descriptions: [],

      abnormalities: [
        data.fibroid === "Present" &&
          "A uterine fibroid is demonstrated",

        data.ovarian_cyst === "Present" &&
          "An adnexal cyst is demonstrated",

        data.free_fluid === "Present" &&
          "Free fluid is demonstrated within the pelvis",
      ].filter(Boolean),

      normalStatement:
        "No significant maternal pelvic abnormality is demonstrated.",

      notes: data.maternal_notes,
    })
  );

  return finalizeReport(report);

}