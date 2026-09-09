import { supabase } from "../supabaseClient";

/* ==========================================================
   GET CURRENT YEAR (26, 27, 28...)
========================================================== */

const getYear = () =>
  new Date().getFullYear().toString().slice(-2);

/* ==========================================================
   GENERATE NEXT NUMBER
========================================================== */

async function generateNextNumber(
  table,
  column,
  prefix
) {
  const year = getYear();

  const { data, error } = await supabase
    .from(table)
    .select(column)
    .ilike(column, `${prefix}${year}%`)
    .order(column, { ascending: false })
    .limit(1);

  if (error) throw error;

  let nextSerial = 1;

  if (data && data.length > 0) {
    const lastNumber = data[0][column];

    // Example:
    // LAB260057 -> 0057
    const serial = parseInt(
      lastNumber.replace(`${prefix}${year}`, ""),
      10
    );

    nextSerial = serial + 1;
  }

  return `${prefix}${year}${String(nextSerial).padStart(
    4,
    "0"
  )}`;
}

/* ==========================================================
   PATIENT ID
========================================================== */

export async function generatePatientId() {
  return generateNextNumber(
    "registrations",
    "patient_id",
    "PAT"
  );
}

/* ==========================================================
   LAB NUMBER
========================================================== */

export async function generateLabNumber() {
  return generateNextNumber(
    "registrations",
    "lab_number",
    "LAB"
  );
}

/* ==========================================================
   SCAN NUMBER
========================================================== */

export async function generateScanNumber() {
  return generateNextNumber(
    "ultrasound_registrations",
    "scan_number",
    "SCAN"
  );
}

/* ==========================================================
   RANDOM ACCESS CODE
========================================================== */

export function generateAccessCode(length = 6) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < length; i++) {
    code += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return code;
}