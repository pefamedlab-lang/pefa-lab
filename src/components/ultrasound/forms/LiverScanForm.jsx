export default function LiverScanForm({

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
          LIVER SIZE
      ===================== */}

      <h3>

        Liver Size

      </h3>

      <textarea
        rows={2}
        placeholder="Liver size..."
        value={data.liverSize || ""}
        onChange={(e)=>
          setValue(
            "liverSize",
            e.target.value
          )
        }
      />

      {/* =====================
          LIVER ECHOTEXTURE
      ===================== */}

      <h3>

        Liver Echotexture

      </h3>

      <textarea
        rows={2}
        placeholder="Liver echotexture..."
        value={data.liverEchotexture || ""}
        onChange={(e)=>
          setValue(
            "liverEchotexture",
            e.target.value
          )
        }
      />

      {/* =====================
          LIVER MARGINS
      ===================== */}

      <h3>

        Liver Margins

      </h3>

      <textarea
        rows={2}
        placeholder="Liver margins..."
        value={data.liverMargins || ""}
        onChange={(e)=>
          setValue(
            "liverMargins",
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
        placeholder="Focal liver lesions..."
        value={data.focalLesions || ""}
        onChange={(e)=>
          setValue(
            "focalLesions",
            e.target.value
          )
        }
      />

      {/* =====================
          INTRAHEPATIC BILE DUCTS
      ===================== */}

      <h3>

        Intrahepatic Bile Ducts

      </h3>

      <textarea
        rows={2}
        placeholder="Intrahepatic bile ducts..."
        value={data.intrahepaticBileDucts || ""}
        onChange={(e)=>
          setValue(
            "intrahepaticBileDucts",
            e.target.value
          )
        }
      />

      {/* =====================
          PORTAL VEIN
      ===================== */}

      <h3>

        Portal Vein

      </h3>

      <textarea
        rows={2}
        placeholder="Portal vein findings..."
        value={data.portalVein || ""}
        onChange={(e)=>
          setValue(
            "portalVein",
            e.target.value
          )
        }
      />

      {/* =====================
          HEPATIC VEINS
      ===================== */}

      <h3>

        Hepatic Veins

      </h3>

      <textarea
        rows={2}
        placeholder="Hepatic veins..."
        value={data.hepaticVeins || ""}
        onChange={(e)=>
          setValue(
            "hepaticVeins",
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
          COMMON BILE DUCT
      ===================== */}

      <h3>

        Common Bile Duct

      </h3>

      <textarea
        rows={2}
        placeholder="Common bile duct findings..."
        value={data.commonBileDuct || ""}
        onChange={(e)=>
          setValue(
            "commonBileDuct",
            e.target.value
          )
        }
      />

      {/* =====================
          ASCITES
      ===================== */}

      <h3>

        Ascites

      </h3>

      <textarea
        rows={2}
        placeholder="Ascites findings..."
        value={data.ascites || ""}
        onChange={(e)=>
          setValue(
            "ascites",
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