import {
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Save,
} from "lucide-react";

import "../styles/hematology.css";

import { supabase } from "../supabase";

import { getUserSession } from "../Auth/authSession";

import { cbcParameters } from "../Hematology/cbcParameters";

import { cbcReferenceRanges } from "../Hematology/cbcReferenceRanges";

import { getCBCFlag } from "../Hematology/getCBCFlag";

import {
  RESULT_STATUS,

  getStatusColor,

  getStatusLabel,

  getNextStatus,
} from "../Utils/resultStatusEngine";

export default function HematologyReport() {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  const patient =
    location.state?.patient || {};

  const user =
    getUserSession();

  const selectedTests =
    location.state
      ?.selectedTests || [];

  /* =========================
     STATES
  ========================= */

  const [results, setResults] =
    useState(
      patient.result_data ||
        {}
    );

  const [saving, setSaving] =
    useState(false);

  const [saveMessage,
    setSaveMessage] =
    useState("");

  const [status, setStatus] =
    useState(
      patient.authorization_status ||
        RESULT_STATUS.PENDING
    );

  const [scientistComment,
    setScientistComment] =
    useState(
      patient.scientist_comment ||
        ""
    );

  const [pathologistRemark,
    setPathologistRemark] =
    useState(
      patient.pathologist_remark ||
        ""
    );

  /* =========================
     INPUT ENGINE
  ========================= */

  const handleChange = (
    code,
    value
  ) => {
    setResults((prev) => ({
      ...prev,

      [code]: value,
    }));
  };

  /* =========================
     CBC DETECTION
  ========================= */

  const hasCBC =
    selectedTests.includes(
      "CBC"
    );

  /* =========================
     RANGE ENGINE
  ========================= */

  const getReferenceRange = (
    parameterCode
  ) => {
    const parameter =
      cbcReferenceRanges[
        parameterCode
      ];

    if (!parameter)
      return "";

    const age =
      Number(
        patient.age
      );

    /* INFANT */

    if (
      age < 1 &&
      parameter.infant
    ) {
      return `${parameter.infant.min} - ${parameter.infant.max}`;
    }

    /* CHILD */

    if (
      age < 18 &&
      parameter.child
    ) {
      return `${parameter.child.min} - ${parameter.child.max}`;
    }

    /* ADULT */

    if (
      parameter[
        patient.sex
      ]
    ) {
      return `${parameter[patient.sex].min} - ${parameter[patient.sex].max}`;
    }

    return "";
  };

  /* =========================
     INTERPRETATION ENGINE
  ========================= */

  const generateInterpretation =
    () => {
      const hb = Number(
        results.hb
      );

      const wbc = Number(
        results.wbc
      );

      const platelet =
        Number(
          results.platelet
        );

      let comments = [];

      /* ANEMIA */

      if (
        patient.sex ===
          "Male" &&
        hb < 13
      ) {
        comments.push(
          "Low hemoglobin level suggestive of anemia."
        );
      }

      if (
        patient.sex ===
          "Female" &&
        hb < 12
      ) {
        comments.push(
          "Low hemoglobin level suggestive of anemia."
        );
      }

      /* HIGH WBC */

      if (wbc > 11) {
        comments.push(
          "Elevated white blood cell count may indicate infection or inflammation."
        );
      }

      /* LOW PLATELET */

      if (
        platelet < 150
      ) {
        comments.push(
          "Low platelet count detected."
        );
      }

      /* NORMAL */

      if (
        comments.length === 0
      ) {
        comments.push(
          "No major hematological abnormality detected."
        );
      }

      return comments;
    };

  /* =========================
     CRITICAL ALERT ENGINE
  ========================= */

  const criticalAlerts =
    [];

let abnormalCount = 0;

let criticalCount = 0;

  cbcParameters.forEach(
    (parameter) => {
      const value =
        results[
          parameter.code
        ];

      const flag =
        getCBCFlag(
          parameter.code,
          value,
          patient.sex,
          patient.age
        );

      if (
        flag ===
        "CRITICAL"
      ) 
criticalCount += 1;
{
        criticalAlerts.push(
          `${parameter.name} is at critical level.`
        );
      }
    }
  );

  /* =========================
     SAVE RESULT
  ========================= */

  const handleSaveResult =
    async () => {
      setSaving(true);

      setSaveMessage("");

      const {
        error,
      } = await supabase
        .from(
          "patient_results"
        )
        .update({
          result_data:
            results,

          scientist_comment:
            scientistComment,

          pathologist_remark:
            pathologistRemark,

          entered_by:
            user?.username,
        })
        .eq(
          "id",
          patient.id
        );

      if (error) {
        console.error(
          error
        );

        setSaveMessage(
          "Failed to save result."
        );
      } else {
        setSaveMessage(
          "Result saved successfully."
        );
      }

      setSaving(false);
    };

  /* =========================
     STATUS ENGINE
  ========================= */

  const handleStatusAdvance =
    async () => {
      const nextStatus =
        getNextStatus(
          status
        );

      let auditPayload =
        {
          authorization_status:
            nextStatus,
        };

      /* REVIEWED */

      if (
        nextStatus ===
        RESULT_STATUS.REVIEWED
      ) {
        auditPayload = {
          ...auditPayload,

          reviewed_by:
            user?.username,

          reviewed_at:
            new Date().toISOString(),
        };
      }

      /* AUTHORIZED */

      if (
        nextStatus ===
        RESULT_STATUS.AUTHORIZED
      ) {
        auditPayload = {
          ...auditPayload,

          authorized_by:
            user?.username,

          authorized_date:
            new Date().toISOString(),
        };
      }

      /* RELEASED */

      if (
        nextStatus ===
        RESULT_STATUS.RELEASED
      ) {
        auditPayload = {
          ...auditPayload,

          released_by:
            user?.username,

          released_at:
            new Date().toISOString(),
        };
      }

      /* UPDATE LOCAL */

      setStatus(
        nextStatus
      );

      /* UPDATE DATABASE */

      const {
        error,
      } = await supabase
        .from(
          "patient_results"
        )
        .update(
          auditPayload
        )
        .eq(
          "id",
          patient.id
        );

      if (error) {
        console.error(
          error
        );

        setSaveMessage(
          "Failed to update workflow."
        );
      } else {
        setSaveMessage(
          `Result moved to ${nextStatus}.`
        );
      }
    };

  return (
    <div className="hematology-report">
      {/* HEADER */}

      <div className="report-header">
        <div>
          <h1>
            Hematology
            Report
          </h1>

          <p>
            Enterprise
            CBC workflow
            engine
          </p>
        </div>

        {/* STATUS */}

        <div
          className="status-badge"
          style={{
            backgroundColor:
              getStatusColor(
                status
              ),
          }}
        >
          {getStatusLabel(
            status
          )}
        </div>
      </div>

      {/* PATIENT INFO */}

      <div className="patient-info">
        <div>
          <strong>
            Patient:
          </strong>{" "}
          {
            patient.patient_name
          }
        </div>

        <div>
          <strong>
            Sex:
          </strong>{" "}
          {patient.sex}
        </div>

        <div>
          <strong>
            Age:
          </strong>{" "}
          {patient.age}
        </div>

        <div>
          <strong>
            Lab Number:
          </strong>{" "}
          {
            patient.lab_number
          }
        </div>
      </div>

      {/* CBC SECTION */}

      {hasCBC && (
        <div className="panel-section">
          {/* CRITICAL ALERT */}

          {criticalAlerts.length >
            0 && (
            <div className="critical-alert">
              <h3>
                Critical
                Value Alert
              </h3>

              <ul>
                {criticalAlerts.map(
                  (
                    alert,
                    index
                  ) => (
                    <li
                      key={
                        index
                      }
                    >
                      {
                        alert
                      }
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          <h2>
            Complete Blood
            Count
          </h2>

          <table>
            <thead>
              <tr>
                <th>
                  Parameter
                </th>

                <th>
                  Result
                </th>

                <th>
                  Unit
                </th>

                <th>
                  Reference
                  Range
                </th>

                <th>
                  Flag
                </th>
              </tr>
            </thead>

            <tbody>
              {cbcParameters.map(
                (
                  parameter
                ) => {
                  const value =
                    results[
                      parameter
                        .code
                    ] || "";

                  const flag =
                    getCBCFlag(
                      parameter.code,
                      value,
                      patient.sex,
                      patient.age
                    );

                  return (
                    <tr
                      key={
                        parameter.code
                      }
                    >
                      {/* PARAMETER */}

                      <td>
                        {
                          parameter.name
                        }
                      </td>

                      {/* RESULT */}

                      <td>
                        <input
                          type="number"
                          value={
                            value
                          }
                          onChange={(
                            e
                          ) =>
                            handleChange(
                              parameter.code,
                              e
                                .target
                                .value
                            )
                          }
                          className={
                            flag ===
                            "CRITICAL"
                              ? "critical-input"
                              : flag ===
                                    "H" ||
                                  flag ===
                                    "L"
                                ? "abnormal-input"
                                : ""
                          }
                        />
                      </td>

                      {/* UNIT */}

                      <td>
                        {
                          parameter.unit
                        }
                      </td>

                      {/* RANGE */}

                      <td>
                        {getReferenceRange(
                          parameter.code
                        )}
                      </td>

                      {/* FLAG */}

                      <td
                        className={
                          flag ===
                          "CRITICAL"
                            ? "flag-critical"
                            : flag ===
                                  "H" ||
                                flag ===
                                  "L"
                              ? "flag-high"
                              : "flag-normal"
                        }
                      >
                        {flag}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>

          {/* INTERPRETATION */}

          <div className="interpretation-box">
            <h3>
              Laboratory
              Interpretation
            </h3>

            <ul>
              {generateInterpretation().map(
                (
                  item,
                  index
                ) => (
                  <li key={index}>
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>

          {/* SCIENTIST COMMENT */}

          <div className="comment-section">
            <label>
              Scientist
              Comment
            </label>

            <textarea
              value={
                scientistComment
              }
              onChange={(e) =>
                setScientistComment(
                  e.target.value
                )
              }
              placeholder="Enter scientist interpretation or observation..."
            />
          </div>

          {/* PATHOLOGIST REMARK */}

          <div className="comment-section">
            <label>
              Pathologist
              Remark
            </label>

            <textarea
              value={
                pathologistRemark
              }
              onChange={(e) =>
                setPathologistRemark(
                  e.target.value
                )
              }
              placeholder="Final pathology remark..."
            />
          </div>

          {/* ACTIONS */}

          <div className="workflow-actions">
            {/* SAVE */}

            <button
              className="save-btn"
              onClick={
                handleSaveResult
              }
            >
              <Save
                size={18}
              />

              {saving
                ? "Saving..."
                : "Save Result"}
            </button>

            {/* PREVIEW */}

            <button
              className="preview-btn"
              onClick={() =>
                navigate(
                  "/hematology-preview",
                  {
                    state: {
                      patient: {
                        ...patient,

                        result_data:
                          results,
                      },
                    },
                  }
                )
              }
            >
              Preview Result
            </button>

            {/* SCIENTIST */}

            {user?.role ===
              "Scientist" &&
              status ===
                RESULT_STATUS.PENDING && (
                <button
                  className="authorize-btn"
                  onClick={
                    handleStatusAdvance
                  }
                >
                  Move to Reviewed
                </button>
              )}

            {/* MANAGER */}

            {user?.role ===
              "Manager" &&
              status ===
                RESULT_STATUS.REVIEWED && (
                <button
                  className="authorize-btn"
                  onClick={
                    handleStatusAdvance
                  }
                >
                  Move to Authorized
                </button>
              )}

            {/* ADMIN */}

            {user?.role ===
              "Admin" &&
              status ===
                RESULT_STATUS.AUTHORIZED && (
                <button
                  className="authorize-btn"
                  onClick={
                    handleStatusAdvance
                  }
                >
                  Release Result
                </button>
              )}
          </div>

          {/* MESSAGE */}

          {saveMessage && (
            <div className="save-message">
              {
                saveMessage
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}