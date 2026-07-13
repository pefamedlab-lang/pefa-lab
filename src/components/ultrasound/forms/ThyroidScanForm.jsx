export default function ThyroidScanForm({

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
          RIGHT THYROID LOBE
      ===================== */}

      <h3>

        Right Thyroid Lobe

      </h3>

      <textarea
        rows={3}
        placeholder="Right thyroid lobe findings..."
        value={data.rightLobe || ""}
        onChange={(e)=>
          setValue(
            "rightLobe",
            e.target.value
          )
        }
      />

      {/* =====================
          LEFT THYROID LOBE
      ===================== */}

      <h3>

        Left Thyroid Lobe

      </h3>

      <textarea
        rows={3}
        placeholder="Left thyroid lobe findings..."
        value={data.leftLobe || ""}
        onChange={(e)=>
          setValue(
            "leftLobe",
            e.target.value
          )
        }
      />

      {/* =====================
          ISTHMUS
      ===================== */}

      <h3>

        Isthmus

      </h3>

      <textarea
        rows={2}
        placeholder="Isthmus findings..."
        value={data.isthmus || ""}
        onChange={(e)=>
          setValue(
            "isthmus",
            e.target.value
          )
        }
      />

      {/* =====================
          THYROID ECHOTEXTURE
      ===================== */}

      <h3>

        Thyroid Echotexture

      </h3>

      <textarea
        rows={2}
        placeholder="Thyroid echotexture..."
        value={data.echotexture || ""}
        onChange={(e)=>
          setValue(
            "echotexture",
            e.target.value
          )
        }
      />

      {/* =====================
          NODULES
      ===================== */}

      <h3>

        Nodules

      </h3>

      <textarea
        rows={3}
        placeholder="Nodules and measurements..."
        value={data.nodules || ""}
        onChange={(e)=>
          setValue(
            "nodules",
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
          CERVICAL LYMPH NODES
      ===================== */}

      <h3>

        Cervical Lymph Nodes

      </h3>

      <textarea
        rows={2}
        placeholder="Cervical lymph nodes..."
        value={data.cervicalNodes || ""}
        onChange={(e)=>
          setValue(
            "cervicalNodes",
            e.target.value
          )
        }
      />

      {/* =====================
          VASCULARITY
      ===================== */}

      <h3>

        Vascularity

      </h3>

      <textarea
        rows={2}
        placeholder="Doppler vascularity findings..."
        value={data.vascularity || ""}
        onChange={(e)=>
          setValue(
            "vascularity",
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