export function calculateVLDL(
  triglyceride
) {
  if (
    triglyceride === "" ||
    triglyceride === null ||
    triglyceride === undefined
  ) {
    return "";
  }

  return (
    Number(triglyceride) / 5
  ).toFixed(1);
}

export function calculateLDL(
  totalCholesterol,
  hdl,
  triglyceride
) {
  if (
    totalCholesterol === "" ||
    hdl === "" ||
    triglyceride === ""
  ) {
    return "";
  }

  return (
    Number(totalCholesterol) -
    Number(hdl) -
    Number(triglyceride) / 5
  ).toFixed(1);
}

export function calculateGGT(
  ast,
  alt
) {
  if (
    ast === "" ||
    alt === ""
  ) {
    return "";
  }

  return (
    (
      Number(ast) +
      Number(alt)
    ) / 2
  ).toFixed(1);
}

export function calculateGlobulin(
  totalProtein,
  albumin
) {
  if (
    totalProtein === "" ||
    albumin === ""
  ) {
    return "";
  }

  return (
    Number(totalProtein) -
    Number(albumin)
  ).toFixed(1);
}

export function calculateAGRatio(
  albumin,
  globulin
) {
  if (
    albumin === "" ||
    globulin === ""
  ) {
    return "";
  }

  return (
    Number(albumin) /
    Number(globulin)
  ).toFixed(2);
}

export function calculateAnionGap(
  sodium,
  chloride,
  bicarbonate
) {
  if (
    sodium === "" ||
    chloride === "" ||
    bicarbonate === ""
  ) {
    return "";
  }

  return (
    Number(sodium) -
    (
      Number(chloride) +
      Number(bicarbonate)
    )
  ).toFixed(1);
}