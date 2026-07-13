export const getResultFlag =
  (
    result,
    reference
  ) => {
    if (
      !result ||
      !reference
    ) {
      return "";
    }

    /* =========================
       EXTRACT RANGE
    ========================= */

    const cleanReference =
      reference.replace(
        /\s/g,
        ""
      );

    const match =
      cleanReference.match(
        /^([0-9.]+)-([0-9.]+)$/
      );

    if (!match) {
      return "";
    }

    const low =
      Number(match[1]);

    const high =
      Number(match[2]);

    const numericResult =
      Number(result);

    if (
      isNaN(
        numericResult
      )
    ) {
      return "";
    }

    /* =========================
       FLAGGING
    ========================= */

    if (
      numericResult <
      low
    ) {
      return "Low";
    }

    if (
      numericResult >
      high
    ) {
      return "High";
    }

    return "Normal";
  };