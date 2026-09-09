import {
  createInterpretation,
  getNumericResult,
  getScientistOverride,
} from "../helpers";


/* ======================================================
     HBsAg
  ====================================================== */

  if (
    test.includes("hbsag") ||
    test.includes("hepatitis b")
  ) {

    if (isNegative) {

      return createInterpretation({

        interpretation:
          "Hepatitis B surface antigen (HBsAg) was not detected. There is no serological evidence of current Hepatitis B infection. A negative result does not exclude infection during the incubation or window period.",

        impression:
          "HBsAg: Non-reactive.",

        recommendation:
          "Interpret together with vaccination history, risk factors and clinical findings. Where acute infection is suspected despite a negative result, repeat testing or additional HBV markers (Anti-HBc IgM, HBeAg, HBV DNA) may be indicated.",

      });

    }

    if (isPositive) {

      return createInterpretation({

        interpretation:
          "Hepatitis B surface antigen (HBsAg) was detected, indicating current Hepatitis B virus infection. This finding may represent either acute or chronic infection and should be interpreted together with additional Hepatitis B serological markers and clinical information.",

        impression:
          "HBsAg: Reactive.",

        recommendation:
          "Further evaluation with a complete Hepatitis B profile (HBeAg, Anti-HBe, Anti-HBc IgM/Total), HBV DNA quantification and liver function tests is recommended. Clinical assessment and hepatology referral should be considered where appropriate.",

      });

    }

  }

  /* ======================================================
     HCV ANTIBODY
  ====================================================== */

  if (
    test.includes("hcv") ||
    test.includes("hepatitis c")
  ) {

    if (isNegative) {

      return createInterpretation({

        interpretation:
          "Hepatitis C antibody was not detected. There is no serological evidence of prior exposure to Hepatitis C virus. A negative result does not exclude very recent infection before seroconversion or infection in severely immunocompromised individuals.",

        impression:
          "HCV antibody: Non-reactive.",

        recommendation:
          "Interpret together with the patient's exposure history and clinical findings. Where recent exposure is suspected, repeat serology after the appropriate window period or perform HCV RNA testing if clinically indicated.",

      });

    }

    if (isPositive) {

      return createInterpretation({

        interpretation:
          "Hepatitis C antibody was detected, indicating previous exposure to Hepatitis C virus. This result does not distinguish between resolved infection and active viraemia.",

        impression:
          "HCV antibody: Reactive.",

        recommendation:
          "HCV RNA (PCR) testing is recommended to determine active infection. Liver function assessment and referral for specialist evaluation should be considered where appropriate.",

      });

    }

  }

  /* ======================================================
     VDRL / RPR (SYPHILIS SCREEN)
  ====================================================== */

  if (
    test.includes("vdrl") ||
    test.includes("rpr") ||
    test.includes("syphilis")
  ) {

    if (isNegative) {

      return createInterpretation({

        interpretation:
          "No serological evidence of syphilis was detected by the non-treponemal screening test. A non-reactive result does not exclude very early primary syphilis or late latent disease in appropriate clinical settings.",

        impression:
          "Non-reactive syphilis screening test.",

        recommendation:
          "Interpret together with the patient's clinical findings and risk factors. Repeat testing or treponemal-specific assays may be indicated where recent exposure or strong clinical suspicion exists.",

      });

    }

    if (isPositive) {

      return createInterpretation({

        interpretation:
          "The non-treponemal screening test is reactive, consistent with possible syphilis infection. False-positive reactions may occur in pregnancy, autoimmune disorders, chronic infections and other medical conditions.",

        impression:
          "Reactive non-treponemal syphilis screen.",

        recommendation:
          "Confirmation with a treponemal-specific assay (e.g. TPHA, TPPA or FTA-ABS) is recommended. Clinical staging and appropriate treatment should follow confirmed diagnosis.",

      });

    }

  }

  /* ======================================================
     WIDAL TEST
  ====================================================== */

  if (
    test.includes("widal") ||
    test.includes("typhoid")
  ) {

    return createInterpretation({

      interpretation:
        "The Widal test measures antibodies against Salmonella Typhi and Paratyphi antigens. Interpretation should be made in conjunction with the patient's clinical presentation, vaccination history, local baseline antibody titres and paired serum samples where available. A single Widal titre has limited diagnostic value and may reflect previous infection, vaccination or cross-reacting antibodies.",

      impression:
        "Widal test requires cautious interpretation.",

      recommendation:
        "Where enteric fever is clinically suspected, blood culture remains the diagnostic gold standard, particularly before commencement of antimicrobial therapy. Stool or bone marrow culture and molecular testing may also be considered where appropriate.",

    });

  }

  /* ======================================================
     H. PYLORI
  ====================================================== */

  if (
    test.includes("h. pylori") ||
    test.includes("helicobacter")
  ) {

    if (isNegative) {

      return createInterpretation({

        interpretation:
          "No serological evidence of Helicobacter pylori infection was detected. A negative antibody result does not exclude active infection, particularly in early disease or immunocompromised patients.",

        impression:
          "H. pylori antibody: Negative.",

        recommendation:
          "Where active infection remains clinically suspected, stool antigen testing or the urea breath test is recommended as these better reflect current infection.",

      });

    }

    if (isPositive) {

      return createInterpretation({

        interpretation:
          "Helicobacter pylori antibodies were detected, indicating previous exposure or current infection. Serology alone cannot distinguish active infection from previous successfully treated infection.",

        impression:
          "H. pylori antibody: Positive.",

        recommendation:
          "Interpret together with the patient's symptoms. Stool antigen testing or the urea breath test may be performed to confirm active infection where clinically indicated.",

      });

    }

  }

  /* ======================================================
     TOXOPLASMA
  ====================================================== */

  if (
    test.includes("toxoplasma") ||
    test.includes("toxo")
  ) {

    if (isNegative) {

      return createInterpretation({

        interpretation:
          "No serological evidence of Toxoplasma gondii infection was detected.",

        impression:
          "Toxoplasma serology: Negative.",

        recommendation:
          "Where recent exposure is suspected, repeat testing may be indicated. In pregnancy, further assessment should follow current clinical guidelines.",

      });

    }

    if (isPositive) {

      return createInterpretation({

        interpretation:
          "Toxoplasma antibodies were detected. Depending on the antibody class (IgM or IgG), this may represent recent infection or previous exposure with immunity.",

        impression:
          "Positive Toxoplasma serology.",

        recommendation:
          "Interpret together with IgG/IgM antibody status, avidity testing where appropriate and the patient's clinical history.",

      });

    }

  }

  /* ======================================================
     RUBELLA
  ====================================================== */

  if (
    test.includes("rubella")
  ) {

    if (isNegative) {

      return createInterpretation({

        interpretation:
          "Rubella antibodies were not detected, indicating absence of demonstrable immunity.",

        impression:
          "Rubella immunity not demonstrated.",

        recommendation:
          "Vaccination should be considered where appropriate, particularly in women of child-bearing age who are not pregnant.",

      });

    }

    if (isPositive) {

      return createInterpretation({

        interpretation:
          "Rubella antibodies were detected, consistent with previous infection or successful immunisation.",

        impression:
          "Evidence of Rubella immunity.",

        recommendation:
          "Interpret alongside vaccination history and antibody class where clinically indicated.",

      });

    }

  }

  /* ======================================================
     CMV
  ====================================================== */

  if (
    test.includes("cmv") ||
    test.includes("cytomegalovirus")
  ) {

    if (isNegative) {

      return createInterpretation({

        interpretation:
          "No serological evidence of Cytomegalovirus infection was detected.",

        impression:
          "CMV serology: Negative.",

        recommendation:
          "Where primary infection is suspected, repeat serology or molecular testing may be indicated.",

      });

    }

    if (isPositive) {

      return createInterpretation({

        interpretation:
          "Cytomegalovirus antibodies were detected. Interpretation depends upon the antibody class (IgM versus IgG) and the clinical setting.",

        impression:
          "Positive CMV serology.",

        recommendation:
          "Interpret together with IgM/IgG status, clinical findings and molecular testing where appropriate.",

      });

    }

  }

  /* ======================================================
     EPSTEIN-BARR VIRUS (EBV)
  ====================================================== */

  if (
    test.includes("ebv") ||
    test.includes("epstein")
  ) {

    if (isNegative) {

      return createInterpretation({

        interpretation:
          "No serological evidence of Epstein-Barr virus infection was detected.",

        impression:
          "EBV serology: Negative.",

        recommendation:
          "Where infectious mononucleosis is clinically suspected despite a negative result, repeat serology or EBV-specific antibody profiling may be appropriate.",

      });

    }

    if (isPositive) {

      return createInterpretation({

        interpretation:
          "Epstein-Barr virus antibodies were detected. Depending on the antibody profile, this may represent acute, recent or previous EBV infection.",

        impression:
          "Positive EBV serology.",

        recommendation:
          "Interpret together with the specific antibody profile (VCA IgM, VCA IgG and EBNA antibodies) and the patient's clinical presentation.",

      });

    }

  }

  /* ======================================================
     HERPES SIMPLEX VIRUS (HSV)
  ====================================================== */

  if (
    test.includes("herpes") ||
    test.includes("hsv")
  ) {

    if (isNegative) {

      return createInterpretation({

        interpretation:
          "No serological evidence of Herpes Simplex Virus infection was detected.",

        impression:
          "HSV serology: Negative.",

        recommendation:
          "A negative serological result does not exclude very recent infection. Molecular testing from active lesions is preferred where clinically indicated.",

      });

    }

    if (isPositive) {

      return createInterpretation({

        interpretation:
          "Herpes Simplex Virus antibodies were detected, indicating previous exposure or infection. Serology cannot reliably determine the site or timing of infection.",

        impression:
          "Positive HSV serology.",

        recommendation:
          "Interpret together with the antibody class, clinical findings and lesion PCR where appropriate.",

      });

    }

  }

  /* ======================================================
     DENGUE
  ====================================================== */

  if (
    test.includes("dengue")
  ) {

    if (isNegative) {

      return createInterpretation({

        interpretation:
          "No serological evidence of Dengue virus infection was detected.",

        impression:
          "Dengue serology: Negative.",

        recommendation:
          "Early infection may yield negative serology. NS1 antigen detection or PCR should be considered during the acute phase where clinically indicated.",

      });

    }

    if (isPositive) {

      return createInterpretation({

        interpretation:
          "Dengue antibodies were detected. Depending on the antibody class, this may indicate recent or previous Dengue virus infection.",

        impression:
          "Positive Dengue serology.",

        recommendation:
          "Interpret together with IgM/IgG status, NS1 antigen results, clinical findings and local epidemiology.",

      });

    }

  }

  /* ======================================================
     COVID-19 ANTIBODY
  ====================================================== */

  if (
    test.includes("covid") ||
    test.includes("sars-cov-2")
  ) {

    if (isNegative) {

      return createInterpretation({

        interpretation:
          "SARS-CoV-2 antibodies were not detected. This may indicate absence of previous infection or vaccination, or testing before antibody development.",

        impression:
          "COVID-19 antibody: Negative.",

        recommendation:
          "Interpret together with vaccination history, exposure history and clinical findings. Molecular testing should be used where acute infection is suspected.",

      });

    }

    if (isPositive) {

      return createInterpretation({

        interpretation:
          "SARS-CoV-2 antibodies were detected, consistent with previous infection and/or vaccination. Serology should not be used to diagnose acute COVID-19 infection.",

        impression:
          "COVID-19 antibody: Positive.",

        recommendation:
          "Interpret together with vaccination history and clinical context. PCR or antigen testing remains the preferred method for diagnosing acute infection.",

      });

    }

  }

  /* ======================================================
     ANTI-STREPTOLYSIN O (ASO) TITRE
  ====================================================== */

  if (
    test.includes("aso") ||
    test.includes("anti streptolysin") ||
    test.includes("anti-streptolysin")
  ) {

    const value = getNumericResult(
      resultMap,
      "ASO"
    ) ??
    getNumericResult(
      resultMap,
      "ASOT"
    );

    if (value !== null) {

      if (value <= 200) {

        return createInterpretation({

          interpretation:
            "The Anti-Streptolysin O (ASO) titre is within the reference interval. There is no serological evidence of a recent Group A Streptococcal infection.",

          impression:
            "Normal ASO titre.",

          recommendation:
            "Interpret together with the patient's clinical presentation. A normal ASO titre does not completely exclude recent streptococcal infection.",

        });

      }

      return createInterpretation({

        interpretation:
          "The Anti-Streptolysin O (ASO) titre is elevated, suggesting recent exposure to Group A β-haemolytic Streptococcus. Elevated titres support, but do not confirm, post-streptococcal complications such as rheumatic fever or post-streptococcal glomerulonephritis.",

        impression:
          "Raised ASO titre.",

        recommendation:
          "Interpret alongside the patient's symptoms, inflammatory markers and clinical findings. Repeat titres may be useful where recent infection is suspected.",

        });

    }

  }

  /* ======================================================
     RHEUMATOID FACTOR (RF)
  ====================================================== */

  if (
    test.includes("rheumatoid factor") ||
    test === "rf"
  ) {

    if (isNegative) {

      return createInterpretation({

        interpretation:
          "Rheumatoid factor was not detected. A negative result does not exclude rheumatoid arthritis, particularly during the early stages of disease.",

        impression:
          "Rheumatoid factor: Negative.",

        recommendation:
          "Interpret together with clinical findings. Anti-CCP antibody testing may provide additional diagnostic value where rheumatoid arthritis is suspected.",

      });

    }

    if (isPositive) {

      return createInterpretation({

        interpretation:
          "Rheumatoid factor was detected. Positive results may occur in rheumatoid arthritis, other autoimmune diseases, chronic infections and occasionally in healthy older adults.",

        impression:
          "Positive Rheumatoid Factor.",

        recommendation:
          "Interpret together with clinical findings, inflammatory markers and Anti-CCP antibody results where appropriate.",

      });

    }

  }

  /* ======================================================
     ANTINUCLEAR ANTIBODY (ANA)
  ====================================================== */

  if (
    test.includes("ana") ||
    test.includes("antinuclear")
  ) {

    if (isNegative) {

      return createInterpretation({

        interpretation:
          "Antinuclear antibodies were not detected. This reduces the likelihood of systemic autoimmune connective tissue disease but does not completely exclude it.",

        impression:
          "ANA: Negative.",

        recommendation:
          "Interpret alongside the patient's clinical findings. Further autoimmune investigations may still be indicated where clinical suspicion remains high.",

      });

    }

    if (isPositive) {

      return createInterpretation({

        interpretation:
          "Antinuclear antibodies were detected. Positive ANA results are associated with systemic autoimmune diseases such as systemic lupus erythematosus, Sjögren syndrome and systemic sclerosis, but may also occur in healthy individuals.",

        impression:
          "Positive ANA.",

        recommendation:
          "Interpret together with ANA titre, staining pattern, ENA profile, anti-dsDNA antibodies and the patient's clinical presentation.",

      });

    }

  }

  /* ======================================================
     C-REACTIVE PROTEIN (QUALITATIVE)
  ====================================================== */

  if (
    test === "crp" ||
    test.includes("c-reactive")
  ) {

    if (isNegative) {

      return createInterpretation({

        interpretation:
          "C-reactive protein was not detected by the qualitative assay. There is no serological evidence of a significant acute inflammatory response.",

        impression:
          "Qualitative CRP: Negative.",

        recommendation:
          "Interpret together with the patient's clinical findings. Quantitative CRP measurement may provide greater clinical value where indicated.",

      });

    }

    if (isPositive) {

      return createInterpretation({

        interpretation:
          "C-reactive protein was detected, indicating the presence of an inflammatory process. This finding is non-specific and may occur in infection, autoimmune disease, trauma, malignancy and other inflammatory conditions.",

        impression:
          "Qualitative CRP: Positive.",

        recommendation:
          "Clinical correlation is recommended. Quantitative CRP measurement and other inflammatory markers may assist further evaluation.",

      });

    }

  }

  /* ======================================================
     GENERIC NEGATIVE RESULT
  ====================================================== */

  if (isNegative) {

    return createInterpretation({

      interpretation:
        "The requested serological marker was not detected. There is no serological evidence of the condition investigated by this assay at the time of testing.",

      impression:
        "Negative serological result.",

      recommendation:
        "Interpret together with the patient's clinical presentation, exposure history and the known diagnostic window period. Repeat testing may be appropriate where recent exposure is suspected.",

    });

  }

  /* ======================================================
     GENERIC POSITIVE RESULT
  ====================================================== */

  if (isPositive) {

    return createInterpretation({

      interpretation:
        "The requested serological marker was detected. Depending on the assay performed, this may indicate current infection, previous exposure, immunity or an autoimmune process. Serological findings should always be interpreted within the appropriate clinical context.",

      impression:
        "Positive serological result.",

      recommendation:
        "Clinical correlation is recommended. Confirmatory testing or additional laboratory investigations may be required depending on the specific analyte and clinical indication.",

    });

  }

  /* ======================================================
     NUMERIC / TEXT RESULT FALLBACK
  ====================================================== */

  if (rawResult) {

    return createInterpretation({

      interpretation:
        `Reported result: ${rawResult}. No disease-specific interpretation rule is currently available for this assay.`,

      impression:
        "Result reported.",

      recommendation:
        "Interpret together with the assay reference interval, clinical findings and other relevant laboratory investigations.",

    });

  }

  /* ======================================================
     DEFAULT
  ====================================================== */

  return defaultInterpretation({

    report,

    resultMap,

  });

}

export default interpretSerology;