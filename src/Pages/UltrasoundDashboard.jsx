import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "../styles/ultrasoundDashboard.css";

// Forms
import OBSForm from "../components/ultrasound/forms/OBSForm";
import PelvicScanForm from "../components/ultrasound/forms/PelvicScanForm";
import AbdominalScanForm from "../components/ultrasound/forms/AbdominalScanForm";
import AbdominoPelvicScanForm from "../components/ultrasound/forms/AbdominoPelvicScanForm";
import BreastScanForm from "../components/ultrasound/forms/BreastScanForm";
import ScrotalScanForm from "../components/ultrasound/forms/ScrotalScanForm";
import KidneyScanForm from "../components/ultrasound/forms/KidneyScanForm";
import LiverScanForm from "../components/ultrasound/forms/LiverScanForm";
import ThyroidScanForm from "../components/ultrasound/forms/ThyroidScanForm";
import ProstateScanForm from "../components/ultrasound/forms/ProstateScanForm";
import SoftTissueScanForm from "../components/ultrasound/forms/SoftTissueScanForm";

const FORM_COMPONENTS = {
  obs_scan: OBSForm,
  pelvic_scan: PelvicScanForm,
  abdominal_scan: AbdominalScanForm,
  abdomino_pelvic_scan: AbdominoPelvicScanForm,
  breast_scan: BreastScanForm,
  scrotal_scan: ScrotalScanForm,
  kidney_scan: KidneyScanForm,
  liver_scan: LiverScanForm,
  thyroid_scan: ThyroidScanForm,
  prostate_scan: ProstateScanForm,
  soft_tissue_scan: SoftTissueScanForm,
};

export default function UltrasoundResultDashboard() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [resultData, setResultData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("ultrasound_results")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setPatients(data || []);
    }

    setLoading(false);
  };

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setResultData(patient.result || {});
  };

  const handleChange = (field, value) => {
    setResultData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveReport = async () => {
    if (!selectedPatient) return;

    setSaving(true);

    const { error } = await supabase
      .from("ultrasound_results")
      .update({
        result: resultData,
      })
      .eq("id", selectedPatient.id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Report saved successfully.");

    loadPatients();
  };

  const CurrentForm =
    FORM_COMPONENTS[selectedPatient?.template_type] || null;

  return (
    <div className="ultrasound-dashboard">

      {/* LEFT PANEL */}

      <div className="patient-list">

        <h2>Ultrasound Queue</h2>

        {loading && <p>Loading...</p>}

        {!loading && patients.length === 0 && (
          <p>No pending requests.</p>
        )}

        {patients.map((patient) => (
          <button
            key={patient.id}
            className={`patient-item ${
              selectedPatient?.id === patient.id ? "active" : ""
            }`}
            onClick={() => selectPatient(patient)}
          >
            <strong>{patient.patient_name}</strong>

            <br />

            <small>{patient.lab_number}</small>

            <br />

            <span>{patient.test_type}</span>
          </button>
        ))}
      </div>

      {/* RIGHT PANEL */}

      <div className="result-editor">

        {!selectedPatient && (
          <div className="empty-state">
            <h2>Select a patient</h2>
            <p>Choose a patient from the queue to begin reporting.</p>
          </div>
        )}

        {selectedPatient && (
          <>
            <div className="editor-header">

              <h1>{selectedPatient.test_type}</h1>

              <div className="patient-info">

                <p>
                  <strong>Patient:</strong>{" "}
                  {selectedPatient.patient_name}
                </p>

                <p>
                  <strong>Lab No:</strong>{" "}
                  {selectedPatient.lab_number}
                </p>

                <p>
                  <strong>Age:</strong>{" "}
                  {selectedPatient.age}
                </p>

                <p>
                  <strong>Sex:</strong>{" "}
                  {selectedPatient.sex}
                </p>

                <p>
                  <strong>Clinical History:</strong>{" "}
                  {selectedPatient.clinical_indication}
                </p>

              </div>
            </div>

            <hr />

            {CurrentForm ? (
              <CurrentForm
                data={resultData}
                onChange={handleChange}
              />
            ) : (
              <div className="unsupported-form">
                <h3>No reporting template available.</h3>
                <p>
                  Template:
                  <strong> {selectedPatient.template_type}</strong>
                </p>
              </div>
            )}

            <div className="dashboard-actions">

              <button
                className="save-btn"
                onClick={saveReport}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Report"}
              </button>

            </div>

          </>
        )}

      </div>

    </div>
  );
}