export default function SoftTissueScanForm({

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
          SITE EXAMINED
      ===================== */}

      <h3>

        Site Examined

      </h3>

      <textarea
        rows={2}
        placeholder="Specify anatomical site examined..."
        value={data.siteExamined || ""}
        onChange={(e)=>
          setValue(
            "siteExamined",
            e.target.value
          )
        }
      />

      {/* =====================
          SOFT TISSUE THICKNESS
      ===================== */}

      <h3>

        Soft Tissue Thickness

      </h3>

      <textarea
        rows={2}
        placeholder="Soft tissue thickness..."
        value={data.softTissueThickness || ""}
        onChange={(e)=>
          setValue(
            "softTissueThickness",
            e.target.value
          )
        }
      />

      {/* =====================
          ECHOGENICITY
      ===================== */}

      <h3>

        Echogenicity

      </h3>

      <textarea
        rows={2}
        placeholder="Echogenicity findings..."
        value={data.echogenicity || ""}
        onChange={(e)=>
          setValue(
            "echogenicity",
            e.target.value
          )
        }
      />

      {/* =====================
          MASS / LESION
      ===================== */}

      <h3>

        Mass / Lesion Description

      </h3>

      <textarea
        rows={4}
        placeholder="Describe masses, nodules or lesions..."
        value={data.massDescription || ""}
        onChange={(e)=>
          setValue(
            "massDescription",
            e.target.value
          )
        }
      />

      {/* =====================
          VASCULARITY
      ===================== */}

      <h3>

        Doppler Vascularity

      </h3>

      <textarea
        rows={2}
        placeholder="Vascularity findings..."
        value={data.vascularity || ""}
        onChange={(e)=>
          setValue(
            "vascularity",
            e.target.value
          )
        }
      />

      {/* =====================
          FLUID COLLECTION
      ===================== */}

      <h3>

        Fluid Collection

      </h3>

      <textarea
        rows={3}
        placeholder="Abscess, seroma, hematoma or fluid collection..."
        value={data.fluidCollection || ""}
        onChange={(e)=>
          setValue(
            "fluidCollection",
            e.target.value
          )
        }
      />

      {/* =====================
          FOREIGN BODY
      ===================== */}

      <h3>

        Foreign Body

      </h3>

      <textarea
        rows={2}
        placeholder="Foreign body findings..."
        value={data.foreignBody || ""}
        onChange={(e)=>
          setValue(
            "foreignBody",
            e.target.value
          )
        }
      />

      {/* =====================
          ADJACENT STRUCTURES
      ===================== */}

      <h3>

        Adjacent Structures

      </h3>

      <textarea
        rows={3}
        placeholder="Muscles, tendons, vessels, nerves, bones..."
        value={data.adjacentStructures || ""}
        onChange={(e)=>
          setValue(
            "adjacentStructures",
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
        placeholder="Radiological impression..."
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
        placeholder="Recommendations..."
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