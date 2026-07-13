import {
  useState,
} from "react";

import {
  Save,
} from "lucide-react";

import "../styles/microbiology.css";

export default function MicrobiologyReport() {
  const [
    patientName,
    setPatientName,
  ] = useState("");

  const [
    labNumber,
    setLabNumber,
  ] = useState("");

  const [
    specimen,
    setSpecimen,
  ] = useState("");

  const [
    organism,
    setOrganism,
  ] = useState("");

  const [
    comment,
    setComment,
  ] = useState("");

  const saveReport =
    () => {
      alert(
        "Microbiology report saved"
      );
    };

  return (
    <div className="micro-page">
      {/* HEADER */}

      <div className="micro-header">
        <h1>
          Microbiology
          Reporting
        </h1>

        <p>
          Culture &
          Sensitivity
          Engine
        </p>
      </div>

      {/* CARD */}

      <div className="micro-card">
        <div className="micro-grid">
          <input
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
            placeholder="Lab Number"
            value={
              labNumber
            }
            onChange={(e) =>
              setLabNumber(
                e.target.value
              )
            }
          />

          <input
            placeholder="Specimen"
            value={
              specimen
            }
            onChange={(e) =>
              setSpecimen(
                e.target.value
              )
            }
          />
        </div>

        <textarea
          placeholder="Organism Isolated"
          value={organism}
          onChange={(e) =>
            setOrganism(
              e.target.value
            )
          }
        />

        <textarea
          placeholder="Comment"
          value={comment}
          onChange={(e) =>
            setComment(
              e.target.value
            )
          }
        />

        <button
          className="micro-save-btn"
          onClick={
            saveReport
          }
        >
          <Save
            size={18}
          />

          Save Report
        </button>
      </div>
    </div>
  );
}