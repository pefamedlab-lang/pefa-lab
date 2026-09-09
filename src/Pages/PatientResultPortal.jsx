import { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck, Download, Printer } from "lucide-react";
import { supabase } from "../supabase";
import PrintEngine from "../utils/PrintEngine";
import { SavedReportPreview, buildReports } from "./laboratory/LaboratoryResultDashboard";
import "../styles/patientResultPortal.css";

const PORTAL_PRINT_MODE = "full";

const text = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const normalize = (value) =>
  text(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const parseObject = (value) => {
  if (!value) return null;
  if (typeof value === "object") return value;
  if (typeof value !== "string") return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const getSavedObject = (row) => {
  if (!row || typeof row !== "object") return {};

  const candidates = [row.result, row.result_data, row.resultData, row.payload, row.data];
  for (const candidate of candidates) {
    const parsed = parseObject(candidate);
    if (parsed) {
      const nested = parseObject(parsed.result);
      return nested ? { ...parsed, ...nested } : parsed;
    }
  }

  return row;
};

const isCoombsRow = (row) => {
  const source = getSavedObject(row);
  const name = normalize(
    row?.test_type ||
      row?.test_name ||
      row?.testName ||
      row?.short_name ||
      row?.shortName ||
      source?.testName ||
      source?.test_name ||
      ""
  );

  return (
    name.includes("direct coombs") ||
    name.includes("indirect coombs") ||
    name === "dat" ||
    name === "iat" ||
    normalize(source?.testType) === "dat" ||
    normalize(source?.testType) === "iat"
  );
};

const getCoombsMode = (row) => {
  const source = getSavedObject(row);
  const explicit = normalize(source?.testType || row?.test_type || row?.testType);
  const name = normalize(
    row?.test_name || row?.testName || source?.testName || source?.test_name || ""
  );

  if (explicit === "iat" || name.includes("indirect coombs") || name === "iat") return "IAT";
  if (explicit === "dat" || name.includes("direct coombs") || name === "dat") return "DAT";
  return "";
};

function PatientReport({ selectedResult, staffDirectory = [] }) {
  return (
    <SavedReportPreview
      report={selectedResult}
      printMode={PORTAL_PRINT_MODE}
      staffDirectory={staffDirectory}
    />
  );
}

export default function PatientResultPortal() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [patient, setPatient] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [staffDirectory, setStaffDirectory] = useState([]);
  const [form, setForm] = useState({ labNumber: "", accessCode: "" });

  const handleChange = (e) => {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  /* ==========================================================
     LOAD THE SAME STAFF SIGNATURE DIRECTORY USED BY THE
     LABORATORY RESULT DASHBOARD.
     The shared PEFAReportShell resolves entered/authorized staff
     identities against this directory to display signature_url.
     ========================================================== */
  useEffect(() => {
    let active = true;

    const loadStaffDirectory = async () => {
      try {
        const { data, error } = await supabase
          .from("staff_users")
          .select("id, auth_user_id, username, full_name, role, signature_url, status")
          .eq("status", "Active")
          .order("full_name", { ascending: true });

        if (!active) return;

        if (error) {
          console.warn("[PEFA PATIENT PORTAL] Staff signature directory could not be loaded:", error);
          setStaffDirectory([]);
          return;
        }

        setStaffDirectory(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!active) return;
        console.warn("[PEFA PATIENT PORTAL] Staff directory load failed:", error);
        setStaffDirectory([]);
      }
    };

    loadStaffDirectory();

    return () => {
      active = false;
    };
  }, []);

  const searchResult = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const labNumber = form.labNumber.trim();
      const accessCode = form.accessCode.trim();

      if (!labNumber || !accessCode) {
        alert("Please enter your Lab Number and Access Code.");
        return;
      }

      const { data: registration, error: registrationError } = await supabase
        .from("registrations")
        .select("*")
        .eq("lab_number", labNumber)
        .eq("access_code", accessCode)
        .single();

      if (registrationError || !registration) {
        alert("Invalid Lab Number or Access Code.");
        return;
      }

      const { data: patientResults, error: resultError } = await supabase
        .from("laboratory_results")
        .select("*")
        .eq("lab_number", labNumber)
        .ilike("release_status", "released")
        .order("created_at", { ascending: false });

      if (resultError || !patientResults?.length) {
        alert("Result not yet released.");
        return;
      }

      /*
       * The Enterprise LIS now stores laboratory result workflow data in
       * laboratory_results. Do not depend on the legacy patient_results
       * table. The release check is case-insensitive because older rows may
       * contain Released/released variations.
       */
      const releasedResults = patientResults.filter(
        (row) => normalize(row?.release_status) === "released"
      );

      if (!releasedResults.length) {
        alert("Result not yet released.");
        return;
      }

      const mergedResults = releasedResults.map((result) => ({
        ...registration,
        ...result,
      }));

      const reports = buildReports(mergedResults).map((report) => ({
        ...report,
        // buildReports() is the shared Result Dashboard report builder.
        // The builder intentionally derives report metadata from its rows,
        // so preserve the released state at report level for the Patient Portal.
        release_status: report.items?.every(
          (row) => normalize(row?.release_status) === "released"
        )
          ? "Released"
          : "",
      }));

      setPatient(registration);
      setResults(mergedResults);
      setSelectedResult(reports[0] || null);
    } catch (error) {
      console.error("Result search error:", error);
      alert("Unable to retrieve your result. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const groupedResults = useMemo(
    () =>
      buildReports(results).map((report) => ({
        ...report,
        release_status: report.items?.every(
          (row) => normalize(row?.release_status) === "released"
        )
          ? "Released"
          : "",
      })),
    [results]
  );

  // IMPORTANT: selectedResult is a Dashboard report object, not a raw
  // laboratory_results row. Never test release_status on the raw report
  // object without preserving it from its report items.
  const selectedIsReleased =
    normalize(selectedResult?.release_status) === "released" ||
    (selectedResult?.items?.length > 0 &&
      selectedResult.items.every(
        (row) => normalize(row?.release_status) === "released"
      ));

  const safeFilePart = (value, fallback) =>
    text(value).replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").slice(0, 80) || fallback;

  const handleDownload = async () => {
    if (!selectedIsReleased) return;

    const lab = safeFilePart(selectedResult?.lab_number || form.labNumber, "PEFA-Laboratory");
    const name = safeFilePart(patient?.full_name, "Patient");
    const test = safeFilePart(
      selectedResult?.title || selectedResult?.test_type || selectedResult?.department || "Laboratory_Result",
      "Result"
    );

    await PrintEngine.download("portal-report", `${lab}_${name}_${test}.pdf`);
  };

  const handlePrint = () => {
    if (!selectedIsReleased) return;
    PrintEngine.print("portal-report", "PEFA Medical Report");
  };

  return (
    <div className="patient-result-page">
      <div className="patient-result-header">
        <ShieldCheck size={42} />
        <h1>Patient Result Portal</h1>
        <p>Secure Online Result Verification</p>
      </div>

      <div className="patient-result-card">
        <div className="search-grid">
          <div className="form-group">
            <label htmlFor="labNumber">Lab Number</label>
            <input
              id="labNumber"
              type="text"
              name="labNumber"
              placeholder="PMDS/26/001"
              value={form.labNumber}
              onChange={handleChange}
              autoComplete="off"
              onKeyDown={(e) => e.key === "Enter" && searchResult()}
            />
          </div>

          <div className="form-group">
            <label htmlFor="accessCode">Access Code</label>
            <input
              id="accessCode"
              type="text"
              name="accessCode"
              placeholder="PEFA-XXXX"
              value={form.accessCode}
              onChange={handleChange}
              autoComplete="off"
              onKeyDown={(e) => e.key === "Enter" && searchResult()}
            />
          </div>
        </div>

        <button type="button" className="search-btn" onClick={searchResult} disabled={loading}>
          <Search size={18} />
          {loading ? "Searching..." : "View Result"}
        </button>
      </div>

      <div className="patient-portal-home">
        <div className="welcome-card">
          <h2>
            Welcome back,
            <span className="patient-name">{patient?.full_name}</span>
          </h2>
          <p>
            Access your laboratory reports securely through the PEFA Medical Diagnostic Services
            Patient Portal. All released results can be viewed, downloaded, and printed instantly.
          </p>
        </div>

        {groupedResults.length > 0 && (
          <div className="report-selector-wrapper">
            <h3>Available Laboratory Reports</h3>
            <div className="report-selector">
              {groupedResults.map((report, index) => (
                <button
                  type="button"
                  key={`${report.test_type || report.title || "report"}-${index}`}
                  className={`report-chip ${selectedResult === report ? "active" : ""}`}
                  onClick={() => setSelectedResult(report)}
                >
                  {normalize(report?.release_status) === "released" ? "✓ " : "⏳ "}
                  {report.title || report.test_type || `${report.department || "Laboratory"} Result`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedResult && selectedIsReleased ? (
        <div id="portal-report" className="report-print-container">
          <PatientReport
            selectedResult={selectedResult}
            staffDirectory={staffDirectory}
          />
        </div>
      ) : selectedResult ? (
        <div className="pending-release-card">
          <h3>Result Not Yet Released</h3>
          <p>This result has not yet been released by the laboratory.</p>
        </div>
      ) : null}

      {selectedIsReleased && (
        <div className="report-actions">
          <button type="button" className="report-action-btn download-btn" onClick={handleDownload}>
            <Download size={18} /> Download PDF
          </button>
          <button type="button" className="report-action-btn print-btn" onClick={handlePrint}>
            <Printer size={18} /> Print Report
          </button>
        </div>
      )}
    </div>
  );
}
