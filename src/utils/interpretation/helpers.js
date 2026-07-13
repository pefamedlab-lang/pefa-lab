/* ==========================================================
   EMPTY INTERPRETATION
========================================================== */

export function defaultInterpretation() {

  return {

    interpretation: "",

    impression: "",

    comment: "",

    recommendation: "",

  };

}

/* ==========================================================
   CREATE OBJECT
========================================================== */

export function createInterpretation({

  interpretation = "",

  impression = "",

  comment = "",

  recommendation = "",

} = {}) {

  return {

    interpretation:

      interpretation?.trim() || "",

    impression:

      impression?.trim() || "",

    comment:

      comment?.trim() || "",

    recommendation:

      recommendation?.trim() || "",

  };

}

/* ==========================================================
   BUILD RESULT MAP
========================================================== */

export function buildResultMap(

  results = []

) {

  const map = {};

  results.forEach(item => {

    const key = (

      item.parameter ||

      item.test_parameter ||

      item.name ||

      item.label ||

      ""

    ).trim();

    if (!key) return;

    map[key] = item;

  });

  return map;

}

/* ==========================================================
   NUMERIC RESULT
========================================================== */

export function getNumericResult(

  resultMap,

  parameter

) {

  const row = resultMap?.[parameter];

  if (!row) {

    return null;

  }

  const raw =

    row.result ??

    row.value ??

    row.numeric_result ??

    "";

  if (

    raw === null ||

    raw === undefined ||

    raw === ""

  ) {

    return null;

  }

  const number = parseFloat(

    String(raw)

      .replace(/,/g, "")

      .replace(/[^\d.-]/g, "")

  );

  return Number.isFinite(number)

    ? number

    : null;

}

/* ==========================================================
   TEXT RESULT
========================================================== */

export function getTextResult(

  resultMap,

  parameter

) {

  const row = resultMap?.[parameter];

  if (!row) {

    return "";

  }

  return String(

    row.result ??

    row.value ??

    ""

  ).trim();

}

/* ==========================================================
   REFERENCE RANGE CHECK
========================================================== */

export function isBelow(

  value,

  lower

) {

  if (

    value === null ||

    lower === null ||

    lower === undefined

  ) {

    return false;

  }

  return value < lower;

}

export function isAbove(

  value,

  upper

) {

  if (

    value === null ||

    upper === null ||

    upper === undefined

  ) {

    return false;

  }

  return value > upper;

}

export function isWithin(

  value,

  lower,

  upper

) {

  if (

    value === null ||

    lower === null ||

    upper === null ||

    lower === undefined ||

    upper === undefined

  ) {

    return false;

  }

  return (

    value >= lower &&

    value <= upper

  );

}

/* ==========================================================
   POSITIVE / NEGATIVE HELPERS
========================================================== */

export function isPositive(

  value = ""

) {

  const text =

    value.toLowerCase();

  return (

    text.includes("positive") ||

    text.includes("reactive") ||

    text.includes("detected")

  );

}

export function isNegative(

  value = ""

) {

  const text =

    value.toLowerCase();

  return (

    text.includes("negative") ||

    text.includes("non-reactive") ||

    text.includes("not detected")

  );

}