import React from "react";

export default function ProstateScanForm({
  data = {},
  onChange,
}) {

  const setValue = (key, value) => {
    onChange(key, value);
  };

  return (

    <div className="scan-form-grid">

      {/* =========================
          PROSTATE GLAND
      ========================= */}

      <h3>Prostate Gland</h3>

      <textarea
        rows={3}
        placeholder="Size, volume, echotexture and contour..."
        value={data.prostate || ""}
        onChange={(e) =>
          setValue("prostate", e.target.value)
        }
      />

      {/* =========================
          CAPSULE
      ========================= */}

      <h3>Capsule</h3>

      <textarea
        rows={2}
        placeholder="Capsular outline..."
        value={data.capsule || ""}
        onChange={(e) =>
          setValue("capsule", e.target.value)
        }
      />

      {/* =========================
          TRANSITION ZONE
      ========================= */}

      <h3>Transition Zone</h3>

      <textarea
        rows={2}
        placeholder="Transition zone findings..."
        value={data.transitionZone || ""}
        onChange={(e) =>
          setValue("transitionZone", e.target.value)
        }
      />

      {/* =========================
          PERIPHERAL ZONE
      ========================= */}

      <h3>Peripheral Zone</h3>

      <textarea
        rows={2}
        placeholder="Peripheral zone findings..."
        value={data.peripheralZone || ""}
        onChange={(e) =>
          setValue("peripheralZone", e.target.value)
        }
      />

      {/* =========================
          SEMINAL VESICLES
      ========================= */}

      <h3>Seminal Vesicles</h3>

      <textarea
        rows={2}
        placeholder="Seminal vesicle appearance..."
        value={data.seminalVesicles || ""}
        onChange={(e) =>
          setValue("seminalVesicles", e.target.value)
        }
      />

      {/* =========================
          BLADDER BASE
      ========================= */}

      <h3>Bladder Base</h3>

      <textarea
        rows={2}
        placeholder="Bladder base findings..."
        value={data.bladderBase || ""}
        onChange={(e) =>
          setValue("bladderBase", e.target.value)
        }
      />

      {/* =========================
          POST VOID RESIDUAL
      ========================= */}

      <h3>Post Void Residual</h3>

      <textarea
        rows={2}
        placeholder="Residual urine findings..."
        value={data.postVoidResidual || ""}
        onChange={(e) =>
          setValue("postVoidResidual", e.target.value)
        }
      />

      {/* =========================
          IMPRESSION
      ========================= */}

      <h3>Impression</h3>

      <textarea
        rows={4}
        placeholder="Overall impression..."
        value={data.impression || ""}
        onChange={(e) =>
          setValue("impression", e.target.value)
        }
      />

      {/* =========================
          RECOMMENDATION
      ========================= */}

      <h3>Recommendation</h3>

      <textarea
        rows={4}
        placeholder="Recommendation..."
        value={data.recommendation || ""}
        onChange={(e) =>
          setValue("recommendation", e.target.value)
        }
      />

    </div>

  );

}