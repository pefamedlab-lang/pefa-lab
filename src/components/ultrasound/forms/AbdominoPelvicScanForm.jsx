export default function AbdominoPelvicScanForm({

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
        placeholder="Liver findings..."
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
          UTERUS
      ===================== */}

      <h3>

        Uterus

      </h3>

      <textarea
        rows={3}
        placeholder="Uterine findings..."
        value={data.uterus || ""}
        onChange={(e)=>
          setValue(
            "uterus",
            e.target.value
          )
        }
      />

      {/* =====================
          ENDOMETRIUM
      ===================== */}

      <h3>

        Endometrium

      </h3>

      <textarea
        rows={2}
        placeholder="Endometrial findings..."
        value={data.endometrium || ""}
        onChange={(e)=>
          setValue(
            "endometrium",
            e.target.value
          )
        }
      />

      {/* =====================
          RIGHT OVARY
      ===================== */}

      <h3>

        Right Ovary

      </h3>

      <textarea
        rows={2}
        placeholder="Right ovary findings..."
        value={data.rightOvary || ""}
        onChange={(e)=>
          setValue(
            "rightOvary",
            e.target.value
          )
        }
      />

      {/* =====================
          LEFT OVARY
      ===================== */}

      <h3>

        Left Ovary

      </h3>

      <textarea
        rows={2}
        placeholder="Left ovary findings..."
        value={data.leftOvary || ""}
        onChange={(e)=>
          setValue(
            "leftOvary",
            e.target.value
          )
        }
      />

      {/* =====================
          POUCH OF DOUGLAS
      ===================== */}

      <h3>

        Pouch of Douglas

      </h3>

      <textarea
        rows={2}
        placeholder="Pouch of Douglas findings..."
        value={data.pouchOfDouglas || ""}
        onChange={(e)=>
          setValue(
            "pouchOfDouglas",
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