import UltrasoundImageUploader
from "../UltrasoundImageUploader";

export default function OBSForm({

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
          BIO PARAMETERS
      ===================== */}

      <h3>

        Bio-Parameters

      </h3>

      <textarea
        rows={3}
        placeholder="Bi-parameter findings..."
        value={data.bioParameters || ""}
        onChange={(e)=>
          setValue(
            "bioParameters",
            e.target.value
          )
        }
      />

      {/* =====================
          PLACENTA
      ===================== */}

      <h3>

        Placenta Status

      </h3>

      <textarea
        rows={3}
        placeholder="Placenta findings..."
        value={data.placentaStatus || ""}
        onChange={(e)=>
          setValue(
            "placentaStatus",
            e.target.value
          )
        }
      />

      {/* =====================
          FETAL STATUS
      ===================== */}

      <h3>

        Fetal Status

      </h3>

      <textarea
        rows={5}
        placeholder="Fetal status..."
        value={data.fetalStatus || ""}
        onChange={(e)=>
          setValue(
            "fetalStatus",
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

<UltrasoundImageUploader

  images={

    form.images || []

  }

  onChange={(images)=>

    setForm({

      ...form,

      images,

    })

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