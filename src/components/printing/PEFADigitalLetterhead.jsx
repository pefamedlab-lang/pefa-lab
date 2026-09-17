import React from "react";
import { QRCodeSVG } from "qrcode.react";
import logo from "../../assets/logo.png";
import "../../styles/pefaReportPrinting.css";

/**
 * PEFA MASTER DIGITAL LETTERHEAD
 *
 * This component contains ONLY the reusable PEFA letterhead.
 * Any document body supplied through `children` is rendered
 * underneath the letterhead and is never replaced by it.
 */
export default function PEFADigitalLetterhead({
  verificationId = "PEFA",
  children,
}) {
  return (
    <div className="pefa-document">
      <header className="pefa-report-letterhead">
        <div className="pefa-letterhead-top">
          <div className="pefa-letterhead-logo-wrap">
            <img
              src={logo}
              alt="PEFA Medical Diagnostic Services"
              className="pefa-letterhead-logo"
            />
          </div>

          <div className="pefa-letterhead-title">
            <h1>PEFA MEDICAL</h1>
            <h2>DIAGNOSTIC SERVICES</h2>
            <div className="pefa-service-strip">
              <span>Laboratory</span>
              <span>Ultrasound</span>
              <span>Blood Bank</span>
              <span>ECG</span>
              <b>REG NO: 3450274</b>
            </div>
          </div>

          <div className="pefa-letterhead-qr">
            <QRCodeSVG
              value={String(verificationId)}
              size={64}
              level="H"
            />
          </div>
        </div>

        <div className="pefa-office-row">
          <div>
            <strong>HEAD OFFICE</strong>
            <span>32, Ogunru-Ori, Pakuro Road, Mowe, Ogun State.</span>
          </div>
          <div>
            <strong>MOWE BRANCH</strong>
            <span>5, Olorombo Street, Imedu-Nla, Mowe, Ogun State.</span>
          </div>
          <div>
            <strong>ORIMERUNMU</strong>
            <span>Iya-Ijebu Junction, Orimerunmu Road, Ogun State.</span>
          </div>
        </div>

        <div className="pefa-contact-strip">
          <span>+234 808 661 8621</span><span>|</span>
          <span>+234 808 568 1720</span><span>|</span>
          <span>+234 808 833 6440</span><span>|</span>
          <span>pefa.medlab@gmail.com</span><span>|</span>
          <span>www.pefamedlab.com</span>
        </div>

        <div className="pefa-header-ribbon" aria-hidden="true">
          <i /><i /><i />
        </div>
      </header>

      <main className="pefa-document-body">
        {children}
      </main>
    </div>
  );
}
