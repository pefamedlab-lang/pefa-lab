import { supabase } from "../supabase";

/* ==========================================================
   NORMALIZE LAB NUMBER
========================================================== */

function normalizeLabNumber(value) {
  return String(value ?? "").trim();
}

/* ==========================================================
   GET REGISTRATION BY LAB NUMBER
========================================================== */

/*
  IMPORTANT:

  Do NOT use maybeSingle() here.

  A patient may currently have more than one registration
  record with the same lab_number.

  maybeSingle() causes:

    PGRST116
    JSON object requested, multiple (or no) rows returned

  Instead, retrieve the matching rows and safely select one.
*/

export async function getPatientRegistration(labNumber) {
  const normalizedLabNumber =
    normalizeLabNumber(labNumber);

  if (!normalizedLabNumber) {
    return {
      data: null,
      error: null,
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from("registrations")
    .select("*")
    .eq("lab_number", normalizedLabNumber);

  if (error) {
    console.error(
      "GET PATIENT REGISTRATION ERROR:",
      error
    );

    return {
      data: null,
      error,
    };
  }

  /*
    No registration found.
  */

  if (!Array.isArray(data) || data.length === 0) {
    return {
      data: null,
      error: null,
    };
  }

  /*
    Normally there should be one registration.

    If duplicates exist, select the best candidate.

    Preference:

    1. created_at
    2. registration_date
    3. registered_at
    4. id
    5. first returned row

    This prevents the dashboard from crashing while
    allowing the application to continue working.
  */

  if (data.length > 1) {
    console.warn(
      `Multiple registrations found for lab number ${normalizedLabNumber}.`,
      data
    );

    const sorted = [...data].sort(
      (a, b) => {
        const dateA =
          new Date(
            a.created_at ||
            a.registration_date ||
            a.registered_at ||
            0
          ).getTime();

        const dateB =
          new Date(
            b.created_at ||
            b.registration_date ||
            b.registered_at ||
            0
          ).getTime();

        /*
          Newest registration first.
        */

        if (dateB !== dateA) {
          return dateB - dateA;
        }

        /*
          If no usable date exists, use ID
          as a stable fallback where possible.
        */

        const idA = String(a.id ?? "");
        const idB = String(b.id ?? "");

        return idB.localeCompare(idA);
      }
    );

    return {
      data: sorted[0] || null,
      error: null,
    };
  }

  /*
    Exactly one registration.
  */

  return {
    data: data[0],
    error: null,
  };
}

/* ==========================================================
   PARSE REGISTERED TESTS
========================================================== */

export function getRegisteredTests(
  registration
) {
  if (!registration) {
    return [];
  }

  try {
    const tests =
      registration.tests;

    /*
      JSON stored as text.
    */

    if (typeof tests === "string") {
      if (!tests.trim()) {
        return [];
      }

      const parsed =
        JSON.parse(tests);

      return Array.isArray(parsed)
        ? parsed
        : [];
    }

    /*
      JSON/JSONB already returned
      as an array.
    */

    if (Array.isArray(tests)) {
      return tests;
    }

    /*
      Some database structures may
      return an object.
    */

    if (
      tests &&
      typeof tests === "object"
    ) {
      return Array.isArray(tests.tests)
        ? tests.tests
        : [];
    }

    return [];
  } catch (error) {
    console.error(
      "UNABLE TO PARSE REGISTERED TESTS:",
      error
    );

    console.error(
      "Registration:",
      registration
    );

    return [];
  }
}

/* ==========================================================
   LOAD COMPLETE PATIENT
========================================================== */

export async function searchPatient(
  labNumber
) {
  const normalizedLabNumber =
    normalizeLabNumber(labNumber);

  if (!normalizedLabNumber) {
    return {
      patient: null,
      tests: [],
      error: null,
    };
  }

  const {
    data,
    error,
  } =
    await getPatientRegistration(
      normalizedLabNumber
    );

  /*
    Database/query error.
  */

  if (error) {
    return {
      patient: null,
      tests: [],
      error,
    };
  }

  /*
    Patient not found.
  */

  if (!data) {
    return {
      patient: null,
      tests: [],
      error: null,
    };
  }

  /*
    Extract registered tests.
  */

  const tests =
    getRegisteredTests(data);

  return {
    patient: data,
    tests,
    error: null,
  };
}

/* ==========================================================
   GET PATIENT BY LAB NUMBER
========================================================== */

export async function getPatient(
  labNumber
) {
  const {
    data,
    error,
  } =
    await getPatientRegistration(
      labNumber
    );

  if (error) {
    console.error(
      "GET PATIENT ERROR:",
      error
    );

    return null;
  }

  return data || null;
}

/* ==========================================================
   GET PATIENT BY ID
========================================================== */

export async function getPatientById(
  id
) {
  if (!id) {
    return {
      data: null,
      error: null,
    };
  }

  return await supabase
    .from("registrations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
}