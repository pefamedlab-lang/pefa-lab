export default function AbdominalScanForm({

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
          LIVER
      ===================== */}

      <h3>

        Liver

      </h3>

      <textarea
        rows={3}
        placeholder="Liver size, echotexture and focal lesions..."
        value={data.liver || ""}
        onChange={(e)=>
          setValue(
            "liver",
            e.target.value
          )
        }
      />

      {/* =====================
          GALL BLADDER
      ===================== */}

      <h3>

        Gall Bladder

      </h3>

      <textarea
        rows={3}
        placeholder="Gall bladder findings..."
        value={data.gallBladder || ""}
        onChange={(e)=>
          setValue(
            "gallBladder",
            e.target.value
          )
        }
      />

      {/* =====================
          PANCREAS
      ===================== */}

      <h3>

        Pancreas

      </h3>

      <textarea
        rows={3}
        placeholder="Pancreatic findings..."
        value={data.pancreas || ""}
        onChange={(e)=>
          setValue(
            "pancreas",
            e.target.value
          )
        }
      />

      {/* =====================
          SPLEEN
      ===================== */}

      <h3>

        Spleen

      </h3>

      <textarea
        rows={3}
        placeholder="Splenic findings..."
        value={data.spleen || ""}
        onChange={(e)=>
          setValue(
            "spleen",
            e.target.value
          )
        }
      />

      {/* =====================
          RIGHT KIDNEY
      ===================== */}

      <h3>

        Right Kidney

      </h3>

      <textarea
        rows={3}
        placeholder="Right kidney findings..."
        value={data.rightKidney || ""}
        onChange={(e)=>
          setValue(
            "rightKidney",
            e.target.value
          )
        }
      />

      {/* =====================
          LEFT KIDNEY
      ===================== */}

      <h3>

        Left Kidney

      </h3>

      <textarea
        rows={3}
        placeholder="Left kidney findings..."
        value={data.leftKidney || ""}
        onChange={(e)=>
          setValue(
            "leftKidney",
            e.target.value
          )
        }
      />

      {/* =====================
          ABDOMINAL AORTA
      ===================== */}

      <h3>

        Abdominal Aorta

      </h3>

      <textarea
        rows={2}
        placeholder="Aortic findings..."
        value={data.aorta || ""}
        onChange={(e)=>
          setValue(
            "aorta",
            e.target.value
          )
        }
      />

      {/* =====================
          INFERIOR VENA CAVA
      ===================== */}

      <h3>

        Inferior Vena Cava

      </h3>

      <textarea
        rows={2}
        placeholder="IVC findings..."
        value={data.ivc || ""}
        onChange={(e)=>
          setValue(
            "ivc",
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
        rows={2}
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
          FREE FLUID
      ===================== */}

      <h3>

        Free Fluid

      </h3>

      <textarea
        rows={2}
        placeholder="Presence or absence of free fluid..."
        value={data.freeFluid || ""}
        onChange={(e)=>
          setValue(
            "freeFluid",
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