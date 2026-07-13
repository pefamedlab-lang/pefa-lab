import "../styles/ultrasoundPrint.css";

import {
  useMemo,
} from "react";

import {
  supabase,
} from "../supabase";

export default function UltrasoundPrint({
  patient,
  report = {},
  sonographer,
  releaseStatus,
  uploadedImages = [],
}) {

  /* =========================
     SAFETY
  ========================= */

  if (!patient)
    return null;

  /* =========================
     SAFE IMAGES
  ========================= */

  const safeImages =
    Array.isArray(
      uploadedImages
    )
      ? uploadedImages
      : [];

  /* =========================
     IMAGE URLS
  ========================= */

  const imageUrls =
    useMemo(() => {

      if (
        !safeImages.length
      ) {
        return [];
      }

      return safeImages
        .map((image) => {

          try {

            const {
              data,
            } = supabase
              .storage
              .from(
                "ultrasound-images"
              )
              .getPublicUrl(
                image
              );

            return (
              data?.publicUrl || null
            );

          } catch {

            return null;
          }
        })
        .filter(Boolean);

    }, [safeImages]);

  /* =========================
     SCAN TYPE DETECTION
  ========================= */

  const scanType =
    patient?.scan_type
      ?.toLowerCase() || "";

  const isObstetric =
    scanType.includes(
      "obstetric"
    );

  const isPelvic =
    scanType.includes(
      "pelvic"
    );

  const isAbdominal =
    scanType.includes(
      "abdominal"
    );

  const isProstate =
    scanType.includes(
      "prostate"
    );

  const isThyroid =
    scanType.includes(
      "thyroid"
    );

  const isBreast =
    scanType.includes(
      "breast"
    );

  const isDoppler =
    scanType.includes(
      "doppler"
    );

  return (

    <div className="ultrasound-print">

      {/* =========================
          HEADER
      ========================= */}

      <div className="print-header">

        <div>

          <h1>
            PEFA Medical Diagnostic Services
          </h1>

          <p>
            Enterprise Ultrasound & Radiology Unit
          </p>

          <span>
            Pakuro • Mowe • Orimerunmu
          </span>

        </div>

        <div className="print-header-right">

          <h3>
            ULTRASOUND REPORT
          </h3>

          <p>
            Scan No:
            {" "}
            {
              patient?.scan_number ||
              "-"
            }
          </p>

          <p>
            Access Code:
            {" "}
            {
              patient?.access_code ||
              "-"
            }
          </p>

        </div>

      </div>

      {/* =========================
          PATIENT INFO
      ========================= */}

      <div className="print-section">

        <h2>
          Patient Information
        </h2>

        <div className="print-grid">

          <div>

            <label>
              Full Name
            </label>

            <span>
              {
                patient?.full_name ||
                "-"
              }
            </span>

          </div>

          <div>

            <label>
              Age
            </label>

            <span>
              {
                patient?.age ||
                "-"
              }
            </span>

          </div>

          <div>

            <label>
              Sex
            </label>

            <span>
              {
                patient?.sex ||
                "-"
              }
            </span>

          </div>

          <div>

            <label>
              Scan Type
            </label>

            <span>
              {
                patient?.scan_type ||
                "-"
              }
            </span>

          </div>

          <div>

            <label>
              Referring Doctor
            </label>

            <span>
              {
                patient?.referring_doctor ||
                "-"
              }
            </span>

          </div>

          <div>

            <label>
              Date
            </label>

            <span>
              {
                new Date()
                  .toLocaleDateString()
              }
            </span>

          </div>

        </div>

      </div>

      {/* =========================
          OBSTETRIC
      ========================= */}

      {isObstetric && (

        <div className="print-section">

          <h2>
            Obstetric Biometry
          </h2>

          <div className="print-grid">

            {report?.bpd && (
              <div>
                <label>BPD</label>
                <span>{report.bpd}</span>
              </div>
            )}

            {report?.hc && (
              <div>
                <label>HC</label>
                <span>{report.hc}</span>
              </div>
            )}

            {report?.ac && (
              <div>
                <label>AC</label>
                <span>{report.ac}</span>
              </div>
            )}

            {report?.fl && (
              <div>
                <label>FL</label>
                <span>{report.fl}</span>
              </div>
            )}

            {report?.crl && (
              <div>
                <label>CRL</label>
                <span>{report.crl}</span>
              </div>
            )}

            {report?.gsd && (
              <div>
                <label>GSD</label>
                <span>{report.gsd}</span>
              </div>
            )}

            {report?.ga && (
              <div>
                <label>GA</label>
                <span>{report.ga}</span>
              </div>
            )}

            {report?.edd && (
              <div>
                <label>EDD</label>
                <span>{report.edd}</span>
              </div>
            )}

            {report?.fetal_weight && (
              <div>
                <label>Weight</label>
                <span>{report.fetal_weight}</span>
              </div>
            )}

            {report?.fetal_sex && (
              <div>
                <label>Fetal Sex</label>
                <span>{report.fetal_sex}</span>
              </div>
            )}

            {report?.afi && (
              <div>
                <label>AFI</label>
                <span>{report.afi}</span>
              </div>
            )}

            {report?.placenta_grade && (
              <div>
                <label>Placenta Grade</label>
                <span>{report.placenta_grade}</span>
              </div>
            )}

          </div>

        </div>
      )}

      {/* =========================
          PELVIC
      ========================= */}

      {isPelvic && (

        <div className="print-section">

          <h2>
            Pelvic Findings
          </h2>

          <div className="print-grid">

            {report?.uterus && (
              <div>
                <label>Uterus</label>
                <span>{report.uterus}</span>
              </div>
            )}

            {report?.endometrium && (
              <div>
                <label>Endometrium</label>
                <span>{report.endometrium}</span>
              </div>
            )}

            {report?.right_ovary && (
              <div>
                <label>Right Ovary</label>
                <span>{report.right_ovary}</span>
              </div>
            )}

            {report?.left_ovary && (
              <div>
                <label>Left Ovary</label>
                <span>{report.left_ovary}</span>
              </div>
            )}

            {report?.adnexa && (
              <div>
                <label>Adnexa</label>
                <span>{report.adnexa}</span>
              </div>
            )}

            {report?.pod && (
              <div>
                <label>POD</label>
                <span>{report.pod}</span>
              </div>
            )}

          </div>

        </div>
      )}

      {/* =========================
          ABDOMINAL
      ========================= */}

      {isAbdominal && (

        <div className="print-section">

          <h2>
            Abdominal Findings
          </h2>

          <div className="print-grid">

            {report?.liver && (
              <div>
                <label>Liver</label>
                <span>{report.liver}</span>
              </div>
            )}

            {report?.gallbladder && (
              <div>
                <label>Gallbladder</label>
                <span>{report.gallbladder}</span>
              </div>
            )}

            {report?.pancreas && (
              <div>
                <label>Pancreas</label>
                <span>{report.pancreas}</span>
              </div>
            )}

            {report?.spleen && (
              <div>
                <label>Spleen</label>
                <span>{report.spleen}</span>
              </div>
            )}

            {report?.right_kidney && (
              <div>
                <label>Right Kidney</label>
                <span>{report.right_kidney}</span>
              </div>
            )}

            {report?.left_kidney && (
              <div>
                <label>Left Kidney</label>
                <span>{report.left_kidney}</span>
              </div>
            )}

          </div>

        </div>
      )}

      {/* =========================
          PROSTATE
      ========================= */}

      {isProstate && (

        <div className="print-section">

          <h2>
            Prostate Findings
          </h2>

          <div className="print-grid">

            {report?.prostate_volume && (
              <div>
                <label>Prostate Volume</label>
                <span>{report.prostate_volume}</span>
              </div>
            )}

            {report?.bladder_wall && (
              <div>
                <label>Bladder Wall</label>
                <span>{report.bladder_wall}</span>
              </div>
            )}

            {report?.residual_urine && (
              <div>
                <label>Residual Urine</label>
                <span>{report.residual_urine}</span>
              </div>
            )}

          </div>

        </div>
      )}

      {/* =========================
          THYROID
      ========================= */}

      {isThyroid && (

        <div className="print-section">

          <h2>
            Thyroid Findings
          </h2>

          <div className="print-grid">

            {report?.right_lobe && (
              <div>
                <label>Right Lobe</label>
                <span>{report.right_lobe}</span>
              </div>
            )}

            {report?.left_lobe && (
              <div>
                <label>Left Lobe</label>
                <span>{report.left_lobe}</span>
              </div>
            )}

            {report?.isthmus && (
              <div>
                <label>Isthmus</label>
                <span>{report.isthmus}</span>
              </div>
            )}

            {report?.thyroid_nodules && (
              <div>
                <label>Nodules</label>
                <span>{report.thyroid_nodules}</span>
              </div>
            )}

            {report?.vascularity && (
              <div>
                <label>Vascularity</label>
                <span>{report.vascularity}</span>
              </div>
            )}

          </div>

        </div>
      )}

      {/* =========================
          BREAST
      ========================= */}

      {isBreast && (

        <div className="print-section">

          <h2>
            Breast Findings
          </h2>

          <div className="print-grid">

            {report?.breast_findings && (
              <div>
                <label>Findings</label>
                <span>{report.breast_findings}</span>
              </div>
            )}

            {report?.birads && (
              <div>
                <label>BIRADS</label>
                <span>{report.birads}</span>
              </div>
            )}

          </div>

        </div>
      )}

      {/* =========================
          DOPPLER
      ========================= */}

      {isDoppler && (

        <div className="print-section">

          <h2>
            Doppler Findings
          </h2>

          <div className="print-grid">

            {report?.doppler_findings && (
              <div>
                <label>Doppler Findings</label>
                <span>{report.doppler_findings}</span>
              </div>
            )}

            {report?.velocity && (
              <div>
                <label>Velocity</label>
                <span>{report.velocity}</span>
              </div>
            )}

            {report?.waveform && (
              <div>
                <label>Waveform</label>
                <span>{report.waveform}</span>
              </div>
            )}

          </div>

        </div>
      )}

      {/* =========================
          GENERAL FINDINGS
      ========================= */}

      <div className="print-section">

        <h2>
          Findings
        </h2>

        <p>
          {
            report?.findings ||
            "-"
          }
        </p>

      </div>

      <div className="print-section">

        <h2>
          Impression
        </h2>

        <p>
          {
            report?.impression ||
            "-"
          }
        </p>

      </div>

      <div className="print-section">

        <h2>
          Conclusion
        </h2>

        <p>
          {
            report?.conclusion ||
            "-"
          }
        </p>

      </div>

      {/* =========================
          ULTRASOUND IMAGES
      ========================= */}

      {imageUrls.length > 0 && (

        <div className="print-section">

          <h2>
            Ultrasound Images
          </h2>

          <div className="ultrasound-images-grid">

            {imageUrls.map(
              (
                image,
                index
              ) => (

                <div
                  key={index}
                  className="ultrasound-image-card"
                >

                  <img
                    src={image}
                    alt={`Ultrasound ${index + 1}`}
                  />

                  <span>
                    Scan Image
                    {" "}
                    {index + 1}
                  </span>

                </div>
              )
            )}

          </div>

        </div>
      )}

      {/* =========================
          VALIDATION
      ========================= */}

      <div className="validation-section">

        <div>

          <label>
            Sonographer
          </label>

          <p>
            {
              sonographer ||
              "-"
            }
          </p>

        </div>

        <div>

          <label>
            Release Status
          </label>

          <p>
            {
              releaseStatus ||
              "Pending"
            }
          </p>

        </div>

      </div>

      {/* =========================
          SIGNATURE
      ========================= */}

      <div className="signature-section">

        <div className="signature-box">

          <div className="signature-line" />

          <span>
            Sonographer Signature
          </span>

        </div>

      </div>

    </div>
  );
}