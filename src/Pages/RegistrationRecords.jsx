import "../styles/registrationRecords.css";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Search,
  Eye,
  Printer,
  Receipt,
  CreditCard,
  CheckCircle,
  Clock3,
  Edit3,
  X,
  Save,
  UserRound,
  FileText,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../supabase";

export default function RegistrationRecords() {
  /* =====================================================
     NAVIGATION
  ===================================================== */

  const navigate = useNavigate();

  /* =====================================================
     STATES
  ===================================================== */

  const [loading, setLoading] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState([]);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editForm, setEditForm] = useState({
    full_name: "",
    dob: "",
    age: "",
    sex: "",
    phone: "",
    address: "",
    branch: "",
    clinical_history: "",
    referring_doctor: "",
    referral_name: "",
  });

  /* =====================================================
     LOAD REGISTRATIONS
  ===================================================== */

  const loadRegistrations = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("[REGISTRATION RECORDS] Load error:", error);
        return;
      }

      setRecords(data || []);
    } catch (error) {
      console.error(
        "[REGISTRATION RECORDS] Unexpected load error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  /* =====================================================
     FILTER RECORDS
  ===================================================== */

  const filteredRecords = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return records;

    return records.filter((item) => {
      return (
        String(item.full_name || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.lab_number || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.branch || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.payment_type || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.patient_id || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.registration_number || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.access_code || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.phone || "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [records, search]);

  /* =====================================================
     HELPERS
  ===================================================== */

  const money = (value) =>
    `₦${Number(value || 0).toLocaleString("en-NG")}`;

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getRecordStatus = (item) =>
    item?.payment_status ||
    item?.registration_status ||
    "Pending";

  const getOrderId = (item) =>
    item?.service_order_id ||
    item?.order_id ||
    item?.serviceOrderId ||
    null;

  /* =====================================================
     VIEW REGISTRATION
     ===================================================== */

  const viewRegistration = (record) => {
    if (!record?.id) {
      console.error(
        "[REGISTRATION RECORDS] Cannot view registration without ID:",
        record
      );
      return;
    }

    setSelectedRecord(record);
    setShowViewModal(true);
    setShowEditModal(false);
  };

  /* =====================================================
     CLOSE VIEW
  ===================================================== */

  const closeView = () => {
    setShowViewModal(false);
    setSelectedRecord(null);
  };

  /* =====================================================
     EDIT REGISTRATION
  ===================================================== */

  const openEdit = (record) => {
    if (!record?.id) return;

    setSelectedRecord(record);

    setEditForm({
      full_name: record.full_name || "",
      dob: record.dob || "",
      age: record.age || "",
      sex: record.sex || "",
      phone: record.phone || "",
      address: record.address || "",
      branch: record.branch || "",
      clinical_history: record.clinical_history || "",
      referring_doctor: record.referring_doctor || "",
      referral_name: record.referral_name || "",
    });

    setShowViewModal(false);
    setShowEditModal(true);
  };

  const closeEdit = () => {
    if (savingEdit) return;

    setShowEditModal(false);
    setSelectedRecord(null);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =====================================================
     SAVE PATIENT INFORMATION CORRECTION

     IMPORTANT:
     - Updates only existing registration information.
     - Does NOT regenerate lab number.
     - Does NOT regenerate patient ID.
     - Does NOT change registration number.
     - Does NOT change billing/payment fields.
     - Does NOT alter laboratory test/result records.
  ===================================================== */

  const savePatientCorrection = async (event) => {
    event.preventDefault();

    if (!selectedRecord?.id) return;

    if (!editForm.full_name.trim()) {
      window.alert("Patient name is required.");
      return;
    }

    if (!editForm.sex) {
      window.alert("Please select the patient's sex.");
      return;
    }

    try {
      setSavingEdit(true);

      const payload = {
        full_name: editForm.full_name.trim(),
        dob: editForm.dob || null,
        age: String(editForm.age || "").trim(),
        sex: editForm.sex,
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
        branch: editForm.branch.trim(),
        clinical_history: editForm.clinical_history.trim(),
        referring_doctor: editForm.referring_doctor.trim(),
        referral_name: editForm.referral_name.trim(),
      };

      /* -----------------------------------------------------
         STEP 1 — UPDATE THE REGISTRATION MASTER RECORD
         -----------------------------------------------------
         registrations is the source record created by the
         Registration Portal.
      ----------------------------------------------------- */

      const { data, error } = await supabase
        .from("registrations")
        .update(payload)
        .eq("id", selectedRecord.id)
        .select("*")
        .single();

      if (error) {
        console.error(
          "[REGISTRATION RECORDS] Patient correction failed:",
          error
        );

        window.alert(
          `Unable to save the correction.\n\n${
            error.message || "Database update failed."
          }`
        );

        return;
      }

      if (!data) {
        window.alert(
          "The correction was submitted, but no updated registration was returned."
        );
        return;
      }

      /* -----------------------------------------------------
         STEP 2 — PROPAGATE PATIENT NAME TO LABORATORY RESULTS
         -----------------------------------------------------
         Laboratory results were created at registration time
         and store their own patient_name snapshot.

         Therefore changing registrations.full_name alone does
         NOT change laboratory_results.patient_name.

         Keep the existing result payload untouched and update
         ONLY the demographic name field.
      ----------------------------------------------------- */

      let resultSyncCount = 0;

      const { data: syncedByRegistration, error: resultSyncError } =
        await supabase
          .from("laboratory_results")
          .update({
            patient_name: data.full_name,
          })
          .eq("registration_id", data.id)
          .select("id");

      if (resultSyncError) {
        console.warn(
          "[REGISTRATION RECORDS] Could not sync laboratory results by registration_id:",
          resultSyncError
        );
      } else {
        resultSyncCount =
          Array.isArray(syncedByRegistration)
            ? syncedByRegistration.length
            : 0;
      }

      /* -----------------------------------------------------
         STEP 3 — LEGACY FALLBACK
         -----------------------------------------------------
         Some older result rows may have registration_id = null
         but still carry the same lab_number.

         If no rows were synchronized through registration_id,
         synchronize by lab_number as a safe legacy fallback.
      ----------------------------------------------------- */

      if (
        resultSyncCount === 0 &&
        data.lab_number
      ) {
        const {
          data: syncedByLabNumber,
          error: labNumberSyncError,
        } = await supabase
          .from("laboratory_results")
          .update({
            patient_name: data.full_name,
          })
          .eq("lab_number", data.lab_number)
          .select("id");

        if (labNumberSyncError) {
          console.warn(
            "[REGISTRATION RECORDS] Legacy laboratory result name sync failed:",
            labNumberSyncError
          );
        } else {
          resultSyncCount =
            Array.isArray(syncedByLabNumber)
              ? syncedByLabNumber.length
              : 0;
        }
      }

      /* -----------------------------------------------------
         STEP 4 — UPDATE LOCAL REGISTRATION RECORD
      ----------------------------------------------------- */

      setRecords((previous) =>
        previous.map((item) =>
          item.id === data.id ? data : item
        )
      );

      setSelectedRecord(data);
      setShowEditModal(false);
      setShowViewModal(true);

      window.alert(
        resultSyncCount > 0
          ? `Patient registration information was corrected successfully. ${resultSyncCount} laboratory result record(s) were synchronized with the new patient name.`
          : "Patient registration information was corrected successfully. No linked laboratory result rows were found to synchronize."
      );
    } catch (error) {
      console.error(
        "[REGISTRATION RECORDS] Unexpected correction error:",
        error
      );

      window.alert(
        error?.message ||
          "An unexpected error occurred while saving the correction."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  /* =====================================================
     CONTINUE PAYMENT
  ===================================================== */

  const continuePayment = (patient) => {
    if (!patient) return;

    navigate("/payment-portal", {
      state: {
        patient,
      },
    });
  };

  /* =====================================================
     PRINT / INVOICE / RECEIPT

     The registration table does not assume a particular
     billing schema. If an order ID exists, use the same
     invoice route used by the Payment Portal.
  ===================================================== */

  const openInvoice = (record) => {
    const orderId = getOrderId(record);
    const invoiceNo =
      record?.invoice_no ||
      (record?.order_number
        ? `INV-${record.order_number}`
        : "");

    if (!orderId) {
      window.alert(
        "No linked service order was found for this registration. Open Payment Portal to continue with billing."
      );
      return;
    }

    navigate(
      `/invoice?order_id=${encodeURIComponent(
        orderId
      )}&invoice_no=${encodeURIComponent(
        invoiceNo
      )}&document=invoice`
    );
  };

  const openReceipt = (record) => {
    const orderId = getOrderId(record);
    const invoiceNo =
      record?.invoice_no ||
      (record?.order_number
        ? `INV-${record.order_number}`
        : "");

    if (!orderId) {
      window.alert(
        "No linked service order was found for this registration. Open Payment Portal to access the receipt."
      );
      return;
    }

    navigate(
      `/invoice?order_id=${encodeURIComponent(
        orderId
      )}&invoice_no=${encodeURIComponent(
        invoiceNo
      )}&document=receipt`
    );
  };

  const printRegistrationSummary = (record) => {
    if (!record) return;

    const popup = window.open(
      "",
      "_blank",
      "width=900,height=800"
    );

    if (!popup) {
      window.alert(
        "The print window was blocked. Please allow pop-ups for PEFA LIS."
      );
      return;
    }

    const tests = Array.isArray(record.tests)
      ? record.tests
      : [];

    const testsHtml =
      tests.length > 0
        ? tests
            .map((test, index) => {
              const name =
                test?.name ||
                test?.test_name ||
                test?.test ||
                "Laboratory Test";

              return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${escapeHtml(name)}</td>
                  <td>${escapeHtml(
                    String(test?.quantity || 1)
                  )}</td>
                  <td>${money(test?.price || 0)}</td>
                </tr>
              `;
            })
            .join("")
        : `
          <tr>
            <td colspan="4">No test detail stored in this registration.</td>
          </tr>
        `;

    popup.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Registration - ${escapeHtml(
            record.lab_number || record.full_name || "Record"
          )}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 16mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              font-family: Arial, Helvetica, sans-serif;
              color: #172033;
              background: #fff;
              font-size: 12px;
            }

            .header {
              border-bottom: 2px solid #0b63ce;
              padding-bottom: 12px;
              margin-bottom: 18px;
            }

            .brand {
              font-size: 21px;
              font-weight: 800;
              letter-spacing: .4px;
            }

            .sub {
              color: #65738a;
              margin-top: 4px;
            }

            h1 {
              font-size: 18px;
              margin: 20px 0 12px;
            }

            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              border: 1px solid #d9e1ec;
              border-radius: 8px;
              overflow: hidden;
            }

            .field {
              padding: 9px 10px;
              border-right: 1px solid #d9e1ec;
              border-bottom: 1px solid #d9e1ec;
            }

            .label {
              font-size: 9px;
              text-transform: uppercase;
              color: #6b7890;
              font-weight: 700;
              margin-bottom: 3px;
            }

            .value {
              font-weight: 600;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
            }

            th, td {
              border: 1px solid #d9e1ec;
              padding: 8px;
              text-align: left;
            }

            th {
              background: #f3f7fb;
              font-size: 10px;
              text-transform: uppercase;
            }

            .footer {
              margin-top: 28px;
              padding-top: 10px;
              border-top: 1px solid #d9e1ec;
              color: #6b7890;
              font-size: 10px;
            }
          </style>
        </head>

        <body>
          <div class="header">
            <div class="brand">PEFA MEDICAL DIAGNOSTIC SERVICES</div>
            <div class="sub">Registration Record Summary</div>
          </div>

          <h1>Patient Registration Record</h1>

          <div class="grid">
            <div class="field">
              <div class="label">Lab Number</div>
              <div class="value">${escapeHtml(
                record.lab_number || "—"
              )}</div>
            </div>

            <div class="field">
              <div class="label">Access Code</div>
              <div class="value">${escapeHtml(
                record.access_code || "—"
              )}</div>
            </div>

            <div class="field">
              <div class="label">Registration Number</div>
              <div class="value">${escapeHtml(
                record.registration_number || "—"
              )}</div>
            </div>

            <div class="field">
              <div class="label">Patient ID</div>
              <div class="value">${escapeHtml(
                record.patient_id || "—"
              )}</div>
            </div>

            <div class="field">
              <div class="label">Patient Name</div>
              <div class="value">${escapeHtml(
                record.full_name || "—"
              )}</div>
            </div>

            <div class="field">
              <div class="label">Date of Birth</div>
              <div class="value">${escapeHtml(
                record.dob || "—"
              )}</div>
            </div>

            <div class="field">
              <div class="label">Age / Sex</div>
              <div class="value">${escapeHtml(
                `${record.age || "—"} / ${record.sex || "—"}`
              )}</div>
            </div>

            <div class="field">
              <div class="label">Phone</div>
              <div class="value">${escapeHtml(
                record.phone || "—"
              )}</div>
            </div>

            <div class="field">
              <div class="label">Branch</div>
              <div class="value">${escapeHtml(
                record.branch || "—"
              )}</div>
            </div>

            <div class="field">
              <div class="label">Payment Status</div>
              <div class="value">${escapeHtml(
                record.payment_status ||
                  "Pending"
              )}</div>
            </div>

            <div class="field">
              <div class="label">Registered</div>
              <div class="value">${escapeHtml(
                formatDate(record.created_at)
              )}</div>
            </div>
          </div>

          <h1>Laboratory Tests</h1>

          <table>
            <thead>
              <tr>
                <th>S/N</th>
                <th>Test / Service</th>
                <th>Qty</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${testsHtml}
            </tbody>
          </table>

          <div class="footer">
            This is a computer-generated registration record summary.
          </div>

          <script>
            window.onload = function () {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    popup.document.close();
  };

  /* =====================================================
     HTML ESCAPE FOR PRINT WINDOW
  ===================================================== */

  const escapeHtml = (value) => {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  /* =====================================================
     VIEW MODAL
  ===================================================== */

  const renderViewModal = () => {
    if (!showViewModal || !selectedRecord) {
      return null;
    }

    const record = selectedRecord;
    const status = getRecordStatus(record);
    const tests = Array.isArray(record.tests)
      ? record.tests
      : [];

    const totalAmount = Number(
      record.total_amount || 0
    );

    const amountPaid = Number(
      record.amount_paid || 0
    );

    const balance =
      record.balance !== undefined &&
      record.balance !== null
        ? Number(record.balance || 0)
        : Math.max(
            totalAmount - amountPaid,
            0
          );

    return (
      <div
        className="registration-modal-overlay"
        onMouseDown={(event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            closeView();
          }
        }}
      >
        <div
          className="registration-view-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="registration-view-title"
        >
          <div className="registration-modal-header">
            <div className="registration-modal-heading">
              <div className="registration-modal-icon">
                <UserRound size={21} />
              </div>

              <div>
                <span className="registration-modal-kicker">
                  REGISTRATION RECORD
                </span>

                <h2 id="registration-view-title">
                  {record.full_name ||
                    "Patient Record"}
                </h2>

                <p>
                  Lab No.{" "}
                  <strong>
                    {record.lab_number ||
                      "—"}
                  </strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              className="registration-close-btn"
              onClick={closeView}
              aria-label="Close registration record"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="registration-modal-body">
            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <section className="registration-action-panel">
              <div className="registration-section-heading">
                <div>
                  <span>
                    RECORD ACTIONS
                  </span>
                  <h3>
                    What would you like to do?
                  </h3>
                </div>

                <p>
                  All record actions are kept
                  inside View to keep the table
                  clean and easy to understand.
                </p>
              </div>

              <div className="registration-action-grid">
                <button
                  type="button"
                  className="record-action record-action-edit"
                  onClick={() =>
                    openEdit(record)
                  }
                >
                  <span className="record-action-icon">
                    <Edit3 size={19} />
                  </span>

                  <span>
                    <strong>
                      Edit Patient
                    </strong>
                    <small>
                      Correct registration
                      information
                    </small>
                  </span>
                </button>

                <button
                  type="button"
                  className="record-action record-action-payment"
                  onClick={() =>
                    continuePayment(
                      record
                    )
                  }
                >
                  <span className="record-action-icon">
                    <CreditCard
                      size={19}
                    />
                  </span>

                  <span>
                    <strong>
                      Continue Payment
                    </strong>
                    <small>
                      Open billing and
                      payment
                    </small>
                  </span>
                </button>

                <button
                  type="button"
                  className="record-action record-action-invoice"
                  onClick={() =>
                    openInvoice(record)
                  }
                >
                  <span className="record-action-icon">
                    <Printer size={19} />
                  </span>

                  <span>
                    <strong>
                      Print / View Invoice
                    </strong>
                    <small>
                      Open service invoice
                    </small>
                  </span>
                </button>

                <button
                  type="button"
                  className="record-action record-action-receipt"
                  onClick={() =>
                    openReceipt(record)
                  }
                >
                  <span className="record-action-icon">
                    <Receipt size={19} />
                  </span>

                  <span>
                    <strong>
                      Print / View Receipt
                    </strong>
                    <small>
                      Open payment receipt
                    </small>
                  </span>
                </button>

                <button
                  type="button"
                  className="record-action record-action-print"
                  onClick={() =>
                    printRegistrationSummary(
                      record
                    )
                  }
                >
                  <span className="record-action-icon">
                    <FileText size={19} />
                  </span>

                  <span>
                    <strong>
                      Print Record
                    </strong>
                    <small>
                      Print registration
                      summary
                    </small>
                  </span>
                </button>
              </div>
            </section>

            {/* =================================================
                PATIENT INFORMATION
            ================================================= */}

            <section className="registration-detail-section">
              <div className="registration-section-title">
                <UserRound size={17} />
                Patient Information
              </div>

              <div className="registration-detail-grid">
                <div className="registration-detail-item">
                  <span>Patient Name</span>
                  <strong>
                    {record.full_name ||
                      "—"}
                  </strong>
                </div>

                <div className="registration-detail-item">
                  <span>Patient ID</span>
                  <strong>
                    {record.patient_id ||
                      "—"}
                  </strong>
                </div>

                <div className="registration-detail-item">
                  <span>Registration No.</span>
                  <strong>
                    {record.registration_number ||
                      "—"}
                  </strong>
                </div>

                <div className="registration-detail-item">
                  <span>Lab Number</span>
                  <strong>
                    {record.lab_number ||
                      "—"}
                  </strong>
                </div>

                <div className="registration-detail-item registration-access-code">
                  <span>Access Code</span>
                  <strong>
                    {record.access_code || "—"}
                  </strong>
                </div>

                <div className="registration-detail-item">
                  <span>Date of Birth</span>
                  <strong>
                    {record.dob ||
                      "—"}
                  </strong>
                </div>

                <div className="registration-detail-item">
                  <span>Age</span>
                  <strong>
                    {record.age ||
                      "—"}
                  </strong>
                </div>

                <div className="registration-detail-item">
                  <span>Sex</span>
                  <strong>
                    {record.sex ||
                      "—"}
                  </strong>
                </div>

                <div className="registration-detail-item">
                  <span>Phone</span>
                  <strong>
                    {record.phone ||
                      "—"}
                  </strong>
                </div>

                <div className="registration-detail-item registration-detail-wide">
                  <span>Address</span>
                  <strong>
                    {record.address ||
                      "—"}
                  </strong>
                </div>

                <div className="registration-detail-item">
                  <span>Branch</span>
                  <strong>
                    {record.branch ||
                      "—"}
                  </strong>
                </div>
              </div>
            </section>

            {/* =================================================
                CLINICAL / REFERRAL
            ================================================= */}

            <section className="registration-detail-section">
              <div className="registration-section-title">
                <FileText size={17} />
                Clinical & Referral Information
              </div>

              <div className="registration-detail-grid">
                <div className="registration-detail-item registration-detail-wide">
                  <span>
                    Clinical History
                  </span>
                  <strong>
                    {record.clinical_history ||
                      "—"}
                  </strong>
                </div>

                <div className="registration-detail-item">
                  <span>
                    Referring Doctor
                  </span>
                  <strong>
                    {record.referring_doctor ||
                      "—"}
                  </strong>
                </div>

                <div className="registration-detail-item">
                  <span>
                    Referral
                  </span>
                  <strong>
                    {record.referral_name ||
                      "—"}
                  </strong>
                </div>
              </div>
            </section>

            {/* =================================================
                BILLING
            ================================================= */}

            <section className="registration-detail-section">
              <div className="registration-section-title">
                <CreditCard size={17} />
                Registration & Billing
              </div>

              <div className="registration-financial-grid">
                <div>
                  <span>Total</span>
                  <strong>
                    {money(totalAmount)}
                  </strong>
                </div>

                <div>
                  <span>Amount Paid</span>
                  <strong>
                    {money(amountPaid)}
                  </strong>
                </div>

                <div>
                  <span>Balance</span>
                  <strong className={
                    balance > 0
                      ? "balance-due"
                      : "balance-clear"
                  }>
                    {money(balance)}
                  </strong>
                </div>

                <div>
                  <span>Payment Status</span>
                  <strong>
                    <span
                      className={`modal-payment-status ${
                        String(status)
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                      }`}
                    >
                      {status}
                    </span>
                  </strong>
                </div>
              </div>
            </section>

            {/* =================================================
                TESTS
            ================================================= */}

            <section className="registration-detail-section">
              <div className="registration-section-title">
                <FileText size={17} />
                Registered Services
              </div>

              {tests.length === 0 ? (
                <div className="registration-no-tests">
                  No test list is stored directly
                  in this registration record.
                </div>
              ) : (
                <div className="registration-tests-table-wrap">
                  <table className="registration-tests-table">
                    <thead>
                      <tr>
                        <th>S/N</th>
                        <th>Test / Service</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {tests.map(
                        (test, index) => {
                          const name =
                            test?.name ||
                            test?.test_name ||
                            test?.test ||
                            "Laboratory Test";

                          const quantity =
                            Number(
                              test?.quantity ||
                                1
                            );

                          const price =
                            Number(
                              test?.price ||
                                0
                            );

                          return (
                            <tr
                              key={
                                test?.id ||
                                `${name}-${index}`
                              }
                            >
                              <td>
                                {index + 1}
                              </td>

                              <td>
                                {name}
                              </td>

                              <td>
                                {quantity}
                              </td>

                              <td>
                                {money(
                                  price
                                )}
                              </td>

                              <td>
                                {money(
                                  price *
                                    quantity
                                )}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* =================================================
                CORRECTION NOTICE
            ================================================= */}

            <div className="registration-correction-notice">
              <AlertCircle size={17} />

              <div>
                <strong>
                  Patient information correction
                </strong>

                <p>
                  Use <b>Edit Patient</b> above
                  if a name, date of birth, sex,
                  phone, address, branch,
                  clinical history, doctor or
                  referral detail was entered
                  incorrectly. Identification and
                  billing numbers are protected
                  from accidental changes.
                </p>
              </div>
            </div>
          </div>

          <div className="registration-modal-footer">
            <span>
              Registered{" "}
              {formatDate(
                record.created_at
              )}
            </span>

            <button
              type="button"
              className="registration-secondary-btn"
              onClick={closeView}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* =====================================================
     EDIT MODAL
  ===================================================== */

  const renderEditModal = () => {
    if (
      !showEditModal ||
      !selectedRecord
    ) {
      return null;
    }

    return (
      <div className="registration-modal-overlay">
        <form
          className="registration-edit-modal"
          onSubmit={
            savePatientCorrection
          }
        >
          <div className="registration-modal-header">
            <div className="registration-modal-heading">
              <div className="registration-modal-icon edit">
                <Edit3 size={21} />
              </div>

              <div>
                <span className="registration-modal-kicker">
                  PATIENT INFORMATION
                </span>

                <h2>
                  Correct Registration
                </h2>

                <p>
                  Lab No.{" "}
                  <strong>
                    {
                      selectedRecord.lab_number ||
                      "—"
                    }
                  </strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              className="registration-close-btn"
              onClick={closeEdit}
              disabled={savingEdit}
              aria-label="Close edit form"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="registration-edit-warning">
            <AlertCircle size={17} />

            <div>
              <strong>
                Correction mode
              </strong>

              <p>
                This form is for correcting
                patient information only.
                Lab number, patient ID,
                registration number,
                tests, billing and payment
                fields are not changed here.
              </p>
            </div>
          </div>

          <div className="registration-edit-body">
            <div className="registration-form-field full">
              <label htmlFor="registration-full-name">
                Patient Name *
              </label>

              <input
                id="registration-full-name"
                name="full_name"
                type="text"
                value={
                  editForm.full_name
                }
                onChange={
                  handleEditChange
                }
                autoComplete="name"
                required
              />
            </div>

            <div className="registration-form-field">
              <label htmlFor="registration-dob">
                Date of Birth
              </label>

              <input
                id="registration-dob"
                name="dob"
                type="date"
                value={
                  editForm.dob || ""
                }
                onChange={
                  handleEditChange
                }
              />
            </div>

            <div className="registration-form-field">
              <label htmlFor="registration-age">
                Age
              </label>

              <input
                id="registration-age"
                name="age"
                type="text"
                value={
                  editForm.age
                }
                onChange={
                  handleEditChange
                }
                inputMode="numeric"
              />
            </div>

            <div className="registration-form-field">
              <label htmlFor="registration-sex">
                Sex *
              </label>

              <select
                id="registration-sex"
                name="sex"
                value={
                  editForm.sex
                }
                onChange={
                  handleEditChange
                }
                required
              >
                <option value="">
                  Select sex
                </option>
                <option value="Male">
                  Male
                </option>
                <option value="Female">
                  Female
                </option>
              </select>
            </div>

            <div className="registration-form-field">
              <label htmlFor="registration-phone">
                Phone
              </label>

              <input
                id="registration-phone"
                name="phone"
                type="tel"
                value={
                  editForm.phone
                }
                onChange={
                  handleEditChange
                }
                autoComplete="tel"
              />
            </div>

            <div className="registration-form-field full">
              <label htmlFor="registration-address">
                Address
              </label>

              <textarea
                id="registration-address"
                name="address"
                value={
                  editForm.address
                }
                onChange={
                  handleEditChange
                }
                rows={3}
              />
            </div>

            <div className="registration-form-field">
              <label htmlFor="registration-branch">
                Branch
              </label>

              <input
                id="registration-branch"
                name="branch"
                type="text"
                value={
                  editForm.branch
                }
                onChange={
                  handleEditChange
                }
              />
            </div>

            <div className="registration-form-field">
              <label htmlFor="registration-referral">
                Referral
              </label>

              <input
                id="registration-referral"
                name="referral_name"
                type="text"
                value={
                  editForm.referral_name
                }
                onChange={
                  handleEditChange
                }
              />
            </div>

            <div className="registration-form-field full">
              <label htmlFor="registration-doctor">
                Referring Doctor
              </label>

              <input
                id="registration-doctor"
                name="referring_doctor"
                type="text"
                value={
                  editForm.referring_doctor
                }
                onChange={
                  handleEditChange
                }
              />
            </div>

            <div className="registration-form-field full">
              <label htmlFor="registration-clinical-history">
                Clinical History
              </label>

              <textarea
                id="registration-clinical-history"
                name="clinical_history"
                value={
                  editForm.clinical_history
                }
                onChange={
                  handleEditChange
                }
                rows={4}
              />
            </div>
          </div>

          <div className="registration-edit-footer">
            <button
              type="button"
              className="registration-secondary-btn"
              onClick={closeEdit}
              disabled={savingEdit}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="registration-save-btn"
              disabled={savingEdit}
            >
              {savingEdit ? (
                <>
                  <RefreshCw
                    size={17}
                    className="registration-spin"
                  />
                  Saving Correction...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Correction
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="registration-records-header">
          <div>
            <span className="registration-page-kicker">
              PEFA ENTERPRISE LIS
            </span>

            <h1>
              Registration Records
            </h1>

            <p>
              Patient registration archive,
              correction and reception
              control.
            </p>
          </div>

          <div className="registration-record-count">
            <strong>
              {filteredRecords.length}
            </strong>

            <span>
              {filteredRecords.length ===
              1
                ? "Record"
                : "Records"}
            </span>
          </div>
        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="registration-records-card registration-search-card">
          <div className="registration-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search Lab Number, Access Code, Patient, Patient ID, Phone, Branch..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              aria-label="Search registration records"
            />

            {search && (
              <button
                type="button"
                className="registration-search-clear"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="registration-action-legend">
            <span>
              <Eye size={14} />
              <b>View</b>
              contains all record actions
            </span>
          </div>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="registration-records-card">
          <div className="registration-table-toolbar">
            <div>
              <span className="registration-table-kicker">
                REGISTRATION ARCHIVE
              </span>

              <h2>
                Patient Registrations
              </h2>
            </div>

            <button
              type="button"
              className="registration-refresh-btn"
              onClick={loadRegistrations}
              disabled={loading}
              title="Refresh registration records"
            >
              <RefreshCw
                size={16}
                className={
                  loading
                    ? "registration-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>

          <div className="registration-table-scroll">
            <div className="registration-table">
              <div className="registration-table-header">
                <span>Lab Number / Access Code</span>
                <span>Patient</span>
                <span>Branch</span>
                <span>Payment</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {loading ? (
                <div className="registration-empty-state">
                  <RefreshCw
                    size={22}
                    className="registration-spin"
                  />

                  <strong>
                    Loading Registrations...
                  </strong>

                  <span>
                    Retrieving the latest
                    registration archive.
                  </span>
                </div>
              ) : filteredRecords.length ===
                0 ? (
                <div className="registration-empty-state">
                  <AlertCircle size={22} />

                  <strong>
                    No Registration Found
                  </strong>

                  <span>
                    Try another search term
                    or refresh the archive.
                  </span>
                </div>
              ) : (
                filteredRecords.map(
                  (item) => {
                    const status =
                      item.payment_status ||
                      "Pending";

                    return (
                      <div
                        key={
                          item.id ||
                          item.lab_number ||
                          item.registration_number
                        }
                        className="registration-row"
                      >
                        <span className="lab-id registration-lab-access-cell">
                          <strong>
                            {item.lab_number || "—"}
                          </strong>
                          <small>
                            Access: {item.access_code || "—"}
                          </small>
                        </span>

                        <span className="patient-cell">
                          <strong>
                            {item.full_name ||
                              "Unnamed Patient"}
                          </strong>

                          <small>
                            {item.patient_id ||
                              item.registration_number ||
                              "No patient ID"}
                          </small>
                        </span>

                        <span>
                          {item.branch ||
                            "—"}
                        </span>

                        <span>
                          {item.payment_type ||
                            "Patient"}
                        </span>

                        <span className="amount">
                          {money(
                            item.total_amount
                          )}
                        </span>

                        <div
                          className={`payment-status ${
                            String(
                              status
                            )
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )
                          }`}
                        >
                          {String(status)
                            .toLowerCase() ===
                          "paid" ? (
                            <CheckCircle
                              size={15}
                            />
                          ) : (
                            <Clock3
                              size={15}
                            />
                          )}

                          {status}
                        </div>

                        {/* =================================
                            ONLY VIEW IN TABLE
                        ================================= */}

                        <div className="registration-actions">
                          <button
                            type="button"
                            className="view-btn registration-view-btn"
                            onClick={() =>
                              viewRegistration(
                                item
                              )
                            }
                            disabled={
                              !item?.id
                            }
                            title="View registration record and available actions"
                          >
                            <Eye
                              size={17}
                            />

                            <span>
                              View
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  }
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {renderViewModal()}
      {renderEditModal()}
    </div>
  );
}
