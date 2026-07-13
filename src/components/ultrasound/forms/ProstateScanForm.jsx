export default function ProstateScanForm({

  data = {},

  onChange,

}) {

  const setValue = (

    key,

    value

  ) => {

    onChange(

      key,

      value

    );

  };

  return (

    <div className="scan-form-grid">

      {/* =====================
          PROSTATE SIZE
      ===================== */}

      <h3>

        Prostate Size

      </h3>

      <textarea
        rows={2}
        placeholder="Prostate dimensions..."
        value={data.prostateSize || ""}
        onChange={(e)=>
          setValue(
            "prostateSize",
            e.target.value
          )
        }
      />

      {/* =====================
          PROSTATE VOLUME
      ===================== */}

      <h3>

        Prostate Volume

      </h3>

      <textarea
        rows={2}
        placeholder="Prostate volume..."
        value={data.prostateVolume || ""}
        onChange={(e)=>
          setValue(
            "prostateVolume",
            e.target.value
          )
        }
      />

      {/* =====================
          ECHOTEXTURE
      ===================== */}

      <h3>

        Echotexture

      </h3>

      <textarea
        rows={2}
        placeholder="Prostatic echotexture..."
        value={data.echotexture || ""}
        onChange={(e)=>
          setValue(
            "echotexture",
            e.target.value
          )
        }
      />

      {/* =====================
          CAPSULE
      ===================== */}

      <h3>

        Capsule

      </h3>

      <textarea
        rows={2}
        placeholder="Capsular outline..."
        value={data.capsule || ""}
        onChange={(e)=>
          setValue(
            "capsule",
            e.target.value
          )
        }
      />

      {/* =====================
          MEDIAN LOBE
      ===================== */}

      <h3>

        Median Lobe

      </h3>

      <textarea
        rows={2}
        placeholder="Median lobe findings..."
        value={data.medianLobe || ""}
        onChange={(e)=>
          setValue(
            "medianLobe",
            e.target.value
          )
        }
      />

      {/* =====================
          SEMINAL VESICLES
      ===================== */}

      <h3>

        Seminal Vesicles

      </h3>

      <textarea
        rows={2}
        placeholder="Seminal vesicles..."
        value={data.seminalVesicles || ""}
        onChange={(e)=>
          setValue(
            "seminalVesicles",
            e.target.value
          )
        }
      />

      {/* =====================
          URINARY BLADDER
      ===================== */}

      <h3>

        Urinary Bladder

      </h3>

      <textarea
        rows={3}
        placeholder="Bladder findings..."
        value={data.bladder || ""}
        onChange={(e)=>
          setValue(
            "bladder",
            e.target.value
          )
        }
      />

      {/* =====================
          POST VOID RESIDUAL
      ===================== */}

      <h3>

        Post-Void Residual Volume

      </h3>

      <textarea
        rows={2}
        placeholder="Residual urine volume..."
        value={data.postVoidResidual || ""}
        onChange={(e)=>
          setValue(
            "postVoidResidual",
            e.target.value
          )
        }
      />

      {/* =====================
          CALCIFICATIONS
      ===================== */}

      <h3>

        Calcifications

      </h3>

      <textarea
        rows={2}
        placeholder="Calcifications..."
        value={data.calcifications || ""}
        onChange={(e)=>
          setValue(
            "calcifications",
            e.target.value
          )
        }
      />

      {/* =====================
          FOCAL LESIONS
      ===================== */}

      <h3>

        Focal Lesions

      </h3>

      <textarea
        rows={3}
        placeholder="Focal lesions or masses..."
        value={data.focalLesions || ""}
        onChange={(e)=>
          setValue(
            "focalLesions",
            e.target.value
          )
        }
      />

      {/* =====================
          IMPRESSION
      ===================== */}

      <h3>

        Impression

      </h3>

      <textarea
        rows={4}
        placeholder="Impression..."
        value={data.impression || ""}
        onChange={(e)=>
          setValue(
            "impression",
            e.target.value
          )
        }
      />

      {/* =====================
          RECOMMENDATION
      ===================== */}

      <h3>

        Recommendation

      </h3>

      <textarea
        rows={4}
        placeholder="Recommendation..."
        value={data.recommendation || ""}
        onChange={(e)=>
          setValue(
            "recommendation",
            e.target.value
          )
        }
      />

    </div>

  );

}