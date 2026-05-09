import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function App() {
  const reportRef = useRef();

  const [patients, setPatients] = useState([]);
  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const [loginData, setLoginData] =
    useState({
      username: "",
      password: "",
    });

  const [patientId, setPatientId] =
    useState("");

  const [
    selectedPatient,
    setSelectedPatient,
  ] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const { data, error } =
      await supabase
        .from("patients")
        .select("*");

    if (data) {
      setPatients(data);
    }
  };

  const inputStyle = {
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "16px",
  };

  const primaryButton = {
    padding: "15px",
    background: "#0097b2",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
  };

  const secondaryButton = {
    padding: "12px 20px",
    background: "#e63946",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (
      loginData.username === "admin" &&
      loginData.password === "pefa123"
    ) {
      setIsLoggedIn(true);
    } else {
      alert("Invalid Login");
    }
  };

  const generatePDF = () => {
    const input = reportRef.current;

    html2canvas(input).then((canvas) => {
      const imgData =
        canvas.toDataURL("image/png");

      const pdf = new jsPDF();

      const imgWidth = 190;

      const pageHeight =
        pdf.internal.pageSize.height;

      const imgHeight =
        (canvas.height * imgWidth) /
        canvas.width;

      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(
        imgData,
        "PNG",
        10,
        position,
        imgWidth,
        imgHeight
      );

      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;

        pdf.addPage();

        pdf.addImage(
          imgData,
          "PNG",
          10,
          position,
          imgWidth,
          imgHeight
        );

        heightLeft -= pageHeight;
      }

      pdf.save("PEFA_Report.pdf");
    });
  };

  return (
    <div
      style={{
        fontFamily:
          "Arial, sans-serif",
        background: "#f5f9fc",
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          background: "#ffffff",
          padding: "15px 30px",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          boxShadow:
            "0 2px 10px rgba(0,0,0,0.1)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <h2 style={{ color: "#0097b2" }}>
          PEFA
        </h2>

        <div
          style={{
            display: "flex",
            gap: "20px",
          }}
        >
          <a
            href="#"
            style={{
              textDecoration: "none",
              color: "#333",
            }}
          >
            Home
          </a>

          <a
            href="#"
            style={{
              textDecoration: "none",
              color: "#333",
            }}
          >
            Services
          </a>

          <a
            href="#"
            style={{
              textDecoration: "none",
              color: "#333",
            }}
          >
            Contact
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          background: "#0097b2",
          color: "white",
          padding: "100px 20px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
          }}
        >
          PEFA Medical Diagnostic
          Services
        </h1>

        <p
          style={{
            fontSize: "22px",
          }}
        >
          Leading the Way in Medical
          Excellences
        </p>
      </section>

      {/* SERVICES */}
      <section
        style={{
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        <h2>Our Services</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px,1fr))",
            gap: "20px",
            marginTop: "40px",
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
          ].map((service, index) => (
            <div
              key={index}
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "15px",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              {service}
            </div>
          ))}
        </div>
      </section>

      {/* STAFF LOGIN */}
      {!isLoggedIn && (
        <section
          style={{
            background: "#ffffff",
            padding: "60px 20px",
            textAlign: "center",
          }}
        >
          <h2>Staff Login</h2>

          <form
            onSubmit={handleLogin}
            style={{
              maxWidth: "400px",
              margin: "30px auto",
              display: "flex",
              flexDirection:
                "column",
              gap: "15px",
            }}
          >
            <input
              type="text"
              placeholder="Username"
              required
              style={inputStyle}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  username:
                    e.target.value,
                })
              }
            />

            <input
              type="password"
              placeholder="Password"
              required
              style={inputStyle}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  password:
                    e.target.value,
                })
              }
            />

            <button
              type="submit"
              style={primaryButton}
            >
              Login
            </button>
          </form>
        </section>
      )}

      {/* ADMIN DASHBOARD */}
      {isLoggedIn && (
        <section
          style={{
            background: "#ffffff",
            padding: "60px 20px",
            textAlign: "center",
          }}
        >
          <h2>Admin Dashboard</h2>

          <button
            onClick={() =>
              setIsLoggedIn(false)
            }
            style={{
              ...secondaryButton,
              marginBottom: "20px",
            }}
          >
            Logout
          </button>

          <form
            onSubmit={async (e) => {
              e.preventDefault();

              const newPatient = {
                patient_id:
                  e.target.patientId
                    .value,

                full_name:
                  e.target.fullName
                    .value,

                age:
                  e.target.age.value,

                sex:
                  e.target.sex.value,

                test_name:
                  e.target.test.value,

                result:
                  e.target.result
                    .value,
              };

              const { error } =
                await supabase
                  .from("patients")
                  .insert([
                    newPatient,
                  ]);

              if (error) {
                console.log(error);

                alert(
                  "Error saving patient"
                );
              } else {
                fetchPatients();

                alert(
                  "Patient Record Saved"
                );

                e.target.reset();
              }
            }}
            style={{
              maxWidth: "600px",
              margin: "40px auto",
              display: "flex",
              flexDirection:
                "column",
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
        </section>
      )}

      {/* PATIENT RESULT PORTAL */}
      <section
        style={{
          padding: "60px 20px",
          background: "#eef7fb",
          textAlign: "center",
        }}
      >
        <h2>Patient Result Portal</h2>

        <div
          style={{
            maxWidth: "500px",
            margin: "30px auto",
            display: "flex",
            gap: "10px",
          }}
        >
          <input
            type="text"
            placeholder="Enter Patient ID"
            value={patientId}
            onChange={(e) =>
              setPatientId(
                e.target.value
              )
            }
            style={{
              ...inputStyle,
              flex: 1,
            }}
          />

          <button
            style={primaryButton}
            onClick={() => {
              const foundPatient =
                patients.find(
                  (patient) =>
                    patient.patient_id ===
                    patientId
                );

              if (foundPatient) {
                setSelectedPatient(
                  foundPatient
                );
              } else {
                alert(
                  "Patient not found"
                );
              }
            }}
          >
            Search
          </button>
        </div>
      </section>

      {/* REPORT */}
      {selectedPatient && (
        <section
          style={{
            padding: "50px 20px",
          }}
        >
          <div
            ref={reportRef}
            style={{
              background: "white",
              maxWidth: "700px",
              margin: "auto",
              padding: "40px",
              borderRadius: "15px",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                color: "#0097b2",
              }}
            >
              PEFA Medical Diagnostic
              Services
            </h2>

            <hr />

            <p>
              <strong>
                Patient ID:
              </strong>{" "}
              {
                selectedPatient.patient_id
              }
            </p>

            <p>
              <strong>Name:</strong>{" "}
              {
                selectedPatient.full_name
              }
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
              <strong>Test:</strong>{" "}
              {
                selectedPatient.test_name
              }
            </p>

            <p>
              <strong>Result:</strong>{" "}
              {selectedPatient.result}
            </p>
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
            }}
          >
            <button
              onClick={generatePDF}
              style={primaryButton}
            >
              Download PDF
            </button>
          </div>
        </section>
      )}

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

        <p>
          32 Ogunru-Ori, Pakuro
          Road, Mowe, Ogun State
        </p>

        <p>
          08086618221 |
          09052853701
        </p>
      </section>
    </div>
  );
}