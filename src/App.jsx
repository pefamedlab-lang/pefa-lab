export default function App() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f5f9fc" }}>

      {/* NAVBAR */}
      <nav
        style={{
          background: "#ffffff",
          padding: "15px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <h2 style={{ color: "#0097b2" }}>
          PEFA
        </h2>

        <div style={{ display: "flex", gap: "20px" }}>
          <a href="#" style={{ textDecoration: "none", color: "#333" }}>
            Home
          </a>

          <a href="#" style={{ textDecoration: "none", color: "#333" }}>
            Services
          </a>

          <a href="#" style={{ textDecoration: "none", color: "#333" }}>
            Contact
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
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

      {/* SERVICES */}
      <section style={{ padding: "50px 20px", textAlign: "center" }}>
        <h2>Our Services</h2>

        <p>Blood Tests</p>
        <p>Hormonal Assay</p>
        <p>Ultrasound Scan</p>
        <p>Diabetes Screening</p>
      </section>

      {/* APPOINTMENT FORM */}
      <section
        style={{
          padding: "60px 20px",
          background: "#ffffff",
          textAlign: "center",
        }}
      >
        <h2>Book Appointment</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            const name = e.target.name.value;
            const phone = e.target.phone.value;
            const test = e.target.test.value;

            const message = `Hello PEFA Medical Diagnostic Services.%0A%0AName: ${name}%0APhone: ${phone}%0ATest Needed: ${test}`;

            window.open(
              `https://wa.me/2348086618221?text=${message}`,
              "_blank"
            );
          }}
          style={{
            maxWidth: "500px",
            margin: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            style={{
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            required
            style={{
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />

          <input
            type="text"
            name="test"
            placeholder="Test Needed"
            required
            style={{
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />

          <button
            type="submit"
            style={{
              padding: "15px",
              background: "#25D366",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Book via WhatsApp
          </button>
        </form>
      </section>

      {/* PATIENT RESULT PORTAL */}
      <section
        style={{
          padding: "60px 20px",
          background: "#f5f9fc",
          textAlign: "center",
        }}
      >
        <h2>Patient Result Portal</h2>

        <p>Enter your Patient ID to check result status</p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();

            const patientId = e.target.patientId.value;

            if (patientId === "PEFA123") {
  alert(
    "Patient: John Doe\nAge: 29\nSex: Male\nTest: Malaria Test\nResult: Negative"
  );
} else {
  alert("Patient ID not found.");
}
          }}
          style={{
            maxWidth: "400px",
            margin: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <input
            type="text"
            name="patientId"
            placeholder="Enter Patient ID"
            required
            style={{
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />

          <button
            type="submit"
            style={{
              padding: "15px",
              background: "#0097b2",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Check Result
          </button>
        </form>
      </section>

      {/* CONTACT */}
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

      {/* FLOATING WHATSAPP BUTTON */}
      <a
        href="https://wa.me/2348086618221"
        target="_blank"
        rel="noreferrer"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#25D366",
          color: "white",
          padding: "15px 18px",
          borderRadius: "50%",
          fontSize: "24px",
          textDecoration: "none",
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
        }}
      >
        💬
      </a>

    </div>
  );
}