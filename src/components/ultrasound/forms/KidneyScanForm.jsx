export default function KidneyScanForm({

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
          RIGHT KIDNEY
      ===================== */}

      <h3>

        Right Kidney

      </h3>

      <textarea
        rows={3}
        placeholder="Right kidney size, echogenicity and findings..."
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
        placeholder="Left kidney size, echogenicity and findings..."
        value={data.leftKidney || ""}
        onChange={(e)=>
          setValue(
            "leftKidney",
            e.target.value
          )
        }
      />

      {/* =====================
          CORTICOMEDULLARY
      ===================== */}

      <h3>

        Corticomedullary Differentiation

      </h3>

      <textarea
        rows={2}
        placeholder="Corticomedullary differentiation..."
        value={data.cmd || ""}
        onChange={(e)=>
          setValue(
            "cmd",
            e.target.value
          )
        }
      />

      {/* =====================
          PELVICALYCEAL SYSTEM
      ===================== */}

      <h3>

        Pelvicalyceal System

      </h3>

      <textarea
        rows={2}
        placeholder="Pelvicalyceal system findings..."
        value={data.pelvicalycealSystem || ""}
        onChange={(e)=>
          setValue(
            "pelvicalycealSystem",
            e.target.value
          )
        }
      />

      {/* =====================
          RENAL STONES
      ===================== */}

      <h3>

        Renal Stones

      </h3>

      <textarea
        rows={2}
        placeholder="Presence or absence of stones..."
        value={data.renalStones || ""}
        onChange={(e)=>
          setValue(
            "renalStones",
            e.target.value
          )
        }
      />

      {/* =====================
          HYDRONEPHROSIS
      ===================== */}

      <h3>

        Hydronephrosis

      </h3>

      <textarea
        rows={2}
        placeholder="Hydronephrosis findings..."
        value={data.hydronephrosis || ""}
        onChange={(e)=>
          setValue(
            "hydronephrosis",
            e.target.value
          )
        }
      />

      {/* =====================
          URETERS
      ===================== */}

      <h3>

        Ureters

      </h3>

      <textarea
        rows={2}
        placeholder="Ureteric findings..."
        value={data.ureters || ""}
        onChange={(e)=>
          setValue(
            "ureters",
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
        placeholder="Urinary bladder findings..."
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