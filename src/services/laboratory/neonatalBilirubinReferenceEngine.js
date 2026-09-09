/* ==========================================================
   PEFA LAB — NEONATAL / PAEDIATRIC BILIRUBIN REFERENCE ENGINE
   ----------------------------------------------------------
   PURPOSE
   - Calculate postnatal age from DOB + optional birth time.
   - Prefer sample-collection date/time as the assessment time.
   - Select an age-specific bilirubin reference interval.
   - Flag Total/Direct bilirubin against the selected interval.

   IMPORTANT CLINICAL SAFETY RULE
   ----------------------------------------------------------
   These are LABORATORY REFERENCE INTERVALS, not phototherapy
   or exchange-transfusion treatment thresholds.

   AAP treatment decisions use TSB, gestational age, age in HOURS,
   and neurotoxicity risk factors. This engine deliberately does
   NOT calculate a treatment threshold.

   The reference values below are a configurable published-study
   profile and must be reviewed/approved by the PEFA laboratory
   director before being adopted as the laboratory's official RI.
   ========================================================== */

export const BILIRUBIN_REFERENCE_SOURCE =
  "Age-specific reference intervals for liver function tests in healthy neonates, infants, and young children (CLSI EP28-A3-based study; 2023 publication).";

const text = (value) => String(value ?? "").trim();

const firstValue = (...values) => {
  for (const value of values) {
    if (value !== null && value !== undefined && text(value) !== "") {
      return value;
    }
  }
  return "";
};

const toDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const dateOnly = (value) => {
  const date = toDate(value);
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const normalizeBilirubinUnit = (value) => {
  const unit = text(value).toLowerCase().replace(/\s+/g, "");
  if (["mg/dl", "mgdl", "mg%", "mg/dL".toLowerCase()].includes(unit)) {
    return "mg/dL";
  }
  return text(value) || "mg/dL";
};

/* ==========================================================
   AUTHORITATIVE REGISTRATION DOB
   ----------------------------------------------------------
   For laboratory result-entry age-aware interpretation, the DOB
   captured/selected at REGISTRATION is authoritative.

   Do NOT allow a stale patient object or an old laboratory result
   row to override the registration DOB.

   Fallback order:
     1. registration DOB
     2. registration.patient DOB
     3. patient DOB
     4. existing result-row DOB (legacy fallback only)
   ========================================================== */
export const getPatientDob = (patient, registration, row = {}) =>
  firstValue(
    registration?.dob,
    registration?.date_of_birth,
    registration?.dateOfBirth,
    registration?.patient_dob,
    registration?.patientDob,
    registration?._dob,
    registration?.patient?.dob,
    registration?.patient?.date_of_birth,
    registration?.patient?.dateOfBirth,
    registration?.patient?.patient_dob,
    patient?.dob,
    patient?.date_of_birth,
    patient?.dateOfBirth,
    patient?.patient_dob,
    patient?.patientDob,
    patient?._dob,
    patient?.patient?.dob,
    patient?.patient?.date_of_birth,
    patient?.patient?.dateOfBirth,
    row?.dob,
    row?.date_of_birth,
    row?.dateOfBirth,
    row?.patient_dob,
    row?.patientDob,
    row?.patient?.dob,
    row?.patient?.date_of_birth,
    row?.patient?.dateOfBirth
  );

export const getBirthDateTime = (patient, registration, row = {}) =>
  firstValue(
    registration?.birth_datetime,
    registration?.birthDateTime,
    registration?.date_time_of_birth,
    registration?.dateTimeOfBirth,
    registration?.patient?.birth_datetime,
    registration?.patient?.birthDateTime,
    registration?.patient?.date_time_of_birth,
    registration?.patient?.dateTimeOfBirth,
    patient?.birth_datetime,
    patient?.birthDateTime,
    patient?.date_time_of_birth,
    patient?.dateTimeOfBirth,
    row?.birth_datetime,
    row?.birthDateTime,
    row?.date_time_of_birth,
    row?.dateTimeOfBirth
  );

export const getBirthTime = (patient, registration, row = {}) =>
  firstValue(
    registration?.birth_time,
    registration?.birthTime,
    registration?.time_of_birth,
    registration?.timeOfBirth,
    registration?.patient?.birth_time,
    registration?.patient?.birthTime,
    registration?.patient?.time_of_birth,
    registration?.patient?.timeOfBirth,
    patient?.birth_time,
    patient?.birthTime,
    patient?.time_of_birth,
    patient?.timeOfBirth,
    row?.birth_time,
    row?.birthTime,
    row?.time_of_birth,
    row?.timeOfBirth
  );

export const getCollectionDateTime = (patient, registration, test, row = {}) =>
  firstValue(
    row?.sample_collection_date_time,
    row?.sampleCollectionDateTime,
    row?.specimen_collection_time,
    row?.specimenCollectionTime,
    row?.collection_datetime,
    row?.collectionDateTime,
    row?.collection_date_time,
    row?.collectionDate,
    row?.sample_collection_datetime,
    row?.sampleCollectionDatetime,
    patient?.sample_collection_date_time,
    registration?.sample_collection_date_time,
    test?.sample_collection_date_time,
    row?.updated_at,
    new Date().toISOString()
  );

const combineDateAndTime = (dob, birthTime) => {
  const base = dateOnly(dob);
  if (!base) return null;

  const raw = text(birthTime);
  if (!raw) return base;

  const match = raw.match(/(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?/);
  if (!match) return base;

  const hours = Math.min(23, Number(match[1]) || 0);
  const minutes = Math.min(59, Number(match[2]) || 0);
  const seconds = Math.min(59, Number(match[3]) || 0);

  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    hours,
    minutes,
    seconds,
    0
  );
};

export const resolveBirthDateTime = (patient, registration, row = {}) => {
  const explicit = toDate(getBirthDateTime(patient, registration, row));
  if (explicit) return explicit;
  return combineDateAndTime(
    getPatientDob(patient, registration, row),
    getBirthTime(patient, registration, row)
  );
};

export const calculatePostnatalAge = ({
  dob,
  birthDateTime,
  birthTime,
  collectionDateTime,
  now,
} = {}) => {
  const birth =
    toDate(birthDateTime) || combineDateAndTime(dob, birthTime) || dateOnly(dob);
  const collection = toDate(collectionDateTime) || toDate(now) || new Date();

  if (!birth || !collection) return null;
  if (collection.getTime() < birth.getTime()) return null;

  const milliseconds = collection.getTime() - birth.getTime();
  const hours = milliseconds / 3600000;
  const days = hours / 24;

  return {
    hours,
    days,
    wholeHours: Math.floor(hours),
    wholeDays: Math.floor(days),
    precision: birthDateTime || birthTime ? "datetime" : "date",
    birth,
    collection,
  };
};

/* ----------------------------------------------------------
   Published-study RI profile used by the engine.
   Values are mg/dL.
   ---------------------------------------------------------- */
const TOTAL_BILIRUBIN_RANGES = [
  { minDays: 0, maxDays: 3, label: "0–<3 days", low: 0.31, high: 2.29 },
  { minDays: 3, maxDays: 60, label: "3 days–<2 months", low: 0.20, high: 2.08 },
  { minDays: 60, maxDays: 90, label: "2–<3 months", low: 0.20, high: 1.78 },
  { minDays: 90, maxDays: 120, label: "3–<4 months", low: 0.16, high: 1.22 },
  { minDays: 120, maxDays: 365, label: "4 months–<1 year", low: 0.16, high: 0.85 },
  { minDays: 365, maxDays: 730, label: "1–<2 years", low: 0.18, high: 0.80 },
  { minDays: 730, maxDays: 3285, label: "2–9 years", low: 0.22, high: 0.97 },
];

const DIRECT_BILIRUBIN_RANGES = [
  { minDays: 0, maxDays: 120, label: "0–<4 months", low: 0.07, high: 0.76 },
  { minDays: 120, maxDays: 900, label: "4–<30 months", low: 0.10, high: 0.27 },
];

export const BILIRUBIN_REFERENCE_RANGES = {
  total_bilirubin: TOTAL_BILIRUBIN_RANGES,
  direct_bilirubin: DIRECT_BILIRUBIN_RANGES,
};

const findRange = (ranges, days) => {
  if (!Number.isFinite(days)) return null;
  return ranges.find((range) => days >= range.minDays && days < range.maxDays) || null;
};

export const getBilirubinReference = (parameterKey, ageDays) => {
  const key = text(parameterKey).toLowerCase().replace(/\s+/g, "_");
  const ranges =
    BILIRUBIN_REFERENCE_RANGES[key] ||
    (key.includes("total") ? TOTAL_BILIRUBIN_RANGES :
      key.includes("direct") ? DIRECT_BILIRUBIN_RANGES : []);

  const range = findRange(ranges, ageDays);
  if (!range) return null;

  return {
    ...range,
    unit: "mg/dL",
    text: `${range.low} - ${range.high} mg/dL`,
    source: BILIRUBIN_REFERENCE_SOURCE,
  };
};

export const flagBilirubinValue = (value, reference) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || !reference) return "";
  if (numeric < reference.low) return "Low";
  if (numeric > reference.high) return "High";
  return "Normal";
};

export const calculateIndirectBilirubin = (total, direct) => {
  const totalNumber = Number(total);
  const directNumber = Number(direct);
  if (!Number.isFinite(totalNumber) || !Number.isFinite(directNumber)) return "";
  const value = totalNumber - directNumber;
  return value >= 0 ? Number(value.toFixed(2)) : "";
};

export const resolveNeonatalBilirubinContext = ({
  patient,
  registration,
  test,
  row,
  collectionDateTime,
} = {}) => {
  const dob = getPatientDob(patient, registration, row);
  const birthDateTime = resolveBirthDateTime(patient, registration, row);
  const birthTime = getBirthTime(patient, registration, row);
  const collection =
    collectionDateTime ||
    getCollectionDateTime(patient, registration, test, row);

  const age = calculatePostnatalAge({
    dob,
    birthDateTime,
    birthTime,
    collectionDateTime: collection,
  });

  const ageDays = age?.days ?? null;
  const ageHours = age?.hours ?? null;

  return {
    dob,
    birthDateTime,
    birthTime,
    collectionDateTime: collection,
    ageDays,
    ageHours,
    age: age
      ? {
          ...age,
          display: age.precision === "datetime"
            ? `${age.wholeDays} day(s), ${age.wholeHours % 24} hour(s)`
            : `${age.wholeDays} day(s)`,
        }
      : null,
  };
};

export const getAgeAwareBilirubinResult = ({
  parameterKey,
  value,
  patient,
  registration,
  test,
  row,
  collectionDateTime,
} = {}) => {
  const context = resolveNeonatalBilirubinContext({
    patient,
    registration,
    test,
    row,
    collectionDateTime,
  });

  const reference = getBilirubinReference(parameterKey, context.ageDays);

  return {
    ...context,
    reference,
    flag: flagBilirubinValue(value, reference),
  };
};
