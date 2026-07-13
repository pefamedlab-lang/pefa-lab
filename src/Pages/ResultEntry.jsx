import { useState } from "react";

import { supabase } from "../supabase";

export default function ResultEntry() {
  const [patientName,
    setPatientName] =
    useState("");

  const [labNumber,
    setLabNumber] =
    useState("");

  const [testType,
    setTestType] =
    useState("");

  const [profileType,
    setProfileType] =
    useState("");

  const [microType,
    setMicroType] =
    useState("");

  const [result,
    setResult] =
    useState("");

  const [unit, setUnit] =
    useState("");

  const [reference,
    setReference] =
    useState("");

  const [flag, setFlag] =
    useState("");

  const [growth,
    setGrowth] =
    useState("");

  const [organism,
    setOrganism] =
    useState("");

  // SAVE RESULT

  const saveResult =
    async () => {
      const { error } =
        await supabase
          .from("results")
          .insert([
            {
              lab_number:
                labNumber,

              patient_name:
                patientName,

              test_name:
                profileType ||
                microType ||
                testType,

              department:
                testType,

              result,

              unit,

              reference_range:
                reference,

              flag,

              scientist:
                "Laboratory Scientist",
            },
          ]);

      if (error) {
        alert(
          error.message
        );

        return;
      }

      alert(
        "Result Saved Successfully"
      );
    };

  return (
    <div
      style={{
        background: "white",
        padding: "30px",
        borderRadius:
          "15px",
        marginTop: "30px",
      }}
    >
      <h2>
        Smart Result
        Entry Engine
      </h2>

      {/* PATIENT */}

      <div
        style={{
          display: "grid",
          gap: "15px",
          marginTop: "25px",
        }}
      >
        <input
          type="text"
          placeholder="Patient Name"
          value={
            patientName
          }
          onChange={(e) =>
            setPatientName(
              e.target.value
            )
          }
        />

        <input
          type="text"
          placeholder="Lab Number"
          value={labNumber}
          onChange={(e) =>
            setLabNumber(
              e.target.value
            )
          }
        />

        {/* TEST TYPE */}

        <select
          value={testType}
          onChange={(e) =>
            setTestType(
              e.target.value
            )
          }
        >
          <option value="">
            Select Test Type
          </option>

          <option value="Qualitative">
            Qualitative
            Test
          </option>

          <option value="Quantitative">
            Quantitative
            Test
          </option>

          <option value="Profile">
            Profile Test
          </option>

          <option value="Microbiology">
            Microbiology
            Test
          </option>
        </select>
      </div>

      {/* QUALITATIVE */}

      {testType ===
        "Qualitative" && (
        <div
          style={{
            marginTop:
              "30px",
          }}
        >
          <h3>
            Qualitative
            Result
          </h3>

          <select
            value={result}
            onChange={(e) =>
              setResult(
                e.target.value
              )
            }
          >
            <option value="">
              Select Result
            </option>

            <option value="Negative">
              Negative
            </option>

            <option value="Positive">
              Positive
            </option>

            <option value="Reactive">
              Reactive
            </option>

            <option value="Non-Reactive">
              Non-Reactive
            </option>
          </select>
        </div>
      )}

      {/* QUANTITATIVE */}

      {testType ===
        "Quantitative" && (
        <div
          style={{
            display: "grid",
            gap: "15px",
            marginTop:
              "30px",
          }}
        >
          <h3>
            Quantitative
            Result
          </h3>

          <input
            type="text"
            placeholder="Result"
            value={result}
            onChange={(e) =>
              setResult(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="Unit"
            value={unit}
            onChange={(e) =>
              setUnit(
                e.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="Reference Range"
            value={reference}
            onChange={(e) =>
              setReference(
                e.target.value
              )
            }
          />

          <select
            value={flag}
            onChange={(e) =>
              setFlag(
                e.target.value
              )
            }
          >
            <option value="">
              Select Flag
            </option>

            <option value="Normal">
              Normal
            </option>

            <option value="High">
              High
            </option>

            <option value="Low">
              Low
            </option>
          </select>
        </div>
      )}

      {/* PROFILE */}

      {testType ===
        "Profile" && (
        <div
          style={{
            marginTop:
              "30px",
          }}
        >
          <h3>
            Profile Test
          </h3>

          <select
            value={
              profileType
            }
            onChange={(e) =>
              setProfileType(
                e.target.value
              )
            }
          >
            <option value="">
              Select Profile
            </option>

            <option value="FBC">
              Full Blood
              Count
            </option>

            <option value="EUCR">
              EUCR
            </option>

            <option value="LFT">
              Liver Function
              Test
            </option>

            <option value="Lipid Profile">
              Lipid Profile
            </option>
          </select>

          {/* FBC */}

          {profileType ===
            "FBC" && (
            <table
              style={{
                width:
                  "100%",
                marginTop:
                  "25px",
              }}
            >
              <tbody>
                <tr>
                  <td>
                    WBC
                  </td>

                  <td>
                    <input type="text" />
                  </td>

                  <td>
                    x10⁹/L
                  </td>

                  <td>
                    4–11
                  </td>
                </tr>

                <tr>
                  <td>
                    RBC
                  </td>

                  <td>
                    <input type="text" />
                  </td>

                  <td>
                    x10¹²/L
                  </td>

                  <td>
                    4–6
                  </td>
                </tr>

                <tr>
                  <td>
                    Hb
                  </td>

                  <td>
                    <input type="text" />
                  </td>

                  <td>
                    g/dL
                  </td>

                  <td>
                    12–16
                  </td>
                </tr>

                <tr>
                  <td>
                    Platelets
                  </td>

                  <td>
                    <input type="text" />
                  </td>

                  <td>
                    x10⁹/L
                  </td>

                  <td>
                    150–400
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {/* EUCR */}

          {profileType ===
            "EUCR" && (
            <table
              style={{
                width:
                  "100%",
                marginTop:
                  "25px",
              }}
            >
              <tbody>
                <tr>
                  <td>
                    Urea
                  </td>

                  <td>
                    <input type="text" />
                  </td>

                  <td>
                    mmol/L
                  </td>

                  <td>
                    2.5–7.1
                  </td>
                </tr>

                <tr>
                  <td>
                    Creatinine
                  </td>

                  <td>
                    <input type="text" />
                  </td>

                  <td>
                    µmol/L
                  </td>

                  <td>
                    62–106
                  </td>
                </tr>

                <tr>
                  <td>
                    Sodium
                  </td>

                  <td>
                    <input type="text" />
                  </td>

                  <td>
                    mmol/L
                  </td>

                  <td>
                    135–145
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {/* LFT */}

          {profileType ===
            "LFT" && (
            <table
              style={{
                width:
                  "100%",
                marginTop:
                  "25px",
              }}
            >
              <tbody>
                <tr>
                  <td>
                    AST
                  </td>

                  <td>
                    <input type="text" />
                  </td>

                  <td>
                    U/L
                  </td>

                  <td>
                    0–40
                  </td>
                </tr>

                <tr>
                  <td>
                    ALT
                  </td>

                  <td>
                    <input type="text" />
                  </td>

                  <td>
                    U/L
                  </td>

                  <td>
                    0–41
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* MICROBIOLOGY */}

      {testType ===
        "Microbiology" && (
        <div
          style={{
            marginTop:
              "30px",
          }}
        >
          <h3>
            Microbiology
            Workflow
          </h3>

          <select
            value={microType}
            onChange={(e) =>
              setMicroType(
                e.target.value
              )
            }
          >
            <option value="">
              Select Test
            </option>

            <option value="Urine MCS">
              Urine M/C/S
            </option>

            <option value="Stool MCS">
              Stool M/C/S
            </option>

            <option value="HVS MCS">
              HVS M/C/S
            </option>

            <option value="Blood Culture">
              Blood Culture
            </option>

            <option value="Seminal Fluid Analysis">
              Seminal Fluid
              Analysis
            </option>
          </select>

          {/* MICROSCOPY */}

          {microType &&
            microType !==
              "Blood Culture" &&
            microType !==
              "Seminal Fluid Analysis" && (
              <div
                style={{
                  marginTop:
                    "25px",
                }}
              >
                <h4>
                  Microscopy
                </h4>

                <table
                  style={{
                    width:
                      "100%",
                  }}
                >
                  <tbody>
                    <tr>
                      <td>
                        Pus Cells
                      </td>

                      <td>
                        <input type="text" />
                      </td>
                    </tr>

                    <tr>
                      <td>
                        Epithelial
                        Cells
                      </td>

                      <td>
                        <input type="text" />
                      </td>
                    </tr>

                    <tr>
                      <td>
                        RBC
                      </td>

                      <td>
                        <input type="text" />
                      </td>
                    </tr>

                    <tr>
                      <td>
                        Others
                      </td>

                      <td>
                        <input type="text" />
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* CULTURE */}

                <div
                  style={{
                    marginTop:
                      "25px",
                  }}
                >
                  <select
                    value={
                      growth
                    }
                    onChange={(
                      e
                    ) =>
                      setGrowth(
                        e.target
                          .value
                      )
                    }
                  >
                    <option value="">
                      Growth
                      Status
                    </option>

                    <option value="No Growth">
                      No Growth
                    </option>

                    <option value="Growth Seen">
                      Growth Seen
                    </option>
                  </select>

                  {/* ORGANISM */}

                  {growth ===
                    "Growth Seen" && (
                    <div
                      style={{
                        marginTop:
                          "20px",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Organism Isolated"
                        value={
                          organism
                        }
                        onChange={(
                          e
                        ) =>
                          setOrganism(
                            e
                              .target
                              .value
                          )
                        }
                      />

                      {/* SENSITIVITY */}

                      <table
                        style={{
                          width:
                            "100%",
                          marginTop:
                            "20px",
                        }}
                      >
                        <tbody>
                          <tr>
                            <td>
                              Ciprofloxacin
                            </td>

                            <td>
                              <select>
                                <option>
                                  +++
                                </option>

                                <option>
                                  ++
                                </option>

                                <option>
                                  +
                                </option>

                                <option>
                                  R
                                </option>
                              </select>
                            </td>
                          </tr>

                          <tr>
                            <td>
                              Ceftriaxone
                            </td>

                            <td>
                              <select>
                                <option>
                                  +++
                                </option>

                                <option>
                                  ++
                                </option>

                                <option>
                                  +
                                </option>

                                <option>
                                  R
                                </option>
                              </select>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* BLOOD CULTURE */}

          {microType ===
            "Blood Culture" && (
            <div
              style={{
                marginTop:
                  "25px",
              }}
            >
              <select
                value={growth}
                onChange={(e) =>
                  setGrowth(
                    e.target
                      .value
                  )
                }
              >
                <option value="">
                  Select Growth
                </option>

                <option value="No Growth">
                  No Growth
                </option>

                <option value="Growth Seen">
                  Growth Seen
                </option>
              </select>

              {growth ===
                "Growth Seen" && (
                <div
                  style={{
                    marginTop:
                      "20px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Organism Isolated"
                  />

                  <table
                    style={{
                      width:
                        "100%",
                      marginTop:
                        "20px",
                    }}
                  >
                    <tbody>
                      <tr>
                        <td>
                          Vancomycin
                        </td>

                        <td>
                          <select>
                            <option>
                              +++
                            </option>

                            <option>
                              ++
                            </option>

                            <option>
                              +
                            </option>

                            <option>
                              R
                            </option>
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SEMINAL FLUID */}

          {microType ===
            "Seminal Fluid Analysis" && (
            <div
              style={{
                marginTop:
                  "25px",
              }}
            >
              <h4>
                Seminal Fluid
                Analysis
              </h4>

              <table
                style={{
                  width:
                    "100%",
                }}
              >
                <tbody>
                  <tr>
                    <td>
                      Volume
                    </td>

                    <td>
                      <input type="text" />
                    </td>

                    <td>
                      ml
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Motility
                    </td>

                    <td>
                      <input type="text" />
                    </td>

                    <td>
                      %
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Sperm Count
                    </td>

                    <td>
                      <input type="text" />
                    </td>

                    <td>
                      million/ml
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Morphology
                    </td>

                    <td>
                      <input type="text" />
                    </td>

                    <td>
                      %
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SAVE */}

      <button
        onClick={saveResult}
        style={{
          marginTop: "40px",
          padding:
            "15px 25px",
          background:
            "#0097b2",
          color: "white",
          border: "none",
          borderRadius:
            "10px",
          cursor: "pointer",
        }}
      >
        Save Result
      </button>
    </div>
  );
}