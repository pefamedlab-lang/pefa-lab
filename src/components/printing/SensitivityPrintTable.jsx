export default function SensitivityPrintTable({

  data = {},

}) {

  const antibiotics =

    Object.entries(data);

  if (

    antibiotics.length === 0

  ) {

    return null;

  }

  return (

    <>

      <div className="micro-section-title">

        Antibiotic Sensitivity Pattern

      </div>

      <table className="micro-compact-table">

        <tbody>

          {Array.from(

            {

              length: Math.ceil(
                antibiotics.length / 2
              ),

            },

            (_, index) => {

              const left =

                antibiotics[
                  index * 2
                ];

              const right =

                antibiotics[
                  index * 2 + 1
                ];

              return (

                <tr key={index}>

                  <td className="micro-key">

                    {left?.[0] || ""}

                  </td>

                  <td
                    className={`micro-value ${String(
                      left?.[1]
                    )
                      .toLowerCase()
                      .replace(
                        " ",
                        "-"
                      )}`}
                  >

                    {left?.[1] || ""}

                  </td>

                  <td className="micro-key">

                    {right?.[0] || ""}

                  </td>

                  <td
                    className={`micro-value ${String(
                      right?.[1]
                    )
                      .toLowerCase()
                      .replace(
                        " ",
                        "-"
                      )}`}
                  >

                    {right?.[1] || ""}

                  </td>

                </tr>

              );

            }

          )}

        </tbody>

      </table>

    </>

  );

}