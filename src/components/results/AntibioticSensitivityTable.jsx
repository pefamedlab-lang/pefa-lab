import { useState } from "react";

const DEFAULT_ANTIBIOTICS = [

  "Amoxicillin",
  "Ampicillin",
  "Augmentin",
  "Cloxacillin",

  "Cefuroxime",
  "Cefixime",
  "Ceftriaxone",
  "Ceftazidime",
  "Cefotaxime",

  "Gentamicin",
  "Amikacin",

  "Ciprofloxacin",
  "Ofloxacin",
  "Levofloxacin",
  "Nalidixic Acid",
  "Nitrofurantoin",

  "Erythromycin",
  "Azithromycin",
  "Clarithromycin",

  "Clindamycin",

  "Vancomycin",
  "Linezolid",

  "Tetracycline",
  "Doxycycline",

  "Chloramphenicol",

  "Co-Trimoxazole",

  "Meropenem",
  "Imipenem",

  "Piperacillin-Tazobactam",

  "Colistin",

];

export default function AntibioticSensitivityTable({

  resultData,
  setResultData,

}) {

  const [customAntibiotic, setCustomAntibiotic] =
    useState("");

  const sensitivity =
    resultData.sensitivity || {};

  const selectedAntibiotics =
    resultData.selectedAntibiotics || [];

  const toggleAntibiotic = (
    antibiotic
  ) => {

    let updated;

    if (
      selectedAntibiotics.includes(
        antibiotic
      )
    ) {

      updated =
        selectedAntibiotics.filter(
          item =>
            item !== antibiotic
        );

    } else {

      updated = [
        ...selectedAntibiotics,
        antibiotic,
      ];

    }

    setResultData({

      ...resultData,

      selectedAntibiotics:
        updated,

    });

  };

  const updateSensitivity =
    (
      antibiotic,
      value
    ) => {

      setResultData({

        ...resultData,

        sensitivity: {

          ...sensitivity,

          [antibiotic]:
            value,

        },

      });

    };

  const addCustomAntibiotic =
    () => {

      if (
        !customAntibiotic.trim()
      )
        return;

      if (
        selectedAntibiotics.includes(
          customAntibiotic
        )
      )
        return;

      setResultData({

        ...resultData,

        selectedAntibiotics: [

          ...selectedAntibiotics,

          customAntibiotic,

        ],

      });

      setCustomAntibiotic(
        ""
      );

    };

  return (

    <div className="sensitivity-wrapper">

      <h4>
        Antibiotic Sensitivity
      </h4>

      <div className="sensitivity-selector">

        <h5>
          Select Tested Antibiotics
        </h5>

        <div className="antibiotic-grid">

          {DEFAULT_ANTIBIOTICS.map(
            antibiotic => (

              <label
                key={antibiotic}
                className="antibiotic-checkbox"
              >

                <input
                  type="checkbox"
                  checked={selectedAntibiotics.includes(
                    antibiotic
                  )}
                  onChange={() =>
                    toggleAntibiotic(
                      antibiotic
                    )
                  }
                />

                {antibiotic}

              </label>

            )
          )}

        </div>

      </div>

      <div className="custom-antibiotic">

        <input

          type="text"

          placeholder="Add Custom Antibiotic"

          value={
            customAntibiotic
          }

          onChange={(e) =>
            setCustomAntibiotic(
              e.target.value
            )
          }

        />

        <button

          type="button"

          onClick={
            addCustomAntibiotic
          }

        >

          Add

        </button>

      </div>

      {selectedAntibiotics.length >
        0 && (

        <table className="result-table">

          <thead>

            <tr>

              <th>
                Antibiotic
              </th>

              <th>
                Result
              </th>

            </tr>

          </thead>

          <tbody>

            {selectedAntibiotics.map(
              antibiotic => (

                <tr
                  key={antibiotic}
                >

                  <td>
                    {antibiotic}
                  </td>

                  <td>

                    <select

                      value={
                        sensitivity[
                          antibiotic
                        ] || ""
                      }

                      onChange={(e) =>
                        updateSensitivity(
                          antibiotic,
                          e.target.value
                        )
                      }

                    >

                      <option value="">
                        Select
                      </option>

                      <option value="S">
                        Sensitive
                      </option>

                      <option value="I">
                        Intermediate
                      </option>

                      <option value="R">
                        Resistant
                      </option>

                    </select>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      )}

    </div>

  );

}