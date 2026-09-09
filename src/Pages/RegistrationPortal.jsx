/* ==========================================================
   PEFA LAB
   REGISTRATION PORTAL
   ----------------------------------------------------------
   PATH:
   src/pages/RegistrationPortal.jsx

   PURPOSE:
   - Register Laboratory / Ultrasound patients
   - Generate registration numbers only on save
   - Create Laboratory Result records immediately after
     successful laboratory registration
   - Create service order and service order items
   - Redirect to Payment Portal

   LABORATORY FLOW:

   Registration
        ↓
   registrations
        ↓
   laboratory_results
        ↓
   LaboratoryResultEntry.jsx
        ↓
   Entered
        ↓
   LaboratoryResultDashboard.jsx
        ↓
   Verify → Authorize → Release

   IMPORTANT:
   - Fresh implementation
   - Uses ../../services/laboratory/laboratoryResultService
   - No old ResultDashboard
   - No old ResultEntry
   - No old testService
   - No old resultService
   ========================================================== */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Loader2 } from "lucide-react";

import { supabase } from "../supabase";

import PatientInformation from "../components/Registration/PatientInformation";
import LaboratoryRegistrationPortal from "../components/Registration/LaboratoryRegistrationPortal";
import UltrasoundRegistrationPortal from "../components/Registration/UltrasoundRegistrationPortal";

import {
  createLaboratoryResultsFromRegistration,
} from "../services/laboratory/laboratoryResultService";

import "../styles/registration.css";

const calculateAgeFromDob = (dob) => {
  if (!dob) return "";

  const birthDate = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return "";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age >= 0 && age <= 120 ? age : "";
};

export default function RegistrationPortal() {
  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const navigate = useNavigate();

  // ==========================================================
  // MODE
  // ==========================================================

  const [mode, setMode] = useState("Laboratory");

  const [saving, setSaving] = useState(false);

  const [loadingNumbers, setLoadingNumbers] =
    useState(true);

  // ==========================================================
  // EMPTY FORM
  // ==========================================================

  const emptyForm = {
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

  const [form, setForm] = useState(emptyForm);

  const [selectedTests, setSelectedTests] =
    useState([]);

  // ==========================================================
  // DOB → AGE
  // ----------------------------------------------------------
  // Keep age synchronized in the parent registration state.
  // This intentionally does NOT depend on the child component's
  // formatted age value.
  // ==========================================================
  useEffect(() => {
    const dob = String(form.dob ?? form.date_of_birth ?? "").trim();

    if (!dob) {
      setForm((previous) =>
        previous.age === ""
          ? previous
          : { ...previous, age: "" }
      );
      return;
    }

    const calculatedAge = calculateAgeFromDob(dob);

    setForm((previous) => {
      const nextAge = calculatedAge === "" ? "" : String(calculatedAge);

      if (
        previous.dob === dob &&
        String(previous.age ?? "") === nextAge
      ) {
        return previous;
      }

      return {
        ...previous,
        dob,
        age: nextAge,
      };
    });
  }, [form.dob, form.date_of_birth]);

  // ==========================================================
  // CALCULATE LABORATORY TOTAL
  // ==========================================================

  useEffect(() => {
    const total = selectedTests.reduce(
      (sum, test) => {
        const quantity = Number(
          test.quantity || 1
        );

        const price = Number(
          test.price || 0
        );

        return sum + price * quantity;
      },
      0
    );

    const discount = Number(
      form.discount || 0
    );

    const paid = Number(
      form.amount_paid || 0
    );

    const calculatedBalance =
      total - discount - paid;

    let paymentStatus = "Pending";

    if (
      total > 0 &&
      calculatedBalance <= 0
    ) {
      paymentStatus = "Paid";
    } else if (paid > 0) {
      paymentStatus = "Part Payment";
    }

    setForm((previous) => ({
      ...previous,

      tests: selectedTests,

      total_amount: total,

      balance:
        calculatedBalance < 0
          ? 0
          : calculatedBalance,

      payment_status: paymentStatus,
    }));
  }, [
    selectedTests,
    form.discount,
    form.amount_paid,
  ]);

  // ==========================================================
  // PREVIEW AUTO NUMBERS
  //
  // IMPORTANT:
  // This function DOES NOT consume numbers.
  //
  // It calls:
  // peek_registration_numbers()
  //
  // NOT:
  // get_registration_numbers()
  // ==========================================================

  const loadRegistrationNumbers =
    async () => {
      try {
        setLoadingNumbers(true);

        const {
          data,
          error,
        } = await supabase.rpc(
          "peek_registration_numbers"
        );

        if (error) {
          throw error;
        }

        console.log(
          "Preview registration numbers:",
          data
        );

        if (!data) {
          throw new Error(
            "No registration numbers were returned."
          );
        }

        const numbers = Array.isArray(data)
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
        setLoadingNumbers(false);
      }
    };

  // ==========================================================
  // PREVIEW BRANCH NUMBER
  // ----------------------------------------------------------
  // Branch numbers are independent counters. Selecting a branch
  // previews its next number without consuming it.
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const loadBranchNumber = async () => {
      const branch = String(form.branch || "").trim();

      if (!branch) {
        setForm((previous) => ({
          ...previous,
          branch_number: "",
        }));
        return;
      }

      try {
        const { data, error } = await supabase.rpc(
          "peek_branch_number",
          { p_branch: branch }
        );

        if (error) throw error;

        if (!cancelled) {
          setForm((previous) => ({
            ...previous,
            branch_number: data || "",
          }));
        }
      } catch (error) {
        console.error("loadBranchNumber:", error);

        if (!cancelled) {
          setForm((previous) => ({
            ...previous,
            branch_number: "",
          }));
        }
      }
    };

    loadBranchNumber();

    return () => {
      cancelled = true;
    };
  }, [form.branch]);

  // ==========================================================
  // PAGE LOAD
  //
  // IMPORTANT:
  // ONLY PREVIEW NUMBERS HERE.
  //
  // NO NUMBER IS CONSUMED.
  // ==========================================================

  useEffect(() => {
    loadRegistrationNumbers();
  }, []);

  // ==========================================================
  // SAVE REGISTRATION
  // ==========================================================

  const handleSaveRegistration =
    async () => {
      // ========================================================
      // PREVENT DOUBLE SUBMISSION
      // ========================================================

      if (saving) {
        return;
      }

      // ========================================================
      // BASIC VALIDATION
      // ========================================================

      // ========================================================
      // DOB / AGE NORMALIZATION
      // --------------------------------------------------------
      // PatientInformation writes to `dob`, but we also accept
      // `date_of_birth` defensively so this save routine remains
      // compatible with any existing form state.
      // ========================================================

      const patientDob = String(
        form.dob ?? form.date_of_birth ?? ""
      ).trim();

      if (!patientDob) {
        alert("Date of birth is required.");
        return;
      }

      const calculatedAge =
        calculateAgeFromDob(patientDob);

      if (calculatedAge === null) {
        alert(
          "Please enter a valid date of birth. DOB cannot be in the future and must represent an age between 0 and 120 years."
        );
        return;
      }

      // Keep the visible form synchronized, but DO NOT depend on
      // this asynchronous state update for the database payload.
      setForm((previous) => ({
        ...previous,
        dob: patientDob,
        age: calculatedAge,
      }));

      // ========================================================
      // MANDATORY PATIENT / REFERRAL INFORMATION
      // ========================================================

      const requiredFields = [
        [form.patient_name, "Patient name is required."],
        [form.branch, "Please select a branch."],
        [patientDob, "Date of birth is required."],
        [form.sex, "Please select patient sex."],
        [
          form.referral_id || form.referral_name,
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

      const missingField = requiredFields.find(
        ([value]) =>
          value === null ||
          value === undefined ||
          String(value).trim() === ""
      );

      if (missingField) {
        alert(missingField[1]);
        return;
      }

      if (calculatedAge === "") {
        alert("Please enter a valid date of birth.");
        return;
      }

      // Keep the visible form synchronized immediately.
      setForm((previous) => ({
        ...previous,
        dob: patientDob,
        age: String(calculatedAge),
      }));

      // ========================================================
      // LAB VALIDATION
      // ========================================================

      if (
        (
          mode === "Laboratory" ||
          mode === "Both"
        ) &&
        selectedTests.length === 0
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
          mode === "Ultrasound" ||
          mode === "Both"
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
        // GENERATE / CONSUME NUMBERS
        //
        // IMPORTANT:
        // This is the ONLY frontend call to
        // get_registration_numbers().
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

        const numbers = Array.isArray(data)
          ? data[0]
          : data;

        if (!numbers) {
          throw new Error(
            "Registration numbers could not be generated."
          );
        }

        console.log(
          "Assigned registration numbers:",
          numbers
        );

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

        const selectedBranch = String(
          form.branch || ""
        ).trim();

        if (!selectedBranch) {
          throw new Error("Please select a branch.");
        }

        // Branch number is consumed only during a real save.
        const {
          data: generatedBranchNumber,
          error: branchNumberError,
        } = await supabase.rpc(
          "generate_branch_number",
          { p_branch: selectedBranch }
        );

        if (branchNumberError) {
          throw branchNumberError;
        }

        if (!generatedBranchNumber) {
          throw new Error(
            "Unable to generate the branch number."
          );
        }

        const branchNumber = generatedBranchNumber;

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

        setForm((previous) => ({
          ...previous,

          patient_id:
            patientId,

          registration_number:
            registrationNumber,

          lab_number:
            laboratoryNumber || "",

          branch_number:
            branchNumber || "",

          scan_number:
            scanNumber || "",

          access_code:
            accessCode || "",
        }));

        // ======================================================
        // SERVICE ORDER VARIABLES
        // ======================================================

        let serviceType = "";

        let orderTotal = 0;

        const orderItems = [];

        let createdRegistrationId = null;

        // ======================================================
        // LABORATORY
        // ======================================================

        if (
          mode === "Laboratory" ||
          mode === "Both"
        ) {
          const laboratorySubtotal =
            selectedTests.reduce(
              (total, test) => {
                const quantity =
                  Number(
                    test.quantity || 1
                  );

                const price =
                  Number(
                    test.price || 0
                  );

                return (
                  total +
                  price * quantity
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
              laboratoryNumber || null,

            access_code:
              accessCode || null,

            full_name:
              form.patient_name.trim(),

            dob:
              patientDob,

            age:
              String(calculatedAge),

            sex:
              form.sex,

            branch:
              form.branch.trim(),

            branch_number:
              branchNumber,

            phone:
              form.phone || "",

            address:
              form.address || "",

            clinical_history:
              form.clinical_history || "",

            referring_doctor:
              form.referring_doctor || "",

            referral_id:
              form.referral_id || null,

            referral_name:
              form.referral_name || "",

            tests:
              selectedTests,

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
            .from("registrations")
            .insert([
              labPayload,
            ])
            .select()
            .single();

          if (labError) {
            throw labError;
          }

          if (!labRegistration?.id) {
            throw new Error(
              "Laboratory registration was created but no registration ID was returned."
            );
          }

          console.log(
            "Laboratory registration saved:",
            labRegistration
          );

          createdRegistrationId = labRegistration.id;

          // ====================================================
          // CREATE LABORATORY RESULT WORK QUEUE
          //
          // registrations
          //       ↓
          // laboratory_results
          //       ↓
          // LaboratoryResultEntry.jsx
          // ====================================================

          const createdLaboratoryResults =
            await createLaboratoryResultsFromRegistration(
              labRegistration
            );

          console.log(
            "Laboratory result records created:",
            createdLaboratoryResults
          );

          // ====================================================
          // SERVICE TYPE
          // ====================================================

          serviceType =
            mode === "Both"
              ? "Laboratory + Ultrasound"
              : "Laboratory";

          // ====================================================
          // ADD LAB TOTAL
          // ====================================================

          orderTotal +=
            laboratorySubtotal;

          // ====================================================
          // ADD LAB ITEMS
          // ====================================================

          selectedTests.forEach(
            (test) => {
              const quantity =
                Number(
                  test.quantity || 1
                );

              const unitPrice =
                Number(
                  test.price || 0
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
          mode === "Ultrasound" ||
          mode === "Both"
        ) {
          const ultrasoundAmount =
            Number(
              form.amount || 0
            );

          // ====================================================
          // ULTRASOUND REGISTRATION
          // ====================================================

          const ultrasoundPayload = {
            scan_number:
              scanNumber || null,

            full_name:
              form.patient_name.trim(),

            dob:
              patientDob,

            age:
              String(calculatedAge),

            sex:
              form.sex,

            phone:
              form.phone || "",

            address:
              form.address || "",

            scan_type:
              form.scan_type,

            clinical_information:
              form.clinical_history ||
              "",

            referring_doctor:
              form.referring_doctor ||
              "",

            access_code:
              accessCode || null,

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

          if (ultrasoundError) {
            throw ultrasoundError;
          }

          console.log(
            "Ultrasound registration saved:",
            ultrasoundRegistration
          );

          if (!createdRegistrationId) {
            createdRegistrationId = ultrasoundRegistration.id;
          }

          // ====================================================
          // SERVICE TYPE
          // ====================================================

          serviceType =
            mode === "Both"
              ? "Laboratory + Ultrasound"
              : "Ultrasound";

          // ====================================================
          // ADD ULTRASOUND TOTAL
          // ====================================================

          orderTotal +=
            ultrasoundAmount;

          // ====================================================
          // ADD ULTRASOUND ITEM
          // ====================================================

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
        // FINAL SERVICE VALIDATION
        // ======================================================

        if (
          orderItems.length === 0
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
          data: orderNumber,
          error:
            orderNumberError,
        } = await supabase.rpc(
          "next_order_number"
        );

        if (orderNumberError) {
          throw orderNumberError;
        }

        const generatedOrderNumber =
          Array.isArray(orderNumber)
            ? orderNumber[0]
            : orderNumber;

        if (!generatedOrderNumber) {
          throw new Error(
            "Unable to generate service order number."
          );
        }

        console.log(
          "Generated service order number:",
          generatedOrderNumber
        );

        // ======================================================
        // SERVICE ORDER PAYLOAD
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
            laboratoryNumber || null,

          referral_id:
            form.referral_id || null,

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

        console.log(
          "Creating service order:",
          serviceOrderPayload
        );

        // ======================================================
        // CREATE SERVICE ORDER
        // ======================================================

        const {
          data: createdOrder,
          error:
            orderError,
        } = await supabase
          .from("service_orders")
          .insert([
            serviceOrderPayload,
          ])
          .select()
          .single();

        if (orderError) {
          throw orderError;
        }

        if (!createdOrder) {
          throw new Error(
            "Service order was not created."
          );
        }

        if (!createdOrder.id) {
          throw new Error(
            "Service order was created but no order ID was returned."
          );
        }

        console.log(
          "Service order created:",
          createdOrder
        );

        // ======================================================
        // CREATE SERVICE ORDER ITEMS
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
          itemsToInsert.length > 0
        ) {
          const {
            data: savedItems,
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
        // VERIFY ORDER ID
        // ======================================================

        const createdOrderId =
          createdOrder.id;

        if (!createdOrderId) {
          throw new Error(
            "Unable to continue to payment because the service order ID is missing."
          );
        }

        // ======================================================
        // WHATSAPP REGISTRATION NOTIFICATION
        // ------------------------------------------------------
        // Notification failure must NOT undo a successful
        // registration. The Edge Function records the attempt.
        // ======================================================

        try {
          const { data: whatsappData, error: whatsappError } =
            await supabase.functions.invoke(
              "send-registration-whatsapp",
              {
                body: {
                  registration_id: createdRegistrationId,
                  patient_name: form.patient_name.trim(),
                  phone: form.phone || "",
                  branch: form.branch.trim(),
                  branch_number: branchNumber,
                  registration_number: registrationNumber,
                  lab_number: laboratoryNumber || "",
                  access_code: accessCode || "",
                  service_type: serviceType,
                  tests: selectedTests.map(
                    (test) =>
                      test.name ||
                      test.test_name ||
                      test.test ||
                      "Laboratory Test"
                  ),
                },
              }
            );

          if (whatsappError) {
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
        } catch (whatsappError) {
          console.warn(
            "Registration saved, but WhatsApp notification could not be sent:",
            whatsappError
          );
        }

        // ======================================================
        // SUCCESS
        // ======================================================

        alert(
          "Registration saved successfully. Proceeding to payment."
        );

        // ======================================================
        // REDIRECT
        // ======================================================

        navigate(
          `/payment-portal?order_id=${encodeURIComponent(
            createdOrderId
          )}`,
          {
            replace: true,
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
  // PAGE
  // ==========================================================

  return (
    <div className="registration-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

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
      ====================================================== */}

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
            disabled={saving}
          >
            <option value="Laboratory">
              Laboratory
            </option>

            <option value="Ultrasound">
              Ultrasound
            </option>

            <option value="Both">
              Laboratory + Ultrasound
            </option>
          </select>

        </div>
      </div>

      {/* ======================================================
          LOADING NUMBERS
      ====================================================== */}

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
      ====================================================== */}

      <PatientInformation
        patient={form}
        setPatient={setForm}
        mode={mode}
      />

      {/* ======================================================
          LABORATORY
      ====================================================== */}

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
      ====================================================== */}

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
      ====================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 30,
          marginBottom: 40,
        }}
      >
        <button
          type="button"
          onClick={
            handleSaveRegistration
          }
          disabled={
            saving ||
            loadingNumbers
          }
          className="primary-btn"
          style={{
            minWidth: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
              <Save size={18} />

              Save Registration
            </>
          )}
        </button>
      </div>

    </div>
  );
}