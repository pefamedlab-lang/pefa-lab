import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Droplets,
  Edit3,
  Loader2,
  RotateCcw,
  Save,
} from "lucide-react";
import {
  getLaboratoryResultById,
  updateLaboratoryResult,
} from "../../../services/laboratory/laboratoryResultService";

const TITRE_OPTIONS = [
  "",
  "1:20",
  "1:40",
  "1:80",
  "1:160",
  "1:320",
  "1:640",
  "1:1280",
];

const DEFAULT_SIGNIFICANT_TITRE = 80;

const ANTIGENS = [
  {
    key: "salmonella_typhi_o",
    organism: "Salmonella Typhi",
    antigen: "O",
    shortName: "Typhi O",
  },
  {
    key: "salmonella_typhi_h",
    organism: "Salmonella Typhi",
    antigen: "H",
    shortName: "Typhi H",
  },
  {
    key: "salmonella_paratyphi_a_o",
    organism: "Salmonella Paratyphi A",
    antigen: "O",
    shortName: "Paratyphi A O",
  },
  {
    key: "salmonella_paratyphi_a_h",
    organism: "Salmonella Paratyphi A",
    antigen: "H",
    shortName: "Paratyphi A H",
  },
  {
    key: "salmonella_paratyphi_b_o",
    organism: "Salmonella Paratyphi B",
    antigen: "O",
    shortName: "Paratyphi B O",
  },
  {
    key: "salmonella_paratyphi_b_h",
    organism: "Salmonella Paratyphi B",
    antigen: "H",
    shortName: "Paratyphi B H",
  },
  {
    key: "salmonella_paratyphi_c_o",
    organism: "Salmonella Paratyphi C",
    antigen: "O",
    shortName: "Paratyphi C O",
  },
  {
    key: "salmonella_paratyphi_c_h",
    organism: "Salmonella Paratyphi C",
    antigen: "H",
    shortName: "Paratyphi C H",
  },
];

const MP_METHOD_OPTIONS = ["Microscopy", "RDT"];
const MP_RDT_RESULT_OPTIONS = ["", "Positive", "Negative", "Invalid"];

const EMPTY_RESULTS = Object.fromEntries(
  ANTIGENS.map((a) => [a.key, ""])
);

const EMPTY_MP = {
  method: "Microscopy",
  parasite_seen: "",
  parasite_form: "",
  species: "",
  density: "",
  parasite_count: "",
  result: "",
  interpretation: "",
  impression: "",
  remark: "",
};

const text = (v) => String(v ?? "").trim();

const lower = (v) => text(v).toLowerCase();

const parseObject = (v) => {
  if (v && typeof v === "object" && !Array.isArray(v)) return v;

  if (typeof v === "string") {
    try {
      const p = JSON.parse(v);
      return p && typeof p === "object" && !Array.isArray(p) ? p : {};
    } catch {
      return {};
    }
  }

  return {};
};

const normalizeMPMethod = (value) => {
  const v = lower(value);

  if (
    v === "rdt" ||
    v.includes("rapid diagnostic") ||
    v.includes("rapid test") ||
    v.includes("malaria rdt")
  ) {
    return "RDT";
  }

  return "Microscopy";
};

const titreNumber = (v) => {
  const value = text(v);

  if (!value) return 0;

  const ratio = value.match(
    /(?:1\s*[:\/]\s*)(\d+(?:\.\d+)?)/i
  );

  if (ratio) return Number(ratio[1]) || 0;

  const numeric = value.match(/\d+(?:\.\d+)?/);

  return numeric ? Number(numeric[0]) || 0 : 0;
};

const thresholdNumber = (v) => {
  const n = Number(
    String(v ?? "").replace(/[^0-9.]/g, "")
  );

  return Number.isFinite(n) && n > 0
    ? n
    : DEFAULT_SIGNIFICANT_TITRE;
};

const titreStatus = (titre, threshold) => {
  const n = titreNumber(titre);

  if (!n) return "Pending";

  return n >= thresholdNumber(threshold)
    ? "Significant"
    : "Low titre";
};

const titreClass = (status) =>
  status === "Significant"
    ? "positive"
    : status === "Low titre"
    ? "negative"
    : "pending";

const normalizeForm = (record) => {
  const data = parseObject(
    record?.result_data ??
      record?.result_json ??
      record?.structured_result ??
      record?.result
  );

  const malariaSource =
    data.malariaParasite ??
    data.malaria_parasite ??
    data.mp;

  const mp = parseObject(malariaSource);

  const normalizedMP = {
    ...EMPTY_MP,
    ...mp,
    method: normalizeMPMethod(
      mp.method ??
        mp.test_method ??
        mp.testMethod ??
        (mp.rdt_result ? "RDT" : "Microscopy")
    ),
  };

  /*
   * Legacy MP records without an explicit method are treated as
   * microscopy because the original Widal form was microscopy-based.
   */
  if (
    normalizedMP.method === "RDT" &&
    !text(normalizedMP.result) &&
    text(mp.rdt_result)
  ) {
    normalizedMP.result = text(mp.rdt_result);
  }

  return {
    patientName:
      data.patientName ||
      record?.patient_name ||
      record?.full_name ||
      "",
    labNumber:
      data.labNumber ||
      record?.lab_number ||
      "",
    patientId:
      data.patientId ||
      record?.patient_id ||
      "",
    sex:
      data.sex ||
      record?.sex ||
      "",
    age:
      data.age ??
      record?.age ??
      "",
    collectionDate:
      data.collectionDate ||
      record?.collection_date ||
      "",
    significantTitre: thresholdNumber(
      data.significantTitre ??
        DEFAULT_SIGNIFICANT_TITRE
    ),
    results: {
      ...EMPTY_RESULTS,
      ...(data.results || {}),
    },
    comment:
      data.comment ||
      "",
    malariaParasite: normalizedMP,
  };
};

const buildMP = (mp) => {
  const out = {
    ...EMPTY_MP,
    ...(mp || {}),
    method: normalizeMPMethod(
      mp?.method
    ),
  };

  /*
   * RDT MODE
   *
   * RDT uses a simple qualitative result:
   * Positive / Negative / Invalid.
   *
   * Microscopy-only fields are cleared so the two methods
   * cannot contaminate each other's saved payload.
   */
  if (out.method === "RDT") {
    out.parasite_seen = "";
    out.parasite_form = "";
    out.species = "";
    out.density = "";
    out.parasite_count = "";

    const rdtResult = text(out.result);

    if (rdtResult === "Positive") {
      out.interpretation =
        "Malaria parasite antigen detected by rapid diagnostic test.";
      out.impression =
        "Positive malaria parasite RDT.";
    } else if (rdtResult === "Negative") {
      out.interpretation =
        "Malaria parasite antigen not detected by rapid diagnostic test.";
      out.impression =
        "Negative malaria parasite RDT.";
    } else if (rdtResult === "Invalid") {
      out.interpretation =
        "Malaria parasite RDT is invalid and should be repeated according to the laboratory procedure.";
      out.impression =
        "Invalid malaria parasite RDT.";
    } else {
      out.interpretation = "";
      out.impression = "";
    }

    return out;
  }

  /*
   * MICROSCOPY MODE
   */
  if (out.parasite_seen === "No") {
    out.parasite_form = "";
    out.species = "";
    out.density = "";
    out.parasite_count = "";

    out.result = "No malaria parasite seen.";
    out.interpretation =
      "Negative for malaria parasite.";
    out.impression =
      "No malaria parasite detected.";
  } else if (
    out.parasite_seen === "Yes" &&
    out.parasite_form &&
    out.species &&
    out.density
  ) {
    out.result =
      `${out.parasite_form} forms of ${out.species} seen (${out.density}).` +
      `${
        out.parasite_count
          ? ` Estimated parasite count: ${out.parasite_count} parasites/µL.`
          : ""
      }`;

    out.interpretation =
      "Malaria parasite identified on microscopy.";

    out.impression =
      "Malaria parasite detected on microscopy.";
  } else if (!out.parasite_seen) {
    out.result = "";
    out.interpretation = "";
    out.impression = "";
  }

  return out;
};

export default function WidalResultEntry({
  resultId = null,
  result = null,
  onSaved,
  onCancel,
}) {
  const resolvedResultId = useMemo(() => {
    if (
      resultId !== null &&
      resultId !== undefined &&
      Number(resultId)
    ) {
      return Number(resultId);
    }

    if (result?.id) {
      return Number(result.id);
    }

    if (typeof window !== "undefined") {
      const q = new URLSearchParams(
        window.location.search
      );

      return (
        Number(
          q.get("result_id") ||
            q.get("resultId") ||
            q.get("id")
        ) || null
      );
    }

    return null;
  }, [resultId, result]);

  const [record, setRecord] =
    useState(result || null);

  const [form, setForm] =
    useState(() =>
      normalizeForm(result)
    );

  const [loading, setLoading] =
    useState(
      Boolean(
        resolvedResultId &&
          !result
      )
    );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    let mounted = true;

    if (!resolvedResultId) {
      setLoading(false);

      return () => {
        mounted = false;
      };
    }

    if (
      result?.id &&
      Number(result.id) ===
        resolvedResultId
    ) {
      setRecord(result);
      setForm(
        normalizeForm(result)
      );
      setLoading(false);

      return () => {
        mounted = false;
      };
    }

    setLoading(true);

    getLaboratoryResultById(
      resolvedResultId
    )
      .then((loaded) => {
        if (!mounted) return;

        if (!loaded) {
          throw new Error(
            "The Widal laboratory result could not be found."
          );
        }

        setRecord(loaded);
        setForm(
          normalizeForm(loaded)
        );
      })
      .catch((e) => {
        if (mounted) {
          setError(
            e?.message ||
              "Unable to load Widal result."
          );
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [resolvedResultId, result]);

  const statuses = useMemo(
    () =>
      ANTIGENS.map((a) => ({
        ...a,
        titre:
          form.results?.[a.key] || "",
        status: titreStatus(
          form.results?.[a.key],
          form.significantTitre
        ),
      })),
    [
      form.results,
      form.significantTitre,
    ]
  );

  const entered = statuses.filter(
    (x) => text(x.titre)
  );

  const significant =
    statuses.filter(
      (x) =>
        x.status ===
        "Significant"
    );

  const allEntered =
    entered.length ===
    ANTIGENS.length;

  const mp =
    form.malariaParasite ||
    EMPTY_MP;

  const mpMethod =
    normalizeMPMethod(
      mp.method
    );

  const mpEntered =
    Boolean(
      mp.parasite_seen ||
        mp.result ||
        mp.parasite_form ||
        mp.species ||
        mp.density ||
        mp.parasite_count
    );

  const automaticInterpretation =
    useMemo(() => {
      if (!entered.length) {
        return "Pending — enter the Widal titres.";
      }

      if (significant.length) {
        return `Significant agglutination titre(s) detected: ${significant
          .map(
            (x) =>
              `${x.shortName} (${x.titre})`
          )
          .join(
            ", "
          )}. Correlate with the clinical presentation, local baseline titres and the laboratory-approved reporting criteria.`;
      }

      if (allEntered) {
        return `No Widal titre has reached the configured significant titre threshold of 1:${thresholdNumber(
          form.significantTitre
        )}. Correlate with clinical findings and the laboratory-approved reference criteria.`;
      }

      return "Partial Widal result — complete the remaining antigen titres.";
    }, [
      entered.length,
      significant,
      allEntered,
      form.significantTitre,
    ]);

  const update = (
    field,
    value
  ) => {
    setForm((f) => ({
      ...f,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  const updateAntigen = (
    key,
    value
  ) => {
    update(
      "results",
      {
        ...form.results,
        [key]: value,
      }
    );
  };

  const updateMP = (
    field,
    value
  ) => {
    setForm((f) => ({
      ...f,
      malariaParasite:
        buildMP({
          ...f.malariaParasite,
          [field]: value,
        }),
    }));

    setError("");
    setSuccess("");
  };

  const handleSave = async (
    event
  ) => {
    event?.preventDefault();

    if (!resolvedResultId) {
      setError(
        "No laboratory result record is attached to this Widal entry."
      );
      return;
    }

    if (!entered.length) {
      setError(
        "Please enter at least one Widal titre before saving."
      );
      return;
    }

    if (saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const finalMP =
        buildMP(
          form.malariaParasite
        );

      const structuredResult = {
        testType:
          "Widal",

        method:
          "Slide / Tube Agglutination",

        patientName:
          form.patientName,

        labNumber:
          form.labNumber,

        patientId:
          form.patientId,

        sex:
          form.sex,

        age:
          form.age,

        collectionDate:
          form.collectionDate,

        significantTitre:
          thresholdNumber(
            form.significantTitre
          ),

        results: {
          ...EMPTY_RESULTS,
          ...form.results,
        },

        interpretation:
          automaticInterpretation,

        comment:
          form.comment || "",

        ...(mpEntered
          ? {
              malariaParasite:
                finalMP,
            }
          : {}),
      };

      const saved =
        await updateLaboratoryResult(
          resolvedResultId,
          {
            /*
             * laboratory_results does not have a result_data
             * column in this schema. Keep the complete structured
             * Widal payload inside the existing TEXT `result` column.
             */
            result:
              JSON.stringify(
                structuredResult
              ),

            result_status:
              allEntered
                ? "Performed"
                : "Pending",
          }
        );

      setRecord(
        saved || {
          ...(record || {}),
          id: resolvedResultId,
          result:
            JSON.stringify(
              structuredResult
            ),
        }
      );

      setSuccess(
        "Widal result saved successfully."
      );

      if (
        typeof onSaved ===
        "function"
      ) {
        onSaved(
          saved || record
        );
      }
    } catch (e) {
      console.error(
        "WidalResultEntry: save failed",
        e
      );

      setError(
        e?.message ||
          "Unable to save Widal result."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <style>
          {STYLES}
        </style>

        <div className="widal-result-entry">
          <div className="widal-loading">
            <Loader2 className="spin" />
            Loading Widal result...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>
        {STYLES}
      </style>

      <div className="widal-result-entry">
        <header className="widal-header">
          <div>
            <div className="eyebrow">
              PEFA LABORATORY •
              SEROLOGY
            </div>

            <h1>
              Widal Test Result Entry
            </h1>

            <p>
              Structured Widal
              agglutination result
              entry
            </p>
          </div>

          {resolvedResultId ? (
            <span className="edit-badge">
              <Edit3 size={14} />
              EDIT MODE
            </span>
          ) : null}
        </header>

        {error && (
          <div className="message error">
            <AlertCircle
              size={17}
            />
            {error}
          </div>
        )}

        {success && (
          <div className="message success">
            <CheckCircle2
              size={17}
            />
            {success}
          </div>
        )}

        <div className="patient-card">
          <div>
            <span>
              Patient
            </span>
            <strong>
              {form.patientName ||
                "—"}
            </strong>
          </div>

          <div>
            <span>
              Lab Number
            </span>
            <strong>
              {form.labNumber ||
                "—"}
            </strong>
          </div>

          <div>
            <span>
              Patient ID
            </span>
            <strong>
              {form.patientId ||
                "—"}
            </strong>
          </div>

          <div>
            <span>
              Age / Sex
            </span>
            <strong>
              {form.age || "—"} /{" "}
              {form.sex || "—"}
            </strong>
          </div>
        </div>

        <form
          onSubmit={
            handleSave
          }
        >
          <section className="card">
            <div className="card-head">
              <h2>
                <Droplets
                  size={17}
                />
                Widal Agglutination
                Results
              </h2>

              <span>
                {entered.length}/
                {ANTIGENS.length}{" "}
                entered
              </span>
            </div>

            <div className="card-body">
              <div className="controls">
                <label>
                  Collection Date

                  <input
                    type="date"
                    value={
                      form.collectionDate ||
                      ""
                    }
                    onChange={(e) =>
                      update(
                        "collectionDate",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Significant Titre

                  <select
                    value={
                      form.significantTitre
                    }
                    onChange={(e) =>
                      update(
                        "significantTitre",
                        thresholdNumber(
                          e.target.value
                        )
                      )
                    }
                  >
                    {[
                      20,
                      40,
                      80,
                      160,
                      320,
                      640,
                      1280,
                    ].map(
                      (n) => (
                        <option
                          key={n}
                          value={n}
                        >
                          1:{n}
                        </option>
                      )
                    )}
                  </select>
                </label>
              </div>

              <table className="widal-table">
                <thead>
                  <tr>
                    <th>
                      Organism
                    </th>
                    <th>O</th>
                    <th>
                      O Flag
                    </th>
                    <th>H</th>
                    <th>
                      H Flag
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {[
                    "Salmonella Typhi",
                    "Salmonella Paratyphi A",
                    "Salmonella Paratyphi B",
                    "Salmonella Paratyphi C",
                  ].map(
                    (organism) => {
                      const o =
                        statuses.find(
                          (x) =>
                            x.organism ===
                              organism &&
                            x.antigen ===
                              "O"
                        );

                      const h =
                        statuses.find(
                          (x) =>
                            x.organism ===
                              organism &&
                            x.antigen ===
                              "H"
                        );

                      return (
                        <tr
                          key={
                            organism
                          }
                        >
                          <td>
                            <strong>
                              {
                                organism
                              }
                            </strong>
                          </td>

                          {[o, h].map(
                            (
                              item,
                              i
                            ) => (
                              <React.Fragment
                                key={
                                  item.key
                                }
                              >
                                <td>
                                  <select
                                    value={
                                      item.titre
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      updateAntigen(
                                        item.key,
                                        e
                                          .target
                                          .value
                                      )
                                    }
                                  >
                                    {TITRE_OPTIONS.map(
                                      (
                                        t
                                      ) => (
                                        <option
                                          key={
                                            t
                                          }
                                          value={
                                            t
                                          }
                                        >
                                          {t ||
                                            "Select titre"}
                                        </option>
                                      )
                                    )}
                                  </select>
                                </td>

                                <td>
                                  <span
                                    className={`badge ${titreClass(
                                      item.status
                                    )}`}
                                  >
                                    {item.status ===
                                    "Significant"
                                      ? "SIGNIFICANT"
                                      : item.status ===
                                        "Low titre"
                                      ? "LOW TITRE"
                                      : "PENDING"}
                                  </span>
                                </td>
                              </React.Fragment>
                            )
                          )}
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ==================================================
              MALARIA PARASITE — SAME TABLE, METHOD SELECTABLE
              ================================================== */}

          <section className="card">
            <div className="card-head">
              <h2>
                Optional Malaria
                Parasite (MP)
              </h2>

              <span>
                Select Microscopy or
                RDT
              </span>
            </div>

            <div className="card-body">
              <table className="mp-table">
                <thead>
                  <tr>
                    <th>
                      Parameter
                    </th>
                    <th>
                      Result
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {/* METHOD */}
                  <tr>
                    <td>
                      <strong>
                        Examination Method
                      </strong>
                    </td>

                    <td>
                      <select
                        value={
                          mpMethod
                        }
                        onChange={(
                          e
                        ) =>
                          updateMP(
                            "method",
                            e.target.value
                          )
                        }
                      >
                        {MP_METHOD_OPTIONS.map(
                          (
                            option
                          ) => (
                            <option
                              key={
                                option
                              }
                              value={
                                option
                              }
                            >
                              {option}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                  </tr>

                  {mpMethod ===
                  "RDT" ? (
                    <>
                      <tr>
                        <td>
                          <strong>
                            Malaria
                            Parasite
                            (RDT)
                          </strong>
                        </td>

                        <td>
                          <select
                            value={
                              mp.result ||
                              ""
                            }
                            onChange={(
                              e
                            ) =>
                              updateMP(
                                "result",
                                e.target
                                  .value
                              )
                            }
                          >
                            {MP_RDT_RESULT_OPTIONS.map(
                              (
                                option
                              ) => (
                                <option
                                  key={
                                    option
                                  }
                                  value={
                                    option
                                  }
                                >
                                  {option ||
                                    "Select result"}
                                </option>
                              )
                            )}
                          </select>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <strong>
                            Interpretation
                          </strong>
                        </td>

                        <td>
                          <div className="mp-readonly">
                            {mp.interpretation ||
                              "Awaiting RDT result."}
                          </div>
                        </td>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr>
                        <td>
                          <strong>
                            Parasite
                            Seen
                          </strong>
                        </td>

                        <td>
                          <select
                            value={
                              mp.parasite_seen ||
                              ""
                            }
                            onChange={(
                              e
                            ) =>
                              updateMP(
                                "parasite_seen",
                                e.target
                                  .value
                              )
                            }
                          >
                            <option value="">
                              Select
                            </option>
                            <option value="No">
                              No
                            </option>
                            <option value="Yes">
                              Yes
                            </option>
                          </select>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <strong>
                            Parasite
                            Form
                          </strong>
                        </td>

                        <td>
                          <select
                            value={
                              mp.parasite_form ||
                              ""
                            }
                            disabled={
                              mp.parasite_seen !==
                              "Yes"
                            }
                            onChange={(
                              e
                            ) =>
                              updateMP(
                                "parasite_form",
                                e.target
                                  .value
                              )
                            }
                          >
                            <option value="">
                              Select
                            </option>
                            <option>
                              Ring
                            </option>
                            <option>
                              Trophozoite
                            </option>
                            <option>
                              Schizont
                            </option>
                            <option>
                              Gametocyte
                            </option>
                          </select>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <strong>
                            Species
                          </strong>
                        </td>

                        <td>
                          <select
                            value={
                              mp.species ||
                              ""
                            }
                            disabled={
                              mp.parasite_seen !==
                              "Yes"
                            }
                            onChange={(
                              e
                            ) =>
                              updateMP(
                                "species",
                                e.target
                                  .value
                              )
                            }
                          >
                            <option value="">
                              Select
                            </option>
                            <option>
                              Plasmodium
                              falciparum
                            </option>
                            <option>
                              Plasmodium
                              vivax
                            </option>
                            <option>
                              Plasmodium
                              malariae
                            </option>
                            <option>
                              Plasmodium
                              ovale
                            </option>
                            <option>
                              Plasmodium
                              knowlesi
                            </option>
                            <option>
                              Mixed
                              Infection
                            </option>
                            <option>
                              Plasmodium
                              species
                            </option>
                          </select>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <strong>
                            Density
                          </strong>
                        </td>

                        <td>
                          <select
                            value={
                              mp.density ||
                              ""
                            }
                            disabled={
                              mp.parasite_seen !==
                              "Yes"
                            }
                            onChange={(
                              e
                            ) =>
                              updateMP(
                                "density",
                                e.target
                                  .value
                              )
                            }
                          >
                            <option value="">
                              Select
                            </option>
                            <option>
                              +
                            </option>
                            <option>
                              ++
                            </option>
                            <option>
                              +++
                            </option>
                            <option>
                              ++++
                            </option>
                          </select>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <strong>
                            Parasite Count
                            (optional)
                          </strong>
                        </td>

                        <td>
                          <input
                            value={
                              mp.parasite_count ||
                              ""
                            }
                            disabled={
                              mp.parasite_seen !==
                              "Yes"
                            }
                            onChange={(
                              e
                            ) =>
                              updateMP(
                                "parasite_count",
                                e.target
                                  .value
                              )
                            }
                            placeholder="parasites/µL"
                          />
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <strong>
                            Microscopy
                            Result
                          </strong>
                        </td>

                        <td>
                          <div className="mp-readonly">
                            {mp.result ||
                              "Incomplete microscopy entry"}
                          </div>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>

              {mpEntered && (
                <div className="mp-summary">
                  <strong>
                    MP Method:
                  </strong>{" "}
                  {mpMethod}
                  {"  "}
                  <strong>
                    Result:
                  </strong>{" "}
                  {mp.result ||
                    "Incomplete MP entry"}
                </div>
              )}
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <h2>
                Interpretation
              </h2>
            </div>

            <div className="card-body">
              <div className="interpretation">
                <strong>
                  Automatic
                  Interpretation
                </strong>

                <p>
                  {
                    automaticInterpretation
                  }
                </p>
              </div>

              <label className="comment">
                Laboratory Comment

                <textarea
                  value={
                    form.comment
                  }
                  onChange={(e) =>
                    update(
                      "comment",
                      e.target
                        .value
                    )
                  }
                  placeholder="Enter additional laboratory comment..."
                />
              </label>
            </div>
          </section>

          <section className="actions">
            <button
              type="button"
              onClick={() => {
                if (onCancel) {
                  onCancel();
                } else {
                  setForm(
                    normalizeForm(
                      record
                    )
                  );
                }
              }}
              disabled={saving}
            >
              <RotateCcw
                size={16}
              />
              Reset
            </button>

            <button
              type="submit"
              className="primary"
              disabled={
                saving ||
                !resolvedResultId ||
                !entered.length
              }
            >
              {saving ? (
                <Loader2
                  className="spin"
                  size={16}
                />
              ) : (
                <Save size={16} />
              )}

              {saving
                ? "Saving..."
                : "Save Widal Result"}
            </button>
          </section>
        </form>
      </div>
    </>
  );
}

const STYLES = `
.widal-result-entry{
  width:100%;
  min-height:100%;
  box-sizing:border-box;
  padding:24px;
  background:linear-gradient(180deg,#f8fafc,#f1f5f9);
  color:#172033;
  font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif
}

.widal-result-entry *{
  box-sizing:border-box
}

.widal-header{
  max-width:1200px;
  margin:0 auto 16px;
  padding:20px 22px;
  background:#fff;
  border:1px solid #dbe3ec;
  border-radius:14px;
  display:flex;
  justify-content:space-between;
  gap:18px;
  align-items:flex-start
}

.eyebrow{
  font-size:11px;
  font-weight:800;
  letter-spacing:.12em;
  color:#64748b
}

.widal-header h1{
  margin:5px 0 4px;
  font-size:25px;
  color:#0f172a
}

.widal-header p{
  margin:0;
  color:#64748b;
  font-size:13px
}

.edit-badge{
  display:flex;
  align-items:center;
  gap:6px;
  padding:7px 10px;
  border-radius:999px;
  background:#ecfeff;
  color:#0f766e;
  font-size:11px;
  font-weight:800
}

.message{
  max-width:1200px;
  margin:0 auto 12px;
  padding:11px 14px;
  border-radius:10px;
  display:flex;
  gap:8px;
  align-items:center;
  font-size:13px;
  font-weight:700
}

.error{
  background:#fef2f2;
  color:#b91c1c;
  border:1px solid #fecaca
}

.success{
  background:#f0fdf4;
  color:#15803d;
  border:1px solid #bbf7d0
}

.patient-card{
  max-width:1200px;
  margin:0 auto 14px;
  padding:14px 18px;
  background:#fff;
  border:1px solid #dbe3ec;
  border-radius:12px;
  display:grid;
  grid-template-columns:2fr 1fr 1fr 1fr;
  gap:12px
}

.patient-card span{
  display:block;
  color:#64748b;
  font-size:10px;
  text-transform:uppercase;
  letter-spacing:.06em
}

.patient-card strong{
  display:block;
  margin-top:3px;
  font-size:13px
}

.card{
  max-width:1200px;
  margin:0 auto 14px;
  background:#fff;
  border:1px solid #dbe3ec;
  border-radius:12px;
  overflow:hidden
}

.card-head{
  padding:13px 16px;
  background:#f8fafc;
  border-bottom:1px solid #e2e8f0;
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:10px
}

.card-head h2{
  margin:0;
  display:flex;
  align-items:center;
  gap:8px;
  font-size:14px;
  color:#0f172a
}

.card-head span{
  font-size:11px;
  color:#64748b
}

.card-body{
  padding:16px
}

.controls{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:12px;
  margin-bottom:14px
}

.controls label,
.mp-table td:first-child,
.comment{
  font-size:11px;
  font-weight:800;
  color:#334155
}

.controls input,
.controls select,
.mp-table input,
.mp-table select,
.comment textarea{
  display:block;
  width:100%;
  margin-top:5px;
  border:1px solid #cbd5e1;
  border-radius:8px;
  background:#fff;
  padding:9px 10px;
  font:inherit;
  font-weight:500;
  color:#0f172a
}

.widal-table,
.mp-table{
  width:100%;
  border-collapse:collapse
}

.widal-table th,
.mp-table th{
  background:#f1f5f9;
  color:#334155;
  font-size:11px;
  text-align:left;
  padding:9px
}

.widal-table td,
.mp-table td{
  border-top:1px solid #e2e8f0;
  padding:9px;
  font-size:12px;
  vertical-align:middle
}

.widal-table select{
  width:100%;
  min-width:110px;
  border:1px solid #cbd5e1;
  border-radius:7px;
  padding:7px;
  background:#fff
}

.mp-table{
  table-layout:fixed
}

.mp-table th:first-child,
.mp-table td:first-child{
  width:38%
}

.mp-table th:last-child,
.mp-table td:last-child{
  width:62%
}

.mp-table select,
.mp-table input{
  margin-top:0;
  padding:8px 9px
}

.mp-table select:disabled,
.mp-table input:disabled{
  background:#f8fafc;
  color:#94a3b8;
  cursor:not-allowed
}

.mp-readonly{
  min-height:37px;
  display:flex;
  align-items:center;
  padding:8px 10px;
  border:1px solid #e2e8f0;
  border-radius:8px;
  background:#f8fafc;
  color:#475569;
  font-size:12px;
  line-height:1.4
}

.badge{
  display:inline-flex;
  padding:5px 8px;
  border-radius:999px;
  font-size:9px;
  font-weight:900;
  white-space:nowrap
}

.badge.positive{
  background:#dcfce7;
  color:#166534
}

.badge.negative{
  background:#fef3c7;
  color:#92400e
}

.badge.pending{
  background:#f1f5f9;
  color:#64748b
}

.mp-summary{
  margin-top:10px;
  padding:10px 12px;
  border-radius:8px;
  background:#f8fafc;
  border:1px solid #e2e8f0;
  font-size:12px;
  color:#475569
}

.interpretation{
  padding:12px;
  border:1px solid #dbe3ec;
  border-radius:9px;
  background:#f8fafc;
  margin-bottom:12px
}

.interpretation strong{
  font-size:11px;
  text-transform:uppercase;
  color:#334155
}

.interpretation p{
  margin:6px 0 0;
  font-size:13px;
  line-height:1.55
}

.comment textarea{
  min-height:80px;
  resize:vertical
}

.actions{
  max-width:1200px;
  margin:0 auto;
  display:flex;
  justify-content:flex-end;
  gap:9px
}

.actions button{
  border:0;
  border-radius:8px;
  padding:10px 15px;
  display:flex;
  align-items:center;
  gap:7px;
  font-weight:800;
  cursor:pointer;
  background:#e2e8f0;
  color:#334155
}

.actions .primary{
  background:#0f766e;
  color:#fff
}

.actions button:disabled{
  opacity:.5;
  cursor:not-allowed
}

.widal-loading{
  max-width:1200px;
  margin:30px auto;
  padding:40px;
  text-align:center;
  background:#fff;
  border:1px solid #dbe3ec;
  border-radius:12px;
  color:#64748b
}

.spin{
  animation:spin 1s linear infinite
}

@keyframes spin{
  to{transform:rotate(360deg)}
}

@media(max-width:850px){
  .patient-card,
  .controls{
    grid-template-columns:1fr
  }

  .widal-header{
    flex-direction:column
  }

  .widal-table,
  .mp-table{
    min-width:620px
  }

  .card-body{
    overflow-x:auto
  }
}
`;

export {
  TITRE_OPTIONS,
  ANTIGENS,
  MP_METHOD_OPTIONS,
  MP_RDT_RESULT_OPTIONS,
  buildMP,
  normalizeForm,
};
