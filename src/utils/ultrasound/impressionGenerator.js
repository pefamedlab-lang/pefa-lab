/* ===========================================================
   ULTRASOUND IMPRESSION GENERATOR
   Enterprise Radiology Reporting Engine
   Version: Enhanced Clinical Logic
=========================================================== */


/* ===========================================================
   CORE UTILITIES
=========================================================== */

function addUnique(arr, value) {
  if (value && !arr.includes(value)) {
    arr.push(value);
  }
}


function normalImpression(message) {
  return [
    message || "No significant sonographic abnormality detected."
  ];
}


/* ===========================================================
   ABDOMINAL ULTRASOUND
=========================================================== */

export function generateAbdominalImpression(data = {}) {

  const impressions = [];


  /* =====================
     LIVER
  ===================== */

  switch (data.liver_echo) {

    case "Fatty":
      addUnique(impressions, "Fatty liver.");
      break;

    case "Coarse":
      addUnique(
        impressions,
        "Coarse hepatic echotexture suggestive of chronic liver parenchymal disease."
      );
      break;

    case "Heterogeneous":
      addUnique(
        impressions,
        "Heterogeneous hepatic echotexture."
      );
      break;
  }


  if (data.liver_mass === "Present") {
    addUnique(
      impressions,
      "Focal hepatic lesion identified."
    );
  }



  /* =====================
     GALL BLADDER
  ===================== */

  if (data.gb_contents === "Stone") {

    addUnique(
      impressions,
      "Cholelithiasis."
    );

    if (data.gb_wall === "Thickened") {

      addUnique(
        impressions,
        "Features suggestive of acute calculous cholecystitis."
      );

    }
  }


  if (data.gb_contents === "Sludge") {

    addUnique(
      impressions,
      "Gall bladder sludge."
    );

  }


  if (data.cbd === "Dilated") {

    addUnique(
      impressions,
      "Dilated common bile duct."
    );

  }



  /* =====================
     RIGHT KIDNEY
  ===================== */

  if (data.right_stone === "Present") {

    addUnique(
      impressions,
      "Right renal calculus."
    );

  }


  if (
    data.right_hydronephrosis &&
    data.right_hydronephrosis !== "None"
  ) {

    addUnique(
      impressions,
      `Right ${data.right_hydronephrosis.toLowerCase()} hydronephrosis.`
    );

  }


  if (data.right_cyst === "Present") {

    addUnique(
      impressions,
      "Right renal cyst."
    );

  }


  if (data.right_mass === "Present") {

    addUnique(
      impressions,
      "Right renal mass."
    );

  }



  /* =====================
     LEFT KIDNEY
  ===================== */

  if (data.left_stone === "Present") {

    addUnique(
      impressions,
      "Left renal calculus."
    );

  }


  if (
    data.left_hydronephrosis &&
    data.left_hydronephrosis !== "None"
  ) {

    addUnique(
      impressions,
      `Left ${data.left_hydronephrosis.toLowerCase()} hydronephrosis.`
    );

  }


  if (data.left_cyst === "Present") {

    addUnique(
      impressions,
      "Left renal cyst."
    );

  }


  if (data.left_mass === "Present") {

    addUnique(
      impressions,
      "Left renal mass."
    );

  }



  /* =====================
     SPLEEN
  ===================== */

  if (data.spleen === "Enlarged") {

    addUnique(
      impressions,
      "Splenomegaly."
    );

  }


  if (data.spleen === "Focal Lesion") {

    addUnique(
      impressions,
      "Focal splenic lesion."
    );

  }



  return impressions.length
    ? impressions
    : normalImpression();

}


/* ===========================================================
   ABDOMINAL RECOMMENDATION
=========================================================== */

export function generateAbdominalRecommendation(data = {}) {
  return generateRecommendation("abdominal_scan", data);
}


/* ===========================================================
   ABDOMINO-PELVIC ULTRASOUND
=========================================================== */


export function generateAbdominoPelvicImpression(data = {}) {

  const impressions = [];


  /* =====================
     LIVER
  ===================== */

  switch (data.liver) {

    case "Fatty Liver":

      addUnique(
        impressions,
        "Fatty liver."
      );

      break;


    case "Hepatomegaly":

      addUnique(
        impressions,
        "Hepatomegaly."
      );

      break;


    case "Cirrhosis":

      addUnique(
        impressions,
        "Features suggestive of chronic liver disease."
      );

      break;


    case "Mass":

      addUnique(
        impressions,
        "Focal hepatic lesion identified."
      );

      break;

  }




  /* =====================
     GALL BLADDER
  ===================== */


  switch (data.gallBladder) {


    case "Stone":

      addUnique(
        impressions,
        "Cholelithiasis."
      );

      break;


    case "Acute Cholecystitis":

      addUnique(
        impressions,
        "Features suggestive of acute cholecystitis."
      );

      break;


    case "Sludge":

      addUnique(
        impressions,
        "Gall bladder sludge."
      );

      break;

  }




  /* =====================
     CBD
  ===================== */


  if (data.cbd === "Dilated") {

    addUnique(
      impressions,
      "Dilated common bile duct."
    );

  }




  /* =====================
     PANCREAS
  ===================== */


  if (data.pancreas === "Pancreatitis") {

    addUnique(
      impressions,
      "Features suggestive of pancreatitis."
    );

  }


  if (data.pancreas === "Mass") {

    addUnique(
      impressions,
      "Pancreatic mass identified."
    );

  }




  /* =====================
     SPLEEN
  ===================== */


  if (data.spleen === "Splenomegaly") {

    addUnique(
      impressions,
      "Splenomegaly."
    );

  }





  /* =====================
     KIDNEYS
  ===================== */


  if (data.rightKidney === "Stone") {

    addUnique(
      impressions,
      "Right renal calculus."
    );

  }


  if (data.leftKidney === "Stone") {

    addUnique(
      impressions,
      "Left renal calculus."
    );

  }


  if (data.rightKidney === "Hydronephrosis") {

    addUnique(
      impressions,
      "Right hydronephrosis."
    );

  }


  if (data.leftKidney === "Hydronephrosis") {

    addUnique(
      impressions,
      "Left hydronephrosis."
    );

  }


  if (data.rightKidney === "Simple Cyst") {

    addUnique(
      impressions,
      "Right simple renal cyst."
    );

  }


  if (data.leftKidney === "Simple Cyst") {

    addUnique(
      impressions,
      "Left simple renal cyst."
    );

  }





  /* =====================
     URINARY BLADDER
  ===================== */


  if (data.bladder === "Stone") {

    addUnique(
      impressions,
      "Urinary bladder calculus."
    );

  }


  if (data.bladder === "Mass") {

    addUnique(
      impressions,
      "Urinary bladder mass identified."
    );

  }





  /* =====================
     UTERUS
  ===================== */


  switch (data.uterus) {


    case "Fibroid":

      addUnique(
        impressions,
        "Fibroid uterus."
      );

      break;


    case "Bulky":

      addUnique(
        impressions,
        "Bulky uterus."
      );

      break;


    case "Pregnancy":

      addUnique(
        impressions,
        "Gravid uterus."
      );

      break;

  }





  /* =====================
     ENDOMETRIUM
  ===================== */


  if (data.endometrium === "Thickened") {

    addUnique(
      impressions,
      "Thickened endometrium."
    );

  }





  /* =====================
     OVARIES
  ===================== */


  if (data.rightOvary === "Simple Cyst") {

    addUnique(
      impressions,
      "Right ovarian cyst."
    );

  }


  if (data.rightOvary === "Complex Cyst") {

    addUnique(
      impressions,
      "Complex right ovarian cyst."
    );

  }


  if (data.leftOvary === "Simple Cyst") {

    addUnique(
      impressions,
      "Left ovarian cyst."
    );

  }


  if (data.leftOvary === "Complex Cyst") {

    addUnique(
      impressions,
      "Complex left ovarian cyst."
    );

  }





  /* =====================
     POUCH OF DOUGLAS
  ===================== */


  if (data.pouchOfDouglas === "Free Fluid") {

    addUnique(
      impressions,
      "Free fluid in the pouch of Douglas."
    );

  }





  return impressions.length
    ? impressions
    : normalImpression(
        "No significant abdomino-pelvic sonographic abnormality detected."
      );

}

/* ===========================================================
   ABDOMINO-PELVIC RECOMMENDATION
=========================================================== */

export function generateAbdominoPelvicRecommendation(data = {}) {

  const recommendations = [];

  if (
    data.rightKidney === "Stone" ||
    data.leftKidney === "Stone"
  ) {
    addUnique(
      recommendations,
      "Urological review if clinically indicated."
    );
  }

  if (
    data.rightOvary === "Complex Cyst" ||
    data.leftOvary === "Complex Cyst"
  ) {
    addUnique(
      recommendations,
      "Gynaecological review recommended."
    );
  }

  if (data.endometrium === "Thickened") {
    addUnique(
      recommendations,
      "Clinical correlation with menstrual status is advised."
    );
  }

  if (
    data.uterus === "Fibroid"
  ) {
    addUnique(
      recommendations,
      "Gynaecological consultation if symptomatic."
    );
  }

  if (data.pancreas === "Mass") {
    addUnique(
      recommendations,
      "Contrast-enhanced CT/MRI recommended."
    );
  }

  if (data.liver === "Mass") {
    addUnique(
      recommendations,
      "Further liver lesion characterization recommended."
    );
  }

  return recommendations.length
    ? recommendations
    : [
        "No additional imaging recommendation."
      ];

}


/* ===========================================================
   PELVIC ULTRASOUND
=========================================================== */

export function generatePelvicImpression(data = {}) {

  const impressions = [];


  if (data.uterine_fibroid === "Present") {

    addUnique(
      impressions,
      "Uterine fibroid."
    );

  }


  if (data.endometrium === "Thickened") {

    addUnique(
      impressions,
      "Thickened endometrium."
    );

  }


  if (data.right_ovary === "Cyst") {

    addUnique(
      impressions,
      "Right ovarian cyst."
    );

  }


  if (data.left_ovary === "Cyst") {

    addUnique(
      impressions,
      "Left ovarian cyst."
    );

  }


  if (data.pod_fluid === "Present") {

    addUnique(
      impressions,
      "Free fluid in the pouch of Douglas."
    );

  }


  return impressions.length
    ? impressions
    : normalImpression(
        "No significant pelvic sonographic abnormality detected."
      );

}

/* ===========================================================
   PELVIC RECOMMENDATION
=========================================================== */

export function generatePelvicRecommendation(data = {}) {
  return generateRecommendation("pelvic_scan", data);
}



/* ===========================================================
   OBSTETRIC ULTRASOUND
=========================================================== */

export function generateObstetricImpression(data = {}) {
  const impressions = [];

  /* =====================
     FETAL VIABILITY
  ===================== */

  if (data.fetal_heart === "Absent") {
    addUnique(
      impressions,
      "No fetal cardiac activity detected."
    );
  }

  if (data.presentation) {
    addUnique(
      impressions,
      `${data.presentation} presentation.`
    );
  }

  /* =====================
     LIQUOR ASSESSMENT
  ===================== */

  if (data.liquor === "Reduced") {
    addUnique(
      impressions,
      "Oligohydramnios."
    );
  }

  if (data.liquor === "Increased") {
    addUnique(
      impressions,
      "Polyhydramnios."
    );
  }

  /* =====================
     PLACENTA
  ===================== */

  if (data.placenta === "Low Lying") {
    addUnique(
      impressions,
      "Low-lying placenta."
    );
  }

  if (data.placenta === "Previa") {
    addUnique(
      impressions,
      "Placenta previa."
    );
  }

  /* =====================
     FETAL GROWTH
  ===================== */

  if (data.growth === "Small") {
    addUnique(
      impressions,
      "Fetal growth restriction suspected."
    );
  }

  if (data.growth === "Large") {
    addUnique(
      impressions,
      "Large for gestational age fetus."
    );
  }

  return impressions.length
    ? impressions
    : normalImpression(
        "No significant obstetric sonographic abnormality detected."
      );
}

/* ===========================================================
   OBSTETRIC RECOMMENDATION
=========================================================== */

export function generateObstetricRecommendation(data = {}) {
  return generateRecommendation("obs_scan", data);
}




/* ===========================================================
   BREAST ULTRASOUND
=========================================================== */

export function generateBreastImpression(data = {}) {

  const impressions = [];


 if (
  data.breast_mass === "Present"
) {

addUnique(
 impressions,
 "Breast mass identified. BI-RADS assessment recommended."
);

}


  if (data.breast_cyst === "Present") {

    addUnique(
      impressions,
      "Breast cyst."
    );

  }


  if (data.abscess === "Present") {

    addUnique(
      impressions,
      "Breast abscess."
    );

  }



  return impressions.length
    ? impressions
    : normalImpression(
        "No significant breast sonographic abnormality detected."
      );

}


/* ===========================================================
   BREAST RECOMMENDATION
=========================================================== */

export function generateBreastRecommendation(data = {}) {
  return generateRecommendation("breast_scan", data);
}


/* ===========================================================
   THYROID ULTRASOUND
=========================================================== */

export function generateThyroidImpression(data = {}) {

  const impressions = [];


  if (data.goitre === "Present") {

    addUnique(
      impressions,
      "Thyromegaly."
    );

  }


  if (data.nodule === "Present") {

    addUnique(
      impressions,
      "Thyroid nodule identified. TI-RADS assessment recommended."
    );

  }


  if (data.breast_cyst === "Present") {

    addUnique(
      impressions,
      "Thyroid cyst."
    );

  }



  return impressions.length
    ? impressions
    : normalImpression(
        "No significant thyroid sonographic abnormality detected."
      );

}





/* ===========================================================
   PROSTATE ULTRASOUND
=========================================================== */

export function generateProstateImpression(data = {}) {

  const impressions = [];


  if (data.prostate_size === "Enlarged") {

    addUnique(
      impressions,
      "Benign prostatic enlargement (BPH)."
    );

  }


  if (data.residual_urine === "Increased") {

    addUnique(
      impressions,
      "Significant post-void residual urine volume."
    );

  }



  if (data.prostate_nodule === "Present") {

    addUnique(
      impressions,
      "Focal prostatic lesion identified."
    );

  }



  return impressions.length
    ? impressions
    : normalImpression(
        "No significant prostatic sonographic abnormality detected."
      );

}

export function generateProstateRecommendation(data = {}) {
  return generateRecommendation("prostate_scan", data);
}




/* ===========================================================
   SCROTAL ULTRASOUND
=========================================================== */

export function generateScrotalImpression(data = {}) {

  const impressions = [];


  if (data.hydrocele === "Present") {

    addUnique(
      impressions,
      "Hydrocele."
    );

  }


  if (data.varicocele === "Present") {

    addUnique(
      impressions,
      "Varicocele."
    );

  }


  if (data.epididymitis === "Present") {

    addUnique(
      impressions,
      "Features suggestive of epididymitis."
    );

  }


  if (data.orchitis === "Present") {

    addUnique(
      impressions,
      "Features suggestive of orchitis."
    );

  }


  if (data.testicular_mass === "Present") {

    addUnique(
      impressions,
      "Testicular mass identified."
    );

  }



  return impressions.length
    ? impressions
    : normalImpression(
        "No significant scrotal sonographic abnormality detected."
      );

}

/* ===========================================================
   SCROTAL RECOMMENDATION
=========================================================== */

export function generateScrotalRecommendation(data = {}) {
  return generateRecommendation("scrotal_scan", data);
}


/* ===========================================================
   KIDNEY ULTRASOUND
=========================================================== */

export function generateKidneyImpression(data = {}) {

  const impressions = [];


  if (data.right_stone === "Present") {

    addUnique(
      impressions,
      "Right renal calculus."
    );

  }


  if (data.left_stone === "Present") {

    addUnique(
      impressions,
      "Left renal calculus."
    );

  }



  if (
    data.right_hydronephrosis &&
    data.right_hydronephrosis !== "None"
  ) {

    addUnique(
      impressions,
      `Right ${data.right_hydronephrosis.toLowerCase()} hydronephrosis.`
    );

  }



  if (
    data.left_hydronephrosis &&
    data.left_hydronephrosis !== "None"
  ) {

    addUnique(
      impressions,
      `Left ${data.left_hydronephrosis.toLowerCase()} hydronephrosis.`
    );

  }



  if (data.right_cyst === "Present") {

    addUnique(
      impressions,
      "Right renal cyst."
    );

  }


  if (data.left_cyst === "Present") {

    addUnique(
      impressions,
      "Left renal cyst."
    );

  }


  if (data.right_mass === "Present") {

    addUnique(
      impressions,
      "Right renal mass identified."
    );

  }


  if (data.left_mass === "Present") {

    addUnique(
      impressions,
      "Left renal mass identified."
    );

  }



  return impressions.length
    ? impressions
    : normalImpression(
        "No significant renal sonographic abnormality detected."
      );

}





/* ===========================================================
   LIVER ULTRASOUND
=========================================================== */

export function generateLiverImpression(data = {}) {

  const impressions = [];

  if (data.liver_echo === "Fatty") {
    addUnique(impressions, "Fatty liver.");
  }

  if (data.liver_echo === "Coarse") {
    addUnique(
      impressions,
      "Coarse hepatic echotexture suggestive of chronic liver parenchymal disease."
    );
  }

  if (data.liver_mass === "Present") {
    addUnique(
      impressions,
      "Focal hepatic lesion identified."
    );
  }

  return impressions.length
    ? impressions
    : normalImpression(
        "No significant hepatic sonographic abnormality detected."
      );
}

/* ===========================================================
   LIVER RECOMMENDATION
=========================================================== */

export function generateLiverRecommendation(data = {}) {
  return generateRecommendation("liver_scan", data);
}

/* ===========================================================
   SOFT TISSUE ULTRASOUND
=========================================================== */

export function generateSoftTissueImpression(data = {}) {

  const impressions = [];

  if (data.abscess === "Present") {
    addUnique(
      impressions,
      "Soft tissue abscess."
    );
  }

  if (data.collection === "Present") {
    addUnique(
      impressions,
      "Soft tissue fluid collection."
    );
  }

  if (data.mass === "Present") {
    addUnique(
      impressions,
      "Soft tissue mass identified."
    );
  }

  return impressions.length
    ? impressions
    : normalImpression(
        "No significant soft tissue sonographic abnormality detected."
      );
}

/* ===========================================================
   SOFT TISSUE RECOMMENDATION
=========================================================== */

export function generateSoftTissueRecommendation(data = {}) {
  return generateRecommendation("soft_tissue_scan", data);
}


/* ===========================================================
   RECOMMENDATION ENGINE
=========================================================== */

export function generateRecommendation(
  templateType,
  data = {}
) {

  const recommendations = [];



  /* =====================
     HEPATOBILIARY
  ===================== */


  if (data.liver_mass === "Present") {

    addUnique(
      recommendations,
      "Further characterization with contrast-enhanced imaging if clinically indicated."
    );

  }


  if (data.cbd === "Dilated") {

    addUnique(
      recommendations,
      "Clinical correlation and liver function assessment recommended."
    );

  }



  /* =====================
     GALL BLADDER
  ===================== */


  if (
    data.gb_contents === "Stone" &&
    data.gb_wall === "Thickened"
  ) {

    addUnique(
      recommendations,
      "Clinical correlation for acute cholecystitis recommended."
    );

  }



  /* =====================
     RENAL
  ===================== */


  if (
    data.right_stone === "Present" ||
    data.left_stone === "Present"
  ) {

    addUnique(
      recommendations,
      "Urological review if symptomatic or clinically indicated."
    );

  }


  if (
    data.right_mass === "Present" ||
    data.left_mass === "Present"
  ) {

    addUnique(
      recommendations,
      "Further evaluation with contrast-enhanced CT/MRI recommended."
    );

  }



  /* =====================
     GYNAECOLOGY
  ===================== */


  if (
    data.fibroid === "Present" ||
    data.uterine_fibroid === "Present"
  ) {

    addUnique(
      recommendations,
      "Gynaecological review if symptomatic."
    );

  }



  if (data.endometrium === "Thickened") {

    addUnique(
      recommendations,
      "Clinical correlation with menstrual status and symptoms recommended."
    );

  }



  /* =====================
   BREAST
===================== */


if (
  templateType === "breast_scan" &&
  data.mass === "Present"
) {

  addUnique(
    recommendations,
    "Breast imaging assessment according to BI-RADS criteria."
  );

}



  /* =====================
     THYROID
  ===================== */


 if (
 templateType === "thyroid_scan" &&
 data.thyroid_nodule === "Present"
) {

addUnique(
 recommendations,
 "Thyroid nodule evaluation according to TI-RADS criteria."
);

}



  /* =====================
     DEFAULT
  ===================== */


  return recommendations.length
    ? recommendations
    : [
        "No additional imaging recommendation."
      ];

}

/* ===========================================================
   THYROID RECOMMENDATION
=========================================================== */

export function generateThyroidRecommendation(data = {}) {
  return generateRecommendation("thyroid_scan", data);
}



/* ===========================================================
   MASTER ROUTER
=========================================================== */

export function generateImpression(templateType, data = {}) {


  switch (templateType) {


    case "abdominal_scan":

      return generateAbdominalImpression(data);



    case "abdomino_pelvic_scan":

      return generateAbdominoPelvicImpression(data);



    case "pelvic_scan":

      return generatePelvicImpression(data);



  case "obs_scan":
  return generateObstetricImpression(data);



    case "breast_scan":

      return generateBreastImpression(data);



    case "thyroid_scan":

      return generateThyroidImpression(data);



    case "prostate_scan":

      return generateProstateImpression(data);



    case "scrotal_scan":

      return generateScrotalImpression(data);



    case "renal_scan":

      return generateKidneyImpression(data);



    case "liver_scan":

      return generateLiverImpression(data);



    case "soft_tissue_scan":

      return generateSoftTissueImpression(data);



    default:

      return [];

  }

}





/* ===========================================================
   MASTER REPORT OUTPUT
=========================================================== */

export function generateUltrasoundReport(templateType, data = {}) {


  return {

    impression:
      generateImpression(templateType, data),


   recommendation:
      generateRecommendation(
        templateType,
        data
      )

  };

}


/* ===========================================================
   ADVANCED RADIOLOGY CLASSIFICATION ENGINE
=========================================================== */


/* ===========================================================
   SEVERITY ENGINE
=========================================================== */

export function determineSeverity(data = {}) {

  const alerts = [];


  /* =====================
     CRITICAL FINDINGS
  ===================== */


  if (
    data.fetal_heart === "Absent"
  ) {

    alerts.push({
      level: "Critical",
      finding: "Absent fetal cardiac activity detected."
    });

  }



  if (
    data.testicular_torsion === "Present"
  ) {

    alerts.push({
      level: "Critical",
      finding: "Possible testicular torsion."
    });

  }



  if (
    data.free_fluid === "Massive"
  ) {

    alerts.push({
      level: "Urgent",
      finding: "Large volume free fluid detected."
    });

  }



  /* =====================
     URGENT FINDINGS
  ===================== */


  if (
    data.right_mass === "Present" ||
    data.left_mass === "Present"
  ) {

    alerts.push({
      level: "Urgent",
     finding:
"Renal mass detected; further characterization recommended."
    });

  }



  if (
    data.liver_mass === "Present"
  ) {

    alerts.push({
      level: "Urgent",
      finding: "Focal hepatic lesion requires characterization."
    });

  }



  return alerts.length
    ? alerts
    : [
        {
          level: "Routine",
          finding: "No urgent sonographic finding detected."
        }
      ];

}





/* ===========================================================
   BI-RADS BREAST SUPPORT
=========================================================== */

export function generateBreastAssessment(data = {}) {


  if (
 !data.breast_mass &&
 !data.breast_cyst
) {

    return {
      category: "BI-RADS 1",
      recommendation:
        "Routine breast screening/follow-up."
    };

  }



  if (
    data.breast_mass === "Present" &&
    data.mass_character === "Benign"
  ) {

    return {

      category: "BI-RADS 2",

      recommendation:
        "Routine follow-up."

    };

  }



  if (
    data.mass === "Present" &&
    data.mass_character === "Suspicious"
  ) {

    return {

      category: "BI-RADS 4",

      recommendation:
        "Tissue diagnosis recommended."

    };

  }



  return {

    category:
      "BI-RADS assessment incomplete",

    recommendation:
      "Further lesion characterization required."

  };

}





/* ===========================================================
   TI-RADS THYROID SUPPORT
=========================================================== */

export function generateThyroidAssessment(data = {}) {


  if (
    data.nodule !== "Present"
  ) {

    return {

      category:
        "No thyroid nodule",

      recommendation:
        "No further thyroid imaging required."

    };

  }



  if (
    data.nodule_risk === "High"
  ) {

    return {

      category:
        "TI-RADS high suspicion",

      recommendation:
        "Fine needle aspiration recommended according to size criteria."

    };

  }



  if (
    data.nodule_risk === "Low"
  ) {

    return {

      category:
        "TI-RADS low suspicion",

      recommendation:
        "Interval ultrasound follow-up."

    };

  }



  return {

    category:
      "TI-RADS assessment required",

    recommendation:
      "Apply TI-RADS scoring."

  };

}





/* ===========================================================
   O-RADS OVARY SUPPORT
=========================================================== */

export function generateOvaryAssessment(data = {}) {


 if (
 !data.ovarian_lesion
) {

    return {

      category:
        "O-RADS 1",

      recommendation:
        "No suspicious ovarian lesion."

    };

  }



  if (
    data.ovarian_lesion === "Simple Cyst"
  ) {

    return {

      category:
        "O-RADS 2",

      recommendation:
        "Benign appearing cyst."

    };

  }



  if (
   data.ovarian_lesion === "Complex"
  ) {

    return {

      category:
        "O-RADS 4/5 consideration",

      recommendation:
        "Gynaecological evaluation recommended."

    };

  }



  return {

    category:
      "O-RADS assessment incomplete",

    recommendation:
      "Further characterization required."

  };

}





/* ===========================================================
   LI-RADS LIVER SUPPORT
=========================================================== */

export function generateLiverAssessment(data = {}) {


  if (
    data.liver_mass !== "Present"
  ) {

    return {

      category:
        "No focal liver lesion",

      recommendation:
        "Routine follow-up if clinically indicated."

    };

  }



  return {

    category:
      "LI-RADS assessment required",

    recommendation:
      "Contrast-enhanced liver imaging recommended."

  };

}





/* ===========================================================
   OBSTETRIC VALIDATION
=========================================================== */

export function validateObstetricData(data = {}) {


  const warnings = [];



  if (
    data.gestation_age &&
    data.gestation_age < 28 &&
    data.presentation
  ) {

    warnings.push(
      "Fetal presentation interpretation should be correlated with gestational age."
    );

  }



  if (
    data.liquor === "Reduced"
  ) {

    warnings.push(
      "Assess fetal growth and placental function."
    );

  }



  return warnings;

}

/* ===========================================================
   COMPLETE ULTRASOUND REPORT COMPOSER
   Enterprise RIS/PACS Compatible Output Layer
=========================================================== */


/* ===========================================================
   REPORT CLASSIFICATION ROUTER
=========================================================== */

export function generateClassification(
  templateType,
  data = {}
) {

  const classification = {};



  switch (templateType) {


    /* =====================
       BREAST
    ===================== */

    case "breast_scan":

      classification.breast =
        generateBreastAssessment(data);

      break;



    /* =====================
       THYROID
    ===================== */

    case "thyroid_scan":

      classification.thyroid =
        generateThyroidAssessment(data);

      break;



    /* =====================
       PELVIC / OVARY
    ===================== */

    case "pelvic_scan":

  classification.ovary =
    generateOvaryAssessment(data);

break;



    /* =====================
       LIVER
    ===================== */

   case "liver_scan":

case "abdominal_scan":

case "abdomino_pelvic_scan":

  classification.liver =
    generateLiverAssessment(data);

break;


  }


  return classification;

}





/* ===========================================================
   REPORT VALIDATION ENGINE
=========================================================== */

export function validateUltrasoundReport(
  templateType,
  data = {}
) {

  const warnings = [];



  /* =====================
     GENERAL DATA CHECK
  ===================== */


  if (!templateType) {

    warnings.push(
      "Missing ultrasound template type."
    );

  }



  if (
    typeof data !== "object"
  ) {

    warnings.push(
      "Invalid ultrasound data format."
    );

  }




  /* =====================
     OB VALIDATION
  ===================== */


  if (
    templateType === "obs_scan"
  ) {

    warnings.push(
      ...validateObstetricData(data)
    );

  }




  /* =====================
     CONTRADICTORY FINDINGS
  ===================== */


  if (
    data.pregnancy === "Present" &&
    data.endometrium === "Thickened"
  ) {

    warnings.push(
      "Review pregnancy status against endometrial assessment."
    );

  }



  if (
    data.gb_contents === "Stone" &&
    data.gb === "Absent"
  ) {

    warnings.push(
      "Gall bladder finding conflict detected."
    );

  }



  return warnings;

}





/* ===========================================================
   FINAL REPORT GENERATOR
=========================================================== */

export function generateCompleteUltrasoundReport(
  templateType,
  data = {}
) {


if (
 !data ||
 typeof data !== "object"
) {

 data = {};

}


  const impression =
    generateImpression(
      templateType,
      data
    );



 const recommendation =
    generateRecommendation(
      templateType,
      data
    );



  const severity =
    determineSeverity(
      data
    );



  const classification =
    generateClassification(
      templateType,
      data
    );



  const validation =
    validateUltrasoundReport(
      templateType,
      data
    );



  return {


    /* =====================
       REPORT INFORMATION
    ===================== */

engineVersion:
"Enterprise Ultrasound Reporting Engine v2.1",

    reportType:
      templateType,


    generatedAt:
      new Date().toISOString(),



    /* =====================
       CLINICAL OUTPUT
    ===================== */


    impression,

    recommendation,

    severity,

    classification,



    /* =====================
       QUALITY CONTROL
    ===================== */


    validationWarnings:
      validation,



    /* =====================
       SYSTEM STATUS
    ===================== */


    status:
      validation.length
        ? "Review Required"
        : "Validated"

  };

}





/* ===========================================================
   HUMAN READABLE REPORT FORMATTER
=========================================================== */

export function formatUltrasoundReport(report) {


  let output = "";



  output +=
`
ULTRASOUND REPORT
=================

IMPRESSION:

`;



  report.impression.forEach(
    (item, index) => {

      output +=
      `${index + 1}. ${item}\n`;

    }
  );



  output +=
`

RECOMMENDATION:

`;



  report.recommendation.forEach(
    (item, index) => {

      output +=
      `${index + 1}. ${item}\n`;

    }
  );



  output +=
`

ASSESSMENT:

`;



  Object.keys(
    report.classification
  )
  .forEach(
    key => {

      output +=
      `${key.toUpperCase()}: ${JSON.stringify(
        report.classification[key]
      )}\n`;

    }
  );



  output +=
`

PRIORITY:

`;



  report.severity.forEach(
    alert => {

      output +=
      `${alert.level}: ${alert.finding}\n`;

    }
  );



  if (
    report.validationWarnings.length
  ) {


    output +=
`

QUALITY WARNINGS:

`;


    report.validationWarnings.forEach(
      warning => {

        output +=
        `- ${warning}\n`;

      }
    );

  }



  return output;

}