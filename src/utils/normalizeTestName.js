/* ======================================================
   NORMALIZE TEST NAMES
   PEFA Laboratory Information System
====================================================== */

export default function normalizeTestName(name = "") {

    const value = String(name)
        .trim()
        .toLowerCase()

        // Remove anything inside brackets
        // e.g.
        // Renal Function Test (RFT)
        // Lipid Profile (FLP)
        // Liver Function Test (LFT)
        .replace(/\(.*?\)/g, "")

        // Replace multiple spaces with one
        .replace(/\s+/g, " ")

        .trim();

    /* ===============================
       COMPLETE BLOOD COUNT
    =============================== */

    if (
        [
            "cbc",
            "fbc",
            "complete blood count",
            "full blood count",
        ].includes(value)
    ) {

        return "Complete Blood Count";

    }

    /* ===============================
       LIVER FUNCTION TEST
    =============================== */

    if (
        [
            "lft",
            "liver function test",
            "liver function tests",
            "liver profile",
            "hepatic profile",
            "hepatic function test",
        ].includes(value)
    ) {

        return "Liver Function Test";

    }

    /* ===============================
       RENAL FUNCTION TEST
    =============================== */

    if (
        [
            "rft",
            "kft",
            "eucr",
            "renal function test",
            "renal function tests",
            "renal profile",
            "kidney function test",
            "kidney function tests",
            "kidney profile",
            "electrolytes urea creatinine",
            "electrolyte urea creatinine",
        ].includes(value)
    ) {

        return "Renal Function Test";

    }

    /* ===============================
       FASTING LIPID PROFILE
    =============================== */

    if (
        [
            "flp",
            "fasting lipid profile",
            "lipid profile",
            "lipid panel",
            "serum lipid profile",
        ].includes(value)
    ) {

        return "Fasting Lipid Profile";

    }

    /* ===============================
       THYROID FUNCTION TEST
    =============================== */

    if (
        [
            "tft",
            "thyroid function test",
            "thyroid function tests",
            "thyroid profile",
            "thyroid panel",
        ].includes(value)
    ) {

        return "Thyroid Function Test";

    }

    /* ===============================
       DEFAULT
       Return cleaned name instead of
       original name.
    =============================== */

    return value;

}