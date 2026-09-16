import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import { supabase } from "../supabase";
import "../styles/testRequestDashboard.css";

const STATUS_OPTIONS = [
  "All",
  "Pending",
  "Reviewed",
  "Accepted",
  "Registered",
  "Rejected",
  "Cancelled",
];

const PRIORITY_OPTIONS = ["All", "Routine", "Urgent", "Emergency"];

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const safeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const displayValue = (value) =>
  value === null || value === undefined || String(value).trim() === ""
    ? "—"
    : String(value);

const getTestName = (test) =>
  test?.test_name || test?.name || test?.test || "Unnamed test";

const getScanName = (scan) =>
  scan?.scan_type || scan?.name || scan?.scan || "Unnamed scan";

const statusClass = (status) =>
  `trd-status trd-status-${String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

const priorityClass = (priority) =>
  `trd-priority trd-priority-${String(priority || "")
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

export default function TestRequestDashboard() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [serviceFilter, setServiceFilter] = useState("All");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [staffNotes, setStaffNotes] = useState("");

  const loadRequests = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const { data, error: queryError } = await supabase
        .from("test_requests")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (queryError) throw queryError;

      setRequests(data || []);

      if (selectedRequest?.id) {
        const fresh = (data || []).find((item) => item.id === selectedRequest.id);
        if (fresh) {
          setSelectedRequest(fresh);
          setStaffNotes(fresh.staff_notes || "");
        }
      }
    } catch (err) {
      console.error("[PEFA TEST REQUEST] Load error:", err);
      setError(
        err?.message ||
          "Unable to load Test Requests. Check the staff account permissions and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedRequest?.id]);

  useEffect(() => {
    loadRequests();

    const channel = supabase
      .channel("pefa-test-requests-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "test_requests" },
        () => loadRequests(true)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadRequests]);

  const statistics = useMemo(() => {
    const count = (status) =>
      requests.filter((request) => request.status === status).length;

    return {
      total: requests.length,
      pending: count("Pending"),
      reviewed: count("Reviewed"),
      accepted: count("Accepted"),
      registered: count("Registered"),
      urgent: requests.filter((r) => r.priority === "Urgent").length,
      emergency: requests.filter((r) => r.priority === "Emergency").length,
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return requests.filter((request) => {
      const haystack = [
        request.request_number,
        request.requestor_name,
        request.requestor_phone,
        request.patient_name,
        request.patient_phone,
        request.referral_name,
        request.referring_doctor,
        request.registration_number,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search || haystack.includes(search);
      const matchesStatus =
        statusFilter === "All" || request.status === statusFilter;
      const matchesPriority =
        priorityFilter === "All" || request.priority === priorityFilter;
      const matchesService =
        serviceFilter === "All" || request.service_type === serviceFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesService;
    });
  }, [requests, searchTerm, statusFilter, priorityFilter, serviceFilter]);

  const openRequest = (request) => {
    setSelectedRequest(request);
    setStaffNotes(request.staff_notes || "");
  };

  const closeRequest = () => {
    if (savingStatus) return;
    setSelectedRequest(null);
    setStaffNotes("");
  };

  const updateRequest = async (status) => {
    if (!selectedRequest?.id || savingStatus) return;

    setSavingStatus(true);
    setError("");

    try {
      const payload = {
        status,
        staff_notes: staffNotes.trim() || null,
        reviewed_at:
          status === "Reviewed" ||
          status === "Accepted" ||
          status === "Rejected"
            ? new Date().toISOString()
            : selectedRequest.reviewed_at || null,
      };

      const { data, error: updateError } = await supabase
        .from("test_requests")
        .update(payload)
        .eq("id", selectedRequest.id)
        .select("*")
        .single();

      if (updateError) throw updateError;

      setRequests((previous) =>
        previous.map((item) => (item.id === data.id ? data : item))
      );
      setSelectedRequest(data);
      setStaffNotes(data.staff_notes || "");

      if (status === "Accepted") {
        alert("Test Request accepted. You can now register the patient.");
      } else if (status === "Reviewed") {
        alert("Test Request marked as reviewed.");
      } else if (status === "Rejected") {
        alert("Test Request rejected.");
      }
    } catch (err) {
      console.error("[PEFA TEST REQUEST] Update error:", err);
      setError(err?.message || "Unable to update this Test Request.");
    } finally {
      setSavingStatus(false);
    }
  };

  const registerRequest = () => {
    if (!selectedRequest?.id) return;

    if (["Registered", "Rejected", "Cancelled"].includes(selectedRequest.status)) {
      alert("This Test Request cannot be opened for registration in its current status.");
      return;
    }

    navigate(`/registration?test_request_id=${encodeURIComponent(selectedRequest.id)}`);
  };

  const tests = safeArray(selectedRequest?.requested_tests);
  const scans = safeArray(selectedRequest?.requested_scans);

  return (
    <div className="test-request-dashboard">
      <div className="trd-shell">
        <header className="trd-header">
          <div>
            <div className="trd-eyebrow">PEFA MEDICAL DIAGNOSTIC SERVICES</div>
            <h1>Test Request Dashboard</h1>
            <p>
              Review public laboratory and ultrasound requests before patient
              registration.
            </p>
          </div>

          <button
            type="button"
            className="trd-refresh-btn"
            onClick={() => loadRequests(true)}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 size={17} className="trd-spin" />
            ) : (
              <RefreshCw size={17} />
            )}
            Refresh
          </button>
        </header>

        {error && (
          <div className="trd-alert trd-alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <section className="trd-stats">
          <div className="trd-stat-card">
            <span>Total Requests</span>
            <strong>{statistics.total}</strong>
          </div>
          <div className="trd-stat-card trd-stat-pending">
            <span>Pending</span>
            <strong>{statistics.pending}</strong>
          </div>
          <div className="trd-stat-card trd-stat-reviewed">
            <span>Reviewed</span>
            <strong>{statistics.reviewed}</strong>
          </div>
          <div className="trd-stat-card trd-stat-accepted">
            <span>Accepted</span>
            <strong>{statistics.accepted}</strong>
          </div>
          <div className="trd-stat-card trd-stat-registered">
            <span>Registered</span>
            <strong>{statistics.registered}</strong>
          </div>
          <div className="trd-stat-card trd-stat-urgent">
            <span>Urgent / Emergency</span>
            <strong>
              {statistics.urgent + statistics.emergency}
            </strong>
          </div>
        </section>

        <section className="trd-toolbar">
          <div className="trd-search">
            <Search size={18} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search request no., patient, doctor, hospital or phone..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                Status: {status}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            {PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>
                Priority: {priority}
              </option>
            ))}
          </select>

          <select
            value={serviceFilter}
            onChange={(event) => setServiceFilter(event.target.value)}
          >
            <option value="All">Service: All</option>
            <option value="Laboratory">Laboratory</option>
            <option value="Ultrasound">Ultrasound</option>
            <option value="Both">Laboratory + Ultrasound</option>
          </select>
        </section>

        <section className="trd-table-card">
          <div className="trd-table-heading">
            <div>
              <h2>Incoming Requests</h2>
              <span>
                Showing {filteredRequests.length} of {requests.length} requests
              </span>
            </div>
          </div>

          {loading ? (
            <div className="trd-loading">
              <Loader2 size={26} className="trd-spin" />
              Loading Test Requests...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="trd-empty">
              <FileText size={42} />
              <h3>No Test Requests Found</h3>
              <p>
                New public Test Requests will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="trd-table-wrap">
              <table className="trd-table">
                <thead>
                  <tr>
                    <th>Request</th>
                    <th>Patient</th>
                    <th>Requestor</th>
                    <th>Referral Hospital</th>
                    <th>Doctor</th>
                    <th>Service</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <strong>{displayValue(request.request_number)}</strong>
                      </td>
                      <td>
                        <strong>{displayValue(request.patient_name)}</strong>
                        <small>
                          {displayValue(request.patient_age)} yrs ·{" "}
                          {displayValue(request.patient_sex)}
                        </small>
                      </td>
                      <td>
                        {displayValue(request.requestor_name)}
                        <small>{displayValue(request.requestor_type)}</small>
                      </td>
                      <td>{displayValue(request.referral_name)}</td>
                      <td>{displayValue(request.referring_doctor)}</td>
                      <td>{displayValue(request.service_type)}</td>
                      <td>
                        <span className={priorityClass(request.priority)}>
                          {displayValue(request.priority)}
                        </span>
                      </td>
                      <td>
                        <span className={statusClass(request.status)}>
                          {displayValue(request.status)}
                        </span>
                      </td>
                      <td>{formatDateTime(request.submitted_at)}</td>
                      <td>
                        <button
                          type="button"
                          className="trd-view-btn"
                          onClick={() => openRequest(request)}
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selectedRequest &&
        createPortal(
          <div className="trd-modal-backdrop" onMouseDown={closeRequest}>
          <div
            className="trd-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="trd-modal-header">
              <div>
                <div className="trd-eyebrow">TEST REQUEST</div>
                <h2>
                  {displayValue(selectedRequest.request_number)}
                </h2>
                <p>
                  Submitted {formatDateTime(selectedRequest.submitted_at)}
                </p>
              </div>
              <button
                type="button"
                className="trd-icon-btn"
                onClick={closeRequest}
                disabled={savingStatus}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="trd-modal-body">
              <div className="trd-detail-grid">
                <DetailSection
                  title="Requestor Information"
                  items={[
                    ["Type", selectedRequest.requestor_type],
                    ["Name", selectedRequest.requestor_name],
                    ["Phone", selectedRequest.requestor_phone],
                    ["Email", selectedRequest.requestor_email],
                  ]}
                />

                <DetailSection
                  title="Patient Information"
                  items={[
                    ["Patient Name", selectedRequest.patient_name],
                    ["Date of Birth", formatDate(selectedRequest.patient_dob)],
                    ["Age", selectedRequest.patient_age],
                    ["Sex", selectedRequest.patient_sex],
                    ["Phone", selectedRequest.patient_phone],
                    ["Address", selectedRequest.patient_address],
                  ]}
                />

                <DetailSection
                  title="Referral Information"
                  items={[
                    ["Referral Hospital", selectedRequest.referral_name],
                    ["Referral ID", selectedRequest.referral_id],
                    ["Referring Doctor", selectedRequest.referring_doctor],
                    ["Doctor Phone", selectedRequest.referring_doctor_phone],
                    ["Doctor Email", selectedRequest.referring_doctor_email],
                  ]}
                />

                <DetailSection
                  title="Clinical Information"
                  items={[
                    ["Presenting Complaint", selectedRequest.presenting_complaint],
                    ["Clinical History", selectedRequest.clinical_history],
                    ["Provisional Diagnosis", selectedRequest.provisional_diagnosis],
                    [
                      "Relevant Medical History",
                      selectedRequest.relevant_medical_history,
                    ],
                    ["Current Medications", selectedRequest.current_medications],
                  ]}
                />

                <DetailSection
                  title="Pre-analytical Information"
                  items={[
                    ["Pregnancy Status", selectedRequest.pregnancy_status],
                    ["LMP", formatDate(selectedRequest.lmp)],
                    ["Specimen Collected", selectedRequest.specimen_collected === true ? "Yes" : selectedRequest.specimen_collected === false ? "No" : "—"],
                    ["Specimen Type", selectedRequest.specimen_type],
                    ["Fasting Status", selectedRequest.fasting_status],
                    ["Last Meal Time", selectedRequest.last_meal_time],
                    [
                      "Laboratory Clinical Notes",
                      selectedRequest.laboratory_clinical_notes,
                    ],
                  ]}
                />

                <DetailSection
                  title="Request Information"
                  items={[
                    ["Service Type", selectedRequest.service_type],
                    ["Priority", selectedRequest.priority],
                    [
                      "Ultrasound Indication",
                      selectedRequest.ultrasound_clinical_indication,
                    ],
                    ["Additional Notes", selectedRequest.additional_notes],
                  ]}
                />
              </div>

              <div className="trd-services-grid">
                <div className="trd-service-card">
                  <h3>Requested Laboratory Tests</h3>
                  {tests.length ? (
                    <ol>
                      {tests.map((test, index) => (
                        <li key={`${test?.id || index}-${index}`}>
                          <span>
                            <strong>{getTestName(test)}</strong>
                            <small>
                              {test?.test_code || "No code"} ·{" "}
                              {test?.department || "Other"}
                            </small>
                          </span>
                          <b>×{Number(test?.quantity || 1)}</b>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="trd-muted">No laboratory tests requested.</p>
                  )}
                </div>

                <div className="trd-service-card">
                  <h3>Requested Ultrasound Scans</h3>
                  {scans.length ? (
                    <ol>
                      {scans.map((scan, index) => (
                        <li key={`${getScanName(scan)}-${index}`}>
                          <span>
                            <strong>{getScanName(scan)}</strong>
                          </span>
                          <b>×{Number(scan?.quantity || 1)}</b>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="trd-muted">No ultrasound scans requested.</p>
                  )}
                </div>
              </div>

              <div className="trd-notes-card">
                <label htmlFor="test-request-staff-notes">
                  Staff Notes
                </label>
                <textarea
                  id="test-request-staff-notes"
                  value={staffNotes}
                  onChange={(event) => setStaffNotes(event.target.value)}
                  placeholder="Add an internal note about this request..."
                  rows={4}
                />
              </div>
            </div>

            <div className="trd-modal-footer">
              <div className="trd-left-actions">
                <button
                  type="button"
                  className="trd-secondary-btn"
                  onClick={() => updateRequest("Reviewed")}
                  disabled={savingStatus}
                >
                  {savingStatus ? <Loader2 size={17} className="trd-spin" /> : <CheckCircle2 size={17} />}
                  Mark Reviewed
                </button>

                <button
                  type="button"
                  className="trd-danger-btn"
                  onClick={() => {
                    if (window.confirm("Reject this Test Request?")) {
                      updateRequest("Rejected");
                    }
                  }}
                  disabled={savingStatus}
                >
                  Reject
                </button>
              </div>

              <div className="trd-right-actions">
                <button
                  type="button"
                  className="trd-secondary-btn"
                  onClick={closeRequest}
                  disabled={savingStatus}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="trd-primary-btn"
                  onClick={() => updateRequest("Accepted")}
                  disabled={savingStatus || selectedRequest.status === "Registered"}
                >
                  <CheckCircle2 size={17} />
                  Accept
                </button>

                <button
                  type="button"
                  className="trd-register-btn"
                  onClick={registerRequest}
                  disabled={
                    savingStatus ||
                    ["Registered", "Rejected", "Cancelled"].includes(
                      selectedRequest.status
                    )
                  }
                >
                  <UserPlus size={17} />
                  Register Patient
                </button>
              </div>
            </div>
          </div>
          </div>,
          document.body
        )}
    </div>
  );
}

function DetailSection({ title, items }) {
  return (
    <div className="trd-detail-card">
      <h3>{title}</h3>
      <div className="trd-detail-list">
        {items.map(([label, value]) => (
          <div className="trd-detail-row" key={label}>
            <span>{label}</span>
            <strong>{displayValue(value)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
