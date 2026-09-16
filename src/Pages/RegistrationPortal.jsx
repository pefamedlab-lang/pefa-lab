/* ==========================================================
   PEFA LAB
   REGISTRATION PORTAL
   ----------------------------------------------------------
   PATH:
   src/Pages/RegistrationPortal.jsx

   PURPOSE:
   - Register Laboratory / Ultrasound patients
   - Generate registration numbers only on save
   - Create Laboratory Result records after successful
     laboratory registration
   - Create service order and service order items
   - Redirect to Payment Portal
   - SUPPORT TEST REQUEST → REGISTRATION PRE-POPULATION

   TEST REQUEST FLOW:

   Public Test Request
          ↓
   test_requests
          ↓
   Test Request Dashboard
          ↓
   Register Patient
          ↓
   RegistrationPortal
          ↓
   Patient information pre-populated
          ↓
   Staff reviews / edits
          ↓
   Save Registration
          ↓
   Existing PEFA registration workflow

   IMPORTANT:
   - Uses existing src/supabase.js
   - Uses existing laboratoryResultService
   - Does NOT modify ReferralDashboard
   - Does NOT create a duplicate patient-registration system
   - Test Request information is loaded using test_request_id
   ========================================================== */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Save, Loader2 } from "lucide-react";

import { supabase } from "../supabase";

import PatientInformation from "../components/Registration/PatientInformation";
import LaboratoryRegistrationPortal from "../components/Registration/LaboratoryRegistrationPortal";
import UltrasoundRegistrationPortal from "../components/Registration/UltrasoundRegistrationPortal";

import {
  createLaboratoryResultsFromRegistration,
} from "../services/laboratory/laboratoryResultService";

import "../styles/registration.css";
import "../styles/registrationPremium.css";


/* ==========================================================
   HELPERS
   ========================================================== */

const calculateAgeFromDob = (dob) => {
  if (!dob) return "";

  const birthDate = new Date(`${dob}T00:00:00`);

  if (Number.isNaN(birthDate.getTime())) {
    return "";
  }

  const today = new Date();

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const monthDifference =
    today.getMonth() -
    birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() < birthDate.getDate()
    )
  ) {
    age -= 1;
  }

  return age >= 0 && age <= 120
    ? age
    : "";
};


/* ==========================================================
   NORMALIZE TEST REQUEST TESTS
   ----------------------------------------------------------
   Public Test Request stores tests like:

   {
      id,
      test_name,
      test_code,
      department,
      test_type,
      result_type,
      is_panel,
      quantity
   }

   Registration Portal may use slightly different property
   names internally, so we preserve the public information and
   provide compatible aliases where useful.
   ========================================================== */

const normalizeRequestedTests = (
  requestedTests
) => {
  if (!Array.isArray(requestedTests)) {
    return [];
  }

  return requestedTests
    .map((test) => {
      const id = Number(
        test?.id ??
        test?.test_id
      );

      const testName =
        test?.test_name ??
        test?.name ??
        test?.test ??
        "";

      if (
        !Number.isFinite(id) ||
        !testName
      ) {
        return null;
      }

      const quantity =
        Number(test?.quantity || 1);

      return {
        id,

        test_id: id,

        test_name: testName,

        name: testName,

        test: testName,

        test_code:
          test?.test_code || "",

        code:
          test?.test_code || "",

        department:
          test?.department ||
          "Other",

        test_type:
          test?.test_type || "",

        result_type:
          test?.result_type || "",

        is_panel:
          Boolean(test?.is_panel),

        quantity:
          quantity > 0
            ? quantity
            : 1,

        /*
         * Test Request intentionally does not expose pricing
         * publicly.
         *
         * Existing Registration Portal / LaboratoryRegistrationPortal
         * remains responsible for resolving pricing where applicable.
         */
        price:
          Number(test?.price || 0),
      };
    })
    .filter(Boolean);
};


/* ==========================================================
   RESOLVE AUTHORITATIVE TEST PRICES
   ----------------------------------------------------------
   Public Test Request does not expose laboratory prices.
   The Registration Portal therefore resolves every requested
   test against the current master_tests catalogue.

   IMPORTANT:
   - Never trust a public/request-supplied price.
   - Preserve the existing selected-test structure.
   - Panels use panel_price.
   - Individual tests use single_test_price.
   ========================================================== */

const resolveTestPrices = async (tests = []) => {
  if (!Array.isArray(tests) || tests.length === 0) {
    return [];
  }

  const testIds = [
    ...new Set(
      tests
        .map((test) =>
          Number(
            test?.id ??
            test?.test_id ??
            0
          )
        )
        .filter(
          (id) =>
            Number.isInteger(id) && id > 0
        )
    ),
  ];

  if (testIds.length === 0) {
    throw new Error(
      "The requested laboratory tests could not be identified."
    );
  }

  const { data, error } = await supabase
    .from("master_tests")
    .select(`
      id,
      test_name,
      test_code,
      department,
      test_type,
      result_type,
      is_panel,
      single_test_price,
      panel_price,
      active_status,
      active,
      is_primary
    `)
    .in("id", testIds)
    .eq("active", true)
    .eq("active_status", "active");

  if (error) {
    throw error;
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(
      "Unable to resolve the requested laboratory tests from the current test catalogue."
    );
  }

  const catalogue = new Map(
    data.map((test) => [
      Number(test.id),
      test,
    ])
  );

  return tests.map((originalTest) => {
    const id = Number(
      originalTest?.id ??
      originalTest?.test_id ??
      0
    );

    const catalogueTest = catalogue.get(id);

    if (!catalogueTest) {
      throw new Error(
        `Requested test ID ${id} is no longer active or could not be found in the laboratory test catalogue.`
      );
    }

    const isPanel =
      Boolean(catalogueTest.is_panel) ||
      String(catalogueTest.test_type || "")
        .toLowerCase() === "panel";

    const price = isPanel
      ? Number(catalogueTest.panel_price ?? 0)
      : Number(catalogueTest.single_test_price ?? 0);

    if (!Number.isFinite(price) || price < 0) {
      throw new Error(
        `Invalid price configured for ${catalogueTest.test_name || "the requested test"}.`
      );
    }

    return {
      ...originalTest,
      id: catalogueTest.id,
      test_id: catalogueTest.id,
      test_name:
        catalogueTest.test_name ||
        originalTest.test_name ||
        originalTest.name ||
        "Laboratory Test",
      name:
        catalogueTest.test_name ||
        originalTest.name ||
        originalTest.test_name ||
        "Laboratory Test",
      test:
        catalogueTest.test_name ||
        originalTest.test ||
        originalTest.name ||
        "Laboratory Test",
      test_code:
        catalogueTest.test_code ||
        originalTest.test_code ||
        "",
      code:
        catalogueTest.test_code ||
        originalTest.code ||
        originalTest.test_code ||
        "",
      department:
        catalogueTest.department ||
        originalTest.department ||
        "Other",
      test_type:
        catalogueTest.test_type ||
        originalTest.test_type ||
        "",
      result_type:
        catalogueTest.result_type ||
        originalTest.result_type ||
        "",
      is_panel: Boolean(catalogueTest.is_panel),
      quantity:
        Number(originalTest.quantity || 1) > 0
          ? Number(originalTest.quantity || 1)
          : 1,
      price,
    };
  });
};


/* ==========================================================
   WELLNESS ORDER SUPPORT
   ========================================================== */

const TWO_PARTNER_WELLNESS_PACKAGES = new Set([
  "Basic Fertility Check",
  "Comprehensive Fertility",
  "Premium Pre-Marital Wellness Package",
  "Premium Fertility & Wellness",
]);

const UNAVAILABLE_WELLNESS_TERMS = [
  "pap smear",
  "x-ray",
  "x ray",
  "chest x-ray",
  "chest x ray",
];

const isUnavailableWellnessItem = (item) => {
  const name = String(
    item?.item_name ??
    item?.test_name ??
    item?.name ??
    ""
  )
    .trim()
    .toLowerCase();

  return UNAVAILABLE_WELLNESS_TERMS.some((term) =>
    name.includes(term)
  );
};

const requiresTwoWellnessPartners = (packageName) =>
  TWO_PARTNER_WELLNESS_PACKAGES.has(
    String(packageName || "").trim()
  );

/* ==========================================================
   EMPTY FORM
   ========================================================== */

const EMPTY_FORM = {
  patient_id: "",

  patient_name: "",
  dob: "",
  age: "",
  sex: "",
  branch: "",
  branch_number: "",
  phone: "",
  address: "",

  referral_id: "",
  referral_name: "",
  referral_code: "",
  referral_type: "",
  referral_contact: "",
  referral_phone: "",
  referral_commission_rate: 0,

  referring_doctor: "",
  clinical_history: "",

  registration_number: "",
  lab_number: "",

  access_code: "",

  // BILLING
  total_amount: 0,
  discount: 0,
  amount_paid: 0,
  balance: 0,
  payment_status: "Pending",

  tests: [],

  // ULTRASOUND
  scan_number: "",
  accession_code: "",

  scan_type: "",
  amount: 0,

  lmp: "",
};


/* ==========================================================
   COMPONENT
   ========================================================== */

export default function RegistrationPortal() {

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const navigate = useNavigate();

  const [
    searchParams,
  ] = useSearchParams();


  // ==========================================================
  // TEST REQUEST ID
  // ----------------------------------------------------------
  // Example:
  //
  // /registration?test_request_id=xxxxxxxx
  //
  // If there is no test_request_id, the page behaves normally.
  // ==========================================================

  const testRequestId =
    searchParams.get(
      "test_request_id"
    );

  const wellnessOrderId =
    searchParams.get(
      "wellness_order_id"
    );


  // ==========================================================
  // MODE
  // ==========================================================

  const [
    mode,
    setMode,
  ] = useState("Laboratory");


  // ==========================================================
  // SAVING
  // ==========================================================

  const [
    saving,
    setSaving,
  ] = useState(false);


  // ==========================================================
  // NUMBER LOADING
  // ==========================================================

  const [
    loadingNumbers,
    setLoadingNumbers,
  ] = useState(true);


  // ==========================================================
  // TEST REQUEST LOADING
  // ==========================================================

  const [
    loadingTestRequest,
    setLoadingTestRequest,
  ] = useState(
    Boolean(testRequestId)
  );


  // ==========================================================
  // TEST REQUEST
  // ==========================================================

  const [
    loadedTestRequest,
    setLoadedTestRequest,
  ] = useState(null);

  const [
    loadingWellnessOrder,
    setLoadingWellnessOrder,
  ] = useState(Boolean(wellnessOrderId));

  const [
    loadedWellnessOrder,
    setLoadedWellnessOrder,
  ] = useState(null);

  const [
    partnerForm,
    setPartnerForm,
  ] = useState(EMPTY_FORM);


  // ==========================================================
  // FORM
  // ==========================================================

  const [
    form,
    setForm,
  ] = useState(EMPTY_FORM);


  // ==========================================================
  // SELECTED TESTS
  // ==========================================================

  const [
    selectedTests,
    setSelectedTests,
  ] = useState([]);


  // ==========================================================
  // TEST REQUEST LOAD ERROR
  // ==========================================================

  const [
    testRequestError,
    setTestRequestError,
  ] = useState("");


  // ==========================================================
  // DOB → AGE
  // ==========================================================

  useEffect(() => {

    const dob = String(
      form.dob ??
      form.date_of_birth ??
      ""
    ).trim();

    if (!dob) {

      setForm((previous) =>
        previous.age === ""
          ? previous
          : {
              ...previous,
              age: "",
            }
      );

      return;
    }

    const calculatedAge =
      calculateAgeFromDob(dob);

    setForm((previous) => {

      const nextAge =
        calculatedAge === ""
          ? ""
          : String(calculatedAge);

      if (
        previous.dob === dob &&
        String(
          previous.age ?? ""
        ) === nextAge
      ) {
        return previous;
      }

      return {
        ...previous,
        dob,
        age: nextAge,
      };
    });

  }, [
    form.dob,
    form.date_of_birth,
  ]);


  // ==========================================================
  // LOAD TEST REQUEST
  // ----------------------------------------------------------
  // This is the bridge between:
  //
  // test_requests
  //        ↓
  // Registration Portal
  // ==========================================================

  useEffect(() => {

    if (!testRequestId) {
      setLoadingTestRequest(false);
      return;
    }

    let cancelled = false;

    const loadTestRequest =
      async () => {

        try {

          setLoadingTestRequest(true);
          setTestRequestError("");

          const {
            data,
            error,
          } = await supabase
            .from("test_requests")
            .select("*")
            .eq(
              "id",
              testRequestId
            )
            .maybeSingle();

          if (error) {
            throw error;
          }

          if (!data) {
            throw new Error(
              "The requested Test Request could not be found."
            );
          }

          if (
            data.status ===
              "Registered"
          ) {
            throw new Error(
              "This Test Request has already been registered."
            );
          }

          if (
            data.status ===
              "Rejected"
          ) {
            throw new Error(
              "This Test Request has been rejected and cannot be registered."
            );
          }

          if (
            data.status ===
              "Cancelled"
          ) {
            throw new Error(
              "This Test Request has been cancelled and cannot be registered."
            );
          }

          if (cancelled) {
            return;
          }

          setLoadedTestRequest(data);

          // ====================================================
          // DETERMINE SERVICE MODE
          // ====================================================

          const requestService =
            data.service_type ||
            "Laboratory";

          if (
            requestService ===
              "Laboratory" ||
            requestService ===
              "Ultrasound" ||
            requestService ===
              "Both"
          ) {
            setMode(
              requestService
            );
          }

          // ====================================================
          // REQUESTED TESTS
          // ====================================================

          const normalizedTests =
            normalizeRequestedTests(
              data.requested_tests
            );

          const pricedTests =
            normalizedTests.length > 0
              ? await resolveTestPrices(
                  normalizedTests
                )
              : [];

          setSelectedTests(
            pricedTests
          );

          // ====================================================
          // CLINICAL INFORMATION
          //
          // Registration Portal has a single clinical_history
          // field. We combine the Test Request's structured
          // clinical information into that existing field.
          //
          // No new registration-table columns are required.
          // ====================================================

          const clinicalSections = [];

          if (
            data.presenting_complaint
          ) {
            clinicalSections.push(
              `Presenting Complaint: ${data.presenting_complaint}`
            );
          }

          if (
            data.clinical_history
          ) {
            clinicalSections.push(
              `Clinical History: ${data.clinical_history}`
            );
          }

          if (
            data.provisional_diagnosis
          ) {
            clinicalSections.push(
              `Provisional Diagnosis: ${data.provisional_diagnosis}`
            );
          }

          if (
            data.relevant_medical_history
          ) {
            clinicalSections.push(
              `Relevant Medical History: ${data.relevant_medical_history}`
            );
          }

          if (
            data.current_medications
          ) {
            clinicalSections.push(
              `Current Medication/Treatment: ${data.current_medications}`
            );
          }

          if (
            data.pregnancy_status &&
            data.pregnancy_status !==
              "Not Applicable"
          ) {
            clinicalSections.push(
              `Pregnancy Status: ${data.pregnancy_status}`
            );
          }

          if (data.lmp) {
            clinicalSections.push(
              `LMP: ${data.lmp}`
            );
          }

          if (
            data.laboratory_clinical_notes
          ) {
            clinicalSections.push(
              `Laboratory Notes: ${data.laboratory_clinical_notes}`
            );
          }

          if (
            data.ultrasound_clinical_indication
          ) {
            clinicalSections.push(
              `Ultrasound Clinical Indication: ${data.ultrasound_clinical_indication}`
            );
          }

          if (
            data.fasting_status
          ) {
            clinicalSections.push(
              `Fasting Status: ${data.fasting_status}`
            );
          }

          if (
            data.last_meal_time
          ) {
            clinicalSections.push(
              `Last Meal Time: ${data.last_meal_time}`
            );
          }

          if (
            data.specimen_collected !==
            null &&
            data.specimen_collected !==
            undefined
          ) {
            clinicalSections.push(
              `Specimen Already Collected: ${
                data.specimen_collected
                  ? "Yes"
                  : "No"
              }`
            );
          }

          if (
            data.specimen_type
          ) {
            clinicalSections.push(
              `Specimen Type: ${data.specimen_type}`
            );
          }

          if (
            data.additional_notes
          ) {
            clinicalSections.push(
              `Additional Notes: ${data.additional_notes}`
            );
          }

          // ====================================================
          // PRE-POPULATE FORM
          // ====================================================

          setForm((previous) => ({
            ...previous,

            patient_name:
              data.patient_name ||
              "",

            dob:
              data.patient_dob ||
              "",

            age:
              data.patient_age !==
              null &&
              data.patient_age !==
              undefined
                ? String(
                    data.patient_age
                  )
                : "",

            sex:
              data.patient_sex ||
              "",

            phone:
              data.patient_phone ||
              data.requestor_phone ||
              "",

            address:
              data.patient_address ||
              "",

            referral_id:
              data.referral_id ||
              "",

            referral_name:
              data.referral_name ||
              "",

            referring_doctor:
              data.referring_doctor ||
              "",

            clinical_history:
              clinicalSections.join(
                "\n\n"
              ),

            tests:
              pricedTests,

            lmp:
              data.lmp || "",

            scan_type:
              Array.isArray(
                data.requested_scans
              ) &&
              data.requested_scans
                .length > 0
                ? (
                    data.requested_scans[0]
                      ?.scan_type ||
                    ""
                  )
                : "",
          }));

        } catch (error) {

          console.error(
            "loadTestRequest:",
            error
          );

          if (!cancelled) {
            setTestRequestError(
              error?.message ||
                "Unable to load the Test Request."
            );
          }

        } finally {

          if (!cancelled) {
            setLoadingTestRequest(
              false
            );
          }
        }
      };

    loadTestRequest();

    return () => {
      cancelled = true;
    };

  }, [
    testRequestId,
  ]);


  // ==========================================================
  // LOAD WELLNESS ORDER
  // ----------------------------------------------------------
  // Wellness orders are accepted from the Wellness Order
  // Dashboard and opened directly in this registration portal.
  // Partner packages display a second independent patient form.
  // ==========================================================

  useEffect(() => {
    if (!wellnessOrderId) {
      setLoadingWellnessOrder(false);
      return;
    }

    let cancelled = false;

    const loadWellnessOrder = async () => {
      try {
        setLoadingWellnessOrder(true);

        const { data, error } = await supabase
          .from("wellness_orders")
          .select("*")
          .eq("id", wellnessOrderId)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          throw new Error(
            "The requested Wellness Order could not be found."
          );
        }

        if (["Registered", "Completed", "Rejected", "Cancelled"].includes(data.status)) {
          throw new Error(
            `This Wellness Order is already ${String(data.status).toLowerCase()} and cannot be registered again.`
          );
        }

        if (cancelled) return;

        const rawItems = Array.isArray(data.included_items)
          ? data.included_items.filter(
              (item) => !isUnavailableWellnessItem(item)
            )
          : [];

        const testItems = rawItems.filter((item) => {
          const type = String(item?.item_type || "Test").toLowerCase();
          return type === "test" || Boolean(item?.master_test_id);
        });

        const testsWithIds = testItems
          .map((item) => ({
            ...item,
            id: Number(item?.master_test_id ?? item?.test_id ?? item?.id),
            test_id: Number(item?.master_test_id ?? item?.test_id ?? item?.id),
            test_name: item?.item_name ?? item?.test_name ?? item?.name ?? "",
            name: item?.item_name ?? item?.test_name ?? item?.name ?? "",
            quantity: Number(item?.quantity || 1) || 1,
          }))
          .filter((item) => Number.isInteger(item.id) && item.id > 0 && item.test_name);

        const pricedTests = testsWithIds.length
          ? await resolveTestPrices(testsWithIds)
          : [];

        if (cancelled) return;

        setLoadedWellnessOrder({
          ...data,
          included_items: rawItems,
        });

        setSelectedTests(pricedTests);

        setMode("Laboratory");

        const primaryForm = {
          ...EMPTY_FORM,
          patient_name: data.patient_name || "",
          dob: data.patient_dob || "",
          age: data.patient_age != null ? String(data.patient_age) : "",
          sex: data.patient_sex || "",
          phone: data.patient_phone || "",
          address: data.patient_address || "",
          referral_id: data.referral_id || "",
          referral_name: data.referral_name || "",
          referring_doctor: data.referring_doctor || "",
          clinical_history: data.additional_notes ||
            `Wellness Package: ${data.package_name || ""}`,
          tests: pricedTests,
        };

        setForm((previous) => ({
          ...previous,
          ...primaryForm,
        }));

        const storedPartner = data.partner_information?.partner_2 ||
          data.partner_information?.partner ||
          null;

        if (requiresTwoWellnessPartners(data.package_name)) {
          setPartnerForm({
            ...EMPTY_FORM,
            ...(storedPartner || {}),
            tests: pricedTests,
          });
        }
      } catch (error) {
        console.error("loadWellnessOrder:", error);
        if (!cancelled) {
          setTestRequestError(
            error?.message || "Unable to load the Wellness Order."
          );
        }
      } finally {
        if (!cancelled) setLoadingWellnessOrder(false);
      }
    };

    loadWellnessOrder();

    return () => {
      cancelled = true;
    };
  }, [wellnessOrderId]);


  // ==========================================================
  // CALCULATE LABORATORY TOTAL
  // ==========================================================

  useEffect(() => {

    const total =
      selectedTests.reduce(
        (
          sum,
          test
        ) => {

          const quantity =
            Number(
              test.quantity || 1
            );

          const price =
            Number(
              test.price || 0
            );

          return (
            sum +
            price *
              quantity
          );
        },
        0
      );

    const discount =
      Number(
        form.discount || 0
      );

    const paid =
      Number(
        form.amount_paid || 0
      );

    const calculatedBalance =
      total -
      discount -
      paid;

    let paymentStatus =
      "Pending";

    if (
      total > 0 &&
      calculatedBalance <= 0
    ) {
      paymentStatus = "Paid";
    } else if (
      paid > 0
    ) {
      paymentStatus =
        "Part Payment";
    }

    setForm((previous) => ({
      ...previous,

      tests:
        selectedTests,

      total_amount:
        total,

      balance:
        calculatedBalance < 0
          ? 0
          : calculatedBalance,

      payment_status:
        paymentStatus,
    }));

  }, [
    selectedTests,
    form.discount,
    form.amount_paid,
  ]);


  // ==========================================================
  // PREVIEW REGISTRATION NUMBERS
  // ==========================================================

  const loadRegistrationNumbers =
    async () => {

      try {

        setLoadingNumbers(
          true
        );

        const {
          data,
          error,
        } = await supabase.rpc(
          "peek_registration_numbers"
        );

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error(
            "No registration numbers were returned."
          );
        }

        const numbers =
          Array.isArray(data)
            ? data[0]
            : data;

        if (!numbers) {
          throw new Error(
            "Registration numbers could not be loaded."
          );
        }

        setForm((previous) => ({
          ...previous,

          patient_id:
            numbers.patient_id ??
            "",

          registration_number:
            numbers.registration_number ??
            "",

          lab_number:
            numbers.laboratory_number ??
            "",

          scan_number:
            numbers.scan_number ??
            "",

          access_code:
            numbers.access_code ??
            "",
        }));

        return numbers;

      } catch (error) {

        console.error(
          "loadRegistrationNumbers:",
          error
        );

        alert(
          error?.message ||
            "Unable to load registration numbers."
        );

        return null;

      } finally {

        setLoadingNumbers(
          false
        );
      }
    };


  // ==========================================================
  // PREVIEW BRANCH NUMBER
  // ==========================================================

  useEffect(() => {

    let cancelled = false;

    const loadBranchNumber =
      async () => {

        const branch =
          String(
            form.branch || ""
          ).trim();

        if (!branch) {

          setForm(
            (previous) => ({
              ...previous,
              branch_number:
                "",
            })
          );

          return;
        }

        try {

          const {
            data,
            error,
          } = await supabase.rpc(
            "peek_branch_number",
            {
              p_branch:
                branch,
            }
          );

          if (error) {
            throw error;
          }

          if (!cancelled) {

            setForm(
              (previous) => ({
                ...previous,
                branch_number:
                  data || "",
              })
            );
          }

        } catch (error) {

          console.error(
            "loadBranchNumber:",
            error
          );

          if (!cancelled) {

            setForm(
              (previous) => ({
                ...previous,
                branch_number:
                  "",
              })
            );
          }
        }
      };

    loadBranchNumber();

    return () => {
      cancelled = true;
    };

  }, [
    form.branch,
  ]);


  // ==========================================================
  // PAGE LOAD — PREVIEW NUMBERS ONLY
  // ==========================================================

  useEffect(() => {
    loadRegistrationNumbers();
  }, []);


  // ==========================================================
  // SAVE REGISTRATION
  // ==========================================================

  const handleSaveRegistration =
    async () => {

      if (saving) {
        return;
      }

      // ========================================================
      // DOB
      // ========================================================

      const patientDob =
        String(
          form.dob ??
          form.date_of_birth ??
          ""
        ).trim();

      if (!patientDob) {

        alert(
          "Date of birth is required."
        );

        return;
      }

      const calculatedAge =
        calculateAgeFromDob(
          patientDob
        );

      if (
        calculatedAge === ""
      ) {

        alert(
          "Please enter a valid date of birth."
        );

        return;
      }

      setForm(
        (previous) => ({
          ...previous,
          dob:
            patientDob,
          age:
            String(
              calculatedAge
            ),
        })
      );


      // ========================================================
      // MANDATORY INFORMATION
      // ========================================================

      const requiredFields = [

        [
          form.patient_name,
          "Patient name is required.",
        ],

        [
          form.branch,
          "Please select a branch.",
        ],

        [
          patientDob,
          "Date of birth is required.",
        ],

        [
          form.sex,
          "Please select patient sex.",
        ],

        [
          form.referral_id ||
            form.referral_name,
          "Please select a referral.",
        ],

        [
          form.referring_doctor,
          "Referring doctor is required.",
        ],

        [
          form.clinical_history,
          "Clinical history is required.",
        ],

      ];

      const missingField =
        requiredFields.find(
          ([value]) =>
            value === null ||
            value === undefined ||
            String(
              value
            ).trim() === ""
        );

      if (missingField) {

        alert(
          missingField[1]
        );

        return;
      }

      // ========================================================
      // WELLNESS PARTNER VALIDATION
      // ========================================================

      const twoPartnerWellness =
        wellnessOrderId &&
        loadedWellnessOrder &&
        requiresTwoWellnessPartners(
          loadedWellnessOrder.package_name
        );

      if (twoPartnerWellness) {
        const partnerDob = String(partnerForm.dob || "").trim();

        if (!partnerForm.patient_name?.trim()) {
          alert("Partner 2 name is required.");
          return;
        }

        if (!partnerDob) {
          alert("Partner 2 date of birth is required.");
          return;
        }

        const partnerAge = calculateAgeFromDob(partnerDob);
        if (partnerAge === "") {
          alert("Please enter a valid Partner 2 date of birth.");
          return;
        }

        if (!partnerForm.sex) {
          alert("Please select Partner 2 sex.");
          return;
        }
      }


      // ========================================================
      // LAB VALIDATION
      // ========================================================

      if (
        (
          mode ===
            "Laboratory" ||
          mode ===
            "Both"
        ) &&
        selectedTests.length ===
          0
      ) {

        alert(
          "Please select at least one laboratory test."
        );

        return;
      }


      // ========================================================
      // ULTRASOUND VALIDATION
      // ========================================================

      if (
        (
          mode ===
            "Ultrasound" ||
          mode ===
            "Both"
        ) &&
        !form.scan_type
      ) {

        alert(
          "Please select an ultrasound scan type."
        );

        return;
      }


      try {

        setSaving(true);

        // ======================================================
        // REFRESH AUTHORITATIVE LABORATORY PRICES
        // ------------------------------------------------------
        // Prices are always resolved from master_tests immediately
        // before registration. This protects the registration and
        // service order from stale or public/request-supplied prices.
        // ======================================================

        let finalSelectedTests =
          selectedTests;

        if (
          mode === "Laboratory" ||
          mode === "Both"
        ) {
          finalSelectedTests =
            await resolveTestPrices(
              selectedTests.filter(
                (test) => !isUnavailableWellnessItem(test)
              )
            );

          setSelectedTests(
            finalSelectedTests
          );

          setForm((previous) => ({
            ...previous,
            tests: finalSelectedTests,
          }));
        }


        // ======================================================
        // CONSUME REGISTRATION NUMBERS
        // ======================================================

        const {
          data,
          error,
        } = await supabase.rpc(
          "get_registration_numbers"
        );

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error(
            "Unable to generate registration numbers."
          );
        }

        const numbers =
          Array.isArray(data)
            ? data[0]
            : data;

        if (!numbers) {
          throw new Error(
            "Registration numbers could not be generated."
          );
        }


        // ======================================================
        // ASSIGNED NUMBERS
        // ======================================================

        const registrationNumber =
          numbers.registration_number;

        const patientId =
          numbers.patient_id;

        const laboratoryNumber =
          numbers.laboratory_number;

        const scanNumber =
          numbers.scan_number;

        const accessCode =
          numbers.access_code;


        const selectedBranch =
          String(
            form.branch || ""
          ).trim();

        if (!selectedBranch) {

          throw new Error(
            "Please select a branch."
          );
        }


        // ======================================================
        // CONSUME BRANCH NUMBER
        // ======================================================

        const {
          data:
            generatedBranchNumber,
          error:
            branchNumberError,
        } = await supabase.rpc(
          "generate_branch_number",
          {
            p_branch:
              selectedBranch,
          }
        );

        if (
          branchNumberError
        ) {
          throw branchNumberError;
        }

        if (
          !generatedBranchNumber
        ) {
          throw new Error(
            "Unable to generate the branch number."
          );
        }

        const branchNumber =
          generatedBranchNumber;


        if (!registrationNumber) {
          throw new Error(
            "Registration number was not generated."
          );
        }

        if (!patientId) {
          throw new Error(
            "Patient ID was not generated."
          );
        }


        // ======================================================
        // UPDATE DISPLAYED FORM
        // ======================================================

        setForm(
          (previous) => ({
            ...previous,

            patient_id:
              patientId,

            registration_number:
              registrationNumber,

            lab_number:
              laboratoryNumber ||
              "",

            branch_number:
              branchNumber ||
              "",

            scan_number:
              scanNumber ||
              "",

            access_code:
              accessCode ||
              "",
          })
        );


        // ======================================================
        // SERVICE ORDER VARIABLES
        // ======================================================

        let serviceType =
          "";

        let orderTotal =
          0;

        const orderItems =
          [];

        let createdRegistrationId =
          null;


        // ======================================================
        // LABORATORY
        // ======================================================

        if (
          mode ===
            "Laboratory" ||
          mode ===
            "Both"
        ) {

          const laboratorySubtotal =
            finalSelectedTests.reduce(
              (
                total,
                test
              ) => {

                const quantity =
                  Number(
                    test.quantity ||
                      1
                  );

                const price =
                  Number(
                    test.price ||
                      0
                  );

                return (
                  total +
                  price *
                    quantity
                );
              },
              0
            );


          // ====================================================
          // LAB REGISTRATION
          // ====================================================

          const labPayload = {

            registration_number:
              registrationNumber,

            patient_id:
              patientId,

            lab_number:
              laboratoryNumber ||
              null,

            access_code:
              accessCode ||
              null,

            full_name:
              form.patient_name.trim(),

            dob:
              patientDob,

            age:
              String(
                calculatedAge
              ),

            sex:
              form.sex,

            branch:
              form.branch.trim(),

            branch_number:
              branchNumber,

            phone:
              form.phone ||
              "",

            address:
              form.address ||
              "",

            clinical_history:
              form.clinical_history ||
              "",

            referring_doctor:
              form.referring_doctor ||
              "",

            referral_id:
              form.referral_id ||
              null,

            referral_name:
              form.referral_name ||
              "",

            tests:
              finalSelectedTests,

            total_amount:
              laboratorySubtotal,

            amount_paid:
              0,

            balance:
              laboratorySubtotal,

            discount:
              0,

            payment_status:
              "Unpaid",

            registration_status:
              "Registered",

            sample_status:
              "Pending",

            status:
              "Active",
          };


          const {
            data:
              labRegistration,
            error:
              labError,
          } = await supabase
            .from(
              "registrations"
            )
            .insert([
              labPayload,
            ])
            .select()
            .single();

          if (labError) {
            throw labError;
          }

          if (
            !labRegistration?.id
          ) {
            throw new Error(
              "Laboratory registration was created but no registration ID was returned."
            );
          }

          console.log(
            "Laboratory registration saved:",
            labRegistration
          );


          createdRegistrationId =
            labRegistration.id;


          // ====================================================
          // CREATE LABORATORY RESULT WORK QUEUE
          // ====================================================

          const
            createdLaboratoryResults =
            await createLaboratoryResultsFromRegistration(
              labRegistration
            );

          console.log(
            "Laboratory result records created:",
            createdLaboratoryResults
          );


          serviceType =
            mode === "Both"
              ? "Laboratory + Ultrasound"
              : "Laboratory";


          orderTotal +=
            laboratorySubtotal;


          // ====================================================
          // SERVICE ORDER LAB ITEMS
          // ====================================================

          finalSelectedTests.forEach(
            (test) => {

              const quantity =
                Number(
                  test.quantity ||
                    1
                );

              const unitPrice =
                Number(
                  test.price ||
                    0
                );

              orderItems.push({

                service_name:
                  test.name ||
                  test.test_name ||
                  test.test ||
                  "Laboratory Test",

                service_category:
                  "Laboratory",

                quantity,

                unit_price:
                  unitPrice,

                total_price:
                  unitPrice *
                  quantity,

              });
            }
          );
        }


        // ======================================================
        // ULTRASOUND
        // ======================================================

        if (
          mode ===
            "Ultrasound" ||
          mode ===
            "Both"
        ) {

          const ultrasoundAmount =
            Number(
              form.amount ||
                0
            );


          const ultrasoundPayload = {

            scan_number:
              scanNumber ||
              null,

            full_name:
              form.patient_name.trim(),

            dob:
              patientDob,

            age:
              String(
                calculatedAge
              ),

            sex:
              form.sex,

            phone:
              form.phone ||
              "",

            address:
              form.address ||
              "",

            scan_type:
              form.scan_type,

            clinical_information:
              form.clinical_history ||
              "",

            referring_doctor:
              form.referring_doctor ||
              "",

            access_code:
              accessCode ||
              null,

            amount:
              ultrasoundAmount,

            total_amount:
              ultrasoundAmount,

            amount_paid:
              0,

            balance:
              ultrasoundAmount,

            discount:
              0,

            payment_status:
              "Unpaid",

            payment_method:
              "",

            status:
              "Registered",

            priority:
              "Routine",

            notes:
              "",

            registered_by:
              "",

            branch:
              form.branch.trim(),

            branch_number:
              branchNumber,
          };


          const {
            data:
              ultrasoundRegistration,
            error:
              ultrasoundError,
          } = await supabase
            .from(
              "ultrasound_registrations"
            )
            .insert([
              ultrasoundPayload,
            ])
            .select()
            .single();

          if (
            ultrasoundError
          ) {
            throw ultrasoundError;
          }

          console.log(
            "Ultrasound registration saved:",
            ultrasoundRegistration
          );


          if (
            !createdRegistrationId
          ) {
            createdRegistrationId =
              ultrasoundRegistration.id;
          }


          serviceType =
            mode === "Both"
              ? "Laboratory + Ultrasound"
              : "Ultrasound";


          orderTotal +=
            ultrasoundAmount;


          orderItems.push({

            service_name:
              form.scan_type ||
              "Ultrasound Scan",

            service_category:
              "Ultrasound",

            quantity:
              1,

            unit_price:
              ultrasoundAmount,

            total_price:
              ultrasoundAmount,

          });
        }


        // ======================================================
        // WELLNESS PACKAGE BILLING OVERRIDE
        // ------------------------------------------------------
        // Wellness orders are sold at the published package price.
        // Do not bill the individual package tests again.
        // ======================================================

        if (
          wellnessOrderId &&
          loadedWellnessOrder
        ) {
          const packageAmount = Number(
            loadedWellnessOrder.amount || 0
          );

          if (!Number.isFinite(packageAmount) || packageAmount < 0) {
            throw new Error("Invalid Wellness Package amount.");
          }

          orderTotal = packageAmount;
          orderItems.length = 0;
          orderItems.push({
            service_name: loadedWellnessOrder.package_name || "Wellness Package",
            service_category: "Wellness Package",
            quantity: 1,
            unit_price: packageAmount,
            total_price: packageAmount,
          });

          serviceType = "Wellness Package";
        }


        // ======================================================
        // FINAL SERVICE VALIDATION
        // ======================================================

        if (
          orderItems.length ===
          0
        ) {
          throw new Error(
            "No services were added to this registration."
          );
        }

        if (
          orderTotal < 0
        ) {
          throw new Error(
            "Invalid registration total."
          );
        }


        // ======================================================
        // GENERATE SERVICE ORDER NUMBER
        // ======================================================

        const {
          data:
            orderNumber,
          error:
            orderNumberError,
        } = await supabase.rpc(
          "next_order_number"
        );

        if (
          orderNumberError
        ) {
          throw orderNumberError;
        }

        const generatedOrderNumber =
          Array.isArray(
            orderNumber
          )
            ? orderNumber[0]
            : orderNumber;

        if (
          !generatedOrderNumber
        ) {
          throw new Error(
            "Unable to generate service order number."
          );
        }


        // ======================================================
        // SERVICE ORDER
        // ======================================================

        const serviceOrderPayload = {

          order_number:
            generatedOrderNumber,

          patient_id:
            patientId,

          patient_name:
            form.patient_name.trim(),

          branch:
            form.branch.trim(),

          branch_number:
            branchNumber,

          lab_number:
            laboratoryNumber ||
            null,

          referral_id:
            form.referral_id ||
            null,

          referral_name:
            form.referral_name?.trim() ||
            null,

          referring_doctor:
            form.referring_doctor?.trim() ||
            null,

          clinical_history:
            form.clinical_history?.trim() ||
            null,

          service_type:
            serviceType,

          total_amount:
            orderTotal,

          amount_paid:
            0,

          balance:
            orderTotal,

          payment_status:
            "Pending",

          status:
            "Pending",
        };


        const {
          data:
            createdOrder,
          error:
            orderError,
        } = await supabase
          .from(
            "service_orders"
          )
          .insert([
            serviceOrderPayload,
          ])
          .select()
          .single();

        if (orderError) {
          throw orderError;
        }

        if (
          !createdOrder
        ) {
          throw new Error(
            "Service order was not created."
          );
        }

        if (
          !createdOrder.id
        ) {
          throw new Error(
            "Service order was created but no order ID was returned."
          );
        }


        // ======================================================
        // SERVICE ORDER ITEMS
        // ======================================================

        const itemsToInsert =
          orderItems.map(
            (item) => ({

              order_id:
                createdOrder.id,

              service_name:
                item.service_name,

              service_category:
                item.service_category,

              quantity:
                item.quantity,

              unit_price:
                item.unit_price,

              total_price:
                item.total_price,

            })
          );


        if (
          itemsToInsert.length >
          0
        ) {

          const {
            data:
              savedItems,
            error:
              itemsError,
          } = await supabase
            .from(
              "service_order_items"
            )
            .insert(
              itemsToInsert
            )
            .select();

          if (itemsError) {
            throw itemsError;
          }

          console.log(
            "Service order items created:",
            savedItems
          );
        }


        // ======================================================
        // UPDATE TEST REQUEST
        // ------------------------------------------------------
        // ONLY do this after registration and service order
        // have been successfully created.
        // ======================================================

        if (
          testRequestId
        ) {

          const {
            error:
              testRequestUpdateError,
          } = await supabase
            .from(
              "test_requests"
            )
            .update({

              status:
                "Registered",

              registered_at:
                new Date().toISOString(),

              registration_id:
                createdRegistrationId,

              registration_number:
                registrationNumber,

            })
            .eq(
              "id",
              testRequestId
            );

          if (
            testRequestUpdateError
          ) {
            /*
             * Registration has already succeeded.
             *
             * Do not throw here and make the user believe the
             * registration failed.
             *
             * Log the error for staff investigation.
             */
            console.warn(
              "Registration succeeded but Test Request status could not be updated:",
              testRequestUpdateError
            );
          } else {
            console.log(
              "Test Request marked as Registered:",
              testRequestId
            );
          }
        }


        // ======================================================
        // UPDATE WELLNESS ORDER
        // ------------------------------------------------------
        // Registration has succeeded. Mark the accepted wellness
        // order as Registered and retain Partner 2 information.
        // ======================================================

        if (wellnessOrderId && loadedWellnessOrder) {
          const partnerInformation =
            requiresTwoWellnessPartners(loadedWellnessOrder.package_name)
              ? {
                  required: true,
                  partner_1: {
                    patient_name: form.patient_name?.trim() || "",
                    phone: form.phone || "",
                    email: form.email || "",
                    dob: form.dob || "",
                    age: form.age || "",
                    sex: form.sex || "",
                    address: form.address || "",
                  },
                  partner_2: {
                    patient_name: partnerForm.patient_name?.trim() || "",
                    phone: partnerForm.phone || "",
                    email: partnerForm.email || "",
                    dob: partnerForm.dob || "",
                    age: partnerForm.age || "",
                    sex: partnerForm.sex || "",
                    address: partnerForm.address || "",
                  },
                }
              : null;

          const { error: wellnessUpdateError } = await supabase
            .from("wellness_orders")
            .update({
              status: "Registered",
              registered_at: new Date().toISOString(),
              registration_id: createdRegistrationId,
              registration_number: registrationNumber,
              ...(partnerInformation
                ? { partner_information: partnerInformation }
                : {}),
            })
            .eq("id", wellnessOrderId);

          if (wellnessUpdateError) {
            console.warn(
              "Registration succeeded but Wellness Order could not be updated:",
              wellnessUpdateError
            );
          }
        }


        // ======================================================
        // WHATSAPP NOTIFICATION
        // ======================================================

        try {

          const {
            data:
              whatsappData,
            error:
              whatsappError,
          } =
            await supabase.functions.invoke(
              "send-registration-whatsapp",
              {
                body: {

                  registration_id:
                    createdRegistrationId,

                  patient_name:
                    form.patient_name.trim(),

                  phone:
                    form.phone ||
                    "",

                  branch:
                    form.branch.trim(),

                  branch_number:
                    branchNumber,

                  registration_number:
                    registrationNumber,

                  lab_number:
                    laboratoryNumber ||
                    "",

                  access_code:
                    accessCode ||
                    "",

                  service_type:
                    serviceType,

                  tests:
                    finalSelectedTests.map(
                      (test) =>
                        test.name ||
                        test.test_name ||
                        test.test ||
                        "Laboratory Test"
                    ),
                },
              }
            );

          if (
            whatsappError
          ) {

            console.warn(
              "Registration saved, but WhatsApp notification failed:",
              whatsappError
            );

          } else {

            console.log(
              "WhatsApp registration notification:",
              whatsappData
            );
          }

        } catch (
          whatsappError
        ) {

          console.warn(
            "Registration saved, but WhatsApp notification could not be sent:",
            whatsappError
          );
        }


        // ======================================================
        // SUCCESS
        // ======================================================

        alert(
          testRequestId
            ? "Test Request successfully converted to a registration. Proceeding to payment."
            : wellnessOrderId
              ? "Wellness Order successfully converted to a registration. Proceeding to payment."
              : "Registration saved successfully. Proceeding to payment."
        );


        // ======================================================
        // PAYMENT
        // ======================================================

        const createdOrderId =
          createdOrder.id;

        navigate(
          `/payment-portal?order_id=${encodeURIComponent(
            createdOrderId
          )}`,
          {
            replace:
              true,
          }
        );

      } catch (error) {

        console.error(
          "Registration failed:",
          error
        );

        alert(
          error?.message ||
            "Unable to save registration."
        );

      } finally {

        setSaving(false);
      }
    };


  // ==========================================================
  // LOADING TEST REQUEST
  // ==========================================================

  if (
    loadingTestRequest ||
    loadingWellnessOrder
  ) {

    return (
      <div className="registration-page">

        <div className="registration-card">

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              gap: 10,
              padding: 40,
            }}
          >

            <Loader2
              size={22}
              className="spin"
            />

            <span>
              Loading Test Request...
            </span>

          </div>

        </div>

      </div>
    );
  }


  // ==========================================================
  // TEST REQUEST ERROR
  // ==========================================================

  if (
    (testRequestId || wellnessOrderId) &&
    testRequestError
  ) {

    return (
      <div className="registration-page">

        <div className="registration-card">

          <div
            style={{
              padding: 25,
              borderRadius: 10,
              background:
                "#fff1f1",
              border:
                "1px solid #e0a0a0",
              color:
                "#9d1c1c",
            }}
          >

            <h2>
              Unable to Load Test Request
            </h2>

            <p>
              {testRequestError}
            </p>

            <button
              type="button"
              className="primary-btn"
              onClick={() =>
                navigate(
                  -1
                )
              }
            >
              Go Back
            </button>

          </div>

        </div>

      </div>
    );
  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div className="registration-page">

      {/* ======================================================
          TEST REQUEST BANNER
      ======================================================= */}

      {testRequestId &&
        loadedTestRequest && (
          <div
            className="registration-card"
            style={{
              marginBottom:
                18,
              border:
                "1px solid #9bc8ea",
              background:
                "#f0f8ff",
            }}
          >

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                gap: 15,
                flexWrap:
                  "wrap",
              }}
            >

              <div>

                <strong
                  style={{
                    color:
                      "#0057b8",
                    display:
                      "block",
                    marginBottom:
                      5,
                  }}
                >
                  TEST REQUEST
                  REGISTRATION
                </strong>

                <div
                  style={{
                    fontSize:
                      14,
                    color:
                      "#29465e",
                  }}
                >
                  Request #
                  <strong>
                    {loadedTestRequest.request_number ||
                      loadedTestRequest.id}
                  </strong>
                </div>

                <div
                  style={{
                    marginTop:
                      5,
                    fontSize:
                      13,
                    color:
                      "#607889",
                  }}
                >
                  Patient:
                  {" "}
                  <strong>
                    {
                      loadedTestRequest.patient_name
                    }
                  </strong>
                </div>

              </div>

              <div
                style={{
                  padding:
                    "8px 13px",
                  borderRadius:
                    20,
                  background:
                    "#dff5e7",
                  color:
                    "#13773b",
                  fontSize:
                    12,
                  fontWeight:
                    800,
                }}
              >
                Information
                Pre-filled
              </div>

            </div>

            <p
              style={{
                margin:
                  "14px 0 0",
                fontSize:
                  12,
                color:
                  "#607889",
              }}
            >
              Patient, referral, clinical
              information and requested
              investigations have been
              loaded from the Test Request.
              Please review the information
              before saving the registration.
            </p>

          </div>
        )}


      {wellnessOrderId && loadedWellnessOrder && (
        <div
          className="registration-card"
          style={{
            marginBottom: 18,
            border: "1px solid #b9dfc5",
            background: "#f1fbf4",
          }}
        >
          <strong
            style={{
              color: "#13773b",
              display: "block",
              marginBottom: 5,
            }}
          >
            WELLNESS ORDER REGISTRATION
          </strong>
          <div style={{ fontSize: 14, color: "#29465e" }}>
            Order # <strong>{loadedWellnessOrder.order_number || loadedWellnessOrder.id}</strong>
          </div>
          <div style={{ marginTop: 5, fontSize: 14, color: "#29465e" }}>
            Package: <strong>{loadedWellnessOrder.package_name}</strong>
          </div>
          <p style={{ margin: "12px 0 0", fontSize: 12, color: "#607889" }}>
            Patient information and the available laboratory tests have been pre-filled from the accepted Wellness Order.
            Unavailable Pap Smear and X-Ray services are excluded.
          </p>
        </div>
      )}

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="registration-header">

        <div>

          <h1>
            Patient Registration
          </h1>

          <p>
            Enterprise Laboratory &
            Ultrasound Registration
            Portal
          </p>

        </div>

      </div>


      {/* ======================================================
          REGISTRATION TYPE
      ======================================================= */}

      <div className="registration-card">

        <div className="form-group">

          <label>
            Registration Type
          </label>

          <select
            value={mode}
            onChange={(event) =>
              setMode(
                event.target.value
              )
            }
            disabled={
              saving ||
              Boolean(testRequestId || wellnessOrderId)
            }
          >

            <option value="Laboratory">
              Laboratory
            </option>

            <option value="Ultrasound">
              Ultrasound
            </option>

            <option value="Both">
              Laboratory +
              Ultrasound
            </option>

          </select>

          {(testRequestId || wellnessOrderId) && (
            <small
              style={{
                display:
                  "block",
                marginTop:
                  6,
                color:
                  "#607889",
              }}
            >
              Registration type was determined from the incoming request/order.
            </small>
          )}

        </div>

      </div>


      {/* ======================================================
          LOADING NUMBERS
      ======================================================= */}

      {loadingNumbers && (

        <div className="registration-card">

          <p>
            Loading registration
            numbers...
          </p>

        </div>

      )}


      {/* ======================================================
          PATIENT INFORMATION
      ======================================================= */}

      <PatientInformation
        patient={form}
        setPatient={setForm}
        mode={mode}
      />

      {wellnessOrderId &&
        loadedWellnessOrder &&
        requiresTwoWellnessPartners(loadedWellnessOrder.package_name) && (
          <>
            <div
              className="registration-card"
              style={{
                marginTop: 18,
                marginBottom: 18,
                border: "1px solid #e3c66b",
                background: "#fffaf0",
              }}
            >
              <strong style={{ color: "#8a5b00" }}>
                PARTNER 2 / SECONDARY PATIENT
              </strong>
              <p style={{ margin: "8px 0 0", color: "#6b5b3e", fontSize: 13 }}>
                This package requires two different patients. Enter the second partner's information separately.
              </p>
            </div>

            <PatientInformation
              patient={partnerForm}
              setPatient={setPartnerForm}
              mode={mode}
            />
          </>
        )}


      {/* ======================================================
          LABORATORY
      ======================================================= */}

      {(
        mode === "Laboratory" ||
        mode === "Both"
      ) && (

        <LaboratoryRegistrationPortal
          form={form}
          setForm={setForm}
          selectedTests={
            selectedTests
          }
          setSelectedTests={
            setSelectedTests
          }
        />

      )}


      {/* ======================================================
          ULTRASOUND
      ======================================================= */}

      {(
        mode === "Ultrasound" ||
        mode === "Both"
      ) && (

        <UltrasoundRegistrationPortal
          form={form}
          setForm={setForm}
        />

      )}


      {/* ======================================================
          SAVE BUTTON
      ======================================================= */}

      <div
        style={{
          display:
            "flex",
          justifyContent:
            "flex-end",
          marginTop:
            30,
          marginBottom:
            40,
        }}
      >

        <button
          type="button"
          onClick={
            handleSaveRegistration
          }
          disabled={
            saving ||
            loadingNumbers ||
            loadingTestRequest ||
            loadingWellnessOrder
          }
          className="primary-btn"
          style={{
            minWidth:
              220,
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            gap: 8,
          }}
        >

          {saving ? (
            <>

              <Loader2
                size={18}
                className="spin"
              />

              Saving...

            </>
          ) : (
            <>

              <Save
                size={18}
              />

              Save Registration

            </>
          )}

        </button>

      </div>

    </div>
  );
}
