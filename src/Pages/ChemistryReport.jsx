import { useState } from "react";

import { useLocation } from "react-router-dom";

import "../Styles/chemistry.css";

import { chemistryPanels } from "../Chemistry/chemistryPanels";

import { chemistryTests } from "../Chemistry/chemistryTests";

import {
  calculateVLDL,
  calculateLDL,
  calculateGGT,
} from "../Chemistry/chemistryCalculations";

export default function ChemistryReport() {
  const location = useLocation();

  const selectedTests =
    location.state
      ?.selectedTests || [];

  const [results, setResults] =
    useState({});

  /* ========================= */
  /* PANEL DETECTION */
  /* ========================= */

  const getPanelCode = () => {
    if (
      location.pathname.includes(
        "/chemistry/lft"
      )
    ) {
      return "LFT";
    }

    if (
      location.pathname.includes(
        "/chemistry/kft"
      )
    ) {
      return "KFT";
    }

    if (
      location.pathname.includes(
        "/chemistry/flp"
      )
    ) {
      return "LIPID_PROFILE";
    }

    if (
      location.pathname.includes(
        "/chemistry/sugar"
      )
    ) {
      return "BLOOD_SUGAR";
    }

    return null;
  };

  const panelCode =
    getPanelCode();

  /* ========================= */
  /* DYNAMIC TEST ENGINE */
  /* ========================= */

  let testsToRender = [];

  if (
    selectedTests.length > 0
  ) {
    testsToRender =
      selectedTests.filter(
        (test) =>
          chemistryTests[test]
      );
  } else if (
    panelCode &&
    chemistryPanels[panelCode]
  ) {
    testsToRender =
      chemistryPanels[
        panelCode
      ].tests;
  }

  /* ========================= */
  /* HANDLE INPUT */
  /* ========================= */

  const handleChange = (
    testCode,
    value
  ) => {
    setResults((prev) => ({
      ...prev,
      [testCode]: value,
    }));
  };

  /* ========================= */
  /* CALCULATIONS */
  /* ========================= */

  const calculatedResults = {
    VLDL: calculateVLDL(
      results.TRIGLYCERIDE
    ),

    LDL: calculateLDL(
      results.CHOLESTEROL,
      results.HDL,
      results.TRIGLYCERIDE
    ),

    GGT: calculateGGT(
      results.AST,
      results.ALT
    ),
  };

  const getFinalResult = (
    testCode
  ) => {
    if (
      calculatedResults[testCode] !==
      undefined
    ) {
      return calculatedResults[
        testCode
      ];
    }

    return (
      results[testCode] || ""
    );
  };

  return (
    <div className="chemistry-report">
      {/* HEADER */}

      <div className="report-header">
        <h1>
          CLINICAL CHEMISTRY
          REPORT
        </h1>
      </div>

      {/* TABLE */}

      <div className="panel-section">
        <table>
          <thead>
            <tr>
              <th>Test</th>

              <th>Result</th>

              <th>Unit</th>
            </tr>
          </thead>

          <tbody>
            {testsToRender.map(
              (testCode) => {
                const test =
                  chemistryTests[
                    testCode
                  ];

                if (!test)
                  return null;

                const result =
                  getFinalResult(
                    testCode
                  );

                const isCalculated =
                  [
                    "VLDL",
                    "LDL",
                    "GGT",
                  ].includes(
                    testCode
                  );

                return (
                  <tr
                    key={testCode}
                  >
                    {/* TEST */}

                    <td>
                      {test.name}
                    </td>

                    {/* RESULT */}

                    <td>
                      {isCalculated ? (
                        <input
                          type="text"
                          value={result}
                          readOnly
                        />
                      ) : (
                        <input
                          type="number"
                          value={result}
                          onChange={(
                            e
                          ) =>
                            handleChange(
                              testCode,
                              e.target
                                .value
                            )
                          }
                        />
                      )}
                    </td>

                    {/* UNIT */}

                    <td>
                      {test.unit}
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}