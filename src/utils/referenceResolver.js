export const resolveReference =
  ({
    parameter,

    patientSex,

    patientAge,

    hormonalPhase,
  }) => {
    if (!parameter) {
      return "";
    }

    /* =========================
       SEX + AGE
    ========================= */

    if (
      parameter.referenceType ===
      "sex-age"
    ) {
      /* CHILD */

      if (
        Number(
          patientAge
        ) < 18
      ) {
        return (
          parameter.childReference ||
          ""
        );
      }

      /* MALE */

      if (
        patientSex ===
        "Male"
      ) {
        return (
          parameter.maleReference ||
          ""
        );
      }

      /* FEMALE */

      return (
        parameter.femaleReference ||
        ""
      );
    }

    /* =========================
       SEX ONLY
    ========================= */

    if (
      parameter.referenceType ===
      "sex"
    ) {
      if (
        patientSex ===
        "Male"
      ) {
        return (
          parameter.maleReference ||
          ""
        );
      }

      return (
        parameter.femaleReference ||
        ""
      );
    }

    /* =========================
       AGE ONLY
    ========================= */

    if (
      parameter.referenceType ===
      "age"
    ) {
      if (
        Number(
          patientAge
        ) < 18
      ) {
        return (
          parameter.childReference ||
          ""
        );
      }

      return (
        parameter.adultReference ||
        ""
      );
    }

    /* =========================
       HORMONAL
    ========================= */

    if (
      parameter.referenceType ===
      "hormonal"
    ) {
      return (
        parameter
          ?.hormonalReferences?.[
          hormonalPhase
        ] || ""
      );
    }

    /* =========================
       NORMAL
    ========================= */

    return (
      parameter.reference ||
      ""
    );
  };