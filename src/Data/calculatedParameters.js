export const calculatedParameters = {

  /* =========================
     LIVER FUNCTION
  ========================= */

  Globulin: (data) => {

    const totalProtein =
      Number(
        data[
          "Total Protein"
        ]?.result
      );

    const albumin =
      Number(
        data[
          "Albumin"
        ]?.result
      );

    if (
      isNaN(totalProtein) ||
      isNaN(albumin)
    )
      return null;

    return (
      totalProtein -
      albumin
    ).toFixed(2);

  },

  "Indirect Bilirubin":
    (data) => {

      const total =
        Number(
          data[
            "Total Bilirubin"
          ]?.result
        );

      const direct =
        Number(
          data[
            "Direct Bilirubin"
          ]?.result
        );

      if (
        isNaN(total) ||
        isNaN(direct)
      )
        return null;

      return (
        total -
        direct
      ).toFixed(2);

    },

  /* =========================
     LIPID PROFILE
  ========================= */

  VLDL: (data) => {

    const tg =
      Number(
        data[
          "Triglycerides"
        ]?.result
      );

    if (
      isNaN(tg)
    )
      return null;

    return (
      tg / 5
    ).toFixed(2);

  },

  "LDL Cholesterol":
    (data) => {

      const tc =
        Number(
          data[
            "Total Cholesterol"
          ]?.result
        );

      const hdl =
        Number(
          data[
            "HDL Cholesterol"
          ]?.result
        );

      const vldl =
        Number(
          data[
            "VLDL"
          ]?.result
        );

      if (
        isNaN(tc) ||
        isNaN(hdl) ||
        isNaN(vldl)
      )
        return null;

      return (
        tc -
        hdl -
        vldl
      ).toFixed(2);

    },

  /* =========================
     CALCIUM PROFILE
  ========================= */

  "Non-Ionized Calcium":
    (data) => {

      const total =
        Number(
          data[
            "Total Calcium"
          ]?.result
        );

      const ionized =
        Number(
          data[
            "Ionized Calcium"
          ]?.result
        );

      if (
        isNaN(total) ||
        isNaN(ionized)
      )
        return null;

      return (
        total -
        ionized
      ).toFixed(2);

    },

  /* =========================
     PROTEIN PROFILE
  ========================= */

  "A/G Ratio":
    (data) => {

      const albumin =
        Number(
          data[
            "Albumin"
          ]?.result
        );

      const globulin =
        Number(
          data[
            "Globulin"
          ]?.result
        );

      if (
        isNaN(albumin) ||
        isNaN(globulin) ||
        globulin === 0
      )
        return null;

      return (
        albumin /
        globulin
      ).toFixed(2);

    },

};