export const generateAccessCode =
  () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let result =
      "PEFA-";

    for (
      let i = 0;
      i < 6;
      i++
    ) {
      result +=
        chars.charAt(
          Math.floor(
            Math.random() *
              chars.length
          )
        );
    }

    return result;
  };