export default function PelvicScanForm({

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
          UTERUS
      ===================== */}

      <h3>

        Uterus

      </h3>

      <textarea
        rows={3}
        placeholder="Size, position and echotexture..."
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
          CERVIX
      ===================== */}

      <h3>

        Cervix

      </h3>

      <textarea
        rows={2}
        placeholder="Cervical findings..."
        value={data.cervix || ""}
        onChange={(e)=>
          setValue(
            "cervix",
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
        placeholder="Fluid collection or other findings..."
        value={data.pouchOfDouglas || ""}
        onChange={(e)=>
          setValue(
            "pouchOfDouglas",
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
          ADNEXAE
      ===================== */}

      <h3>

        Adnexae

      </h3>

      <textarea
        rows={2}
        placeholder="Adnexal findings..."
        value={data.adnexae || ""}
        onChange={(e)=>
          setValue(
            "adnexae",
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