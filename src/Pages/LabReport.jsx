import { useState, useRef } from "react";

import jsPDF from "jspdf";

import html2canvas from "html2canvas";

import QRCode from "react-qr-code";

export default function LabReport() {
  const reportRef = useRef();

  const [patientName, setPatientName] =
    useState("");

  const [age, setAge] =
    useState("");

  const [sex, setSex] =
    useState("");

  const [testName, setTestName] =
    useState("");

  const [result, setResult] =
    useState("");

  const [reference, setReference] =
    useState("");

  const [scientist, setScientist] =
    useState("");

  const verificationLink =
    "https://pefa-medlab.vercel.app/result-checker";

  const exportPDF = async () => {
    const input =
      reportRef.current;

    const canvas =
      await html2canvas(
        input
      );

    const imgData =
      canvas.toDataURL(
        "image/png"
      );

    const pdf =
      new jsPDF();

    const pdfWidth =
      pdf.internal.pageSize.getWidth();

    const pdfHeight =
      (canvas.height *
        pdfWidth) /
      canvas.width;

    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      pdfWidth,
      pdfHeight
    );

    pdf.save(
      `${
        patientName ||
        "report"
      }.pdf`
    );
  };

  return (
    <div
      style={{
        background: "white",
        padding: "30px",
        borderRadius:
          "15px",
        marginTop: "30px",
      }}
    >
      <h2>
        Laboratory Report
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(250px,1fr))",
          gap: "15px",
          marginTop: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Patient Name"
          value={patientName}
          onChange={(e) =>
            setPatientName(
              e.target.value
            )
          }
        />

        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) =>
            setAge(
              e.target.value
            )
          }
        />

        <select
          value={sex}
          onChange={(e) =>
            setSex(
              e.target.value
            )
          }
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
          placeholder="Test Name"
          value={testName}
          onChange={(e) =>
            setTestName(
              e.target.value
            )
          }
        />

        <input
          type="text"
          placeholder="Result"
          value={result}
          onChange={(e) =>
            setResult(
              e.target.value
            )
          }
        />

        <input
          type="text"
          placeholder="Reference Range"
          value={reference}
          onChange={(e) =>
            setReference(
              e.target.value
            )
          }
        />

        <input
          type="text"
          placeholder="Scientist Name"
          value={scientist}
          onChange={(e) =>
            setScientist(
              e.target.value
            )
          }
        />
      </div>

      <div
        ref={reportRef}
        style={{
          marginTop: "40px",
          border:
            "1px solid #ddd",
          borderRadius:
            "10px",
          padding: "30px",
          background:
            "white",
        }}
      >
        <div
          style={{
            textAlign:
              "center",
            borderBottom:
              "3px solid #0097b2",
            paddingBottom:
              "15px",
            marginBottom:
              "20px",
          }}
        >
          <h1
            style={{
              color:
                "#0097b2",
            }}
          >
            PEFA MEDICAL
            DIAGNOSTIC
            SERVICES
          </h1>

          <p>
            Accurate,
            Reliable &
            Professional
            Diagnostic
            Services
          </p>
        </div>

        <p>
          <strong>
            Patient Name:
          </strong>{" "}
          {patientName}
        </p>

        <p>
          <strong>
            Age:
          </strong>{" "}
          {age}
        </p>

        <p>
          <strong>
            Sex:
          </strong>{" "}
          {sex}
        </p>

        <p>
          <strong>
            Test:
          </strong>{" "}
          {testName}
        </p>

        <hr
          style={{
            margin:
              "25px 0",
          }}
        />

        <p>
          <strong>
            Result:
          </strong>{" "}
          {result}
        </p>

        <p>
          <strong>
            Reference:
          </strong>{" "}
          {reference}
        </p>

        <div
          style={{
            marginTop: "40px",
            textAlign:
              "center",
          }}
        >
          <h3>
            Scan to Verify
            Result
          </h3>

          <div
            style={{
              background:
                "white",
              padding:
                "15px",
              display:
                "inline-block",
            }}
          >
            <QRCode
              value={
                verificationLink
              }
              size={120}
            />
          </div>

          <p
            style={{
              marginTop:
                "10px",
              fontSize:
                "14px",
            }}
          >
            Secure Online
            Verification
          </p>
        </div>

        <div
          style={{
            marginTop: "50px",
          }}
        >
          <p>
            __________________
          </p>

          <p>
            Scientist
          </p>

          <p>
            {scientist}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "15px",
          marginTop: "30px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() =>
            window.print()
          }
          style={{
            padding:
              "15px 25px",
            background:
              "#0097b2",
            color: "white",
            border: "none",
            borderRadius:
              "10px",
            cursor: "pointer",
          }}
        >
          Print Report
        </button>

        <button
          onClick={exportPDF}
          style={{
            padding:
              "15px 25px",
            background:
              "#9acd32",
            color: "white",
            border: "none",
            borderRadius:
              "10px",
            cursor: "pointer",
          }}
        >
          Export PDF
        </button>
      </div>
    </div>
  );
}