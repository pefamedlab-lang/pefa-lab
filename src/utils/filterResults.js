export const filterResults =
(
  results
) => {

  return Object.fromEntries(

    Object.entries(
      results || {}
    ).filter(

      ([, value]) => {

        if (!value)
          return false;

        if (
          typeof value ===
          "object"
        ) {

          return (

            value.result !==
              "" &&

            value.result !==
              null &&

            value.result !==
              undefined

          );

        }

        return (
          value !== ""
        );

      }

    )

  );

};