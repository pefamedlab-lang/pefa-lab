import JsBarcode from "jsbarcode";
import { QRCodeSVG } from "qrcode.react";
import { useEffect } from "react";

export default function ReportFooter({ result }) {
  /* =====================================================
     BARCODE
  ===================================================== */

  useEffect(() => {
    if (!result?.verification_id) return;

    const barcode = document.getElementById(
      "report-barcode"
    );

    if (!barcode) return;

    try {
      JsBarcode(barcode, result.verification_id, {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: true,
      });
    } catch (err) {
      console.error(err);
    }
  }, [result]);

  return (
    <div className="report-bottom">

      {/* ==========================================
          VERIFICATION
      ========================================== */}

      <div className="report-verification-strip">

        <strong>RESULT VERIFICATION</strong>

        <div className="verification-row">

          <div className="header-barcode">
            <svg id="report-barcode" />
          </div>

          <div className="header-qr">
            <QRCodeSVG
              value={
                result?.verification_id ||
                result?.lab_number ||
                "PEFA"
              }
              size={70}
            />
          </div>

        </div>

      </div>

      {/* ==========================================
          SIGNATURES
      ========================================== */}

      <div className="report-footer-fixed">

        {/* ENTERED */}

        <div className="footer-signature">

          <div className="signature-line" />

          <div className="signature-name">
            {result?.entered_by || "N/A"}
          </div>

          <div className="signature-role">
            Entered By
          </div>

        </div>

        {/* AUTHORIZED */}

        <div className="footer-signature">

          {result?.authorization_status ===
            "Authorized" && (
            <div className="authorization-stamp">
              AUTHORIZED
            </div>
          )}

          <div className="signature-line" />

          <div className="signature-name">
            {result?.authorized_by ||
              "Pending"}
          </div>

          <div className="signature-role">
            Authorized By
          </div>

        </div>

        {/* RELEASED */}

        <div className="footer-signature">

          {result?.release_status ===
            "Released" && (
            <div className="released-stamp">
              RELEASED
            </div>
          )}

          <div className="signature-line" />

          <div className="signature-name">
            {result?.released_by ||
              "Pending"}
          </div>

          <div className="signature-role">
            Released By
          </div>

        </div>

      </div>

      {/* ==========================================
          BRANDING
      ========================================== */}

      <div className="footer-color-lines">

        <div className="line-blue" />

        <div className="line-red" />

        <div className="line-green" />

      </div>

      <div className="report-tagline">

        Leading the way in Medical Excellence
        through Timely, Affordable and Accurate
        Laboratory Services

      </div>

    </div>
  );
}