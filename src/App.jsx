export default function App() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f5f9fc" }}>

      <section
        style={{
          background: "#0097b2",
          color: "white",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "48px" }}>
          PEFA Medical Diagnostic Services
        </h1>

        <p style={{ fontSize: "20px" }}>
          Leading the Way in Medical Excellences
        </p>

        <button
          style={{
            padding: "15px 25px",
            marginTop: "20px",
            border: "none",
            borderRadius: "8px",
            background: "#32cd32",
            color: "white",
          }}
        >
          Book Appointment
        </button>
      </section>

      <section style={{ padding: "50px 20px", textAlign: "center" }}>
        <h2>Our Services</h2>

        <p>Blood Tests</p>
        <p>Hormonal Assay</p>
        <p>Ultrasound Scan</p>
        <p>Diabetes Screening</p>
      </section>

      <section
        style={{
          background: "#0097b2",
          color: "white",
          padding: "40px 20px",
          textAlign: "center",
        }}
      >
        <h2>Contact Us</h2>

        <p>32 Ogunru-Ori, Pakuro Road, Mowe, Ogun State</p>

        <p>08086618221 | 09052853701</p>
      </section>

    </div>
  );
}