import { useState, useRef } from "react";

import jsPDF from "jspdf";

import html2canvas from "html2canvas";

import QRCode from "react-qr-code";

export default function LabReportPage() {
  const reportRef = useRef();

  const [patientName, setPatientName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [testName, setTestName] =
    useState("");

  const [result, setResult] =
    useState("");

  const verificationLink =
    "https://pefa-medlab.vercel.app/result-checker";

  const whatsappMessage =
    `Hello ${patientName},

Your laboratory report is ready.

Verify securely here:

${verificationLink}

PEFA MEDICAL DIAGNOSTIC SERVICES`;

  const whatsappLink =
    `https://wa.me/234${phone}?text=${encodeURIComponent(
      whatsappMessage
    )}`;

  // PDF EXPORT

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
        width: "90%",
        margin: "40px auto",
        background: "white",
        padding: "30px",
        borderRadius:
          "15px",
      }}
    >
      <h1>
        Laboratory Report
      </h1>

      {/* FORM */}

      <div
        style={{
          display: "grid",
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
          type="text"
          placeholder="Patient WhatsApp Number"
          value={phone}
          onChange={(e) =>
            setPhone(
              e.target.value
            )
          }
        />

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
      </div>

      {/* REPORT */}

      <div
        ref={reportRef}
        style={{
          marginTop: "40px",
          border:
            "1px solid #ddd",
          padding: "30px",
          borderRadius:
            "10px",
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
            Patient:
          </strong>{" "}
          {patientName}
        </p>

        <p>
          <strong>
            Test:
          </strong>{" "}
          {testName}
        </p>

        <p>
          <strong>
            Result:
          </strong>{" "}
          {result}
        </p>

        {/* QR */}

        <div
          style={{
            marginTop: "40px",
            textAlign:
              "center",
          }}
        >
          <QRCode
            value={
              verificationLink
            }
            size={120}
          />

          <p>
            Scan to Verify
          </p>
        </div>
      </div>

      {/* ACTIONS */}

      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          marginTop: "30px",
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
          }}
        >
          Export PDF
        </button>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
        >
          <button
            style={{
              padding:
                "15px 25px",
              background:
                "#25D366",
              color: "white",
              border: "none",
              borderRadius:
                "10px",
            }}
          >
            Send via WhatsApp
          </button>
        </a>
      </div>
    </div>
  );
}