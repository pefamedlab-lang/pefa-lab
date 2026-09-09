import {
  buildOrgan,
  finalizeReport,
} from "../reportBuilder";

/* ==========================================================
   SCROTAL ULTRASOUND REPORT
========================================================== */

export function generateScrotalReport(data = {}) {
  const report = [];

  /* ==========================
     RIGHT TESTIS
  ========================== */

  report.push(
    ...buildOrgan({
      title: "RIGHT TESTIS:",
      subject: "The right testis",

      descriptions: [
        data.right_testis_position &&
          `is ${data.right_testis_position.toLowerCase()}`,

        data.right_testis_size &&
          `${data.right_testis_size.toLowerCase()} in size`,

        data.right_length &&
        data.right_width &&
        data.right_height &&
          `measures ${data.right_length} × ${data.right_width} × ${data.right_height} mm`,

        data.right_testis_echo &&
          `has ${data.right_testis_echo.toLowerCase()} echotexture`,

        data.right_testis_contour &&
          `with a ${data.right_testis_contour.toLowerCase()} contour`,
      ].filter(Boolean),

      abnormalities: [
        data.right_testis_mass === "Present" &&
          "Right testicular mass demonstrated",

        data.right_microlithiasis === "Present" &&
          "Right testicular microlithiasis demonstrated",

        data.right_calcification === "Present" &&
          "Right testicular calcification demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No focal right testicular lesion is demonstrated.",

      notes: data.right_testis_notes,
    })
  );

  /* ==========================
     LEFT TESTIS
  ========================== */

  report.push(
    ...buildOrgan({
      title: "LEFT TESTIS:",
      subject: "The left testis",

      descriptions: [
        data.left_testis_position &&
          `is ${data.left_testis_position.toLowerCase()}`,

        data.left_testis_size &&
          `${data.left_testis_size.toLowerCase()} in size`,

        data.left_length &&
        data.left_width &&
        data.left_height &&
          `measures ${data.left_length} × ${data.left_width} × ${data.left_height} mm`,

        data.left_testis_echo &&
          `has ${data.left_testis_echo.toLowerCase()} echotexture`,

        data.left_testis_contour &&
          `with a ${data.left_testis_contour.toLowerCase()} contour`,
      ].filter(Boolean),

      abnormalities: [
        data.left_testis_mass === "Present" &&
          "Left testicular mass demonstrated",

        data.left_microlithiasis === "Present" &&
          "Left testicular microlithiasis demonstrated",

        data.left_calcification === "Present" &&
          "Left testicular calcification demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No focal left testicular lesion is demonstrated.",

      notes: data.left_testis_notes,
    })
  );

  /* ==========================
     RIGHT EPIDIDYMIS
  ========================== */

  report.push(
    ...buildOrgan({
      title: "RIGHT EPIDIDYMIS:",
      subject: "The right epididymis",

      descriptions: [
        data.right_epididymis &&
          data.right_epididymis === "Normal" &&
          "is normal in size and echotexture",

        data.right_epididymis === "Enlarged" &&
          "is enlarged",

        data.right_epididymis === "Heterogeneous" &&
          "is heterogeneous",
      ].filter(Boolean),

      abnormalities: [
        data.right_epididymal_cyst === "Present" &&
          "A right epididymal cyst is demonstrated",

        data.right_epididymitis === "Present" &&
          "Features are in keeping with epididymitis",
      ].filter(Boolean),

      normalStatement:
        "No focal right epididymal lesion is demonstrated.",

      notes: data.right_epididymis_notes,
    })
  );

  /* ==========================
     LEFT EPIDIDYMIS
  ========================== */

  report.push(
    ...buildOrgan({
      title: "LEFT EPIDIDYMIS:",
      subject: "The left epididymis",

      descriptions: [
        data.left_epididymis &&
          data.left_epididymis === "Normal" &&
          "is normal in size and echotexture",

        data.left_epididymis === "Enlarged" &&
          "is enlarged",

        data.left_epididymis === "Heterogeneous" &&
          "is heterogeneous",
      ].filter(Boolean),

      abnormalities: [
        data.left_epididymal_cyst === "Present" &&
          "A left epididymal cyst is demonstrated",

        data.left_epididymitis === "Present" &&
          "Features are in keeping with epididymitis",
      ].filter(Boolean),

      normalStatement:
        "No focal left epididymal lesion is demonstrated.",

      notes: data.left_epididymis_notes,
    })
  );

  /* ==========================
     SPERMATIC CORDS
  ========================== */

  report.push(
    ...buildOrgan({
      title: "SPERMATIC CORDS:",
      subject: "The spermatic cords",

      descriptions: [
        data.spermatic_cords === "Normal" &&
          "are normal in course and echotexture",

        data.spermatic_cords === "Thickened" &&
          "appear thickened",
      ].filter(Boolean),

      abnormalities: [
        data.right_varicocele === "Present" &&
          "Right-sided varicocele is demonstrated",

        data.left_varicocele === "Present" &&
          "Left-sided varicocele is demonstrated",

        data.bilateral_varicocele === "Present" &&
          "Bilateral varicoceles are demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No abnormality of the spermatic cords is demonstrated.",

      notes: data.spermatic_cord_notes,
    })
  );

  /* ==========================
     SCROTAL SAC / MISCELLANEOUS
  ========================== */

  report.push(
    ...buildOrgan({
      title: "SCROTAL SAC:",
      subject: "The scrotal sac",

      descriptions: [],

      abnormalities: [
        data.right_hydrocele === "Present" &&
          "A right hydrocele is demonstrated",

        data.left_hydrocele === "Present" &&
          "A left hydrocele is demonstrated",

        data.bilateral_hydrocele === "Present" &&
          "Bilateral hydroceles are demonstrated",

        data.scrotal_wall === "Thickened" &&
          "Diffuse scrotal wall thickening is demonstrated",

        data.scrotal_wall === "Oedematous" &&
          "Scrotal wall oedema is demonstrated",

        data.scrotal_mass === "Present" &&
          "A scrotal mass is demonstrated",
      ].filter(Boolean),

      normalStatement:
        "No hydrocele, scrotal wall abnormality or other extratesticular lesion is demonstrated.",

      notes: data.scrotal_notes,
    })
  );

  return finalizeReport(report);

}