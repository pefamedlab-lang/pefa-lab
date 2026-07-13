import QRCode from "react-qr-code";

export default function ResultQRCode({
  labNumber,
  accessCode,
}) {
  const resultUrl = `${window.location.origin}/patient-portal?lab=${labNumber}&code=${accessCode}`;

  return (
    <div
      style={{
        display: "flex",

        flexDirection:
          "column",

        alignItems:
          "center",

        gap: "10px",

        marginTop: "20px",
      }}
    >
      <QRCode
        value={resultUrl}
        size={120}
      />

      <small>
        Scan to verify
        result
      </small>
    </div>
  );
}