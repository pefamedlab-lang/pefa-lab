export default function BreastScanForm({

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
          RIGHT BREAST
      ===================== */}

      <h3>

        Right Breast

      </h3>

      <textarea
        rows={3}
        placeholder="Right breast findings..."
        value={data.rightBreast || ""}
        onChange={(e)=>
          setValue(
            "rightBreast",
            e.target.value
          )
        }
      />

      {/* =====================
          LEFT BREAST
      ===================== */}

      <h3>

        Left Breast

      </h3>

      <textarea
        rows={3}
        placeholder="Left breast findings..."
        value={data.leftBreast || ""}
        onChange={(e)=>
          setValue(
            "leftBreast",
            e.target.value
          )
        }
      />

      {/* =====================
          RETROAREOLAR REGION
      ===================== */}

      <h3>

        Retroareolar Region

      </h3>

      <textarea
        rows={2}
        placeholder="Retroareolar findings..."
        value={data.retroareolarRegion || ""}
        onChange={(e)=>
          setValue(
            "retroareolarRegion",
            e.target.value
          )
        }
      />

      {/* =====================
          SKIN THICKNESS
      ===================== */}

      <h3>

        Skin Thickness

      </h3>

      <textarea
        rows={2}
        placeholder="Skin findings..."
        value={data.skinThickness || ""}
        onChange={(e)=>
          setValue(
            "skinThickness",
            e.target.value
          )
        }
      />

      {/* =====================
          DUCTS
      ===================== */}

      <h3>

        Ducts

      </h3>

      <textarea
        rows={2}
        placeholder="Ductal findings..."
        value={data.ducts || ""}
        onChange={(e)=>
          setValue(
            "ducts",
            e.target.value
          )
        }
      />

      {/* =====================
          FIBROGLANDULAR TISSUE
      ===================== */}

      <h3>

        Fibroglandular Tissue

      </h3>

      <textarea
        rows={3}
        placeholder="Fibroglandular tissue findings..."
        value={data.fibroglandularTissue || ""}
        onChange={(e)=>
          setValue(
            "fibroglandularTissue",
            e.target.value
          )
        }
      />

      {/* =====================
          MASSES
      ===================== */}

      <h3>

        Masses / Nodules

      </h3>

      <textarea
        rows={3}
        placeholder="Masses or nodules..."
        value={data.masses || ""}
        onChange={(e)=>
          setValue(
            "masses",
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
          AXILLARY LYMPH NODES
      ===================== */}

      <h3>

        Axillary Lymph Nodes

      </h3>

      <textarea
        rows={2}
        placeholder="Axillary lymph nodes..."
        value={data.axillaryNodes || ""}
        onChange={(e)=>
          setValue(
            "axillaryNodes",
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