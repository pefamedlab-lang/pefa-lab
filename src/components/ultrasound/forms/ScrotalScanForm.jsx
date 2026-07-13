export default function ScrotalScanForm({

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
          RIGHT TESTIS
      ===================== */}

      <h3>

        Right Testis

      </h3>

      <textarea
        rows={3}
        placeholder="Right testicular findings..."
        value={data.rightTestis || ""}
        onChange={(e)=>
          setValue(
            "rightTestis",
            e.target.value
          )
        }
      />

      {/* =====================
          LEFT TESTIS
      ===================== */}

      <h3>

        Left Testis

      </h3>

      <textarea
        rows={3}
        placeholder="Left testicular findings..."
        value={data.leftTestis || ""}
        onChange={(e)=>
          setValue(
            "leftTestis",
            e.target.value
          )
        }
      />

      {/* =====================
          RIGHT EPIDIDYMIS
      ===================== */}

      <h3>

        Right Epididymis

      </h3>

      <textarea
        rows={2}
        placeholder="Right epididymal findings..."
        value={data.rightEpididymis || ""}
        onChange={(e)=>
          setValue(
            "rightEpididymis",
            e.target.value
          )
        }
      />

      {/* =====================
          LEFT EPIDIDYMIS
      ===================== */}

      <h3>

        Left Epididymis

      </h3>

      <textarea
        rows={2}
        placeholder="Left epididymal findings..."
        value={data.leftEpididymis || ""}
        onChange={(e)=>
          setValue(
            "leftEpididymis",
            e.target.value
          )
        }
      />

      {/* =====================
          SPERMATIC CORD
      ===================== */}

      <h3>

        Spermatic Cord

      </h3>

      <textarea
        rows={2}
        placeholder="Spermatic cord findings..."
        value={data.spermaticCord || ""}
        onChange={(e)=>
          setValue(
            "spermaticCord",
            e.target.value
          )
        }
      />

      {/* =====================
          HYDROCELE
      ===================== */}

      <h3>

        Hydrocele

      </h3>

      <textarea
        rows={2}
        placeholder="Hydrocele findings..."
        value={data.hydrocele || ""}
        onChange={(e)=>
          setValue(
            "hydrocele",
            e.target.value
          )
        }
      />

      {/* =====================
          VARICOCELE
      ===================== */}

      <h3>

        Varicocele

      </h3>

      <textarea
        rows={2}
        placeholder="Varicocele findings..."
        value={data.varicocele || ""}
        onChange={(e)=>
          setValue(
            "varicocele",
            e.target.value
          )
        }
      />

      {/* =====================
          SCROTAL WALL
      ===================== */}

      <h3>

        Scrotal Wall

      </h3>

      <textarea
        rows={2}
        placeholder="Scrotal wall findings..."
        value={data.scrotalWall || ""}
        onChange={(e)=>
          setValue(
            "scrotalWall",
            e.target.value
          )
        }
      />

      {/* =====================
          MASSES / LESIONS
      ===================== */}

      <h3>

        Masses / Lesions

      </h3>

      <textarea
        rows={3}
        placeholder="Masses or focal lesions..."
        value={data.masses || ""}
        onChange={(e)=>
          setValue(
            "masses",
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