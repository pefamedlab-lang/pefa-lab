export default function AnalyticsDashboard() {
  return (
    <div
      style={{
        background: "white",
        padding: "30px",
        borderRadius: "15px",
        marginTop: "30px",
      }}
    >
      <h2>
        Analytics Dashboard
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(250px,1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            background:
              "#0097b2",
            color: "white",
            padding: "25px",
            borderRadius:
              "10px",
          }}
        >
          <h3>
            Total Patients
          </h3>

          <h1>245</h1>
        </div>

        <div
          style={{
            background:
              "#9acd32",
            color: "white",
            padding: "25px",
            borderRadius:
              "10px",
          }}
        >
          <h3>
            Revenue
          </h3>

          <h1>
            ₦1,250,000
          </h1>
        </div>

        <div
          style={{
            background:
              "#e63946",
            color: "white",
            padding: "25px",
            borderRadius:
              "10px",
          }}
        >
          <h3>
            Pending Results
          </h3>

          <h1>18</h1>
        </div>
      </div>
    </div>
  );
}