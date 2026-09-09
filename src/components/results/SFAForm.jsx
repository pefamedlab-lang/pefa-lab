import { useState, useEffect } from "react";

export default function SFAForm({
  resultData,
  setResultData,
}) {

  /* ======================================
      FORM STATE
  ====================================== */

  const [form, setForm] = useState({

    /* ==========================
       SPECIMEN INFORMATION
    ========================== */

    collectionDate: "",
    receivedDate: "",
    processedDate: "",
    examinedDate: "",

    patientAge: "",

    abstinenceDays: "",

    collectionMethod: "",

    sampleComplete: "",

    containerType: "",

    /* ==========================
       PHYSICAL EXAMINATION
    ========================== */

    volume: "",

    colour: "",

    appearance: "",

    ph: "",

    viscosity: "",

    liquefactionTime: "",

    fructose: "",

    /* ==========================
       SPERM ANALYSIS
    ========================== */

    spermCount: "",

    totalSpermNumber: "",

    totalMotility: "",

    progressiveMotility: "",

    nonProgressiveMotility: "",

    immotile: "",

    vitality: "",

    normalMorphology: "",

    gradeA: "",

    gradeB: "",

    gradeC: "",

    gradeD: "",

    headDefects: "",

    midpieceDefects: "",

    tailDefects: "",

    /* ==========================
       MICROSCOPY
    ========================== */

    pusCells: "",

    wbc: "",

    rbc: "",

    epithelialCells: "",

    roundCells: "",

    yeastCells: "",

    agglutination: "",

    aggregation: "",

    debris: "",

    others: "",

    /* ==========================
       FINAL REPORT
    ========================== */

    impression: "",

    scientistRemark: "",

  });

  /* ======================================
      LOAD SAVED DATA
  ====================================== */

  useEffect(() => {

    if (
      resultData &&
      Object.keys(resultData).length
    ) {

      setForm(prev => ({
        ...prev,
        ...resultData,
      }));

    }

  }, [resultData]);

/* ======================================
    DEFAULT DATE/TIME
====================================== */

useEffect(() => {

  const now = new Date()
    .toISOString()
    .slice(0, 16);

  setForm(prev => ({
    ...prev,
    receivedDate: prev.receivedDate || now,
    processedDate: prev.processedDate || now,
    examinedDate: prev.examinedDate || now,
  }));

}, []);

  /* ======================================
      UPDATE FIELD
  ====================================== */

  const updateField = (field, value) => {

    const updated = {

      ...form,

      [field]: value,

    };

    setForm(updated);

    setResultData(updated);

  };

  /* ======================================
      SAFE NUMBER
  ====================================== */

  const num = (value) => {

    const n = parseFloat(value);

    return isNaN(n) ? null : n;

  };

  /* ======================================
      NORMAL / ABNORMAL CSS
  ====================================== */

  const getInputClass = (field) => {

    switch (field) {

      case "volume":
        return num(form.volume) !== null &&
          num(form.volume) < 1.4
          ? "abnormal"
          : "";

      case "ph":
        return num(form.ph) !== null &&
          num(form.ph) < 7.2
          ? "abnormal"
          : "";

      case "spermCount":
        return num(form.spermCount) !== null &&
          num(form.spermCount) < 16
          ? "abnormal"
          : "";

      case "totalSpermNumber":
        return num(form.totalSpermNumber) !== null &&
          num(form.totalSpermNumber) < 39
          ? "abnormal"
          : "";

      case "totalMotility":
        return num(form.totalMotility) !== null &&
          num(form.totalMotility) < 42
          ? "abnormal"
          : "";

      case "progressiveMotility":
        return num(form.progressiveMotility) !== null &&
          num(form.progressiveMotility) < 30
          ? "abnormal"
          : "";

      case "normalMorphology":
        return num(form.normalMorphology) !== null &&
          num(form.normalMorphology) < 4
          ? "abnormal"
          : "";

      case "vitality":
        return num(form.vitality) !== null &&
          num(form.vitality) < 54
          ? "abnormal"
          : "";

      case "wbc":
        return num(form.wbc) !== null &&
          num(form.wbc) > 1
          ? "abnormal"
          : "";

      default:
        return "";

    }

  };

  /* ======================================
      VALIDATION
  ====================================== */

  const motilityTotal =

    (num(form.progressiveMotility) || 0) +

    (num(form.nonProgressiveMotility) || 0) +

    (num(form.immotile) || 0);

  const gradeTotal =

    (num(form.gradeA) || 0) +

    (num(form.gradeB) || 0) +

    (num(form.gradeC) || 0) +

    (num(form.gradeD) || 0);

  /* ======================================
      AUTO IMPRESSION
  ====================================== */

  useEffect(() => {

    const findings = [];

    const count = num(form.spermCount);

    const total = num(form.totalSpermNumber);

    const prog = num(form.progressiveMotility);

    const morph = num(form.normalMorphology);

    const vitality = num(form.vitality);

    const volume = num(form.volume);

    if (volume !== null && volume < 1.4) {

      findings.push("Hypospermia");

    }

    if (count === 0) {

      findings.push("Azoospermia");

    }

    else {

      if (count !== null && count < 16)

        findings.push("Oligozoospermia");

      if (total !== null && total < 39)

        findings.push("Low Total Sperm Number");

      if (prog !== null && prog < 30)

        findings.push("Asthenozoospermia");

      if (morph !== null && morph < 4)

        findings.push("Teratozoospermia");

      if (vitality !== null && vitality < 54)

        findings.push("Necrozoospermia");

    }

    if (

      count !== null &&
      count > 0 &&
      count < 16 &&
      prog !== null &&
      prog < 30 &&
      morph !== null &&
      morph < 4

    ) {

      findings.length = 0;

      findings.push(

        "Oligoasthenoteratozoospermia (OAT Syndrome)"

      );

    }

    if (findings.length === 0) {

      findings.push("Normozoospermia");

    }

    const report = findings.join(", ");

    if (report !== form.impression) {

      setForm(prev => ({

        ...prev,

        impression: report,

      }));

      setResultData(prev => ({

        ...prev,

        impression: report,

      }));

    }

  }, [

    form.volume,

    form.spermCount,

    form.totalSpermNumber,

    form.progressiveMotility,

    form.normalMorphology,

    form.vitality,

  ]);

  /* ======================================
      AUTO SCIENTIST REMARK
  ====================================== */

  useEffect(() => {

    const remarks = [];

    if (num(form.volume) < 1.4)
      remarks.push("Low semen volume.");

    if (num(form.ph) < 7.2)
      remarks.push("Acidic semen.");

    if (num(form.liquefactionTime) > 60)
      remarks.push("Delayed liquefaction.");

    if (form.viscosity === "Increased")
      remarks.push("Hyperviscosity noted.");

    if (
      form.agglutination &&
      form.agglutination !== "Absent"
    )
      remarks.push("Sperm agglutination present.");

    if (num(form.wbc) > 1)
      remarks.push(
        "Leukocytospermia present."
      );

    if (form.fructose === "Absent")
      remarks.push(
        "Absent seminal fructose."
      );

    const report = remarks.join(" ");

    if (report !== form.scientistRemark) {

      setForm(prev => ({

        ...prev,

        scientistRemark: report,

      }));

      setResultData(prev => ({

        ...prev,

        scientistRemark: report,

      }));

    }

  }, [

    form.volume,

    form.ph,

    form.liquefactionTime,

    form.viscosity,

    form.agglutination,

    form.wbc,

    form.fructose,

  ]);

  /* ======================================
      RENDER INPUT ROW
  ====================================== */

  const renderInputRows = (rows) =>

    rows.map(([label, key]) => (

      <tr key={key}>

        <td>{label}</td>

        <td>

          <input
  type={
    [
      "collectionDate",
      "receivedDate",
      "processedDate",
      "examinedDate",
    ].includes(key)
      ? "datetime-local"
      : "text"
  }
  className={getInputClass(key)}
  value={form[key]}
  onChange={(e) =>
    updateField(
      key,
      e.target.value
    )
  }
/>

        </td>

      </tr>

    ));

  /* ======================================
      RENDER SELECT ROW
  ====================================== */

  const renderSelectRows = (rows) =>

    rows.map(([label, key, options]) => (

      <tr key={key}>

        <td>{label}</td>

        <td>

          <select
            value={form[key]}
            onChange={(e) =>
              updateField(
                key,
                e.target.value
              )
            }
          >

            <option value="">
              Select
            </option>

            {options.map(option => (

              <option
                key={option}
                value={option}
              >
                {option}
              </option>

            ))}

          </select>

        </td>

      </tr>

    ));

  /* ======================================
      JSX CONTINUES IN PART 2
  ====================================== */

  return (

<div className="sfa-form">

  <h3>Seminal Fluid Analysis (SFA)</h3>

  {/* ======================================
      SPECIMEN INFORMATION
  ====================================== */}

  <h4>Specimen Information</h4>

  <table className="result-table">
    <tbody>

      {renderInputRows([
        ["Collection Date / Time", "collectionDate"],
        ["Received Date / Time", "receivedDate"],
        ["Processed Date / Time", "processedDate"],
        ["Examined Date / Time", "examinedDate"],
        ["Patient Age (Years)", "patientAge"],
        ["Days of Abstinence", "abstinenceDays"],
        ["Container Type", "containerType"],
      ])}

      {renderSelectRows([
        [
          "Method of Collection",
          "collectionMethod",
          [
            "Masturbation",
            "Coitus Interruptus",
            "Special Condom",
            "Other",
          ],
        ],

        [
          "Sample Complete",
          "sampleComplete",
          [
            "Yes",
            "No",
          ],
        ],
      ])}

    </tbody>
  </table>

  {/* ======================================
      PHYSICAL EXAMINATION
  ====================================== */}

  <h4>Physical Examination</h4>

  <table className="result-table">

    <tbody>

      {renderInputRows([
        ["Volume (mL)", "volume"],
        ["pH", "ph"],
        ["Liquefaction Time (Minutes)", "liquefactionTime"],
      ])}

      {renderSelectRows([

        [
          "Colour",
          "colour",
          [
            "Grey Opalescent",
            "Grey White",
            "Whitish",
            "Yellowish",
            "Brownish",
            "Reddish",
          ],
        ],

        [
          "Appearance",
          "appearance",
          [
            "Normal",
            "Turbid",
            "Clear",
            "Blood Stained",
          ],
        ],

        [
          "Viscosity",
          "viscosity",
          [
            "Normal",
            "Increased",
            "Highly Increased",
            "Decreased",
          ],
        ],

        [
          "Fructose",
          "fructose",
          [
            "Present",
            "Absent",
          ],
        ],

      ])}

    </tbody>

  </table>

  {/* ======================================
      SPERM ANALYSIS
  ====================================== */}

  <h4>Sperm Analysis</h4>

  <table className="result-table">

    <tbody>

      {renderInputRows([

        [
          "Sperm Concentration (million/mL)",
          "spermCount",
        ],

        [
          "Total Sperm Number (million/ejaculate)",
          "totalSpermNumber",
        ],

        [
          "Total Motility (%)",
          "totalMotility",
        ],

        [
          "Progressive Motility (%)",
          "progressiveMotility",
        ],

        [
          "Non-Progressive Motility (%)",
          "nonProgressiveMotility",
        ],

        [
          "Immotile (%)",
          "immotile",
        ],

        [
          "Vitality (%)",
          "vitality",
        ],

        [
          "Normal Morphology (%)",
          "normalMorphology",
        ],

      ])}

    </tbody>

  </table>

  {/* ======================================
      MOTILITY VALIDATION
  ====================================== */}

  <div
    className={
      motilityTotal === 100
        ? "validation-success"
        : "validation-error"
    }
  >
    <strong>
      Motility Total:
    </strong>{" "}
    {motilityTotal}%{" "}
    {motilityTotal === 100
      ? "✓"
      : "(Should equal 100%)"}
  </div>

  {/* ======================================
      SPERM GRADING
  ====================================== */}

  <h4>Sperm Motility Grade (Optional)</h4>

  <table className="result-table">

    <tbody>

      {renderInputRows([

        [
          "Grade A (%)",
          "gradeA",
        ],

        [
          "Grade B (%)",
          "gradeB",
        ],

        [
          "Grade C (%)",
          "gradeC",
        ],

        [
          "Grade D (%)",
          "gradeD",
        ],

      ])}

    </tbody>

  </table>

  <div
    className={
      gradeTotal === 100
        ? "validation-success"
        : "validation-error"
    }
  >
    <strong>
      Grade Total:
    </strong>{" "}
    {gradeTotal}%{" "}
    {gradeTotal === 100
      ? "✓"
      : "(Should equal 100%)"}
  </div>

  {/* ======================================
      MORPHOLOGY DEFECTS
  ====================================== */}

  <h4>Morphology Defects</h4>

  <table className="result-table">

    <tbody>

      {renderInputRows([

        [
          "Head Defects (%)",
          "headDefects",
        ],

        [
          "Midpiece Defects (%)",
          "midpieceDefects",
        ],

        [
          "Tail Defects (%)",
          "tailDefects",
        ],

      ])}

    </tbody>

  </table>

  {/* ======================================
      MICROSCOPY
      (Continues in Part 3)
  ====================================== */}

  <h4>Microscopy</h4>

  <table className="result-table">

    <tbody>

      {renderInputRows([
        ["Pus Cells (/HPF)", "pusCells"],
        ["WBC (×10⁶/mL)", "wbc"],
        ["Red Blood Cells", "rbc"],
        ["Epithelial Cells", "epithelialCells"],
        ["Round Cells", "roundCells"],
        ["Yeast Cells", "yeastCells"],
        ["Aggregation", "aggregation"],
        ["Debris", "debris"],
        ["Others", "others"],
      ])}

      {renderSelectRows([
        [
          "Agglutination",
          "agglutination",
          [
            "Absent",
            "Mild",
            "Moderate",
            "Marked",
          ],
        ],
      ])}

    </tbody>

  </table>

  {/* ======================================
      IMPRESSION
  ====================================== */}

  <h4>Laboratory Impression</h4>

  <textarea
    className="comment-box"
    rows={4}
    value={form.impression}
    onChange={(e) =>
      updateField(
        "impression",
        e.target.value
      )
    }
    placeholder="Automatically generated (editable)"
  />

  {/* ======================================
      SCIENTIST REMARK
  ====================================== */}

  <h4>Scientist Remark</h4>

  <textarea
    className="comment-box"
    rows={4}
    value={form.scientistRemark}
    onChange={(e) =>
      updateField(
        "scientistRemark",
        e.target.value
      )
    }
    placeholder="Automatically generated (editable)"
  />

  {/* ======================================
      WHO 2021 REFERENCE VALUES
  ====================================== */}

  <h4>WHO 2021 Lower Reference Values</h4>

  <table className="reference-table">

    <thead>

      <tr>

        <th>Parameter</th>

        <th>Reference</th>

      </tr>

    </thead>

    <tbody>

      <tr>

        <td>Volume</td>

        <td>≥ 1.4 mL</td>

      </tr>

      <tr>

        <td>Sperm Concentration</td>

        <td>≥ 16 million/mL</td>

      </tr>

      <tr>

        <td>Total Sperm Number</td>

        <td>≥ 39 million</td>

      </tr>

      <tr>

        <td>Total Motility</td>

        <td>≥ 42%</td>

      </tr>

      <tr>

        <td>Progressive Motility</td>

        <td>≥ 30%</td>

      </tr>

      <tr>

        <td>Vitality</td>

        <td>≥ 54%</td>

      </tr>

      <tr>

        <td>Normal Morphology</td>

        <td>≥ 4%</td>

      </tr>

      <tr>

        <td>pH</td>

        <td>≥ 7.2</td>

      </tr>

      <tr>

        <td>Leukocytes</td>

        <td>&lt; 1 × 10⁶/mL</td>

      </tr>

      <tr>

        <td>Liquefaction</td>

        <td>Within 60 minutes</td>

      </tr>

    </tbody>

  </table>

</div>

);

}