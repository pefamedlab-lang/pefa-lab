import { useState } from "react";

import PrintLayout from "../../components/printing/PrintLayout";

import "../../styles/clinicalDocuments.css";

export default function ResultSummary() {

  const [summary, setSummary] = useState({

    summaryNumber: "",

    issueDate: "",

    patientName: "",

    hospitalNumber: "",

    age: "",

    gender: "",

    clinician: "",

    diagnosis: "",

    clinicalHistory: "",

    laboratorySummary: "",

    interpretation: "",

    recommendation: "",

    reviewedBy: "",

    designation: "",

    licenceNumber: "",

  });

  const [results, setResults] = useState([

    {

      investigation: "",

      result: "",

      referenceRange: "",

      remark: "",

    },

  ]);

  const handleSummaryChange = ({ target }) => {

    const { name, value } = target;

    setSummary((prev) => ({

      ...prev,

      [name]: value,

    }));

  };

  const handleResultChange = (index, field, value) => {

    const copy = [...results];

    copy[index][field] = value;

    setResults(copy);

  };

  const addResult = () => {

    setResults([

      ...results,

      {

        investigation: "",

        result: "",

        referenceRange: "",

        remark: "",

      },

    ]);

  };

  const removeResult = (index) => {

    if (results.length === 1) return;

    setResults(

      results.filter((_, i) => i !== index)

    );

  };

  return (

    <PrintLayout>

      <div className="clinical-document">

        <div className="document-title">

          <h2>

            LABORATORY RESULT SUMMARY

          </h2>

          <p>

            Summary of Laboratory Findings

          </p>

        </div>

        {/* ================================= */}

        <section className="referral-section">

          <div className="section-header">

            Patient Information

          </div>

          <div className="patient-grid">

            <div className="form-group">

              <label>

                Patient Name

              </label>

              <input
                name="patientName"
                value={summary.patientName}
                onChange={handleSummaryChange}
              />

            </div>

            <div className="form-group">

              <label>

                Hospital Number

              </label>

              <input
                name="hospitalNumber"
                value={summary.hospitalNumber}
                onChange={handleSummaryChange}
              />

            </div>

            <div className="form-group">

              <label>

                Age

              </label>

              <input
                name="age"
                value={summary.age}
                onChange={handleSummaryChange}
              />

            </div>

            <div className="form-group">

              <label>

                Gender

              </label>

              <select
                name="gender"
                value={summary.gender}
                onChange={handleSummaryChange}
              >

                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>

              </select>

            </div>

          </div>

        </section>

        {/* ================================= */}

        <section className="referral-section">

          <div className="section-header">

            Investigation Summary

          </div>

          <table>

            <thead>

              <tr>

                <th>

                  Investigation

                </th>

                <th>

                  Result

                </th>

                <th>

                  Reference Range

                </th>

                <th>

                  Remark

                </th>

                <th>

                  Action

                </th>

              </tr>

            </thead>

            <tbody>

              {

                results.map((item, index) => (

                  <tr key={index}>

                    <td>

                      <input
                        value={item.investigation}
                        onChange={(e)=>

                          handleResultChange(
                            index,
                            "investigation",
                            e.target.value
                          )

                        }
                      />

                    </td>

                    <td>

                      <input
                        value={item.result}
                        onChange={(e)=>

                          handleResultChange(
                            index,
                            "result",
                            e.target.value
                          )

                        }
                      />

                    </td>

                    <td>

                      <input
                        value={item.referenceRange}
                        onChange={(e)=>

                          handleResultChange(
                            index,
                            "referenceRange",
                            e.target.value
                          )

                        }
                      />

                    </td>

                    <td>

                      <input
                        value={item.remark}
                        onChange={(e)=>

                          handleResultChange(
                            index,
                            "remark",
                            e.target.value
                          )

                        }
                      />

                    </td>

                    <td>

                      <button
                        type="button"
                        onClick={()=>
                          removeResult(index)
                        }
                      >

                        Remove

                      </button>

                    </td>

                  </tr>

                ))

              }

            </tbody>

          </table>

          <button
            type="button"
            onClick={addResult}
          >

            + Add Investigation

          </button>

        </section>

        {/* ================================= */}

        <section className="referral-section">

          <div className="section-header">

            Clinical Interpretation

          </div>

          <div className="form-group full-width">

            <label>

              Clinical History

            </label>

            <textarea
              rows={4}
              name="clinicalHistory"
              value={summary.clinicalHistory}
              onChange={handleSummaryChange}
            />

          </div>

          <div className="form-group full-width">

            <label>

              Diagnosis

            </label>

            <textarea
              rows={3}
              name="diagnosis"
              value={summary.diagnosis}
              onChange={handleSummaryChange}
            />

          </div>

          <div className="form-group full-width">

            <label>

              Laboratory Summary

            </label>

            <textarea
              rows={5}
              name="laboratorySummary"
              value={summary.laboratorySummary}
              onChange={handleSummaryChange}
            />

          </div>

          <div className="form-group full-width">

            <label>

              Interpretation

            </label>

            <textarea
              rows={5}
              name="interpretation"
              value={summary.interpretation}
              onChange={handleSummaryChange}
            />

          </div>

          <div className="form-group full-width">

            <label>

              Recommendation

            </label>

            <textarea
              rows={4}
              name="recommendation"
              value={summary.recommendation}
              onChange={handleSummaryChange}
            />

          </div>

        </section>

        {/* ================================= */}

        <section className="referral-section">

          <div className="section-header">

            Authorized By

          </div>

          <div className="patient-grid">

            <div className="form-group">

              <label>

                Reviewed By

              </label>

              <input
                name="reviewedBy"
                value={summary.reviewedBy}
                onChange={handleSummaryChange}
              />

            </div>

            <div className="form-group">

              <label>

                Designation

              </label>

              <input
                name="designation"
                value={summary.designation}
                onChange={handleSummaryChange}
              />

            </div>

            <div className="form-group">

              <label>

                Licence Number

              </label>

              <input
                name="licenceNumber"
                value={summary.licenceNumber}
                onChange={handleSummaryChange}
              />

            </div>

          </div>

          <div className="signature-row">

            <div className="signature-box">

              <label>

                Signature

              </label>

              <div className="signature-line"></div>

            </div>

            <div className="signature-box">

              <label>

                Official Stamp

              </label>

              <div className="signature-line"></div>

            </div>

          </div>

        </section>

      </div>

    </PrintLayout>

  );

}