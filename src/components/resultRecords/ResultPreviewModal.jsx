import "../../styles/resultRecords.css";

export default function ResultPreviewModal({
  open,
  onClose,
  selectedResult,
  onAuthorize,
  onRelease,
  onPrint,
  onDownload,
  children,
}) {
  if (!open || !selectedResult) return null;

  const isAuthorized =
    selectedResult.authorization_status ===
    "Authorized";

  const isReleased =
    selectedResult.release_status ===
    "Released";

  return (
    <div className="modal-overlay">
      <div className="modal-content result-record-modal enterprise-modal">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="modal-header">

          <div className="modal-title">

            <h2>Laboratory Report</h2>

            <small>
              <strong>
                {selectedResult.lab_number}
              </strong>
              {" • "}
              {selectedResult.patient_name}
            </small>

          </div>

          <button
            className="close-btn"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>

        </div>

        {/* ==================================================
            STATUS BAR
        ================================================== */}

        <div className="result-status-bar">

          <span
            className={
              isAuthorized
                ? "status-authorized"
                : "status-pending"
            }
          >
            {isAuthorized
              ? "✓ Authorized"
              : "Pending Authorization"}
          </span>

          <span
            className={
              isReleased
                ? "status-released"
                : "status-pending"
            }
          >
            {isReleased
              ? "✓ Released"
              : "Pending Release"}
          </span>

          <span className="status-info">
            🖨 Prints:&nbsp;
            <strong>
              {selectedResult.print_count || 0}
            </strong>
          </span>

          <span className="status-info">
            📄 Downloads:&nbsp;
            <strong>
              {selectedResult.download_count || 0}
            </strong>
          </span>

        </div>

        {/* ==================================================
            ACTION TOOLBAR
        ================================================== */}

        <div className="result-toolbar sticky-toolbar">

          {!isAuthorized && (
            <button
              className="authorize-btn"
              onClick={() =>
                onAuthorize(selectedResult.id)
              }
            >
              ✅ Authorize Result
            </button>
          )}

          {isAuthorized && !isReleased && (
            <button
              className="release-btn"
              onClick={() =>
                onRelease(selectedResult.id)
              }
            >
              🚀 Release Result
            </button>
          )}

          <button
            className="print-btn"
            onClick={() =>
              onPrint(selectedResult)
            }
          >
            🖨 Print
          </button>

          <button
            className="download-btn"
            onClick={() =>
              onDownload(selectedResult)
            }
          >
            📄 Download PDF
          </button>

          <button
            className="close-btn secondary"
            onClick={onClose}
          >
            ✖ Close
          </button>

        </div>

{/* ==================================================
    CONTENT
================================================== */}

<div className="result-content">

  <aside className="patient-sidebar">

    <div className="patient-summary-card">

      <div>
        <label>Lab Number</label>
        <strong>{selectedResult.lab_number || "-"}</strong>
      </div>

      <div>
        <label>Patient</label>
        <strong>{selectedResult.patient_name || "-"}</strong>
      </div>

      <div>
        <label>Department</label>
        <strong>{selectedResult.department || "-"}</strong>
      </div>

      <div>
        <label>Test</label>
        <strong>{selectedResult.test_type || "-"}</strong>
      </div>

      <div>
        <label>Reported</label>
        <strong>
          {selectedResult.reported_at
            ? new Date(selectedResult.reported_at).toLocaleString()
            : "-"}
        </strong>
      </div>

      <div>
        <label>Authorized By</label>
        <strong>{selectedResult.authorized_by || "-"}</strong>
      </div>

      <div>
        <label>Released By</label>
        <strong>{selectedResult.released_by || "-"}</strong>
      </div>

      <div>
        <label>Requested By</label>
        <strong>{selectedResult.requested_by || "-"}</strong>
      </div>

    </div>

  </aside>

  <div
    id="print-area"
    className="result-preview"
  >
    {children}
  </div>

</div>

      </div>
    </div>
  );
}