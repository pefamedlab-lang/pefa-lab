export default function ResultRecordsTable({
  results = [],
  onView,
  onPrint,
  onDownload,
  onAuthorize,
  onRelease,
}) {
  return (
    <table className="records-table">
      <thead>
        <tr>
          <th>Lab No</th>
          <th>Patient</th>
          <th>Test</th>
          <th>Reported</th>
          <th>Authorization</th>
          <th>Release</th>
          <th>Prints</th>
          <th>Downloads</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {results.length === 0 ? (
          <tr>
            <td
              colSpan={9}
              style={{
                textAlign: "center",
                padding: "25px",
              }}
            >
              No laboratory results found.
            </td>
          </tr>
        ) : (
          results.map((row) => (
            <tr key={row.id}>
              <td>{row.lab_number}</td>

              <td>{row.patient_name}</td>

              <td>{row.test_type}</td>

              <td>
                {row.reported_at
                  ? new Date(row.reported_at).toLocaleString()
                  : "-"}
              </td>

              <td>
                <span
                  className={
                    row.authorization_status === "Authorized"
                      ? "status-authorized"
                      : "status-pending"
                  }
                >
                  {row.authorization_status || "Pending"}
                </span>
              </td>

              <td>
                <span
                  className={
                    row.release_status === "Released"
                      ? "status-released"
                      : "status-pending"
                  }
                >
                  {row.release_status || "Pending"}
                </span>
              </td>

              <td>{row.print_count || 0}</td>

              <td>{row.download_count || 0}</td>

              <td>
                <div className="action-buttons">

  <button
    className="view-btn"
    onClick={() => onView(row)}
  >
    View
  </button>

</div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}