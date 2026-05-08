import { useState } from "react";

export default function App() {
  const [patients, setPatients] = useState([]);
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#f5f9fc",
        color: "#222",
      }}
    >

      {/* NAVBAR */}
      <nav
        style={{
          background: "#ffffff",
          padding: "18px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ color: "#0097b2", margin: 0 }}>
          PEFA Medical
        </h2>

        <div style={{ display: "flex", gap: "25px" }}>
          <a href="#" style={navLink}>
            Home
          </a>

          <a href="#" style={navLink}>
            Services
          </a>

          <a href="#" style={navLink}>
            Portal
          </a>

          <a href="#" style={navLink}>
            Contact
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          background:
            "linear-gradient(135deg, #0097b2 0%, #00b4d8 100%)",
          color: "white",
          padding: "100px 20px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "56px",
            marginBottom: "20px",
          }}
        >
          PEFA Medical Diagnostic Services
        </h1>

        <p
          style={{
            fontSize: "22px",
            maxWidth: "700px",
            margin: "auto",
            lineHeight: "1.7",
          }}
        >
          Leading the Way in Medical Excellences with
          accurate diagnostics, fast turnaround time,
          and quality patient-centered care.
        </p>

        <div
          style={{
            marginTop: "35px",
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <button style={primaryButton}>
            Book Appointment
          </button>

          <button style={secondaryButton}>
            Patient Portal
          </button>
        </div>
      </section>

      {/* SERVICES */}
      <section
        style={{
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "38px" }}>
          Our Services
        </h2>

        <p
          style={{
            maxWidth: "700px",
            margin: "15px auto 50px",
            color: "#555",
            lineHeight: "1.7",
          }}
        >
          We provide reliable and modern laboratory
          diagnostic services for hospitals, clinics,
          organizations, and individuals.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "25px",
            maxWidth: "1100px",
            margin: "auto",
          }}
        >
          {[
              "Hematology",
	      "Chemical Pathology",
              "Microbiology",
  "Tumor Markers",
  "Wellness Check",
  "Ultrasound Scan",
  "Infertility Check",
  "Diabetes Screening",
  "Medical Fitness",
  "Full Body Checkup",
          ].map((service, index) => (
            <div key={index} style={serviceCard}>
              <h3>{service}</h3>

              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Accurate and professional diagnostic
                services with fast turnaround time.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* APPOINTMENT */}
      <section
        style={{
          background: "#ffffff",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "36px" }}>
          Book Appointment
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            const name = e.target.name.value;
            const phone = e.target.phone.value;
            const test = e.target.test.value;

            const message =
              `Hello PEFA Medical Diagnostic Services.%0A%0A` +
              `Name: ${name}%0A` +
              `Phone: ${phone}%0A` +
              `Test Needed: ${test}`;

            window.open(
              `https://wa.me/2348086618621?text=${message}`,
              "_blank"
            );
          }}
          style={{
            maxWidth: "500px",
            margin: "40px auto 0",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="test"
            placeholder="Test Needed"
            required
            style={inputStyle}
          />

          <button type="submit" style={primaryButton}>
            Book via WhatsApp
          </button>
        </form>
      </section>

      {/* PATIENT PORTAL */}
      <section
        style={{
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "36px" }}>
          Patient Result Portal
        </h2>

        <p style={{ color: "#666" }}>
          Enter your Patient ID to check result status
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            const patientId =
              e.target.patientId.value;

            if (patientId === "PEFA123") {
              alert(
                "Patient: John Doe\n" +
                "Age: 29\n" +
                "Sex: Male\n" +
                "Test: Malaria Test\n" +
                "Result: Negative"
              );
            } else {
              alert("Patient ID not found.");
            }
          }}
          style={{
            maxWidth: "450px",
            margin: "35px auto 0",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <input
            type="text"
            name="patientId"
            placeholder="Enter Patient ID"
            required
            style={inputStyle}
          />

          <button type="submit" style={primaryButton}>
            Check Result
          </button>
        </form>
      </section>
      {/* ADMIN DASHBOARD */}
      <section
        style={{
          background: "#ffffff",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "36px" }}>
          Admin Dashboard
        </h2>

        <p style={{ color: "#666" }}>
          Add patient laboratory records
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            const newPatient = {
              patientId: e.target.patientId.value,
              fullName: e.target.fullName.value,
              age: e.target.age.value,
              sex: e.target.sex.value,
              test: e.target.test.value,
              result: e.target.result.value,
            };

            setPatients([...patients, newPatient]);

            alert("Patient Record Added");

            e.target.reset();
          }}
          style={{
            maxWidth: "600px",
            margin: "40px auto",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <input
            type="text"
            name="patientId"
            placeholder="Patient ID"
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            required
            style={inputStyle}
          />

          <input
            type="number"
            name="age"
            placeholder="Age"
            required
            style={inputStyle}
          />

          <select
            name="sex"
            required
            style={inputStyle}
          >
            <option value="">
              Select Sex
            </option>

            <option value="Male">
              Male
            </option>

            <option value="Female">
              Female
            </option>
          </select>

          <input
            type="text"
            name="test"
            placeholder="Test Name"
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="result"
            placeholder="Result"
            required
            style={inputStyle}
          />

          <button
            type="submit"
            style={primaryButton}
          >
            Save Patient Record
          </button>
        </form>

        {/* DISPLAY PATIENTS */}
        <div
          style={{
            maxWidth: "900px",
            margin: "50px auto",
            textAlign: "left",
          }}
        >
          {patients.map((patient, index) => (
            <div
              key={index}
              style={{
                background: "#f5f9fc",
                padding: "20px",
                borderRadius: "12px",
                marginBottom: "15px",
                boxShadow:
                  "0 3px 10px rgba(0,0,0,0.05)",
              }}
            >
              <h3>
                {patient.fullName}
              </h3>

              <p>
                <strong>ID:</strong>{" "}
                {patient.patientId}
              </p>

              <p>
                <strong>Age:</strong>{" "}
                {patient.age}
              </p>

              <p>
                <strong>Sex:</strong>{" "}
                {patient.sex}
              </p>

              <p>
                <strong>Test:</strong>{" "}
                {patient.test}
              </p>

              <p>
                <strong>Result:</strong>{" "}
                {patient.result}
              </p>
            </div>
          ))}
        </div>
      </section>
      {/* CONTACT */}
      <section
        style={{
          background: "#0097b2",
          color: "white",
          padding: "70px 20px",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "36px" }}>
          Contact Us
        </h2>

        <p style={{ marginTop: "20px" }}>
          32 Ogunru-Ori, Pakuro Road, Mowe, Ogun State
        </p>

        <p>
          08086618621 | 09052853701
        </p>

        <p>
          Mon - Fri: 8AM - 6PM
        </p>
      </section>

      {/* FLOATING WHATSAPP */}
      <a
        href="https://wa.me/2348086618621"
        target="_blank"
        rel="noreferrer"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#25D366",
          color: "white",
          padding: "16px 20px",
          borderRadius: "50%",
          fontSize: "26px",
          textDecoration: "none",
          boxShadow: "0 5px 15px rgba(0,0,0,0.25)",
        }}
      >
        💬
      </a>

    </div>
  );
}

/* STYLES */

const navLink = {
  textDecoration: "none",
  color: "#333",
  fontWeight: "600",
};

const primaryButton = {
  padding: "15px 28px",
  background: "#25D366",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontSize: "16px",
  cursor: "pointer",
};

const secondaryButton = {
  padding: "15px 28px",
  background: "white",
  color: "#0097b2",
  border: "none",
  borderRadius: "10px",
  fontSize: "16px",
  cursor: "pointer",
};

const inputStyle = {
  padding: "16px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  fontSize: "15px",
};

const serviceCard = {
  background: "white",
  padding: "30px",
  borderRadius: "16px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
};