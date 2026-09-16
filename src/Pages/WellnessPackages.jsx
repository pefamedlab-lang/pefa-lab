import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import "../styles/wellnessPackages.css";

/* ============================================================
   PEFA MEDICAL DIAGNOSTIC SERVICES
   WELLNESS PACKAGES

   PUBLIC WORKFLOW:
   Package Card
      -> Confirmation Modal
      -> Public Patient Information Modal
      -> wellness_orders (Pending)
      -> Success Message on this page

   Database contract:
   - wellness_orders.package_id is UUID NOT NULL.
   - wellness_orders.patient_address is nullable text.
   - wellness_orders.partner_information is nullable JSONB.

   Staff registration is intentionally NOT opened from this page.
   Staff accept the order from Wellness Order Dashboard, then
   continue through RegistrationPortal using wellness_order_id.

   IMPORTANT:
   - Pap Smear is NOT available and must never be displayed.
   - X-Ray / Chest X-Ray is NOT available and must never be displayed.
   - The following packages require TWO separate patient records:
       1. Comprehensive Pre-Marital Package
       2. Premium Pre-Marital Wellness Package
       3. Basic Fertility Check
       4. Comprehensive Fertility
       5. Premium Fertility & Wellness
   ============================================================ */

const UNAVAILABLE_SERVICES = [
  "pap smear",
  "pap smear — women",
  "pap smear - women",
  "x-ray",
  "x ray",
  "chest x-ray",
  "chest x ray",
  "chest radiograph",
  "radiograph",
];

const TWO_PARTNER_PACKAGES = [
  "Comprehensive Pre-Marital Package",
  "Premium Pre-Marital Wellness Package",
  "Basic Fertility Check",
  "Comprehensive Fertility",
  "Premium Fertility & Wellness",
];


/* ============================================================
   HELPERS
   ============================================================ */

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ");

const isUnavailableService = (itemName) => {
  const normalized = normalizeText(itemName);

  if (!normalized) return false;

  return UNAVAILABLE_SERVICES.some((service) => {
    const target = normalizeText(service);

    return (
      normalized === target ||
      normalized.includes(target)
    );
  });
};

const cleanPackageItems = (items) => {
  if (!Array.isArray(items)) return [];

  return items.filter((item) => {
    if (!item) return false;

    const itemName =
      typeof item === "string"
        ? item
        : item.item_name ||
          item.name ||
          item.test_name ||
          item.service_name ||
          "";

    return (
      itemName.trim() !== "" &&
      !isUnavailableService(itemName)
    );
  });
};

const requiresTwoPartners = (packageName) =>
  TWO_PARTNER_PACKAGES.some(
    (name) =>
      normalizeText(name) === normalizeText(packageName)
  );

/* ============================================================
   PUBLIC ORDER HELPERS
   ============================================================ */

const calculateAgeFromDob = (dob) => {
  if (!dob) return "";

  const birthDate = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return "";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age >= 0 && age <= 120 ? age : "";
};

const normalizeOrderItems = (items) =>
  cleanPackageItems(items).map((item, index) => {
    if (typeof item === "string") {
      return {
        item_name: item,
        item_type: "Test",
        department: "",
        master_test_id: null,
        display_order: index + 1,
      };
    }

    return {
      id: item?.id ?? null,
      item_name:
        item?.item_name ||
        item?.name ||
        item?.test_name ||
        item?.service_name ||
        "",
      item_type: item?.item_type || "Test",
      department: item?.department || "",
      master_test_id:
        item?.master_test_id ??
        item?.test_id ??
        null,
      display_order:
        item?.display_order ??
        index + 1,
    };
  });

/* ============================================================
   PACKAGE-SPECIFIC PREPARATION
   ============================================================ */

const getPackagePreparation = (pkg) => {
  const packageName = normalizeText(
    pkg?.package_name
  );

  /*
   * Specific preparation takes priority over whatever
   * generic preparation may currently exist in the database.
   */

  if (
    packageName ===
    normalizeText("Basic Wellness Package")
  ) {
    return "No fasting is required. Follow PEFA specimen-collection instructions.";
  }

  if (
    packageName ===
    normalizeText("Standard Wellness Package")
  ) {
    return "Fast for 8–12 hours before sample collection. Plain water is permitted. Avoid food and caloric drinks during the fasting period.";
  }

  if (
    packageName ===
    normalizeText("Premium Wellness Package")
  ) {
    return "Fast for 8–12 hours before sample collection. Plain water is permitted. Avoid food and caloric drinks during the fasting period.";
  }

  if (
    packageName ===
    normalizeText("Executive Wellness Package")
  ) {
    return "Fast for 8–12 hours before sample collection. Plain water is permitted. Avoid food and caloric drinks during the fasting period. Additional preparation may apply for abdominal ultrasound.";
  }

  if (
    packageName ===
    normalizeText("Pre-School Screening Package")
  ) {
    return "No routine fasting is required unless specifically requested by the laboratory or clinician. Follow PEFA instructions for specimen collection.";
  }

  if (
    packageName ===
    normalizeText("Pre-Employment Screening Package")
  ) {
    return "No routine fasting is required. Follow PEFA specimen-collection instructions and any additional instructions provided by the laboratory.";
  }

  if (
    packageName ===
    normalizeText("Premium Executive Employment Package")
  ) {
    return "No routine fasting is required unless specifically requested. Follow PEFA specimen-collection instructions and any additional instructions provided by the laboratory.";
  }

  if (
    packageName ===
    normalizeText("Basic Compatibility Package")
  ) {
    return "No fasting is required. Follow PEFA specimen-collection instructions.";
  }

  if (
    packageName ===
    normalizeText("Comprehensive Pre-Marital Package")
  ) {
    return "No routine fasting is required. Semen analysis requires 2–7 days of sexual abstinence. Additional preparation may apply for ultrasound and hormonal investigations.";
  }

  if (
    packageName ===
    normalizeText(
      "Premium Pre-Marital Wellness Package"
    )
  ) {
    return "Both partners should follow their individual preparation instructions. Fast for 8–12 hours before blood collection where fasting blood sugar is required. Plain water is permitted. Semen analysis requires 2–7 days of sexual abstinence.";
  }

  if (
    packageName ===
    normalizeText("Basic Fertility Check")
  ) {
    return "No routine fasting is required. Semen analysis requires 2–7 days of sexual abstinence. Hormonal investigations may require specific cycle-day timing. Follow PEFA instructions for pelvic ultrasound.";
  }

  if (
    packageName ===
    normalizeText("Comprehensive Fertility")
  ) {
    return "Both partners should follow their individual preparation instructions. Fasting for 8–12 hours is recommended where fasting blood sugar is required. Semen analysis requires 2–7 days of sexual abstinence. Hormonal investigations may require specific cycle-day timing.";
  }

  if (
    packageName ===
    normalizeText("Premium Fertility & Wellness")
  ) {
    return "Both partners should follow their individual preparation instructions. Fast for 8–12 hours where fasting blood sugar is required; plain water is permitted. Semen analysis requires 2–7 days of sexual abstinence. Hormonal investigations and pelvic ultrasound may require additional preparation.";
  }

  if (
    packageName ===
    normalizeText("Stroke Screening")
  ) {
    return "Fast for 8–12 hours before sample collection for fasting blood sugar and lipid profile. Plain water is permitted. Avoid food and caloric drinks during the fasting period.";
  }

  if (
    packageName ===
    normalizeText("Diabetes Screening")
  ) {
    return "Fast for 8–12 hours before sample collection for fasting blood sugar and lipid profile. Plain water is permitted. Avoid food and caloric drinks during the fasting period.";
  }

  if (
    packageName ===
    normalizeText("Kidney Disease Screening")
  ) {
    return "Fast for 8–12 hours before blood collection because fasting blood sugar is included. Plain water is permitted. Follow PEFA instructions for renal ultrasound.";
  }

  if (
    packageName ===
    normalizeText(
      "Food Handlers Medical Screening Package"
    )
  ) {
    return "No routine fasting is required. Follow PEFA specimen-collection instructions. Additional preparation will be provided if a fasting investigation is requested.";
  }

  if (
    packageName ===
    normalizeText(
      "House Help / Domestic Staff Screening Package"
    )
  ) {
    return "No routine fasting is required. Follow PEFA specimen-collection instructions. Additional preparation will be provided if a fasting investigation is requested.";
  }

  /*
   * If a future package is added without a specific rule,
   * preserve its database preparation instruction.
   */
  return (
    pkg?.preparation_instructions ||
    pkg?.preparation ||
    "Follow PEFA laboratory instructions before sample collection."
  );
};

/* ============================================================
   FALLBACK PACKAGE DATA

   Used only if the public RPC fails or returns no packages.
   The database remains the preferred source.
   ============================================================ */

const FALLBACK_PACKAGES = [
  {
    package_code: "BWP",
    package_name: "Basic Wellness Package",
    description:
      "Essential health screening for routine wellness assessment.",
    price: 25000,
    preparation_instructions:
      "No fasting is required. Follow PEFA specimen-collection instructions.",
    turnaround_time: "Same day / as applicable",
    items: [
      "Full Blood Count (FBC)",
      "Malaria Parasite",
      "Urinalysis",
      "Blood Group & Genotype",
      "Random Blood Sugar",
      "HIV Screening",
      "Counseling",
    ],
  },

  {
    package_code: "SWP",
    package_name: "Standard Wellness Package",
    description:
      "Comprehensive screening for general adult health assessment.",
    price: 60000,
    preparation_instructions:
      "Fast for 8–12 hours before sample collection. Plain water is permitted. Avoid food and caloric drinks during the fasting period.",
    turnaround_time: "Same day / as applicable",
    items: [
      "Full Blood Count (FBC)",
      "Malaria Parasite",
      "Urinalysis",
      "Blood Group & Genotype",
      "Fasting Blood Sugar",
      "Lipid Profile",
      "Liver Function Test",
      "Kidney Function Test",
      "HIV Screening",
      "Hepatitis B Screening",
      "Thyroid Profile (TSH)",
      "Counseling",
    ],
  },

  {
    package_code: "PWP",
    package_name: "Premium Wellness Package",
    description:
      "Advanced wellness screening covering major metabolic, cardiovascular and endocrine health markers.",
    price: 100000,
    preparation_instructions:
      "Fast for 8–12 hours before sample collection. Plain water is permitted. Avoid food and caloric drinks during the fasting period.",
    turnaround_time: "Same day / as applicable",
    items: [
      "Full Blood Count (FBC)",
      "Malaria Parasite",
      "Urinalysis",
      "Blood Group & Genotype",
      "Fasting Blood Sugar",
      "HbA1c",
      "Lipid Profile",
      "Liver Function Test",
      "Kidney Function Test",
      "Electrolytes (Na, K, Cl)",
      "Thyroid Profile (TSH, T3, T4)",
      "HIV Screening",
      "Hepatitis B Screening",
      "PSA — Men",
      "Counseling",
    ],
  },

  {
    package_code: "EWP",
    package_name: "Executive Wellness Package",
    description:
      "Expanded executive health assessment with cardiovascular, metabolic and ultrasound screening.",
    price: 130000,
    preparation_instructions:
      "Fast for 8–12 hours before sample collection. Plain water is permitted. Avoid food and caloric drinks during the fasting period. Additional preparation may apply for abdominal ultrasound.",
    turnaround_time: "Same day / as applicable",
    items: [
      "Full Blood Count (FBC)",
      "Malaria Parasite",
      "Urinalysis",
      "Blood Group & Genotype",
      "Fasting Blood Sugar",
      "HbA1c",
      "Lipid Profile",
      "Liver Function Test",
      "Kidney Function Test",
      "Electrolytes (Na, K, Cl)",
      "Thyroid Profile (TSH, T3, T4)",
      "HIV Screening",
      "Hepatitis B Screening",
      "PSA — Men",
      "Cardiac Risk Markers",
      "High Sensitivity CRP",
      "Uric Acid",
      "Abdominal Ultrasound",
      "Body Mass Index (BMI)",
      "Executive Counseling",
    ],
  },

  {
    package_code: "PSP",
    package_name: "Pre-School Screening Package",
    description:
      "Basic health screening for children before school admission.",
    price: 35000,
    preparation_instructions:
      "No routine fasting is required unless specifically requested by the laboratory or clinician. Follow PEFA instructions for specimen collection.",
    turnaround_time: "Same day / as applicable",
    items: [
      "Full Blood Count (FBC)",
      "Hepatitis B Screening",
      "Stool Microscopy",
      "Malaria Parasite",
      "Medical Fitness Assessment",
      "Blood Group & Genotype",
      "Urinalysis",
      "Mantoux Test",
      "Blood Sugar",
    ],
  },

  {
    package_code: "PESP",
    package_name: "Pre-Employment Screening Package",
    description:
      "Laboratory and medical screening for employment fitness assessment.",
    price: 85000,
    preparation_instructions:
      "No routine fasting is required. Follow PEFA specimen-collection instructions and any additional instructions provided by the laboratory.",
    turnaround_time: "Same day / as applicable",
    items: [
      "Full Blood Count (FBC)",
      "Urinalysis",
      "Stool Examination",
      "Blood Group & Genotype",
      "Hepatitis B & C Screening",
      "HIV 1 & 2 Screening",
      "Medical Fitness Report",
      "Drug Screening",
    ],
  },

  {
    package_code: "PEEP",
    package_name: "Premium Executive Employment Package",
    description:
      "Extended employment screening with endocrine, prostate and cardiovascular assessment.",
    price: 140000,
    preparation_instructions:
      "No routine fasting is required unless specifically requested. Follow PEFA specimen-collection instructions and any additional instructions provided by the laboratory.",
    turnaround_time: "Same day / as applicable",
    items: [
      "Full Blood Count (FBC)",
      "Urinalysis",
      "Stool Examination",
      "Blood Group & Genotype",
      "Hepatitis B & C Screening",
      "HIV 1 & 2 Screening",
      "Medical Fitness Report",
      "Drug Screening",
      "Thyroid Profile",
      "PSA — Men",
      "Cardiac Risk Markers",
      "Consultation & Results Review",
    ],
  },

  {
    package_code: "FHP",
    package_name: "Food Handlers Medical Screening Package",
    description:
      "Essential laboratory and medical screening for food handlers and food-service personnel.",
    price: 22200,
    preparation_instructions:
      "No routine fasting is required. Follow PEFA specimen-collection instructions. Additional preparation will be provided if a fasting investigation is requested.",
    turnaround_time: "Same day / next working day",
    items: [
      "Full Blood Count (FBC)",
      "Malaria Parasite",
      "Urinalysis",
      "Stool Examination",
      "Hepatitis B Screening",
      "Hepatitis C Screening",
      "HIV Screening",
      "Medical Fitness Assessment",
    ],
  },

  {
    package_code: "HHP",
    package_name: "House Help / Domestic Staff Screening Package",
    description:
      "Comprehensive health screening for domestic staff and household workers.",
    price: 25100,
    preparation_instructions:
      "No routine fasting is required. Follow PEFA specimen-collection instructions. Additional preparation will be provided if a fasting investigation is requested.",
    turnaround_time: "Same day / next working day",
    items: [
      "Full Blood Count (FBC)",
      "Malaria Parasite",
      "Urinalysis",
      "Stool Examination",
      "Hepatitis B Screening",
      "Hepatitis C Screening",
      "HIV Screening",
      "Blood Group",
      "Genotype",
      "Medical Fitness Assessment",
    ],
  },

  {
    package_code: "BCP",
    package_name: "Basic Compatibility Package",
    description:
      "Essential compatibility screening for couples.",
    price: 25000,
    preparation_instructions:
      "No fasting is required. Follow PEFA specimen-collection instructions.",
    turnaround_time: "Same day / as applicable",
    items: [
      "Blood Group (ABO)",
      "Genotype (Hb Electrophoresis)",
      "HIV Screening (I & II)",
      "Hepatitis Screening (HBsAg & HCV)",
      "VDRL / Syphilis Screening",
    ],
  },

 {
  package_code: "CPMP",
  package_name: "Comprehensive Pre-Marital Package",
  description:
    "Expanded premarital health and fertility screening for both partners.",
  price: 110000,
  two_partners: true,
    preparation_instructions:
      "No routine fasting is required. Semen analysis requires 2–7 days of sexual abstinence. Additional preparation may apply for ultrasound and hormonal investigations.",
    turnaround_time: "Same day / as applicable",
    items: [
      "Basic Compatibility Package",
      "Semen Analysis",
      "Hormonal Assays — Men",
      "Hormonal Profile — Women",
      "Pelvic Ultrasound Scan — Women",
      "Infection Screening — Women",
      "Urinalysis",
    ],
  },

  {
    package_code: "PPMW",
    package_name: "Premium Pre-Marital Wellness Package",
    description:
      "Comprehensive premarital wellness assessment for both partners.",
    price: 180000,
    preparation_instructions:
      "Both partners should follow their individual preparation instructions. Fast for 8–12 hours before blood collection where fasting blood sugar is required. Plain water is permitted. Semen analysis requires 2–7 days of sexual abstinence.",
    turnaround_time: "Same day / as applicable",
    two_partners: true,
    items: [
      "Comprehensive Pre-Marital Package",
      "Full Blood Count (FBC)",
      "Fasting Blood Sugar",
      "Liver Function Test",
      "Kidney Function Test",
      "Thyroid Profile (TSH, T3, T4)",
      "Expert Counseling & Results Review",
    ],
  },

  {
    package_code: "BFC",
    package_name: "Basic Fertility Check",
    description:
      "Initial fertility assessment designed for both male and female partners.",
    price: 50000,
    preparation_instructions:
      "No routine fasting is required. Semen analysis requires 2–7 days of sexual abstinence. Hormonal investigations may require specific cycle-day timing. Follow PEFA instructions for pelvic ultrasound.",
    turnaround_time: "Same day / as applicable",
    two_partners: true,
    items: [
      "Men: Semen Analysis",
      "Men: Urinalysis",
      "Men: Infection Screening",
      "Women: Hormonal Profile (FSH, LH, Prolactin)",
      "Women: Pelvic Ultrasound",
      "Women: Urinalysis",
    ],
  },

  {
    package_code: "CF",
    package_name: "Comprehensive Fertility",
    description:
      "Detailed fertility investigation for both male and female partners.",
    price: 130000,
    preparation_instructions:
      "Both partners should follow their individual preparation instructions. Fasting for 8–12 hours is recommended where fasting blood sugar is required. Semen analysis requires 2–7 days of sexual abstinence. Hormonal investigations may require specific cycle-day timing.",
    turnaround_time: "Same day / as applicable",
    two_partners: true,
    items: [
      "Men: Semen Analysis",
      "Men: Hormonal Assays (Testosterone, FSH, LH, Prolactin)",
      "Men: Infection Screening",
      "Women: Full Hormonal Profile (FSH, LH, Prolactin, Progesterone, Estradiol)",
      "Women: Pelvic Ultrasound",
      "Women: Infection Screening",
      "Blood Sugar",
      "Thyroid Profile (TSH)",
    ],
  },

  {
    package_code: "PFW",
    package_name: "Premium Fertility & Wellness",
    description:
      "Advanced fertility and wellness assessment for both partners.",
    price: 170000,
    preparation_instructions:
      "Both partners should follow their individual preparation instructions. Fast for 8–12 hours where fasting blood sugar is required; plain water is permitted. Semen analysis requires 2–7 days of sexual abstinence. Hormonal investigations and pelvic ultrasound may require additional preparation.",
    turnaround_time: "Same day / as applicable",
    two_partners: true,
    items: [
      "All Comprehensive Fertility Package Investigations",
      "AMH",
      "Full Blood Count (FBC)",
      "Liver Function Test",
      "Kidney Function Test",
      "Hepatitis B & C",
      "HIV",
      "Advanced Infection Screening",
      "Expert Fertility Counseling",
      "Results Review",
    ],
  },

  {
    package_code: "SSP",
    package_name: "Stroke Screening",
    description:
      "Screening package for major laboratory and cardiovascular stroke risk factors.",
    price: 45000,
    preparation_instructions:
      "Fast for 8–12 hours before sample collection for fasting blood sugar and lipid profile. Plain water is permitted. Avoid food and caloric drinks during the fasting period.",
    turnaround_time: "Same day / as applicable",
    items: [
      "BP Check",
      "Fasting Blood Sugar",
      "Lipid Profile",
      "ECG",
      "Full Blood Count (FBC)",
      "Urea",
      "Electrolytes",
      "Creatinine",
      "Liver Function Test",
      "BMI & Consultation",
    ],
  },

  {
    package_code: "DSP",
    package_name: "Diabetes Screening",
    description:
      "Laboratory screening for diabetes and associated metabolic risk factors.",
    price: 40000,
    preparation_instructions:
      "Fast for 8–12 hours before sample collection for fasting blood sugar and lipid profile. Plain water is permitted. Avoid food and caloric drinks during the fasting period.",
    turnaround_time: "Same day / as applicable",
    items: [
      "Fasting Blood Sugar",
      "Random Blood Sugar",
      "HbA1c",
      "Lipid Profile",
      "Urea",
      "Electrolytes",
      "Creatinine",
      "Liver Function Test",
      "Urinalysis",
      "BMI & Consultation",
    ],
  },

  {
    package_code: "KDSP",
    package_name: "Kidney Disease Screening",
    description:
      "Comprehensive assessment of renal function and kidney disease risk.",
    price: 35000,
    preparation_instructions:
      "Fast for 8–12 hours before blood collection because fasting blood sugar is included. Plain water is permitted. Follow PEFA instructions for renal ultrasound.",
    turnaround_time: "Same day / as applicable",
    items: [
      "Urea",
      "Creatinine & eGFR",
      "Electrolytes (Sodium, Potassium, Chloride, Bicarbonate)",
      "Urinalysis",
      "Full Blood Count (FBC)",
      "BP Check",
      "Fasting Blood Sugar",
      "Renal Ultrasound (KUB)",
      "Consultation & Risk Assessment",
    ],
  },
];

/* ============================================================
   CURRENT WELLNESS PACKAGE UUIDS
   ------------------------------------------------------------
   These IDs match the public.wellness_packages table.
   They are used only as a safe fallback when the public RPC
   returns a package without its UUID.
   ============================================================ */

const WELLNESS_PACKAGE_IDS = {
  BWP: "ee002d2d-fe1e-4bcc-a877-2257dad90611",
  SWP: "37756b30-113a-4add-841b-32de81bc6256",
  PWP: "7c9a3e8a-6dac-401c-8ed6-7cdff0ed885c",
  EWP: "b8c25c12-f8ea-4be3-875a-59e8c46770ca",
  PSP: "cd290b79-5ba1-42c2-b598-1a738710b478",
  PESP: "51e84196-22ca-4cab-8f65-53c156f7846c",
  PEEP: "ea8b9eb8-149c-4bc1-879e-66cd48cf5c70",
  BCP: "f6d2c3da-fc29-4c3c-8709-dc6b62b2c8b0",
  CPMP: "02dba5c9-1ac6-47c7-9985-c0e751b437ff",
  PPMW: "3d222a4d-de58-4908-bc91-134fb5f4bf04",
  BFC: "4cb37286-e2d7-44b0-9d15-acb102ace875",
  CF: "b88412e8-ff82-429a-8be7-056e655ed853",
  PFW: "84eb2d36-982c-42b7-b880-99d5f06a7c84",
  SSP: "d0fec48b-d62a-4b8d-a6e2-6bc5a1ffcc16",
  DSP: "6ef757e6-c13e-4897-9619-62f70e4915fb",
  KDSP: "7bff7926-45e2-4687-ae04-28d5657d6e8d",
  FHP: "83cbc63c-19c2-4451-b0ae-f95bcc300142",
  HHP: "6ae46d48-6055-4b2f-982e-13c0899f8c61",
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getKnownPackageId = (pkg) => {
  if (pkg?.id && UUID_PATTERN.test(String(pkg.id))) {
    return String(pkg.id);
  }

  if (pkg?.package_code && WELLNESS_PACKAGE_IDS[pkg.package_code]) {
    return WELLNESS_PACKAGE_IDS[pkg.package_code];
  }

  return null;
};

/* ============================================================
   COMPONENT
   ============================================================ */

export default function WellnessPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);

  const [showPatientForm, setShowPatientForm] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderSubmitError, setOrderSubmitError] = useState("");

  const [patientForm, setPatientForm] = useState({
    patient_name: "",
    patient_dob: "",
    patient_sex: "",
    patient_phone: "",
    patient_email: "",
    patient_address: "",
    preferred_date: "",
    additional_notes: "",
  });

  const [partnerForm, setPartnerForm] = useState({
    patient_name: "",
    patient_dob: "",
    patient_sex: "",
    patient_phone: "",
    patient_email: "",
    patient_address: "",
  });

  /* ============================================================
     LOAD PUBLIC WELLNESS PACKAGES
     ============================================================ */

  useEffect(() => {
    let mounted = true;

    const loadPackages = async () => {
      try {
        setLoading(true);
        setError("");

        const { data, error: rpcError } =
          await supabase.rpc(
            "get_public_wellness_packages"
          );

        if (rpcError) {
          throw rpcError;
        }

        if (!mounted) return;

        const sourcePackages =
          Array.isArray(data) && data.length > 0
            ? data
            : FALLBACK_PACKAGES;

        const cleanedPackages =
          sourcePackages.map((pkg) => {
            const rawItems =
              Array.isArray(pkg.items)
                ? pkg.items
                : Array.isArray(pkg.included_items)
                ? pkg.included_items
                : [];

            return {
              ...pkg,

              // The order table requires the package UUID.
              id: getKnownPackageId(pkg),

              items: cleanPackageItems(rawItems),

              /*
               * Always calculate preparation from the actual
               * package name so old generic DB text cannot
               * continue appearing on the public page.
               */
              preparation_instructions:
                getPackagePreparation(pkg),

              two_partners:
                Boolean(pkg.two_partners) ||
                requiresTwoPartners(
                  pkg.package_name
                ),
            };
          });

        setPackages(cleanedPackages);
      } catch (loadError) {
        console.error(
          "Unable to load wellness packages:",
          loadError
        );

        if (!mounted) return;

        /*
         * Keep the page usable if the public RPC temporarily
         * fails. The fallback catalogue is still filtered.
         */
        setError(
          "Unable to load the latest wellness packages. Showing the available package catalogue."
        );

        setPackages(
          FALLBACK_PACKAGES.map((pkg) => ({
            ...pkg,
            id: getKnownPackageId(pkg),
            items: cleanPackageItems(pkg.items),
            preparation_instructions:
              getPackagePreparation(pkg),
            two_partners:
              Boolean(pkg.two_partners) ||
              requiresTwoPartners(
                pkg.package_name
              ),
          }))
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPackages();

    return () => {
      mounted = false;
    };
  }, []);

  /* ============================================================
     GROUP PACKAGES
     ============================================================ */

  const packageGroups = useMemo(() => {
    const groups = [
      {
        title: "Wellness Screening",
        names: [
          "Basic Wellness Package",
          "Standard Wellness Package",
          "Premium Wellness Package",
          "Executive Wellness Package",
        ],
      },

      {
        title: "Employment Screening",
        names: [
          "Pre-School Screening Package",
          "Pre-Employment Screening Package",
          "Premium Executive Employment Package",
        ],
      },

      {
        title: "Occupational & Domestic Screening",
        names: [
          "Food Handlers Medical Screening Package",
          "House Help / Domestic Staff Screening Package",
        ],
      },

      {
        title: "Pre-Marital & Compatibility",
        names: [
          "Basic Compatibility Package",
          "Comprehensive Pre-Marital Package",
          "Premium Pre-Marital Wellness Package",
        ],
      },

      {
        title: "Fertility Screening",
        names: [
          "Basic Fertility Check",
          "Comprehensive Fertility",
          "Premium Fertility & Wellness",
        ],
      },

      {
        title: "Specialized Screening",
        names: [
          "Stroke Screening",
          "Diabetes Screening",
          "Kidney Disease Screening",
        ],
      },
    ];

    return groups
      .map((group) => ({
        ...group,

        packages: group.names
          .map((name) =>
            packages.find(
              (pkg) =>
                normalizeText(
                  pkg.package_name
                ) === normalizeText(name)
            )
          )
          .filter(Boolean),
      }))
      .filter(
        (group) => group.packages.length > 0
      );
  }, [packages]);

  /* ============================================================
     OPEN ORDER
     ============================================================ */

  const handleOrder = (pkg) => {
    setSelectedPackage(pkg);
    setShowOrderForm(true);
  };

  /* ============================================================
     OPEN PUBLIC PATIENT INFORMATION FORM
     ============================================================ */

  const openPatientForm = () => {
    setOrderSubmitError("");
    setOrderSubmitted(false);
    setShowOrderForm(false);
    setShowPatientForm(true);
  };

  /* ============================================================
     FORM FIELD HELPERS
     ============================================================ */

  const updatePatientField = (field, value) => {
    setPatientForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updatePartnerField = (field, value) => {
    setPartnerForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* ============================================================
     SUBMIT PUBLIC WELLNESS ORDER
     ------------------------------------------------------------
     IMPORTANT:
     - Insert only. No public select is performed after insert.
     - New requests always enter the staff queue as Pending.
     - Two-partner packages store two independent patient records.
     ============================================================ */

  const submitWellnessOrder = async (event) => {
    event.preventDefault();

    if (!selectedPackage || submittingOrder) return;

    setOrderSubmitError("");

    const primaryName = patientForm.patient_name.trim();
    const primaryDob = patientForm.patient_dob.trim();
    const primarySex = patientForm.patient_sex.trim();
    const primaryPhone = patientForm.patient_phone.trim();

    if (!primaryName || !primaryDob || !primarySex || !primaryPhone) {
      setOrderSubmitError(
        "Please complete the required Partner 1 / Primary Patient information."
      );
      return;
    }

    const primaryAge = calculateAgeFromDob(primaryDob);
    if (primaryAge === "") {
      setOrderSubmitError("Please provide a valid date of birth for Partner 1.");
      return;
    }

    const twoPartners =
      Boolean(selectedPackage.two_partners) ||
      requiresTwoPartners(selectedPackage.package_name);

    let partnerInformation = null;

    if (twoPartners) {
      const secondaryName = partnerForm.patient_name.trim();
      const secondaryDob = partnerForm.patient_dob.trim();
      const secondarySex = partnerForm.patient_sex.trim();
      const secondaryPhone = partnerForm.patient_phone.trim();

      if (
        !secondaryName ||
        !secondaryDob ||
        !secondarySex ||
        !secondaryPhone
      ) {
        setOrderSubmitError(
          "Please complete the required Partner 2 / Secondary Patient information."
        );
        return;
      }

      const secondaryAge = calculateAgeFromDob(secondaryDob);
      if (secondaryAge === "") {
        setOrderSubmitError("Please provide a valid date of birth for Partner 2.");
        return;
      }

      partnerInformation = {
        partner_1: {
          patient_name: primaryName,
          patient_dob: primaryDob,
          patient_age: primaryAge,
          patient_sex: primarySex,
          patient_phone: primaryPhone,
          patient_email: patientForm.patient_email.trim(),
          patient_address: patientForm.patient_address.trim(),
        },
        partner_2: {
          patient_name: secondaryName,
          patient_dob: secondaryDob,
          patient_age: secondaryAge,
          patient_sex: secondarySex,
          patient_phone: secondaryPhone,
          patient_email: partnerForm.patient_email.trim(),
          patient_address: partnerForm.patient_address.trim(),
        },
      };
    }

    try {
      setSubmittingOrder(true);

      /*
       * wellness_orders.package_id is UUID NOT NULL.
       * Prefer the UUID returned by the public RPC. If the RPC
       * response does not contain it, use the known package code
       * mapping. As a final fallback, resolve the UUID directly
       * from wellness_packages by package code/name.
       */
      let packageId = getKnownPackageId(selectedPackage);

      if (!packageId) {
        const packageLookup = supabase
          .from("wellness_packages")
          .select("id")
          .eq(
            "package_name",
            selectedPackage.package_name
          )
          .limit(1)
          .maybeSingle();

        const {
          data: packageRow,
          error: packageLookupError,
        } = await packageLookup;

        if (!packageLookupError && packageRow?.id) {
          packageId = packageRow.id;
        }
      }

      if (!packageId || !UUID_PATTERN.test(String(packageId))) {
        throw new Error(
          "Unable to identify the selected wellness package. Please refresh the page and try again."
        );
      }

      const payload = {
        package_id: packageId,
        patient_name: primaryName,
        patient_phone: primaryPhone,
        patient_email: patientForm.patient_email.trim() || null,
        patient_sex: primarySex,
        patient_dob: primaryDob,
        patient_age: primaryAge,
        patient_address: patientForm.patient_address.trim() || null,
        preferred_date: patientForm.preferred_date || null,
        package_name: selectedPackage.package_name,
        amount: Number(selectedPackage.price || 0),
        payment_status: "Pending",
        status: "Pending",
        submitted_at: new Date().toISOString(),
        included_items: normalizeOrderItems(selectedPackage.items || []),
        additional_notes: patientForm.additional_notes.trim() || null,
      };

      if (partnerInformation) {
        payload.partner_information = partnerInformation;
      }

      console.log("PEFA Wellness Order Package ID:", packageId);

      const { error: insertError } = await supabase
        .from("wellness_orders")
        .insert(payload);

      if (insertError) {
        throw insertError;
      }

      setOrderSubmitted(true);
    } catch (submitError) {
      console.error("Unable to submit wellness order:", submitError);
      setOrderSubmitError(
        submitError?.message ||
          "Unable to submit your wellness request. Please try again."
      );
    } finally {
      setSubmittingOrder(false);
    }
  };

  /* ============================================================
     CLOSE ORDER / PATIENT MODALS
     ============================================================ */

  const resetOrderState = () => {
    if (submittingOrder) return;

    setShowOrderForm(false);
    setShowPatientForm(false);
    setSelectedPackage(null);
    setOrderSubmitted(false);
    setOrderSubmitError("");

    setPatientForm({
      patient_name: "",
      patient_dob: "",
      patient_sex: "",
      patient_phone: "",
      patient_email: "",
      patient_address: "",
      preferred_date: "",
      additional_notes: "",
    });

    setPartnerForm({
      patient_name: "",
      patient_dob: "",
      patient_sex: "",
      patient_phone: "",
      patient_email: "",
      patient_address: "",
    });
  };

  const closeOrderModal = resetOrderState;
  const closePatientModal = resetOrderState;

  /* ============================================================
     RENDER PACKAGE CARD
     ============================================================ */

  const renderPackageCard = (pkg) => {
    const items = cleanPackageItems(
      pkg.items || []
    );

    const twoPartners =
      Boolean(pkg.two_partners) ||
      requiresTwoPartners(pkg.package_name);

    const preparation =
      getPackagePreparation(pkg);

    return (
      <article
        key={
          pkg.id ||
          pkg.package_code ||
          pkg.package_name
        }
        className="wellness-package-card"
      >
        <div className="wellness-package-card-header">
          <div>
            <h3>{pkg.package_name}</h3>

            {pkg.package_code && (
              <span className="wellness-package-code">
                {pkg.package_code}
              </span>
            )}
          </div>

          <div className="wellness-package-price">
            ₦
            {Number(
              pkg.price || 0
            ).toLocaleString()}
          </div>
        </div>

        {pkg.description && (
          <p className="wellness-package-description">
            {pkg.description}
          </p>
        )}

        {twoPartners && (
          <div className="wellness-two-partner-badge">
            <strong>2-PARTNER PACKAGE</strong>

            <span>
              Separate patient information and
              registration are required for both
              partners.
            </span>
          </div>
        )}

        <div className="wellness-package-items">
          <h4>Package Includes</h4>

          {items.length > 0 ? (
            <ul>
              {items.map((item, index) => {
                const itemName =
                  typeof item === "string"
                    ? item
                    : item.item_name ||
                      item.name ||
                      item.test_name ||
                      item.service_name ||
                      "";

                /*
                 * Second protection layer:
                 * unavailable services can never render,
                 * even if returned from the database.
                 */
                if (
                  !itemName ||
                  isUnavailableService(itemName)
                ) {
                  return null;
                }

                return (
                  <li
                    key={
                      item.id ||
                      `${itemName}-${index}`
                    }
                  >
                    <span className="wellness-check">
                      ✓
                    </span>

                    <span>{itemName}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>
              Package investigations will be confirmed
              during registration.
            </p>
          )}
        </div>

        {preparation && (
          <div className="wellness-preparation">
            <strong>Preparation:</strong>

            <span>{preparation}</span>
          </div>
        )}

        {pkg.turnaround_time && (
          <div className="wellness-turnaround">
            <strong>Turnaround:</strong>

            <span>
              {pkg.turnaround_time}
            </span>
          </div>
        )}

        <button
          type="button"
          className="wellness-order-btn"
          onClick={() => handleOrder(pkg)}
        >
          Order This Package
        </button>
      </article>
    );
  };

  /* ============================================================
     LOADING
     ============================================================ */

  if (loading) {
    return (
      <main className="wellness-packages-page">
        <section className="wellness-packages-hero">
          <div className="wellness-packages-container">
            <div className="wellness-loading">
              Loading wellness packages...
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* ============================================================
     PAGE
     ============================================================ */

  return (
    <main className="wellness-packages-page">

      {/* ======================================================
          HERO
      ======================================================= */}

      <section className="wellness-packages-hero">
        <div className="wellness-packages-container">
          <div className="wellness-hero-content">

            <span className="wellness-eyebrow">
              PEFA MEDICAL DIAGNOSTIC SERVICES
            </span>

            <h1>
              Wellness & Health Screening Packages
            </h1>

            <p>
              Take charge of your health with
              comprehensive laboratory and diagnostic
              screening packages designed for
              individuals, families, couples and
              organizations.
            </p>

          </div>
        </div>
      </section>

      {/* ======================================================
          ERROR / FALLBACK NOTICE
      ======================================================= */}

      {error && (
        <div className="wellness-packages-container">
          <div className="wellness-alert">
            {error}
          </div>
        </div>
      )}

      {/* ======================================================
          PACKAGES
      ======================================================= */}

      <section className="wellness-packages-section">
        <div className="wellness-packages-container">

          {packageGroups.map((group) => (
            <section
              key={group.title}
              className="wellness-package-group"
            >
              <div className="wellness-group-heading">
                <h2>{group.title}</h2>
              </div>

              <div className="wellness-package-grid">
                {group.packages.map(
                  renderPackageCard
                )}
              </div>
            </section>
          ))}

        </div>
      </section>

      {/* ======================================================
          IMPORTANT NOTE
      ======================================================= */}

      <section className="wellness-important-note">
        <div className="wellness-packages-container">

          <div className="wellness-note-box">

            <h3>Important Information</h3>

            <p>
              Package investigations are subject to
              availability and clinical appropriateness.
              Please follow the preparation instructions
              provided by PEFA Medical Diagnostic
              Services.
            </p>

            <p>
              For packages requiring two partners, each
              partner will have a separate patient
              information and registration record.
            </p>

          </div>

        </div>
      </section>

      {/* ======================================================
          PACKAGE CONFIRMATION MODAL
          ------------------------------------------------------
          Continue opens the public patient information form.
          It NEVER opens RegistrationPortal.
      ======================================================= */}

      {showOrderForm && selectedPackage && (
        <div
          className="wellness-order-modal-backdrop"
          onClick={closeOrderModal}
        >
          <div
            className="wellness-order-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="wellness-modal-close"
              onClick={closeOrderModal}
              aria-label="Close"
            >
              ×
            </button>

            <h2>{selectedPackage.package_name}</h2>

            <div className="wellness-modal-price">
              ₦{Number(selectedPackage.price || 0).toLocaleString()}
            </div>

            {(
              selectedPackage.two_partners ||
              requiresTwoPartners(selectedPackage.package_name)
            ) && (
              <div className="wellness-two-partner-notice">
                <strong>This package requires two partners.</strong>
                <p>
                  You will provide separate patient information for Partner 1
                  and Partner 2 in the next step. PEFA staff will register
                  each partner separately after the request is accepted.
                </p>
              </div>
            )}

            <p>
              Click Continue to provide the patient information required to
              submit this wellness package request.
            </p>

            <button
              type="button"
              className="wellness-order-confirm-btn"
              onClick={openPatientForm}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          PUBLIC PATIENT INFORMATION MODAL
      ======================================================= */}

      {showPatientForm && selectedPackage && (
        <div
          className="wellness-order-modal-backdrop"
          onClick={submittingOrder ? undefined : closePatientModal}
        >
          <div
            className="wellness-order-modal wellness-patient-form-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {!submittingOrder && (
              <button
                type="button"
                className="wellness-modal-close"
                onClick={closePatientModal}
                aria-label="Close"
              >
                ×
              </button>
            )}

            {orderSubmitted ? (
              <div className="wellness-order-success">
                <div className="wellness-order-success-icon">✓</div>
                <h2>Request Successfully Submitted</h2>
                <p>
                  Your <strong>{selectedPackage.package_name}</strong> request
                  has been submitted successfully.
                </p>
                <p>
                  PEFA Medical Diagnostic Services will review the request and
                  proceed with registration and payment arrangements.
                </p>
                <button
                  type="button"
                  className="wellness-order-confirm-btn"
                  onClick={closePatientModal}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submitWellnessOrder}>
                <h2>Patient Information</h2>

                <div className="wellness-form-package-summary">
                  <strong>{selectedPackage.package_name}</strong>
                  <span>
                    ₦{Number(selectedPackage.price || 0).toLocaleString()}
                  </span>
                </div>

                <p className="wellness-form-required-note">
                  Fields marked with * are required.
                </p>

                <section className="wellness-public-form-section">
                  <h3>Partner 1 / Primary Patient</h3>

                  <div className="wellness-public-form-grid">
                    <label>
                      Full Name *
                      <input
                        type="text"
                        value={patientForm.patient_name}
                        onChange={(event) =>
                          updatePatientField("patient_name", event.target.value)
                        }
                        required
                        autoComplete="name"
                      />
                    </label>

                    <label>
                      Date of Birth *
                      <input
                        type="date"
                        value={patientForm.patient_dob}
                        onChange={(event) =>
                          updatePatientField("patient_dob", event.target.value)
                        }
                        required
                      />
                    </label>

                    <label>
                      Sex *
                      <select
                        value={patientForm.patient_sex}
                        onChange={(event) =>
                          updatePatientField("patient_sex", event.target.value)
                        }
                        required
                      >
                        <option value="">Select sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </label>

                    <label>
                      Phone Number *
                      <input
                        type="tel"
                        value={patientForm.patient_phone}
                        onChange={(event) =>
                          updatePatientField("patient_phone", event.target.value)
                        }
                        required
                        autoComplete="tel"
                      />
                    </label>

                    <label>
                      Email Address
                      <input
                        type="email"
                        value={patientForm.patient_email}
                        onChange={(event) =>
                          updatePatientField("patient_email", event.target.value)
                        }
                        autoComplete="email"
                      />
                    </label>

                    <label>
                      Preferred Appointment Date
                      <input
                        type="date"
                        value={patientForm.preferred_date}
                        onChange={(event) =>
                          updatePatientField("preferred_date", event.target.value)
                        }
                      />
                    </label>

                    <label className="wellness-public-form-full">
                      Address
                      <textarea
                        value={patientForm.patient_address}
                        onChange={(event) =>
                          updatePatientField("patient_address", event.target.value)
                        }
                        rows={2}
                        autoComplete="street-address"
                      />
                    </label>

                    <label className="wellness-public-form-full">
                      Additional Notes
                      <textarea
                        value={patientForm.additional_notes}
                        onChange={(event) =>
                          updatePatientField("additional_notes", event.target.value)
                        }
                        rows={3}
                        placeholder="Optional information for PEFA staff"
                      />
                    </label>
                  </div>
                </section>

                {(
                  selectedPackage.two_partners ||
                  requiresTwoPartners(selectedPackage.package_name)
                ) && (
                  <section className="wellness-public-form-section wellness-partner-two-section">
                    <h3>Partner 2 / Secondary Patient</h3>
                    <p>
                      Enter the second partner's own information. Do not repeat
                      Partner 1 details.
                    </p>

                    <div className="wellness-public-form-grid">
                      <label>
                        Full Name *
                        <input
                          type="text"
                          value={partnerForm.patient_name}
                          onChange={(event) =>
                            updatePartnerField("patient_name", event.target.value)
                          }
                          required
                          autoComplete="name"
                        />
                      </label>

                      <label>
                        Date of Birth *
                        <input
                          type="date"
                          value={partnerForm.patient_dob}
                          onChange={(event) =>
                            updatePartnerField("patient_dob", event.target.value)
                          }
                          required
                        />
                      </label>

                      <label>
                        Sex *
                        <select
                          value={partnerForm.patient_sex}
                          onChange={(event) =>
                            updatePartnerField("patient_sex", event.target.value)
                          }
                          required
                        >
                          <option value="">Select sex</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </label>

                      <label>
                        Phone Number *
                        <input
                          type="tel"
                          value={partnerForm.patient_phone}
                          onChange={(event) =>
                            updatePartnerField("patient_phone", event.target.value)
                          }
                          required
                          autoComplete="tel"
                        />
                      </label>

                      <label>
                        Email Address
                        <input
                          type="email"
                          value={partnerForm.patient_email}
                          onChange={(event) =>
                            updatePartnerField("patient_email", event.target.value)
                          }
                          autoComplete="email"
                        />
                      </label>

                      <label>
                        Address
                        <textarea
                          value={partnerForm.patient_address}
                          onChange={(event) =>
                            updatePartnerField("patient_address", event.target.value)
                          }
                          rows={2}
                          autoComplete="street-address"
                        />
                      </label>
                    </div>
                  </section>
                )}

                {orderSubmitError && (
                  <div className="wellness-alert wellness-order-submit-error">
                    {orderSubmitError}
                  </div>
                )}

                <div className="wellness-public-form-actions">
                  <button
                    type="button"
                    className="wellness-modal-secondary-btn"
                    onClick={() => {
                      if (!submittingOrder) {
                        setShowPatientForm(false);
                        setShowOrderForm(true);
                        setOrderSubmitError("");
                      }
                    }}
                    disabled={submittingOrder}
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    className="wellness-order-confirm-btn"
                    disabled={submittingOrder}
                  >
                    {submittingOrder ? "Submitting..." : "Save & Submit Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </main>
  );
}