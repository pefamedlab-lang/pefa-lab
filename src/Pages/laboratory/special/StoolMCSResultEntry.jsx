/* ==========================================================
   PEFA LAB
   STOOL MCS RESULT ENTRY
   ----------------------------------------------------------
   PATH:
   src/pages/laboratory/special/StoolMCSResultEntry.jsx

   PURPOSE:
   - Structured Stool Microscopy, Culture & Sensitivity
     result-entry component.
   - Supports NEW RESULT and EDIT RESULT modes.
   - Existing laboratory result is loaded by resultId.
   - Existing laboratory result is updated through
     laboratoryResultService.
   - Existing database payload structure is preserved.
   - Styling is completely contained inside this JSX file.

   WORKFLOW:

      SPECIMEN
          ↓
      MACROSCOPY
          ↓
      MICROSCOPY
          ↓
      CULTURE
          ↓
      ORGANISM IDENTIFICATION
          ↓
      ANTIMICROBIAL SUSCEPTIBILITY
          ↓
      INTERPRETATION
          ↓
      SAVE / UPDATE

   IMPORTANT:
   - This component does NOT create a new database record.
   - It updates the laboratory result record supplied by
     resultId through updateLaboratoryResult().
   ========================================================== */

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  FlaskConical,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";

import {
  getLaboratoryResultById,
  updateLaboratoryResult,
} from "../../../services/laboratory/laboratoryResultService";

/* ==========================================================
   CONSTANTS
   ========================================================== */

const CULTURE_OPTIONS = [
  "",
  "No Growth",
  "Growth",
  "Mixed Growth",
  "Contaminated",
  "Pending",
];

const GRAM_STAIN_OPTIONS = [
  "",
  "Not Done",
  "No Organism Seen",
  "Gram Positive Cocci",
  "Gram Positive Bacilli",
  "Gram Negative Cocci",
  "Gram Negative Bacilli",
  "Mixed Gram Positive and Gram Negative Organisms",
  "Yeast Cells",
];

const CONSISTENCY_OPTIONS = [
  "",
  "Formed",
  "Semi-formed",
  "Soft",
  "Loose",
  "Watery",
];

const COLOUR_OPTIONS = [
  "",
  "Brown",
  "Yellow",
  "Green",
  "Black",
  "Red",
  "Pale",
  "Other",
];

const BLOOD_OPTIONS = [
  "",
  "Absent",
  "Present",
];

const MUCUS_OPTIONS = [
  "",
  "Absent",
  "Present",
];

const OCCULT_BLOOD_OPTIONS = [
  "",
  "Negative",
  "Positive",
];

const PUS_CELL_OPTIONS = [
  "",
  "None Seen",
  "Few",
  "Moderate",
  "Many",
];

const RBC_OPTIONS = [
  "",
  "None Seen",
  "Few",
  "Moderate",
  "Many",
];

const EPITHELIAL_OPTIONS = [
  "",
  "None Seen",
  "Few",
  "Moderate",
  "Many",
];

const YEAST_OPTIONS = [
  "",
  "None Seen",
  "Few",
  "Moderate",
  "Many",
];

const PARASITE_OPTIONS = [
  "",
  "None Seen",
  "Present",
];

const ORGANISM_OPTIONS = [
  "Escherichia coli",
  "Shigella species",
  "Salmonella species",
  "Salmonella Typhi",
  "Salmonella Paratyphi",
  "Campylobacter species",
  "Vibrio cholerae",
  "Vibrio species",
  "Yersinia enterocolitica",
  "Aeromonas species",
  "Plesiomonas species",
  "Staphylococcus aureus",
  "Candida species",
  "Other",
];

const COMMON_ANTIBIOTICS = [
  "Amikacin",
  "Amoxicillin",
  "Amoxicillin/Clavulanate",
  "Ampicillin",
  "Azithromycin",
  "Cefepime",
  "Cefixime",
  "Cefotaxime",
  "Ceftazidime",
  "Ceftriaxone",
  "Cefuroxime",
  "Ciprofloxacin",
  "Clindamycin",
  "Gentamicin",
  "Imipenem",
  "Levofloxacin",
  "Meropenem",
  "Metronidazole",
  "Nalidixic Acid",
  "Nitrofurantoin",
  "Piperacillin/Tazobactam",
  "Tetracycline",
  "Trimethoprim/Sulfamethoxazole",
  "Vancomycin",
];

const SUSCEPTIBILITY_OPTIONS = [
  "",
  "S",
  "I",
  "R",
];

/* ==========================================================
   HELPERS
   ========================================================== */

const createId = (prefix = "row") =>
  `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;

const createAntibioticRow = () => ({
  id: createId("antibiotic"),
  antibiotic: "",
  result: "",
});

const createOrganismRow = () => ({
  id: createId("organism"),
  organism: "",
  identification: "",
  comment: "",
  antibiotics: [
    createAntibioticRow(),
  ],
});

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const getQueryValue = (
  searchParams,
  keys = []
) => {
  for (const key of keys) {
    const value = searchParams.get(key);

    if (
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return "";
};

const resolveResultId = (resultId) => {
  if (
    resultId !== null &&
    resultId !== undefined &&
    resultId !== ""
  ) {
    return Number(resultId) || null;
  }

  if (
    typeof window !== "undefined"
  ) {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const value = getQueryValue(
      params,
      [
        "result_id",
        "resultId",
        "id",
      ]
    );

    return value
      ? Number(value) || null
      : null;
  }

  return null;
};

/* ==========================================================
   DEFAULT RESULT STRUCTURE
   ========================================================== */

const createInitialMacroscopy = () => ({
  colour: "",
  consistency: "",
  blood: "",
  mucus: "",
  visibleParasites: "",
});

const createInitialMicroscopy = () => ({
  pusCells: "",
  redBloodCells: "",
  epithelialCells: "",
  yeastCells: "",
  ova: "",
  cysts: "",
  trophozoites: "",
  parasites: "",
  microscopyComment: "",
});

const createInitialForm = (
  result = null
) => {
  const metadata =
    result?.result_data ||
    result?.result_json ||
    result?.structured_result ||
    null;

  if (
    metadata &&
    typeof metadata === "object" &&
    !Array.isArray(metadata)
  ) {
    return {
      patientName:
        metadata.patientName ||
        result?.patient_name ||
        result?.full_name ||
        "",

      labNumber:
        metadata.labNumber ||
        result?.lab_number ||
        "",

      patientId:
        metadata.patientId ||
        result?.patient_id ||
        "",

      registrationNumber:
        metadata.registrationNumber ||
        result?.registration_number ||
        "",

      sex:
        metadata.sex ||
        result?.sex ||
        "",

      age:
        metadata.age ||
        result?.age ||
        "",

      collectionDate:
        metadata.collectionDate ||
        result?.collection_date ||
        "",

      receivedDate:
        metadata.receivedDate ||
        result?.received_date ||
        "",

      specimen:
        metadata.specimen ||
        "Stool",

      occultBlood:
        metadata.occultBlood ||
        "",

      gramStain:
        metadata.gramStain ||
        "",

      cultureResult:
        metadata.cultureResult ||
        "Pending",

      finalReport:
        metadata.finalReport ||
        "",

      microscopyComment:
        metadata.microscopyComment ||
        "",

      cultureComment:
        metadata.cultureComment ||
        "",

      interpretation:
        metadata.interpretation ||
        "",

      comment:
        metadata.comment ||
        "",

      macroscopic: {
        ...createInitialMacroscopy(),
        ...(metadata.macroscopic || {}),
      },

      microscopic: {
        ...createInitialMicroscopy(),
        ...(metadata.microscopic || {}),
      },

      organisms:
        Array.isArray(
          metadata.organisms
        ) &&
        metadata.organisms.length
          ? metadata.organisms.map(
              normalizeOrganism
            )
          : [
              createOrganismRow(),
            ],
    };
  }

  return {
    patientName:
      result?.patient_name ||
      result?.full_name ||
      "",

    labNumber:
      result?.lab_number ||
      "",

    patientId:
      result?.patient_id ||
      "",

    registrationNumber:
      result?.registration_number ||
      "",

    sex:
      result?.sex ||
      "",

    age:
      result?.age ||
      "",

    collectionDate:
      result?.collection_date ||
      "",

    receivedDate:
      result?.received_date ||
      "",

    specimen:
      "Stool",

    occultBlood:
      "",

    gramStain:
      "",

    cultureResult:
      "Pending",

    finalReport:
      "",

    microscopyComment:
      "",

    cultureComment:
      "",

    interpretation:
      "",

    comment:
      "",

    macroscopic:
      createInitialMacroscopy(),

    microscopic:
      createInitialMicroscopy(),

    organisms: [
      createOrganismRow(),
    ],
  };
};

const normalizeOrganism = (
  organism = {}
) => ({
  id:
    organism.id ||
    createId("organism"),

  organism:
    organism.organism || "",

  identification:
    organism.identification ||
    "",

  comment:
    organism.comment || "",

  antibiotics:
    Array.isArray(
      organism.antibiotics
    ) &&
    organism.antibiotics.length
      ? organism.antibiotics.map(
          (item) => ({
            id:
              item.id ||
              createId(
                "antibiotic"
              ),
            antibiotic:
              item.antibiotic ||
              "",
            result:
              item.result ||
              "",
          })
        )
      : [
          createAntibioticRow(),
        ],
});

/* ==========================================================
   COMPONENT
   ========================================================== */

export default function StoolMCSResultEntry({
  resultId = null,
  onSaved,
  onCancel,
}) {
  /* ========================================================
     RESULT ID
     ======================================================== */

  const resolvedResultId =
    useMemo(
      () =>
        resolveResultId(resultId),
      [resultId]
    );

  const editMode =
    Boolean(resolvedResultId);

  /* ========================================================
     STATE
     ======================================================== */

  const [
    resultRecord,
    setResultRecord,
  ] = useState(null);

  const [form, setForm] =
    useState(() =>
      createInitialForm()
    );

  const [loading, setLoading] =
    useState(editMode);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* ========================================================
     LOAD EXISTING RESULT
     ======================================================== */

  useEffect(() => {
    let mounted = true;

    const loadResult = async () => {
      if (!resolvedResultId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const result =
          await getLaboratoryResultById(
            resolvedResultId
          );

        if (!mounted) {
          return;
        }

        if (!result) {
          throw new Error(
            "The Stool MCS laboratory result could not be found."
          );
        }

        setResultRecord(result);

        setForm(
          createInitialForm(result)
        );
      } catch (err) {
        if (!mounted) {
          return;
        }

        console.error(
          "StoolMCSResultEntry: load failed",
          err
        );

        setError(
          err?.message ||
            "Unable to load Stool MCS result."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadResult();

    return () => {
      mounted = false;
    };
  }, [resolvedResultId]);

  /* ========================================================
     FIELD UPDATE
     ======================================================== */

  const updateField = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  const updateNestedField = (
    section,
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));

    setError("");
    setSuccess("");
  };

  /* ========================================================
     ORGANISM MANAGEMENT
     ======================================================== */

  const addOrganism = () => {
    setForm((current) => ({
      ...current,
      organisms: [
        ...(current.organisms || []),
        createOrganismRow(),
      ],
    }));
  };

  const removeOrganism = (
    organismId
  ) => {
    setForm((current) => {
      const organisms =
        current.organisms || [];

      if (organisms.length <= 1) {
        return current;
      }

      return {
        ...current,
        organisms:
          organisms.filter(
            (item) =>
              item.id !==
              organismId
          ),
      };
    });
  };

  const updateOrganism = (
    organismId,
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      organisms: (
        current.organisms || []
      ).map((organism) =>
        organism.id ===
        organismId
          ? {
              ...organism,
              [field]: value,
            }
          : organism
      ),
    }));

    setError("");
    setSuccess("");
  };

  /* ========================================================
     ANTIBIOTIC MANAGEMENT
     ======================================================== */

  const addAntibiotic = (
    organismId
  ) => {
    setForm((current) => ({
      ...current,
      organisms: (
        current.organisms || []
      ).map((organism) =>
        organism.id ===
        organismId
          ? {
              ...organism,
              antibiotics: [
                ...(organism.antibiotics ||
                  []),
                createAntibioticRow(),
              ],
            }
          : organism
      ),
    }));
  };

  const removeAntibiotic = (
    organismId,
    antibioticId
  ) => {
    setForm((current) => ({
      ...current,
      organisms: (
        current.organisms || []
      ).map((organism) => {
        if (
          organism.id !==
          organismId
        ) {
          return organism;
        }

        const antibiotics =
          organism.antibiotics ||
          [];

        if (
          antibiotics.length <=
          1
        ) {
          return organism;
        }

        return {
          ...organism,
          antibiotics:
            antibiotics.filter(
              (item) =>
                item.id !==
                antibioticId
            ),
        };
      }),
    }));
  };

  const updateAntibiotic = (
    organismId,
    antibioticId,
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      organisms: (
        current.organisms || []
      ).map((organism) => {
        if (
          organism.id !==
          organismId
        ) {
          return organism;
        }

        return {
          ...organism,
          antibiotics: (
            organism.antibiotics ||
            []
          ).map((item) =>
            item.id ===
            antibioticId
              ? {
                  ...item,
                  [field]:
                    value,
                }
              : item
          ),
        };
      }),
    }));

    setError("");
    setSuccess("");
  };

  /* ========================================================
     ORGANISM / CULTURE STATE
     ======================================================== */

  const selectedOrganisms =
    useMemo(
      () =>
        (
          form.organisms ||
          []
        ).filter((item) =>
          String(
            item.organism || ""
          ).trim()
        ),
      [form.organisms]
    );

  const positiveCulture =
    normalizeText(
      form.cultureResult
    ) === "growth";

  /* ========================================================
     AUTOMATIC INTERPRETATION
     ======================================================== */

  const automaticInterpretation =
    useMemo(() => {
      const culture =
        normalizeText(
          form.cultureResult
        );

      const occult =
        normalizeText(
          form.occultBlood
        );

      const parasite =
        normalizeText(
          form.microscopic
            ?.parasites
        );

      const organisms =
        selectedOrganisms.length;

      const statements = [];

      if (
        culture ===
        "no growth"
      ) {
        statements.push(
          "No significant bacterial growth was detected from the stool culture."
        );
      }

      if (
        culture === "growth" &&
        organisms > 0
      ) {
        statements.push(
          `${organisms} organism${
            organisms === 1
              ? ""
              : "s"
          } identified. Review antimicrobial susceptibility results where applicable.`
        );
      }

      if (
        culture ===
        "mixed growth"
      ) {
        statements.push(
          "Mixed bacterial growth was observed. Clinical correlation is advised."
        );
      }

      if (
        culture ===
        "contaminated"
      ) {
        statements.push(
          "The culture is suggestive of contamination. Consider repeat specimen where clinically indicated."
        );
      }

      if (
        occult === "positive"
      ) {
        statements.push(
          "Occult blood detected."
        );
      }

      if (
        parasite ===
        "present"
      ) {
        statements.push(
          "Parasites were reported on microscopic examination."
        );
      }

      if (!statements.length) {
        return "Pending — complete the Stool MCS findings.";
      }

      return statements.join(
        " "
      );
    }, [
      form.cultureResult,
      form.occultBlood,
      form.microscopic
        ?.parasites,
      selectedOrganisms.length,
    ]);

  /* ========================================================
     VALIDATION
     ======================================================== */

  const validate = () => {
    if (
      !form.specimen
        ?.trim()
    ) {
      return "Specimen type is required.";
    }

    if (
      !form.cultureResult
    ) {
      return "Culture result is required.";
    }

    if (
      form.cultureResult ===
        "Growth" &&
      selectedOrganisms.length ===
        0
    ) {
      return "Add at least one organism for a positive stool culture.";
    }

    return "";
  };

  /* ========================================================
     RESET
     ======================================================== */

  const handleReset = () => {
    if (resultRecord) {
      setForm(
        createInitialForm(
          resultRecord
        )
      );
    } else {
      setForm(
        createInitialForm()
      );
    }

    setError("");
    setSuccess("");
  };

  /* ========================================================
     SAVE / UPDATE
     ======================================================== */

  const handleSave = async (
    event
  ) => {
    event?.preventDefault();

    if (!resolvedResultId) {
      setError(
        "No laboratory result record is attached to this Stool MCS entry."
      );
      return;
    }

    if (saving) {
      return;
    }

    const validationError =
      validate();

    if (validationError) {
      setError(
        validationError
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      /* ----------------------------------------------------
         Preserve the existing structured result contract.
         ---------------------------------------------------- */

      const structuredResult =
        {
          testType:
            "Stool MCS",

          method:
            "Microscopy, Culture and Sensitivity",

          patientName:
            form.patientName,

          labNumber:
            form.labNumber,

          patientId:
            form.patientId,

          registrationNumber:
            form.registrationNumber,

          sex:
            form.sex,

          age:
            form.age,

          collectionDate:
            form.collectionDate,

          receivedDate:
            form.receivedDate,

          specimen:
            form.specimen,

          macroscopic: {
            ...form.macroscopic,
          },

          microscopic: {
            ...form.microscopic,
          },

          occultBlood:
            form.occultBlood,

          gramStain:
            form.gramStain,

          cultureResult:
            form.cultureResult,

          finalReport:
            form.finalReport,

          organisms: (
            form.organisms ||
            []
          ).map(
            (organism) => ({
              ...organism,
              antibiotics:
                organism.antibiotics ||
                [],
            })
          ),

          interpretation:
            automaticInterpretation,

          microscopyComment:
            form.microscopyComment,

          cultureComment:
            form.cultureComment,

          comment:
            form.comment || "",
        };

      /* ----------------------------------------------------
         Compact human-readable result.
         ---------------------------------------------------- */

      const organismText =
        selectedOrganisms.length
          ? selectedOrganisms
              .map(
                (item) =>
                  item.organism
              )
              .join(", ")
          : "None identified";

      const compactResult =
        [
          `Macroscopy: ${
            form.macroscopic
              ?.colour ||
            "Not stated"
          } / ${
            form.macroscopic
              ?.consistency ||
            "Not stated"
          }`,

          `Microscopy: Pus cells ${
            form.microscopic
              ?.pusCells ||
            "Not stated"
          }, RBC ${
            form.microscopic
              ?.redBloodCells ||
            "Not stated"
          }`,

          `Occult blood: ${
            form.occultBlood ||
            "Not done"
          }`,

          `Culture: ${
            form.cultureResult ||
            "Pending"
          }`,

          `Organism: ${organismText}`,
        ].join("; ");

      const payload = {
        result:
          compactResult,

        result_status:
          form.cultureResult ===
          "Pending"
            ? "Pending"
            : "Entered",

        result_data:
          structuredResult,
      };

      const saved =
        await updateLaboratoryResult(
          resolvedResultId,
          payload
        );

      setResultRecord(
        saved || resultRecord
      );

      /*
       * Keep the form in the current edited state.
       * This prevents the user from losing unsaved UI
       * values if the service returns a minimal record.
       */

      setSuccess(
        editMode
          ? "Stool MCS result updated successfully."
          : "Stool MCS result saved successfully."
      );

      if (
        typeof onSaved ===
        "function"
      ) {
        onSaved(
          saved ||
            resultRecord
        );
      }
    } catch (err) {
      console.error(
        "StoolMCSResultEntry: save failed",
        err
      );

      setError(
        err?.message ||
          "Unable to save Stool MCS result."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ========================================================
     LOADING
     ======================================================== */

  if (loading) {
    return (
      <div className="stool-mcs-result-entry">
        <style>
          {STYLES}
        </style>

        <div className="stool-mcs-result-entry__loading">
          <Loader2
            size={26}
            className="stool-mcs-result-entry__spin"
          />

          <span>
            Loading Stool MCS result...
          </span>
        </div>
      </div>
    );
  }

  /* ========================================================
     RENDER
     ======================================================== */

  return (
    <div className="stool-mcs-result-entry">
      <style>
        {STYLES}
      </style>

      {/* ====================================================
          HEADER
         ==================================================== */}

      <header className="stool-mcs-result-entry__header">
        <div>
          <div className="stool-mcs-result-entry__eyebrow">
            PEFA LABORATORY • MICROBIOLOGY
          </div>

          <h1>
            Stool MCS Result Entry
          </h1>

          <p>
            Stool Microscopy, Culture &
            Sensitivity
          </p>
        </div>

        <div className="stool-mcs-result-entry__header-actions">
          {editMode && (
            <div className="stool-mcs-result-entry__edit-indicator">
              <Edit3 size={15} />
              <span>
                EDIT MODE
              </span>
            </div>
          )}

          {onCancel && (
            <button
              type="button"
              className="stool-mcs-result-entry__button stool-mcs-result-entry__button--secondary"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            form="stool-mcs-form"
            className="stool-mcs-result-entry__button stool-mcs-result-entry__button--primary"
            disabled={
              saving ||
              !resolvedResultId
            }
          >
            {saving ? (
              <Loader2
                size={16}
                className="stool-mcs-result-entry__spin"
              />
            ) : editMode ? (
              <Edit3 size={16} />
            ) : (
              <Save size={16} />
            )}

            {saving
              ? "Saving..."
              : editMode
                ? "Save Changes"
                : "Save Result"}
          </button>
        </div>
      </header>

      {/* ====================================================
          MODE BANNER
         ==================================================== */}

      {editMode && (
        <div className="stool-mcs-result-entry__mode-banner">
          <Edit3 size={17} />

          <div>
            <strong>
              Editing Existing Result
            </strong>

            <span>
              Changes will update the existing
              laboratory result record.
            </span>
          </div>
        </div>
      )}

      {/* ====================================================
          MESSAGES
         ==================================================== */}

      {error && (
        <div className="stool-mcs-result-entry__message stool-mcs-result-entry__message--error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="stool-mcs-result-entry__message stool-mcs-result-entry__message--success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* ====================================================
          PATIENT INFORMATION
         ==================================================== */}

      <section className="stool-mcs-result-entry__patient">
        <PatientItem
          label="Patient Name"
          value={
            form.patientName
          }
        />

        <PatientItem
          label="Lab Number"
          value={
            form.labNumber
          }
        />

        <PatientItem
          label="Patient ID"
          value={
            form.patientId
          }
        />

        <PatientItem
          label="Registration Number"
          value={
            form.registrationNumber
          }
        />

        <PatientItem
          label="Sex"
          value={form.sex}
        />

        <PatientItem
          label="Age"
          value={form.age}
        />
      </section>

      <form
        id="stool-mcs-form"
        onSubmit={handleSave}
      >
        {/* ==================================================
            SPECIMEN INFORMATION
           ================================================== */}

        <Section
          title="Specimen Information"
          subtitle="Collection and specimen receipt details."
          icon={<FlaskConical size={17} />}
        >
          <div className="stool-mcs-result-entry__grid">
            <Field
              label="Specimen"
              required
            >
              <input
                value={
                  form.specimen
                }
                onChange={(event) =>
                  updateField(
                    "specimen",
                    event.target.value
                  )
                }
                placeholder="Stool"
              />
            </Field>

            <Field label="Collection Date">
              <input
                type="date"
                value={
                  form.collectionDate ||
                  ""
                }
                onChange={(event) =>
                  updateField(
                    "collectionDate",
                    event.target.value
                  )
                }
              />
            </Field>

            <Field label="Received Date">
              <input
                type="date"
                value={
                  form.receivedDate ||
                  ""
                }
                onChange={(event) =>
                  updateField(
                    "receivedDate",
                    event.target.value
                  )
                }
              />
            </Field>

            <Field label="Occult Blood">
              <select
                value={
                  form.occultBlood
                }
                onChange={(event) =>
                  updateField(
                    "occultBlood",
                    event.target.value
                  )
                }
              >
                {OCCULT_BLOOD_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option ||
                        "Select"}
                    </option>
                  )
                )}
              </select>
            </Field>
          </div>
        </Section>

        {/* ==================================================
            MACROSCOPY
           ================================================== */}

        <Section
          title="Macroscopic Examination"
          subtitle="Record the gross appearance of the stool specimen."
        >
          <div className="stool-mcs-result-entry__grid">
            <Field label="Colour">
              <select
                value={
                  form.macroscopic
                    ?.colour || ""
                }
                onChange={(event) =>
                  updateNestedField(
                    "macroscopic",
                    "colour",
                    event.target.value
                  )
                }
              >
                {COLOUR_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option ||
                        "Select colour"}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Consistency">
              <select
                value={
                  form.macroscopic
                    ?.consistency ||
                  ""
                }
                onChange={(event) =>
                  updateNestedField(
                    "macroscopic",
                    "consistency",
                    event.target.value
                  )
                }
              >
                {CONSISTENCY_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option ||
                        "Select consistency"}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Visible Blood">
              <select
                value={
                  form.macroscopic
                    ?.blood || ""
                }
                onChange={(event) =>
                  updateNestedField(
                    "macroscopic",
                    "blood",
                    event.target.value
                  )
                }
              >
                {BLOOD_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option ||
                        "Select"}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Mucus">
              <select
                value={
                  form.macroscopic
                    ?.mucus || ""
                }
                onChange={(event) =>
                  updateNestedField(
                    "macroscopic",
                    "mucus",
                    event.target.value
                  )
                }
              >
                {MUCUS_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option ||
                        "Select"}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field
              label="Visible Parasites"
              wide
            >
              <input
                value={
                  form.macroscopic
                    ?.visibleParasites ||
                  ""
                }
                onChange={(event) =>
                  updateNestedField(
                    "macroscopic",
                    "visibleParasites",
                    event.target.value
                  )
                }
                placeholder="Enter observation if present"
              />
            </Field>
          </div>
        </Section>

        {/* ==================================================
            MICROSCOPY
           ================================================== */}

        <Section
          title="Microscopic Examination"
          subtitle="Record cells, parasites, ova, cysts and other microscopic findings."
        >
          <div className="stool-mcs-result-entry__grid">
            <Field label="Pus Cells">
              <select
                value={
                  form.microscopic
                    ?.pusCells || ""
                }
                onChange={(event) =>
                  updateNestedField(
                    "microscopic",
                    "pusCells",
                    event.target.value
                  )
                }
              >
                {PUS_CELL_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option ||
                        "Select"}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Red Blood Cells">
              <select
                value={
                  form.microscopic
                    ?.redBloodCells ||
                  ""
                }
                onChange={(event) =>
                  updateNestedField(
                    "microscopic",
                    "redBloodCells",
                    event.target.value
                  )
                }
              >
                {RBC_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option ||
                        "Select"}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Epithelial Cells">
              <select
                value={
                  form.microscopic
                    ?.epithelialCells ||
                  ""
                }
                onChange={(event) =>
                  updateNestedField(
                    "microscopic",
                    "epithelialCells",
                    event.target.value
                  )
                }
              >
                {EPITHELIAL_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option ||
                        "Select"}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Yeast Cells">
              <select
                value={
                  form.microscopic
                    ?.yeastCells ||
                  ""
                }
                onChange={(event) =>
                  updateNestedField(
                    "microscopic",
                    "yeastCells",
                    event.target.value
                  )
                }
              >
                {YEAST_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option ||
                        "Select"}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Ova">
              <input
                value={
                  form.microscopic
                    ?.ova || ""
                }
                onChange={(event) =>
                  updateNestedField(
                    "microscopic",
                    "ova",
                    event.target.value
                  )
                }
                placeholder="e.g. None seen"
              />
            </Field>

            <Field label="Cysts">
              <input
                value={
                  form.microscopic
                    ?.cysts || ""
                }
                onChange={(event) =>
                  updateNestedField(
                    "microscopic",
                    "cysts",
                    event.target.value
                  )
                }
                placeholder="e.g. None seen"
              />
            </Field>

            <Field label="Trophozoites">
              <input
                value={
                  form.microscopic
                    ?.trophozoites ||
                  ""
                }
                onChange={(event) =>
                  updateNestedField(
                    "microscopic",
                    "trophozoites",
                    event.target.value
                  )
                }
                placeholder="e.g. None seen"
              />
            </Field>

            <Field label="Parasites">
              <select
                value={
                  form.microscopic
                    ?.parasites || ""
                }
                onChange={(event) =>
                  updateNestedField(
                    "microscopic",
                    "parasites",
                    event.target.value
                  )
                }
              >
                {PARASITE_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option ||
                        "Select"}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field
              label="Microscopy Comment"
              wide
            >
              <textarea
                value={
                  form.microscopic
                    ?.microscopyComment ||
                  ""
                }
                onChange={(event) =>
                  updateNestedField(
                    "microscopic",
                    "microscopyComment",
                    event.target.value
                  )
                }
                placeholder="Additional microscopy findings..."
              />
            </Field>
          </div>
        </Section>

        {/* ==================================================
            CULTURE
           ================================================== */}

        <Section
          title="Culture Examination"
          subtitle="Record Gram stain, culture status and final report status."
        >
          <div className="stool-mcs-result-entry__grid">
            <Field label="Gram Stain">
              <select
                value={
                  form.gramStain
                }
                onChange={(event) =>
                  updateField(
                    "gramStain",
                    event.target.value
                  )
                }
              >
                {GRAM_STAIN_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option ||
                        "Select"}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field
              label="Culture Result"
              required
            >
              <select
                value={
                  form.cultureResult
                }
                onChange={(event) =>
                  updateField(
                    "cultureResult",
                    event.target.value
                  )
                }
              >
                {CULTURE_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option ||
                        "Select culture result"}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Final Report">
              <select
                value={
                  form.finalReport
                }
                onChange={(event) =>
                  updateField(
                    "finalReport",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select
                </option>
                <option value="Preliminary">
                  Preliminary
                </option>
                <option value="Final">
                  Final
                </option>
              </select>
            </Field>

            <Field
              label="Culture Comment"
              wide
            >
              <textarea
                value={
                  form.cultureComment ||
                  ""
                }
                onChange={(event) =>
                  updateField(
                    "cultureComment",
                    event.target.value
                  )
                }
                placeholder="Enter culture observation..."
              />
            </Field>
          </div>
        </Section>

        {/* ==================================================
            ORGANISM IDENTIFICATION
           ================================================== */}

        <Section
          title="Organism Identification"
          subtitle="Add organisms isolated from the stool culture."
          action={
            <button
              type="button"
              className="stool-mcs-result-entry__button stool-mcs-result-entry__button--secondary stool-mcs-result-entry__button--small"
              onClick={
                addOrganism
              }
            >
              <Plus size={14} />
              Add Organism
            </button>
          }
        >
          <div className="stool-mcs-result-entry__organisms">
            {(
              form.organisms ||
              []
            ).map(
              (
                organism,
                index
              ) => (
                <div
                  className="stool-mcs-result-entry__organism"
                  key={
                    organism.id
                  }
                >
                  <div className="stool-mcs-result-entry__organism-header">
                    <div>
                      <span>
                        Organism{" "}
                        {index +
                          1}
                      </span>

                      <strong>
                        {organism.organism ||
                          "Not selected"}
                      </strong>
                    </div>

                    <button
                      type="button"
                      className="stool-mcs-result-entry__icon-button stool-mcs-result-entry__icon-button--danger"
                      onClick={() =>
                        removeOrganism(
                          organism.id
                        )
                      }
                      disabled={
                        (
                          form.organisms ||
                          []
                        ).length <=
                        1
                      }
                      title="Remove organism"
                    >
                      <Trash2
                        size={16}
                      />
                    </button>
                  </div>

                  <div className="stool-mcs-result-entry__grid">
                    <Field label="Organism">
                      <select
                        value={
                          organism.organism
                        }
                        onChange={(
                          event
                        ) =>
                          updateOrganism(
                            organism.id,
                            "organism",
                            event
                              .target
                              .value
                          )
                        }
                      >
                        <option value="">
                          Select organism
                        </option>

                        {ORGANISM_OPTIONS.map(
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
                              {
                                option
                              }
                            </option>
                          )
                        )}
                      </select>
                    </Field>

                    <Field label="Identification">
                      <input
                        value={
                          organism.identification ||
                          ""
                        }
                        onChange={(
                          event
                        ) =>
                          updateOrganism(
                            organism.id,
                            "identification",
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="Biochemical / automated identification"
                      />
                    </Field>

                    <Field
                      label="Organism Comment"
                      wide
                    >
                      <input
                        value={
                          organism.comment ||
                          ""
                        }
                        onChange={(
                          event
                        ) =>
                          updateOrganism(
                            organism.id,
                            "comment",
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="Additional organism comment"
                      />
                    </Field>
                  </div>

                  {/* ==========================================
                      AST
                     ========================================== */}

                  <div className="stool-mcs-result-entry__ast-header">
                    <div>
                      <h3>
                        Antimicrobial Susceptibility
                      </h3>

                      <p>
                        S = Sensitive · I =
                        Intermediate · R =
                        Resistant
                      </p>
                    </div>

                    <button
                      type="button"
                      className="stool-mcs-result-entry__button stool-mcs-result-entry__button--secondary stool-mcs-result-entry__button--small"
                      onClick={() =>
                        addAntibiotic(
                          organism.id
                        )
                      }
                    >
                      <Plus
                        size={14}
                      />
                      Add Antibiotic
                    </button>
                  </div>

                  <div className="stool-mcs-result-entry__table-wrapper">
                    <table className="stool-mcs-result-entry__table">
                      <thead>
                        <tr>
                          <th>
                            Antibiotic
                          </th>
                          <th>
                            Result
                          </th>
                          <th>
                            Assessment
                          </th>
                          <th>
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {(
                          organism.antibiotics ||
                          []
                        ).map(
                          (
                            antibiotic
                          ) => (
                            <tr
                              key={
                                antibiotic.id
                              }
                            >
                              <td>
                                <select
                                  value={
                                    antibiotic.antibiotic ||
                                    ""
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateAntibiotic(
                                      organism.id,
                                      antibiotic.id,
                                      "antibiotic",
                                      event
                                        .target
                                        .value
                                    )
                                  }
                                >
                                  <option value="">
                                    Select antibiotic
                                  </option>

                                  {COMMON_ANTIBIOTICS.map(
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
                                        {
                                          option
                                        }
                                      </option>
                                    )
                                  )}
                                </select>
                              </td>

                              <td>
                                <select
                                  value={
                                    antibiotic.result ||
                                    ""
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateAntibiotic(
                                      organism.id,
                                      antibiotic.id,
                                      "result",
                                      event
                                        .target
                                        .value
                                    )
                                  }
                                >
                                  {SUSCEPTIBILITY_OPTIONS.map(
                                    (
                                      option
                                    ) => (
                                      <option
                                        key={
                                          option ||
                                          "empty"
                                        }
                                        value={
                                          option
                                        }
                                      >
                                        {option ||
                                          "Select"}
                                      </option>
                                    )
                                  )}
                                </select>
                              </td>

                              <td>
                                <SusceptibilityBadge
                                  value={
                                    antibiotic.result
                                  }
                                />
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="stool-mcs-result-entry__icon-button stool-mcs-result-entry__icon-button--danger"
                                  onClick={() =>
                                    removeAntibiotic(
                                      organism.id,
                                      antibiotic.id
                                    )
                                  }
                                  disabled={
                                    (
                                      organism.antibiotics ||
                                      []
                                    ).length <=
                                    1
                                  }
                                  title="Remove antibiotic"
                                >
                                  <Trash2
                                    size={15}
                                  />
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}
          </div>
        </Section>

        {/* ==================================================
            INTERPRETATION
           ================================================== */}

        <Section
          title="Interpretation & Comments"
          subtitle="Review the suggested interpretation before authorization."
        >
          <div className="stool-mcs-result-entry__interpretation-box">
            <div className="stool-mcs-result-entry__interpretation-label">
              Automatic Interpretation
            </div>

            <p>
              {
                automaticInterpretation
              }
            </p>
          </div>

          <div className="stool-mcs-result-entry__grid stool-mcs-result-entry__grid--two">
            <Field label="Final Interpretation">
              <textarea
                value={
                  form.interpretation ||
                  ""
                }
                onChange={(event) =>
                  updateField(
                    "interpretation",
                    event.target.value
                  )
                }
                placeholder={
                  automaticInterpretation
                }
              />
            </Field>

            <Field label="Laboratory Comment">
              <textarea
                value={
                  form.comment ||
                  ""
                }
                onChange={(event) =>
                  updateField(
                    "comment",
                    event.target.value
                  )
                }
                placeholder="Enter additional laboratory comments..."
              />
            </Field>
          </div>
        </Section>

        {/* ==================================================
            FOOTER
           ================================================== */}

        <div className="stool-mcs-result-entry__footer">
          <div className="stool-mcs-result-entry__footer-status">
            <span>
              Stool MCS
            </span>

            <strong>
              {form.cultureResult ||
                "Pending"}
            </strong>
          </div>

          <div className="stool-mcs-result-entry__footer-actions">
            <button
              type="button"
              className="stool-mcs-result-entry__button stool-mcs-result-entry__button--secondary"
              onClick={() => {
                if (
                  typeof onCancel ===
                  "function"
                ) {
                  onCancel();
                  return;
                }

                handleReset();
              }}
              disabled={saving}
            >
              <RotateCcw
                size={16}
              />
              {editMode
                ? "Reset Changes"
                : "Reset"}
            </button>

            <button
              type="submit"
              className="stool-mcs-result-entry__button stool-mcs-result-entry__button--primary"
              disabled={
                saving ||
                !resolvedResultId
              }
            >
              {saving ? (
                <Loader2
                  size={16}
                  className="stool-mcs-result-entry__spin"
                />
              ) : editMode ? (
                <Edit3 size={16} />
              ) : (
                <Save size={16} />
              )}

              {saving
                ? "Saving..."
                : editMode
                  ? "Save Changes"
                  : "Save Result"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ==========================================================
   PATIENT ITEM
   ========================================================== */

function PatientItem({
  label,
  value,
}) {
  return (
    <div className="stool-mcs-result-entry__patient-item">
      <span>
        {label}
      </span>

      <strong>
        {value || "—"}
      </strong>
    </div>
  );
}

/* ==========================================================
   SECTION
   ========================================================== */

function Section({
  title,
  subtitle,
  icon,
  action,
  children,
}) {
  return (
    <section className="stool-mcs-result-entry__card">
      <div className="stool-mcs-result-entry__card-header">
        <div>
          <h2>
            {icon}
            {title}
          </h2>

          {subtitle && (
            <p>
              {subtitle}
            </p>
          )}
        </div>

        {action}
      </div>

      <div className="stool-mcs-result-entry__card-body">
        {children}
      </div>
    </section>
  );
}

/* ==========================================================
   FIELD
   ========================================================== */

function Field({
  label,
  required = false,
  wide = false,
  children,
}) {
  return (
    <div
      className={
        wide
          ? "stool-mcs-result-entry__field stool-mcs-result-entry__field--wide"
          : "stool-mcs-result-entry__field"
      }
    >
      <label>
        {label}

        {required && (
          <span className="stool-mcs-result-entry__required">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

/* ==========================================================
   SUSCEPTIBILITY BADGE
   ========================================================== */

function SusceptibilityBadge({
  value,
}) {
  if (!value) {
    return (
      <span className="stool-mcs-result-entry__badge stool-mcs-result-entry__badge--empty">
        —
      </span>
    );
  }

  if (value === "S") {
    return (
      <span className="stool-mcs-result-entry__badge stool-mcs-result-entry__badge--s">
        Sensitive
      </span>
    );
  }

  if (value === "I") {
    return (
      <span className="stool-mcs-result-entry__badge stool-mcs-result-entry__badge--i">
        Intermediate
      </span>
    );
  }

  return (
    <span className="stool-mcs-result-entry__badge stool-mcs-result-entry__badge--r">
      Resistant
    </span>
  );
}

/* ==========================================================
   INLINE STYLES
   ========================================================== */

const STYLES = `
.stool-mcs-result-entry {
  --sm-primary: #173f5f;
  --sm-primary-dark: #102f48;
  --sm-accent: #087f8c;
  --sm-text: #17202a;
  --sm-muted: #667085;
  --sm-border: #dfe5eb;
  --sm-bg: #f5f7fa;
  --sm-card: #ffffff;
  --sm-danger: #c62828;
  --sm-success: #16794a;
  --sm-warning: #9a6700;

  min-height: 100%;
  padding: 24px;
  background:
    linear-gradient(
      180deg,
      #f8fafc 0%,
      #f3f6f9 100%
    );
  color: var(--sm-text);
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  box-sizing: border-box;
}

.stool-mcs-result-entry *,
.stool-mcs-result-entry *::before,
.stool-mcs-result-entry *::after {
  box-sizing: border-box;
}

.stool-mcs-result-entry button,
.stool-mcs-result-entry input,
.stool-mcs-result-entry select,
.stool-mcs-result-entry textarea {
  font: inherit;
}

.stool-mcs-result-entry__header {
  max-width: 1500px;
  margin: 0 auto 18px;
  padding: 24px 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #ffffff;
  border: 1px solid var(--sm-border);
  border-radius: 16px;
  box-shadow:
    0 8px 24px rgba(16, 24, 40, 0.06);
}

.stool-mcs-result-entry__eyebrow {
  margin-bottom: 7px;
  color: var(--sm-accent);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.stool-mcs-result-entry__header h1 {
  margin: 0;
  color: var(--sm-primary);
  font-size: 25px;
  line-height: 1.2;
  font-weight: 800;
}

.stool-mcs-result-entry__header p {
  margin: 7px 0 0;
  color: var(--sm-muted);
  font-size: 13px;
}

.stool-mcs-result-entry__header-actions,
.stool-mcs-result-entry__footer-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 9px;
  flex-wrap: wrap;
}

.stool-mcs-result-entry__edit-indicator {
  min-height: 34px;
  padding: 0 11px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #b9d7e3;
  border-radius: 8px;
  background: #eef8fb;
  color: #056778;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.stool-mcs-result-entry__mode-banner {
  max-width: 1500px;
  margin: 0 auto 16px;
  padding: 13px 16px;
  display: flex;
  align-items: center;
  gap: 11px;
  border: 1px solid #b8dce5;
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    #edf9fb,
    #f7fcfd
  );
  color: #075b68;
}

.stool-mcs-result-entry__mode-banner strong {
  display: block;
  font-size: 13px;
  font-weight: 800;
}

.stool-mcs-result-entry__mode-banner span {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  color: #5d7780;
}

.stool-mcs-result-entry__message {
  max-width: 1500px;
  margin: 0 auto 16px;
  padding: 12px 15px;
  display: flex;
  align-items: center;
  gap: 9px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
}

.stool-mcs-result-entry__message--error {
  border: 1px solid #f2c2c2;
  background: #fff4f4;
  color: var(--sm-danger);
}

.stool-mcs-result-entry__message--success {
  border: 1px solid #b8dfca;
  background: #f1fbf5;
  color: var(--sm-success);
}

.stool-mcs-result-entry__patient {
  max-width: 1500px;
  margin: 0 auto 18px;
  padding: 16px;
  display: grid;
  grid-template-columns:
    1.5fr
    1fr
    1fr
    1.2fr
    .7fr
    .7fr;
  gap: 10px;
  border: 1px solid var(--sm-border);
  border-radius: 14px;
  background: #ffffff;
  box-shadow:
    0 5px 18px rgba(16, 24, 40, 0.04);
}

.stool-mcs-result-entry__patient-item {
  min-width: 0;
  padding: 10px 12px;
  border-right: 1px solid #edf0f3;
}

.stool-mcs-result-entry__patient-item:last-child {
  border-right: 0;
}

.stool-mcs-result-entry__patient-item span {
  display: block;
  margin-bottom: 5px;
  color: var(--sm-muted);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stool-mcs-result-entry__patient-item strong {
  display: block;
  overflow: hidden;
  color: var(--sm-text);
  font-size: 13px;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stool-mcs-result-entry form {
  max-width: 1500px;
  margin: 0 auto;
}

.stool-mcs-result-entry__card {
  margin-bottom: 17px;
  overflow: hidden;
  border: 1px solid var(--sm-border);
  border-radius: 15px;
  background: var(--sm-card);
  box-shadow:
    0 5px 20px rgba(16, 24, 40, 0.045);
}

.stool-mcs-result-entry__card-header {
  min-height: 62px;
  padding: 15px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  border-bottom: 1px solid #edf0f3;
  background:
    linear-gradient(
      180deg,
      #ffffff,
      #fbfcfd
    );
}

.stool-mcs-result-entry__card-header h2 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--sm-primary);
  font-size: 15px;
  font-weight: 800;
}

.stool-mcs-result-entry__card-header p {
  margin: 4px 0 0;
  color: var(--sm-muted);
  font-size: 11px;
}

.stool-mcs-result-entry__card-body {
  padding: 19px;
}

.stool-mcs-result-entry__grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 15px;
}

.stool-mcs-result-entry__grid--two {
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
}

.stool-mcs-result-entry__field {
  min-width: 0;
}

.stool-mcs-result-entry__field--wide {
  grid-column: 1 / -1;
}

.stool-mcs-result-entry__field label {
  display: block;
  margin-bottom: 6px;
  color: #344054;
  font-size: 11px;
  font-weight: 750;
}

.stool-mcs-result-entry__required {
  margin-left: 3px;
  color: #c62828;
}

.stool-mcs-result-entry__field input,
.stool-mcs-result-entry__field select,
.stool-mcs-result-entry__field textarea,
.stool-mcs-result-entry__table select {
  width: 100%;
  min-height: 38px;
  padding: 8px 10px;
  outline: none;
  border: 1px solid #cfd7df;
  border-radius: 8px;
  background: #ffffff;
  color: #17202a;
  font-size: 12px;
  transition:
    border-color .16s ease,
    box-shadow .16s ease;
}

.stool-mcs-result-entry__field textarea {
  min-height: 94px;
  resize: vertical;
  line-height: 1.5;
}

.stool-mcs-result-entry__field input:focus,
.stool-mcs-result-entry__field select:focus,
.stool-mcs-result-entry__field textarea:focus,
.stool-mcs-result-entry__table select:focus {
  border-color: #4b9aaa;
  box-shadow:
    0 0 0 3px rgba(8, 127, 140, 0.09);
}

.stool-mcs-result-entry__button {
  min-height: 36px;
  padding: 0 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 750;
  transition:
    transform .12s ease,
    box-shadow .12s ease,
    background .12s ease;
}

.stool-mcs-result-entry__button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.stool-mcs-result-entry__button:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.stool-mcs-result-entry__button--small {
  min-height: 32px;
  padding: 0 10px;
  font-size: 11px;
}

.stool-mcs-result-entry__button--primary {
  background: var(--sm-primary);
  color: #ffffff;
  box-shadow:
    0 4px 10px rgba(23, 63, 95, 0.16);
}

.stool-mcs-result-entry__button--primary:hover:not(:disabled) {
  background: var(--sm-primary-dark);
}

.stool-mcs-result-entry__button--secondary {
  border-color: #ccd5dd;
  background: #ffffff;
  color: #344054;
}

.stool-mcs-result-entry__button--secondary:hover:not(:disabled) {
  background: #f8fafc;
}

.stool-mcs-result-entry__organism {
  margin-bottom: 15px;
  padding: 16px;
  border: 1px solid #dfe6ec;
  border-radius: 12px;
  background: #fbfcfd;
}

.stool-mcs-result-entry__organism:last-child {
  margin-bottom: 0;
}

.stool-mcs-result-entry__organism-header {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.stool-mcs-result-entry__organism-header span {
  display: block;
  margin-bottom: 4px;
  color: var(--sm-accent);
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .08em;
}

.stool-mcs-result-entry__organism-header strong {
  display: block;
  color: var(--sm-primary);
  font-size: 13px;
}

.stool-mcs-result-entry__icon-button {
  width: 33px;
  height: 33px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d4dce4;
  border-radius: 7px;
  background: #ffffff;
  color: #52606d;
  cursor: pointer;
}

.stool-mcs-result-entry__icon-button:hover:not(:disabled) {
  background: #f4f6f8;
}

.stool-mcs-result-entry__icon-button--danger {
  color: #b42318;
  border-color: #efc8c5;
}

.stool-mcs-result-entry__icon-button:disabled {
  opacity: .4;
  cursor: not-allowed;
}

.stool-mcs-result-entry__ast-header {
  margin-top: 18px;
  padding-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  border-top: 1px solid #e5e9ed;
}

.stool-mcs-result-entry__ast-header h3 {
  margin: 0;
  color: #344054;
  font-size: 13px;
  font-weight: 800;
}

.stool-mcs-result-entry__ast-header p {
  margin: 4px 0 0;
  color: var(--sm-muted);
  font-size: 10px;
}

.stool-mcs-result-entry__table-wrapper {
  margin-top: 12px;
  overflow-x: auto;
  border: 1px solid #e1e6eb;
  border-radius: 9px;
  background: #ffffff;
}

.stool-mcs-result-entry__table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
}

.stool-mcs-result-entry__table th {
  padding: 10px 11px;
  background: #f5f7f9;
  color: #475467;
  font-size: 10px;
  font-weight: 800;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.stool-mcs-result-entry__table td {
  padding: 9px 10px;
  border-top: 1px solid #edf0f3;
  vertical-align: middle;
  font-size: 11px;
}

.stool-mcs-result-entry__table th:last-child,
.stool-mcs-result-entry__table td:last-child {
  width: 60px;
  text-align: center;
}

.stool-mcs-result-entry__badge {
  min-width: 75px;
  padding: 5px 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
}

.stool-mcs-result-entry__badge--s {
  background: #e8f7ee;
  color: #16794a;
}

.stool-mcs-result-entry__badge--i {
  background: #fff6db;
  color: #946200;
}

.stool-mcs-result-entry__badge--r {
  background: #fdecec;
  color: #b42318;
}

.stool-mcs-result-entry__badge--empty {
  background: #f2f4f7;
  color: #667085;
}

.stool-mcs-result-entry__interpretation-box {
  margin-bottom: 16px;
  padding: 14px 16px;
  border: 1px solid #c9e1e6;
  border-radius: 10px;
  background: #f2fafb;
}

.stool-mcs-result-entry__interpretation-label {
  margin-bottom: 5px;
  color: #087383;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .07em;
}

.stool-mcs-result-entry__interpretation-box p {
  margin: 0;
  color: #344054;
  font-size: 12px;
  line-height: 1.55;
}

.stool-mcs-result-entry__footer {
  margin-bottom: 30px;
  padding: 15px 17px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border: 1px solid var(--sm-border);
  border-radius: 14px;
  background: #ffffff;
  box-shadow:
    0 6px 20px rgba(16, 24, 40, 0.05);
}

.stool-mcs-result-entry__footer-status span {
  display: block;
  color: var(--sm-muted);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .07em;
}

.stool-mcs-result-entry__footer-status strong {
  display: block;
  margin-top: 3px;
  color: var(--sm-primary);
  font-size: 13px;
}

.stool-mcs-result-entry__loading {
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--sm-primary);
  font-size: 13px;
  font-weight: 700;
}

.stool-mcs-result-entry__spin {
  animation:
    stool-mcs-spin 1s linear infinite;
}

@keyframes stool-mcs-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1100px) {
  .stool-mcs-result-entry__patient {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }

  .stool-mcs-result-entry__patient-item {
    border-right: 0;
  }

  .stool-mcs-result-entry__grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .stool-mcs-result-entry {
    padding: 12px;
  }

  .stool-mcs-result-entry__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .stool-mcs-result-entry__header-actions {
    width: 100%;
  }

  .stool-mcs-result-entry__header-actions .stool-mcs-result-entry__button {
    flex: 1;
  }

  .stool-mcs-result-entry__patient {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .stool-mcs-result-entry__grid,
  .stool-mcs-result-entry__grid--two {
    grid-template-columns: 1fr;
  }

  .stool-mcs-result-entry__field--wide {
    grid-column: auto;
  }

  .stool-mcs-result-entry__footer {
    align-items: stretch;
    flex-direction: column;
  }

  .stool-mcs-result-entry__footer-actions {
    width: 100%;
  }

  .stool-mcs-result-entry__footer-actions .stool-mcs-result-entry__button {
    flex: 1;
  }

  .stool-mcs-result-entry__ast-header {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 460px) {
  .stool-mcs-result-entry__patient {
    grid-template-columns: 1fr;
  }

  .stool-mcs-result-entry__patient-item {
    border-bottom: 1px solid #edf0f3;
  }

  .stool-mcs-result-entry__patient-item:last-child {
    border-bottom: 0;
  }

  .stool-mcs-result-entry__card-header,
  .stool-mcs-result-entry__card-body {
    padding: 13px;
  }

  .stool-mcs-result-entry__button {
    min-height: 38px;
  }
}
`;