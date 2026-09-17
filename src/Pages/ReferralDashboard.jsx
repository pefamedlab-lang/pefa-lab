import "../styles/referralDashboard.css";
import "../styles/printing/printing.css";
import "../styles/LetterHeadPortal.css";

import { createPortal } from "react-dom";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as XLSX from "xlsx";

import {
  Building2,
  Users,
  Wallet,
  Eye,
  X,
  Printer,
  Download,
  Mail,
  MessageCircle,
  ReceiptText,
  FileText,
  Edit3,
  History,
  BadgePercent,
  Search,
  Trash2,
} from "lucide-react";

import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { supabase } from "../supabase";
import { logActivity } from "../utils/logActivity";

import PEFADigitalLetterhead from "../components/printing/PEFADigitalLetterhead";
import PrintEngine from "../utils/PrintEngine";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PEFAModalPortal = ({ children }) => {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
};


/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_REFERRAL = {
  referral_code: "",
  name: "",
  type: "",
  contact_person: "",
  phone: "",
  email: "",
  address: "",
  commission_rate: 10,
  credit_limit: 0,
  status: "Active",
};

const BUSINESS_NAME = "PEFA Medical Diagnostic Services";


/* =========================================================
   HELPERS
========================================================= */

const naira = (value) =>
  `₦${Number(value || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value = new Date()) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value = new Date()) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const escapeFileName = (value = "") =>
  String(value)
    .trim()
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const generateReference = (prefix = "REF") => {
  const now = new Date();

  const year = now.getFullYear();

  const stamp =
    `${year}` +
    `${String(now.getMonth() + 1).padStart(2, "0")}` +
    `${String(now.getDate()).padStart(2, "0")}` +
    `${String(now.getHours()).padStart(2, "0")}` +
    `${String(now.getMinutes()).padStart(2, "0")}` +
    `${String(now.getSeconds()).padStart(2, "0")}`;

  return `${prefix}-${stamp}`;
};


/* =========================================================
   COMPONENT
========================================================= */

export default function ReferralDashboard() {

  /* =======================================================
     DATA
  ======================================================= */

  const [referrals, setReferrals] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [referralPatients, setReferralPatients] =
    useState([]);

  const [paymentHistory, setPaymentHistory] =
    useState([]);

  const [commissionHistory, setCommissionHistory] =
    useState([]);


  /* =======================================================
     LOADING
  ======================================================= */

  const [loading, setLoading] = useState(false);

  const [savingReferral, setSavingReferral] =
    useState(false);

  const [savingPayment, setSavingPayment] =
    useState(false);

  const [savingCommission, setSavingCommission] =
    useState(false);

  const [printing, setPrinting] = useState(false);

  const [downloading, setDownloading] =
    useState(false);


  /* =======================================================
     SEARCH / FILTER
  ======================================================= */

  const [searchTerm, setSearchTerm] =
    useState("");

  const [filterType, setFilterType] =
    useState("All");


  /* =======================================================
     REFERRAL MODAL
  ======================================================= */

  const [showModal, setShowModal] =
    useState(false);

  const [editingReferral, setEditingReferral] =
    useState(null);

  const [newReferral, setNewReferral] =
    useState({
      ...EMPTY_REFERRAL,
    });


  /* =======================================================
     SELECTED REFERRAL
  ======================================================= */

  const [selectedReferral, setSelectedReferral] =
    useState(null);


  /* =======================================================
     PAYMENT MODAL
  ======================================================= */

  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [selectedInvoice, setSelectedInvoice] =
    useState(null);

  /* =======================================================
     REMOVE REFERRAL / AUDIT MODAL
  ======================================================= */

  const [showRemoveReferralModal, setShowRemoveReferralModal] =
    useState(false);

  const [removeReferralPatient, setRemoveReferralPatient] =
    useState(null);

  const [removeReferralReason, setRemoveReferralReason] =
    useState("");

  const [removeReferralDetails, setRemoveReferralDetails] =
    useState("");

  const [removingReferral, setRemovingReferral] =
    useState(false);

  const [paymentAmount, setPaymentAmount] =
    useState("");


  /* =======================================================
     HISTORY MODAL
  ======================================================= */

  const [showHistoryModal, setShowHistoryModal] =
    useState(false);


  /* =======================================================
     STATEMENT MODAL
  ======================================================= */

  const [showStatement, setShowStatement] =
    useState(false);

  /* =======================================================
     DOCUMENT VIEWERS
  ======================================================= */

  const [showInvoiceViewer, setShowInvoiceViewer] =
    useState(false);

  const [invoiceViewerHtml, setInvoiceViewerHtml] =
    useState("");

  /* Snapshot of the referral/document used by the invoice viewer.
     Viewer actions must continue to work even if the underlying
     referral-detail modal is closed or selectedReferral changes. */
  const [invoiceViewerContext, setInvoiceViewerContext] =
    useState(null);

  const invoiceShareInProgressRef = useRef(false);

  const [showReceiptViewer, setShowReceiptViewer] =
    useState(false);

  const [receiptViewerHtml, setReceiptViewerHtml] =
    useState("");

  const [viewerLoading, setViewerLoading] =
    useState(false);

  const [viewerReceiptData, setViewerReceiptData] =
    useState(null);

  /* =======================================================
     OFFICIAL INVOICE SIGNATORY
     -------------------------------------------------------
     Only an ACTIVE staff member with role = Manager may
     sign referral invoices. The name and signature are
     extracted from staff_users so the invoice always uses
     the current Staff Management record.
  ======================================================= */

  const [managerSigner, setManagerSigner] =
    useState(null);

  const [managerSignerLoading, setManagerSignerLoading] =
    useState(false);


  /* =======================================================
     COMMISSION MODAL
  ======================================================= */

  const [showCommissionModal, setShowCommissionModal] =
    useState(false);

  const [commissionAmount, setCommissionAmount] =
    useState("");

  const [commissionNote, setCommissionNote] =
    useState("");


  /* =======================================================
     PRINT DATA
  ======================================================= */

  const [printReceiptData, setPrintReceiptData] =
    useState(null);

  const [printCommissionData, setPrintCommissionData] =
    useState(null);


  /* =======================================================
     PRINT TARGETS
  ======================================================= */

  const invoicePrintRef = useRef(null);
  const receiptPrintRef = useRef(null);
  const commissionPrintRef = useRef(null);


  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    loadReferrals();
    loadInvoices();
    loadManagerSigner();
  }, []);


  /* =======================================================
     LOAD OFFICIAL MANAGER SIGNATORY
     -------------------------------------------------------
     Prefer an ACTIVE Manager who already has a signature.
     If none has a signature, keep the active Manager record
     so the document can clearly report that the signature is
     not configured in Staff Management.
  ======================================================= */

  const loadManagerSigner = async () => {
    try {
      setManagerSignerLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from("staff_users")
        .select("id, full_name, role, department, status, signature_url, created_at")
        .eq("role", "Manager")
        .eq("status", "Active")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      const managers = data || [];

      const signer =
        managers.find(
          (item) =>
            Boolean(
              item?.signature_url
            )
        ) ||
        managers[0] ||
        null;

      setManagerSigner(signer);

      if (!signer) {
        console.warn(
          "[PEFA REFERRAL] No active Manager found in Staff Management."
        );
      } else if (!signer.signature_url) {
        console.warn(
          "[PEFA REFERRAL] Active Manager found, but no signature is configured:",
          signer.full_name
        );
      }

      return signer;
    } catch (error) {
      console.error(
        "[PEFA REFERRAL] Unable to load official Manager signatory:",
        error
      );
      setManagerSigner(null);
      return null;
    } finally {
      setManagerSignerLoading(false);
    }
  };


  /* =======================================================
     LOAD REFERRALS
  ======================================================= */

  const loadReferrals = async () => {
    try {
      const {
        data,
        error,
      } = await supabase
        .from("referrals")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setReferrals(data || []);
    } catch (error) {
      console.error(
        "Load referrals error:",
        error
      );
    }
  };


  /* =======================================================
     LOAD INVOICES
  ======================================================= */

  const loadInvoices = async () => {
    try {
      const {
        data,
        error,
      } = await supabase
        .from("referral_invoices")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setInvoices(data || []);
    } catch (error) {
      console.error(
        "Load invoices error:",
        error
      );
    }
  };


  /* =======================================================
     CREATE REFERRAL
  ======================================================= */

  const createReferral = async () => {
    if (!newReferral.name?.trim()) {
      alert(
        "Please enter the referral name."
      );
      return;
    }

    try {
      setSavingReferral(true);

      const code =
        newReferral.referral_code?.trim() ||
        `REF-${Date.now()
          .toString()
          .slice(-6)}`;

      const payload = {
        ...newReferral,

        referral_code: code,

        commission_rate: Number(
          newReferral.commission_rate || 0
        ),

        credit_limit: Number(
          newReferral.credit_limit || 0
        ),
      };

      const {
        error,
      } = await supabase
        .from("referrals")
        .insert([payload]);

      if (error) {
        throw error;
      }

      await logActivity(
        "Created Referral",
        newReferral.name
      );

      // =====================================================
      // WHATSAPP REFERRAL REGISTRATION NOTIFICATION
      // -----------------------------------------------------
      // The referral is already saved. WhatsApp failure must
      // never undo the successful referral registration.
      // =====================================================
      try {
        const { data: whatsappData, error: whatsappError } =
          await supabase.functions.invoke(
            "send-registration-whatsapp",
            {
              body: {
                event_type: "referral_registration",
                referral_id: payload.id || null,
                referral_name: newReferral.name?.trim() || "Referral",
                phone: newReferral.phone || "",
                email: newReferral.email || "",
                referral_code: code,
              },
            }
          );

        if (whatsappError) {
          console.warn(
            "Referral saved, but WhatsApp notification failed:",
            whatsappError
          );
        } else {
          console.log(
            "WhatsApp referral registration notification:",
            whatsappData
          );
        }
      } catch (whatsappError) {
        console.warn(
          "Referral saved, but WhatsApp notification could not be sent:",
          whatsappError
        );
      }

      alert(
        `${newReferral.name} added successfully.`
      );

      resetReferralForm();
      await loadReferrals();
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
        "Unable to create referral."
      );
    } finally {
      setSavingReferral(false);
    }
  };


  /* =======================================================
     EDIT REFERRAL
  ======================================================= */

  const editReferral = (referral) => {
    setEditingReferral(referral);

    setNewReferral({
      referral_code:
        referral.referral_code || "",

      name:
        referral.name || "",

      type:
        referral.type || "",

      contact_person:
        referral.contact_person || "",

      phone:
        referral.phone || "",

      email:
        referral.email || "",

      address:
        referral.address || "",

      commission_rate:
        referral.commission_rate ?? 10,

      credit_limit:
        referral.credit_limit ?? 0,

      status:
        referral.status || "Active",
    });

    setShowModal(true);
  };


  /* =======================================================
     UPDATE REFERRAL
  ======================================================= */

  const updateReferral = async () => {
    if (!editingReferral?.id) {
      return;
    }

    try {
      setSavingReferral(true);

      const payload = {
        ...newReferral,

        commission_rate: Number(
          newReferral.commission_rate || 0
        ),

        credit_limit: Number(
          newReferral.credit_limit || 0
        ),
      };

      const {
        error,
      } = await supabase
        .from("referrals")
        .update(payload)
        .eq(
          "id",
          editingReferral.id
        );

      if (error) {
        throw error;
      }

      await logActivity(
        "Updated Referral",
        newReferral.name
      );

      alert(
        "Referral updated successfully."
      );

      resetReferralForm();
      await loadReferrals();
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
        "Unable to update referral."
      );
    } finally {
      setSavingReferral(false);
    }
  };


  /* =======================================================
   REFERRAL INVOICE / PATIENT HELPERS
======================================================= */

/*
  IMPORTANT:
  referral_invoices is the HEADER.
  referral_invoice_items contains the patients/orders
  belonging to that referral invoice.

  Therefore patient information is loaded from:

      referral_invoice_items
             ↓
      service_orders

  We do NOT depend on referral_invoices.patient_name
  or referral_invoices.lab_number for the patient list.
*/

const getPatientName = (item) => {
  return (
    item?.service_order?.patient_name ||
    item?.patient_name ||
    "Unknown Patient"
  );
};


const getLabNumber = (item) => {
  /*
    Your service_orders table does not contain a lab_number
    column in the schema you supplied.

    patient_id is therefore used as the displayed Lab/Patient
    identifier when available.

    If your system later adds service_orders.lab_number,
    this helper will automatically prefer it.
  */

  return (
    item?.service_order?.lab_number ||
    item?.service_order?.patient_id ||
    item?.lab_number ||
    "-"
  );
};


const getOrderNumber = (item) => {
  return (
    item?.service_order?.order_number ||
    "-"
  );
};


const getPatientAmount = (item) => {
  return Number(
    item?.amount ||
    item?.service_order?.total_amount ||
    0
  );
};


/* =======================================================
   RESET REFERRAL FORM
======================================================= */

const resetReferralForm = () => {
  setNewReferral({
    ...EMPTY_REFERRAL,
  });

  setEditingReferral(null);
  setShowModal(false);
};


/* =======================================================
   VIEW REFERRAL
======================================================= */

const viewReferral = async (referral) => {
  if (!referral?.id && !referral?.name) {
    alert("Invalid referral selected.");
    return;
  }

  try {
    setLoading(true);

    /*
      We identify the referral primarily by referral_id.

      referral_id is the correct permanent relationship.

      referral_name is retained as a fallback because your
      existing referral invoice tables use referral_name.
    */

    let invoiceQuery = supabase
      .from("referral_invoices")
      .select(`
        *,
        referral_invoice_items (
          id,
          invoice_id,
          service_order_id,
          patient_name,
          amount,
          service_order:service_orders (
            id,
            order_number,
            patient_name,
            patient_id,
            referral_id,
            referral_name,
            total_amount,
            amount_paid,
            balance,
            payment_status,
            invoice_no,
            created_at
          )
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    /*
      Your referral_invoices table currently contains
      referral_name, not referral_id.

      Therefore filter by referral_name.
    */

    invoiceQuery = invoiceQuery.eq(
      "referral_name",
      referral.name
    );

    const {
      data,
      error,
    } = await invoiceQuery;

    if (error) {
      throw error;
    }


    /*
      Convert the referral invoice structure into a clean
      patient list for the UI.

      Each invoice may contain MANY patients.
    */

    const invoices = data || [];

    /* =======================================================
       LOAD REAL TEST / SERVICE NAMES
       -------------------------------------------------------
       The referral invoice item contains the patient/order and amount,
       but the selected laboratory tests are stored in registrations.tests.
       Load those test details using the patient's identifier so the
       invoice never falls back to "-" when the registration has tests.
    ======================================================= */
    const registrationIdentifiers = Array.from(
      new Set(
        invoices
          .flatMap((invoice) => invoice?.referral_invoice_items || [])
          .flatMap((item) => [
            item?.service_order?.patient_id,
            item?.service_order?.lab_number,
            item?.patient_id,
            item?.lab_number,
          ])
          .filter(Boolean)
          .map((value) => String(value).trim())
      )
    );

    let registrationMap = new Map();

    if (registrationIdentifiers.length) {
      const { data: registrationRows, error: registrationError } =
        await supabase
          .from("registrations")
          .select("id, patient_id, lab_number, tests")
          .in("patient_id", registrationIdentifiers);

      if (registrationError) {
        console.warn(
          "Unable to load registration test details for referral invoice:",
          registrationError
        );
      } else {
        (registrationRows || []).forEach((registration) => {
          [registration?.patient_id, registration?.lab_number]
            .filter(Boolean)
            .forEach((identifier) => {
              registrationMap.set(
                String(identifier).trim().toUpperCase(),
                registration
              );
            });
        });
      }
    }

    const normalizeTests = (value) => {
      if (value == null) return [];

      let tests = value;

      if (typeof tests === "string") {
        try {
          tests = JSON.parse(tests);
        } catch {
          return tests.trim() ? [tests.trim()] : [];
        }
      }

      if (!Array.isArray(tests)) tests = [tests];

      return tests
        .map((test) => {
          if (typeof test === "string") return test.trim();
          return (
            test?.name ||
            test?.test_name ||
            test?.test ||
            test?.service_name ||
            test?.service ||
            test?.label ||
            ""
          ).toString().trim();
        })
        .filter(Boolean);
    };

    const getPatientTests = (item, serviceOrder) => {
      const directTests = normalizeTests(
        item?.tests ??
        item?.test_name ??
        serviceOrder?.tests ??
        serviceOrder?.test_name
      );

      if (directTests.length) return directTests.join(", ");

      const identifiers = [
        serviceOrder?.patient_id,
        serviceOrder?.lab_number,
        item?.patient_id,
        item?.lab_number,
      ]
        .filter(Boolean)
        .map((value) => String(value).trim().toUpperCase());

      for (const identifier of identifiers) {
        const registration = registrationMap.get(identifier);
        const registrationTests = normalizeTests(registration?.tests);
        if (registrationTests.length) return registrationTests.join(", ");
      }

      return "-";
    };

    const patientRows = [];


    invoices.forEach((invoice) => {

      const invoiceItems =
        invoice.referral_invoice_items || [];


      invoiceItems.forEach((item) => {

        const serviceOrder =
          item.service_order || null;


        patientRows.push({

          /* Invoice information */

          referral_invoice_id:
            invoice.id,

          invoice_no:
            invoice.invoice_no || "-",


          /* Patient information */

          patient_name:
            getPatientName(item),

          lab_number:
            getLabNumber(item),

          order_number:
            getOrderNumber(item),

          /* Real tests / services from the registration record */
          tests:
            getPatientTests(item, serviceOrder),


          /* Service order */

          service_order_id:
            item.service_order_id,

          referral_id:
            serviceOrder?.referral_id ||
            referral.id ||
            null,

          referral_name:
            serviceOrder?.referral_name ||
            invoice.referral_name ||
            referral.name,


          /* Financial — PATIENT/ORDER level for patient tables.
             referral_invoices is the document header and may contain
             multiple patients. Never repeat the full invoice total on
             every patient row. */

          amount:
            getPatientAmount(item),

          invoice_total:
            Number(invoice?.final_amount ?? invoice?.total_amount ?? 0),

          invoice_paid:
            Number(invoice?.amount_paid ?? 0),

          invoice_balance:
            Number(invoice?.balance ?? 0),

          invoice_payment_status:
            invoice?.payment_status ||
            (Number(invoice?.balance ?? 0) > 0 ? "Pending" : "Paid"),

          /* Patient-level financial values used by Payment Management.
             These prevent a multi-patient invoice of ₦10,000 from being
             displayed as ₦10,000 against each ₦5,000 patient. */
          patient_amount:
            Number(item?.amount ?? serviceOrder?.total_amount ?? 0),

          patient_paid:
            Number(serviceOrder?.amount_paid ?? 0),

          patient_balance:
            Number(serviceOrder?.balance ?? item?.amount ?? 0),

          patient_payment_status:
            serviceOrder?.payment_status ||
            (Number(serviceOrder?.balance ?? item?.amount ?? 0) > 0
              ? "Outstanding"
              : "Paid"),

          service_order_total:
            Number(
              serviceOrder?.total_amount || 0
            ),

          service_order_paid:
            Number(
              serviceOrder?.amount_paid || 0
            ),

          service_order_balance:
            Number(
              serviceOrder?.balance || 0
            ),

          service_order_payment_status:
            serviceOrder?.payment_status ||
            "Pending",


          /* Keep original records */

          invoice,

          item,

          serviceOrder,

        });

      });

    });


    /*
      IMPORTANT:

      setReferralPatients() receives PATIENT ROWS,
      not only referral_invoices.

      This is what prevents the Referral Portal from
      displaying "-" for patient name.
    */

    setReferralPatients(
      patientRows
    );


    /*
      Also keep the invoice records available if your
      existing UI needs them.
    */

    setSelectedReferral(
      referral
    );


    await logActivity(
      "Viewed Referral",
      referral.name
    );

  } catch (error) {

    console.error(
      "viewReferral:",
      error
    );

    alert(
      error?.message ||
      "Unable to load referral."
    );

  } finally {

    setLoading(false);

  }
};


/* =======================================================
   PAYMENT HISTORY
======================================================= */

const loadPaymentHistory = async (
  referral = selectedReferral,
  { openModal = true } = {}
) => {
  if (!referral?.name) return [];

  try {
    setLoading(true);
    const referralName = String(referral.name).trim();

    // Payment history is sourced directly from the payment ledger.
    // referral_payments contains referral_name, so no invoice relationship
    // is required to discover an existing payment.
    const { data: payments, error: paymentError } = await supabase
      .from("referral_payments")
      .select("*")
      .eq("referral_name", referralName)
      .order("payment_date", { ascending: false });

    if (paymentError) throw paymentError;

    const rows = payments || [];
    const invoiceIds = [...new Set(rows.map((row) => row?.invoice_id).filter(Boolean))];
    let invoiceMap = new Map();

    if (invoiceIds.length) {
      const { data: invoiceRows, error: invoiceError } = await supabase
        .from("referral_invoices")
        .select("id, invoice_no, referral_name")
        .in("id", invoiceIds);

      if (invoiceError) throw invoiceError;
      invoiceMap = new Map((invoiceRows || []).map((invoice) => [invoice.id, invoice]));
    }

    const enrichedRows = rows.map((payment) => {
      const invoice = invoiceMap.get(payment.invoice_id);
      return {
        ...payment,
        invoice_no: payment.invoice_no || invoice?.invoice_no || "-",
        referral_name: payment.referral_name || invoice?.referral_name || referralName,
      };
    });

    setPaymentHistory(enrichedRows);
    if (openModal) setShowHistoryModal(true);
    return enrichedRows;
  } catch (error) {
    console.error("loadPaymentHistory:", error);
    setPaymentHistory([]);
    alert(error?.message || "Unable to load payment history.");
    return [];
  } finally {
    setLoading(false);
  }
};


/* =======================================================
   REMOVE / DETACH PATIENT FROM REFERRAL
======================================================= */

const openRemoveReferralModal = (patient) => {
  if (!patient?.service_order_id) {
    alert("This patient record has no service order ID and cannot be detached safely.");
    return;
  }

  setRemoveReferralPatient(patient);
  setRemoveReferralReason("");
  setRemoveReferralDetails("");
  setShowRemoveReferralModal(true);
};

const closeRemoveReferralModal = () => {
  if (removingReferral) return;
  setShowRemoveReferralModal(false);
  setRemoveReferralPatient(null);
  setRemoveReferralReason("");
  setRemoveReferralDetails("");
};

const removePatientFromReferral = async () => {
  const patient = removeReferralPatient;
  const serviceOrderId = patient?.service_order_id;

  if (!serviceOrderId) {
    alert("No service order was selected for removal.");
    return;
  }
  if (!removeReferralReason.trim()) {
    alert("Please select a reason for removing this patient from the referral account.");
    return;
  }
  if (!removeReferralDetails.trim()) {
    alert("Please provide an explanation for the removal. This is required for auditing.");
    return;
  }

  try {
    setRemovingReferral(true);
    setLoading(true);

    const { data, error } = await supabase.rpc(
      "remove_patient_from_referral_v3",
      {
        p_service_order_id: serviceOrderId,
        p_invoice_id: patient?.referral_invoice_id || patient?.invoice?.id || null,
        p_reason: removeReferralReason.trim(),
        p_details: removeReferralDetails.trim(),
      }
    );

    if (error) throw error;

    const result = Array.isArray(data) ? data[0] : data;
    if (!result?.success) {
      throw new Error(result?.message || "The patient could not be removed from this referral account.");
    }

    const auditReason = removeReferralReason.trim();
    const referralSnapshot = selectedReferral;
    closeRemoveReferralModal();
    await viewReferral(referralSnapshot);

    alert(
      `Patient removed from referral successfully.\n\n` +
      `Patient: ${patient?.patient_name || "Unknown Patient"}\n` +
      `Referral: ${referralSnapshot?.name || patient?.referral_name || "-"}\n` +
      `Audit Trail: Recorded\n` +
      `Reason: ${auditReason}`
    );
  } catch (error) {
    console.error("[PEFA REFERRAL] Remove referral failed:", error);
    alert(error?.message || "Unable to remove this patient from the referral account.");
  } finally {
    setRemovingReferral(false);
    setLoading(false);
  }
};


/* =======================================================
   RECORD REFERRAL PAYMENT
======================================================= */

/*
  IMPORTANT:

  Referral payment is made against the REFERRAL INVOICE.

  It must NOT:

    1. Create another patient invoice.
    2. Create another referral invoice.
    3. Manually calculate the invoice balance in React.
    4. Insert payment history first and invoice update second.

  The production-safe version should call ONE Supabase
  RPC which performs all financial changes atomically.

  Expected RPC:

      process_referral_payment

  The RPC should:

      lock referral invoice
      validate balance
      create referral payment
      create referral receipt
      update referral invoice
      update related service orders
      create audit log
      return receipt number
*/

const recordPayment = async () => {
  if (
    !selectedInvoice?.id ||
    !selectedReferral?.name
  ) {
    alert(
      "Please select a valid referral invoice."
    );
    return;
  }

  const amount = Number(paymentAmount);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    alert(
      "Enter a valid payment amount."
    );
    return;
  }

  const currentBalance = Number(
    selectedInvoice.balance || 0
  );

  if (currentBalance <= 0) {
    alert(
      "This referral invoice is already fully paid."
    );
    return;
  }

  if (amount > currentBalance) {
    alert(
      "Payment cannot exceed the outstanding balance."
    );
    return;
  }

  /*
    Preserve these before clearing React state.
    The refresh operations below must not depend on
    selectedInvoice after setSelectedInvoice(null).
  */
  const referralSnapshot = selectedReferral;
  const invoiceSnapshot = selectedInvoice;

  try {
    setSavingPayment(true);

    /* =====================================================
       GET AUTHENTICATED USER
    ===================================================== */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      throw new Error(
        "Your session has expired. Please log in again."
      );
    }

    const receivedBy =
      user.email ||
      "Authenticated User";

    /* =====================================================
       ATOMIC REFERRAL PAYMENT
    ===================================================== */

    const { data, error } =
      await supabase.rpc(
        "process_referral_payment",
        {
          p_invoice_id:
            invoiceSnapshot.id,

          p_amount:
            amount,

          p_payment_method:
            "Referral",

          p_received_by:
            receivedBy,
        }
      );

    if (error) {
      throw error;
    }

    if (!data?.success) {
      throw new Error(
        data?.message ||
        "Referral payment was not completed."
      );
    }

    /* =====================================================
       AUDIT
    ===================================================== */

    await logActivity(
      "Recorded Referral Payment",
      `${referralSnapshot.name} - ${naira(amount)} - ${
        data.receipt_no || "Receipt"
      }`
    );

    /* =====================================================
       CLEAR PAYMENT FORM / MODAL IMMEDIATELY
    ===================================================== */

    setPaymentAmount("");
    setShowPaymentModal(false);
    setSelectedInvoice(null);

    /*
      If the payment completely settled the invoice,
      immediately remove rows belonging to that invoice
      from Payment Management while fresh DB data loads.

      If it was a part-payment, the DB reload below will
      return the updated balance.
    */
    const returnedBalance = Number(
      data.new_balance ??
      data.balance ??
      Math.max(
        0,
        currentBalance - amount
      )
    );

    if (returnedBalance <= 0) {
      setReferralPatients(current =>
        current.filter(
          row =>
            row.referral_invoice_id !==
            invoiceSnapshot.id
        )
      );
    }

    /* =====================================================
       REFRESH DATABASE-BACKED UI
    ===================================================== */

    await loadInvoices();

    await viewReferral(
      referralSnapshot
    );

    /*
      Refresh Payment History silently.
      Do NOT automatically open the history modal.
      The next click on Payment History will also fetch
      fresh data from referral_payments.
    */
    await loadPaymentHistory(
      referralSnapshot,
      { openModal: false }
    );

    /* =====================================================
       SUCCESS MESSAGE
    ===================================================== */

    alert(
      `Payment recorded successfully.\n\n` +
      `Referral Invoice: ${
        data.invoice_no ||
        invoiceSnapshot.invoice_no ||
        "-"
      }\n` +
      `Receipt: ${
        data.receipt_no || "-"
      }`
    );
  } catch (error) {
    console.error(
      "recordPayment:",
      error
    );

    alert(
      error?.message ||
      "Unable to record referral payment."
    );
  } finally {
    setSavingPayment(false);
  }
};


/* =======================================================
     COMMISSION HISTORY
  ======================================================= */

  const loadCommissionHistory = async () => {
    if (!selectedReferral) {
      return;
    }

    try {
      const {
        data,
        error,
      } = await supabase
        .from("referral_commissions")
        .select("*")
        .eq(
          "referral_name",
          selectedReferral.name
        )
        .order("payment_date", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setCommissionHistory(
        data || []
      );
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
        "Unable to load commission history."
      );
    }
  };


  /* =======================================================
     COMMISSION PAYMENT
  ======================================================= */

  const saveCommissionPayment =
    async () => {
      if (!selectedReferral) {
        return;
      }

      const amount =
        Number(commissionAmount);

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        alert(
          "Enter a valid commission payment."
        );
        return;
      }

      if (amount > referralCommission) {
        alert(
          "Amount exceeds the commission currently due."
        );
        return;
      }

      try {
        setSavingCommission(true);

        const balance =
          referralCommission -
          amount;

        const {
          error,
        } = await supabase
          .from("referral_commissions")
          .insert([
            {
              referral_name:
                selectedReferral.name,

              amount_paid:
                amount,

              commission_due:
                referralCommission,

              balance,

              notes:
                commissionNote,

              payment_date:
                new Date().toISOString(),
            },
          ]);

        if (error) {
          throw error;
        }

        await logActivity(
          "Commission Payment",
          `${selectedReferral.name} - ${naira(amount)}`
        );

        alert(
          "Commission payment saved successfully."
        );

        setCommissionAmount("");
        setCommissionNote("");

        await loadCommissionHistory();
      } catch (error) {
        console.error(error);

        alert(
          error.message ||
          "Unable to save commission payment."
        );
      } finally {
        setSavingCommission(false);
      }
    };


  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalRevenue = useMemo(
    () =>
      invoices.reduce(
        (sum, item) =>
          sum +
          Number(
            item.final_amount || 0
          ),
        0
      ),
    [invoices]
  );

  const totalBalance = useMemo(
    () =>
      invoices.reduce(
        (sum, item) =>
          sum +
          Number(
            item.balance || 0
          ),
        0
      ),
    [invoices]
  );

  const totalPatients = useMemo(
    () =>
      new Set(
        invoices
          .map(
            item =>
              item.patient_name
          )
          .filter(Boolean)
      ).size,
    [invoices]
  );


  /* =======================================================
     REFERRAL STATS
  ======================================================= */

  const referralStats = useMemo(
    () =>
      referrals.map(
        referral => {
          const patients =
            invoices.filter(
              invoice =>
                invoice.referral_name ===
                referral.name
            );

          const revenue =
            patients.reduce(
              (sum, item) =>
                sum +
                Number(
                  item.final_amount || 0
                ),
              0
            );

          const outstanding =
            patients.reduce(
              (sum, item) =>
                sum +
                Number(
                  item.balance || 0
                ),
              0
            );

          const commission =
            revenue *
            (
              Number(
                referral.commission_rate ||
                  0
              ) / 100
            );

          return {
            ...referral,
            patients:
              patients.length,
            revenue,
            outstanding,
            commission,
          };
        }
      ),
    [
      referrals,
      invoices,
    ]
  );

  const topRevenueReferral =
    [...referralStats].sort(
      (a, b) =>
        b.revenue -
        a.revenue
    )[0];

  const topPatientReferral =
    [...referralStats].sort(
      (a, b) =>
        b.patients -
        a.patients
    )[0];

  const topCommissionReferral =
    [...referralStats].sort(
      (a, b) =>
        b.commission -
        a.commission
    )[0];

  const topOutstandingReferral =
    [...referralStats].sort(
      (a, b) =>
        b.outstanding -
        a.outstanding
    )[0];


  /* =======================================================
     SELECTED REFERRAL FINANCIALS
  ======================================================= */

  const referralInvoiceDocuments = useMemo(() => {
    const map = new Map();

    (referralPatients || []).forEach((row) => {
      const invoice = row?.invoice;
      if (invoice?.id && !map.has(invoice.id)) {
        map.set(invoice.id, invoice);
      }
    });

    return Array.from(map.values());
  }, [referralPatients]);

  /* Financial totals are invoice-level and must be counted once per
     invoice. Patient rows can share the same invoice. */
  const referralRevenue =
    referralInvoiceDocuments.reduce(
      (sum, invoice) =>
        sum +
        Number(
          invoice?.final_amount ??
          invoice?.total_amount ??
          0
        ),
      0
    );

  const referralPaid =
    referralInvoiceDocuments.reduce(
      (sum, invoice) =>
        sum +
        Number(invoice?.amount_paid ?? 0),
      0
    );

  const referralOutstanding =
    referralInvoiceDocuments.reduce(
      (sum, invoice) =>
        sum +
        Math.max(
          0,
          Number(invoice?.balance ?? 0)
        ),
      0
    );

  const referralCommission =
    referralRevenue *
    (
      Number(
        selectedReferral?.commission_rate ||
          0
      ) / 100
    );

  const getCurrentReferralInvoice = useCallback(() => {
    const candidates = (referralPatients || [])
      .map((row) => row?.invoice)
      .filter((invoice) => invoice?.id);

    const unique = Array.from(
      new Map(
        candidates.map((invoice) => [
          invoice.id,
          invoice,
        ])
      ).values()
    );

    unique.sort(
      (a, b) =>
        new Date(b?.created_at || 0).getTime() -
        new Date(a?.created_at || 0).getTime()
    );

    // Invoice documents are ONLY for invoices with money still due.
    // Once an invoice is fully paid, its payment receipt becomes the
    // official financial document and the paid invoice is not reused.
    const pending = unique.find(
      (invoice) => Number(invoice?.balance ?? 0) > 0
    );

    return pending || null;
  }, [referralPatients]);

  const currentReferralInvoice = getCurrentReferralInvoice();

  /* =======================================================
     INVOICE COMMISSION / NET PAYABLE
     -------------------------------------------------------
     Gross invoice = value of all services on the invoice.
     Commission = agreed referral percentage of gross.
     Total payable = gross invoice less commission.
  ======================================================= */

  const currentInvoiceGrossAmount = Number(
    currentReferralInvoice?.final_amount ??
    currentReferralInvoice?.total_amount ??
    0
  );

  const currentInvoiceCommissionRate = Number(
    selectedReferral?.commission_rate || 0
  );

  const currentInvoiceCommissionAmount =
    currentInvoiceGrossAmount *
    (currentInvoiceCommissionRate / 100);

  const currentInvoiceTotalPayable = Math.max(
    0,
    currentInvoiceGrossAmount -
      currentInvoiceCommissionAmount
  );

  const currentInvoicePaidAmount = Number(
    currentReferralInvoice?.amount_paid || 0
  );

  const currentInvoiceNetBalance = Math.max(
    0,
    currentInvoiceTotalPayable -
      currentInvoicePaidAmount
  );

  /* =======================================================
   OUTSTANDING PAYMENT MANAGEMENT ROWS

   Payment Management is for money still outstanding.
   Fully settled service orders are kept in the database
   and Payment History, but are not left in this table.
======================================================= */

const outstandingReferralPatients =
  useMemo(
    () =>
      referralPatients.filter((item) => {
        /* Payment Management is patient/order based. An invoice may contain
           multiple patients, so the invoice header total/balance must NOT be
           repeated for every patient. */
        const patientAmount = Number(
          item.patient_amount ??
          item.item?.amount ??
          item.service_order?.total_amount ??
          item.amount ??
          0
        );
        const patientBalance = Number(
          item.patient_balance ??
          item.service_order?.balance ??
          item.item?.amount ??
          0
        );

        return Boolean(item.referral_invoice_id) &&
          patientAmount > 0 &&
          patientBalance > 0;
      }),
    [referralPatients]
  );


/* =======================================================
     FILTERED REFERRALS
  ======================================================= */

  const filteredReferrals =
    useMemo(
      () =>
        referrals.filter(
          item => {
            const search =
              searchTerm
                .trim()
                .toLowerCase();

            const matchesSearch =
              !search ||
              item.name
                ?.toLowerCase()
                .includes(search) ||
              item.phone
                ?.toLowerCase()
                .includes(search) ||
              item.contact_person
                ?.toLowerCase()
                .includes(search);

            if (!matchesSearch) {
              return false;
            }

            if (
              filterType ===
              "Active"
            ) {
              return (
                item.status ===
                "Active"
              );
            }

            if (
              filterType ===
              "Inactive"
            ) {
              return (
                item.status !==
                "Active"
              );
            }

            return true;
          }
        ),
      [
        referrals,
        searchTerm,
        filterType,
      ]
    );


  /* =======================================================
     CHART
  ======================================================= */

  const revenueChartData =
    useMemo(
      () => ({
        labels:
          referralStats.map(
            item =>
              item.name
          ),

        datasets: [
          {
            label:
              "Revenue",

            data:
              referralStats.map(
                item =>
                  item.revenue
              ),

            backgroundColor:
              "#2563eb",

            borderRadius:
              6,
          },
        ],
      }),
      [referralStats]
    );


  /* =======================================================
     INVOICE NUMBER
  ======================================================= */

  const getInvoiceNumber =
    useCallback(() => {
      const currentInvoice =
        getCurrentReferralInvoice();

      if (currentInvoice?.invoice_no) {
        return currentInvoice.invoice_no;
      }

      if (!selectedReferral) {
        return "INV-DRAFT";
      }

      const year =
        new Date().getFullYear();

      const code =
        selectedReferral.referral_code
          ?.replace(/[^a-zA-Z0-9]/g, "")
          .slice(-6) ||
        String(
          selectedReferral.id || "001"
        ).slice(-6);

      return `INV-${year}-${code.toUpperCase()}`;
    }, [
      selectedReferral,
      getCurrentReferralInvoice,
    ]);

  const currentReferralInvoicePatients = useMemo(() => {
    const invoiceId = currentReferralInvoice?.id;
    if (!invoiceId) return [];
    return (referralPatients || []).filter(
      (row) => row?.referral_invoice_id === invoiceId
    );
  }, [referralPatients, currentReferralInvoice]);

  const assertPendingReferralInvoice = () => {
    const invoice = getCurrentReferralInvoice();
    if (!invoice?.id) {
      throw new Error("No referral invoice is available for this referral.");
    }
    if (Number(invoice?.balance ?? 0) <= 0) {
      throw new Error("This referral invoice is fully paid. Use the payment receipt for the paid transaction.");
    }
    return invoice;
  };


  /* =======================================================
     WAIT FOR PRINT DOM
     
     This prevents the common blank invoice problem where
     PrintEngine runs before PEFADigitalLetterhead has rendered.
  ======================================================= */

  const waitForPrintTarget =
    useCallback(
      async (id) => {
        for (
          let attempt = 0;
          attempt < 20;
          attempt += 1
        ) {
          await new Promise(
            resolve =>
              requestAnimationFrame(
                resolve
              )
          );

          const target =
            document.getElementById(id);

          if (
            target &&
            target.innerHTML.trim()
          ) {
            return target;
          }

          await new Promise(
            resolve =>
              setTimeout(
                resolve,
                50
              )
          );
        }

        return null;
      },
      []
    );


  /* =======================================================
     INVOICE VIEWER ACTION CONTEXT

     The viewer owns a snapshot of the referral and rendered invoice.
     Print/PDF/email/WhatsApp actions therefore do not depend on the
     parent referral-detail modal remaining mounted.
  ======================================================= */

  const getActiveInvoiceReferral = () =>
    selectedReferral || invoiceViewerContext?.referral || null;

  const getActiveInvoiceHtml = () =>
    String(invoiceViewerHtml || invoiceViewerContext?.html || "");

  const getActiveInvoiceNumber = () => {
    const invoice = invoiceViewerContext?.invoice || currentReferralInvoice;
    return (
      invoice?.invoice_no ||
      (selectedReferral ? getInvoiceNumber() : "INV-DRAFT")
    );
  };

  const refreshReferralDocument = async () => {
    const referral = getActiveInvoiceReferral();

    if (!referral) {
      throw new Error("Please select a referral first.");
    }

    const invoice =
      invoiceViewerContext?.invoice ||
      currentReferralInvoice;

    if (!invoice?.id) {
      throw new Error("No referral invoice is available for this referral.");
    }

    if (Number(invoice?.balance ?? 0) <= 0) {
      throw new Error(
        "This referral invoice is fully paid. Use the payment receipt for the paid transaction."
      );
    }

    /* Prefer the exact HTML snapshot shown in the viewer. */
    const viewerHtml = getActiveInvoiceHtml();
    if (viewerHtml.trim()) {
      return {
        target: null,
        html: viewerHtml,
        referral,
        invoice,
      };
    }

    /* Fallback to the mounted source document. */
    const target = await waitForPrintTarget(
      "referral-invoice-print"
    );

    if (!target || !target.innerHTML.trim()) {
      throw new Error(
        `The current referral invoice ${invoice.invoice_no || ""} could not be prepared.`
      );
    }

    return {
      target,
      html: target.innerHTML,
      referral,
      invoice,
    };
  };


  /* =======================================================
     BUILD PDF BLOB
  ======================================================= */

  const buildReferralInvoicePdf = async () => {
    const prepared = await refreshReferralDocument();
    const { referral, invoice } = prepared;

    const { default: html2pdf } = await import("html2pdf.js");

    const filename =
      `${invoice?.invoice_no || getInvoiceNumber()}-${escapeFileName(
        referral?.name || "Referral"
      )}.pdf`;

    /*
     * IMPORTANT PDF FIX
     * ------------------
     * The invoice viewer already contains a fully rendered, visible
     * document. Generate the PDF from that REAL DOM node instead of
     * cloning its HTML into a hidden/off-screen element. html2canvas can
     * return a blank canvas when the source is hidden, has negative z-index,
     * or is positioned outside the viewport.
     */
    let source = document.querySelector(
      ".document-viewer-render"
    );

    if (!source || !source.innerHTML.trim()) {
      source = prepared.target || null;
    }

    if (!source || !source.innerHTML.trim()) {
      throw new Error(
        `The invoice ${invoice?.invoice_no || ""} is not currently rendered and cannot be converted to PDF.`
      );
    }

    /* Wait for fonts/images/layout to finish before html2canvas captures it. */
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch (_) {
        /* Font readiness is best-effort. */
      }
    }

    const images = Array.from(source.querySelectorAll("img"));
    if (images.length) {
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            const done = () => resolve();
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
          });
        })
      );
    }

    await new Promise((resolve) =>
      requestAnimationFrame(() =>
        requestAnimationFrame(resolve)
      )
    );

    const options = {
      margin: [8, 7, 8, 7],
      filename,
      image: {
        type: "jpeg",
        quality: 0.98,
      },
      html2canvas: {
        scale: Math.min(2, window.devicePixelRatio || 2),
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000,
        scrollX: 0,
        scrollY: 0,
        windowWidth: Math.max(
          document.documentElement.clientWidth || 0,
          source.scrollWidth || 0,
          794
        ),
        windowHeight: Math.max(
          document.documentElement.clientHeight || 0,
          source.scrollHeight || 0,
          1123
        ),
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
      },
      pagebreak: {
        mode: ["css", "legacy"],
      },
    };

    const pdf = await html2pdf()
      .set(options)
      .from(source)
      .toPdf()
      .outputPdf("blob");

    if (!(pdf instanceof Blob) || pdf.size < 1000) {
      throw new Error(
        "The invoice PDF was generated but contains no usable document content."
      );
    }

    return {
      blob: pdf,
      filename,
      referral,
      invoice,
    };
  };

  /* =======================================================
     VIEW PENDING INVOICE

     An invoice is only a request for outstanding payment.
     Fully paid invoices cannot be opened as invoices; the
     corresponding payment receipt must be used instead.
  ======================================================= */

  const viewInvoice = async () => {
    if (!selectedReferral) {
      alert("Please select a referral first.");
      return;
    }

    try {
      setViewerLoading(true);

      /*
       * Refresh the official Manager signer before capturing the
       * invoice HTML. This guarantees the viewer uses the current
       * Staff Management name/signature rather than a stale value.
       */
      await loadManagerSigner();

      /*
       * IMPORTANT: refreshReferralDocument() only waits for the
       * already-mounted invoice DOM. It does not reload the referral,
       * preventing the previous "Opening..." deadlock.
       */
      const prepared = await refreshReferralDocument();
      const html = prepared.html || prepared.target?.innerHTML || "";

      setInvoiceViewerHtml(html);
      setInvoiceViewerContext({
        referral: { ...selectedReferral },
        invoice: prepared.invoice ? { ...prepared.invoice } : null,
        html,
      });
      setShowInvoiceViewer(true);
      await logActivity("Viewed Referral Invoice", selectedReferral.name);
    } catch (error) {
      console.error("Invoice view error:", error);
      alert(
        error?.message ||
        "Unable to open the pending invoice."
      );
    } finally {
      setViewerLoading(false);
    }
  };


  /* =======================================================
     VIEW PAYMENT RECEIPT
  ======================================================= */

  const viewReceipt = async (patientOrPayment) => {
    try {
      setViewerLoading(true);
      const { receiptData, target } =
        await setReceiptDataAndWait(patientOrPayment);

      setViewerReceiptData(receiptData);
      setReceiptViewerHtml(target.innerHTML);
      setShowReceiptViewer(true);

      await logActivity(
        "Viewed Payment Receipt",
        `${receiptData.patient_name || selectedReferral?.name || "Referral"} - ${receiptData.receipt_number}`
      );
    } catch (error) {
      console.error("Receipt view error:", error);
      alert(
        error?.message ||
        "Unable to open the payment receipt."
      );
    } finally {
      setViewerLoading(false);
    }
  };


  /* =======================================================
     PRINT INVOICE
  ======================================================= */

  const printInvoice = async () => {
    try {
      setPrinting(true);

      const prepared = await refreshReferralDocument();
      const referral = prepared.referral;

      /* Print the exact document currently shown in the viewer. */
      let printTarget = prepared.target;
      let temporaryTarget = null;

      if (!printTarget) {
        temporaryTarget = document.createElement("div");
        temporaryTarget.id = `referral-invoice-print-action-${Date.now()}`;
        temporaryTarget.className = "print-render-target";
        temporaryTarget.style.position = "fixed";
        temporaryTarget.style.left = "-100000px";
        temporaryTarget.style.top = "0";
        temporaryTarget.style.width = "210mm";
        temporaryTarget.innerHTML = prepared.html;
        document.body.appendChild(temporaryTarget);
        printTarget = temporaryTarget;
      }

      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      );

      PrintEngine.print(printTarget.id);

      await logActivity(
        "Generated Invoice",
        referral?.name || "Referral"
      );

      /* Give PrintEngine time to clone the target before removing it. */
      if (temporaryTarget) {
        setTimeout(() => {
          if (temporaryTarget.parentNode) {
            temporaryTarget.parentNode.removeChild(temporaryTarget);
          }
        }, 3000);
      }
    } catch (error) {
      console.error("Invoice print error:", error);
      alert(error?.message || "Unable to print invoice.");
    } finally {
      setTimeout(() => setPrinting(false), 500);
    }
  };


  /* =======================================================
     DOWNLOAD INVOICE PDF
  ======================================================= */

  const downloadInvoice = async () => {
    try {
      setDownloading(true);

      const { blob, filename, referral } =
        await buildReferralInvoicePdf();

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      setTimeout(() => URL.revokeObjectURL(url), 10000);

      await logActivity(
        "Downloaded Invoice",
        referral?.name || "Referral"
      );
    } catch (error) {
      console.error("Invoice PDF error:", error);
      alert(error?.message || "Unable to generate PDF.");
    } finally {
      setDownloading(false);
    }
  };


  /* =======================================================
     SHARE PDF FILE

     Browser security does not allow mailto: or WhatsApp Web
     to receive an arbitrary local attachment. The correct
     browser-native solution is Web Share API file sharing.

     If supported, the user can choose Email or WhatsApp and
     the PDF is passed as a real file attachment.

     If unsupported, the PDF is downloaded and the corresponding
     app is opened with a concise message as a safe fallback.
  ======================================================= */

  const shareReferralInvoicePdf = async (channel) => {
    if (invoiceShareInProgressRef.current) {
      return;
    }

    invoiceShareInProgressRef.current = true;

    try {
      const { blob, filename, referral, invoice } =
        await buildReferralInvoicePdf();

      const invoiceNumber =
        invoice?.invoice_no || getActiveInvoiceNumber();

      const file = new File(
        [blob],
        filename,
        { type: "application/pdf" }
      );

      /*
       * WhatsApp / Email attachment behaviour
       * --------------------------------------
       * A normal WhatsApp Web URL cannot be given a local file attachment
       * by JavaScript. The only browser API capable of handing the PDF file
       * to another application is Web Share. When file sharing is supported,
       * use it ONCE and await completion. This allows WhatsApp (where it is
       * available as a share target) to receive the actual PDF attachment.
       *
       * We deliberately do NOT download first and then call navigator.share;
       * that was the source of the previous "earlier share has not yet
       * completed" race.
       */
      if (channel === "whatsapp") {
        const canUseFileShare =
          typeof navigator !== "undefined" &&
          typeof navigator.share === "function" &&
          typeof navigator.canShare === "function" &&
          navigator.canShare({ files: [file] });

        if (canUseFileShare) {
          try {
            await navigator.share({
              title: `${BUSINESS_NAME} — Referral Invoice ${invoiceNumber}`,
              text: `Referral Invoice ${invoiceNumber}`,
              files: [file],
            });

            await logActivity(
              "Shared Invoice PDF By WhatsApp",
              referral?.name || "Referral"
            );
            return;
          } catch (error) {
            /* User cancellation is not an application error. */
            if (error?.name === "AbortError") {
              return;
            }

            /*
             * InvalidStateError can occur when another share session is
             * still held by the browser/OS. Fall through to the reliable
             * download + WhatsApp Web workflow instead of throwing.
             */
            console.warn(
              "Native PDF sharing unavailable; falling back to WhatsApp Web:",
              error
            );
          }
        }

        /* Fallback for browsers/WhatsApp Web that cannot receive files. */
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30000);

        const rawPhone = String(referral?.phone || "").replace(/\D/g, "");
        const whatsappNumber =
          rawPhone.startsWith("0")
            ? `234${rawPhone.slice(1)}`
            : rawPhone.startsWith("234")
            ? rawPhone
            : rawPhone
            ? `234${rawPhone}`
            : "";

        if (!whatsappNumber) {
          throw new Error("This referral does not have a phone number.");
        }

        const message = [
          `*${BUSINESS_NAME.toUpperCase()}*`,
          "",
          `*REFERRAL INVOICE ${invoiceNumber}*`,
          "",
          `The official invoice PDF is ${filename}.`,
          "This browser cannot attach a local PDF directly to WhatsApp Web.",
          "Please attach the downloaded PDF before sending.",
        ].join("\n");

        window.open(
          `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
          "_blank",
          "noopener,noreferrer"
        );

        await logActivity(
          "Prepared Invoice PDF For WhatsApp",
          referral?.name || "Referral"
        );
        return;
      }

      /* Email: mailto cannot accept a generated local file attachment. */
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);

      const recipient = String(referral?.email || "").trim();
      const subject = `${invoiceNumber} | Referral Invoice | ${BUSINESS_NAME}`;
      const body = [
        `Dear ${referral?.contact_person || referral?.name || "Sir/Madam"},`,
        "",
        `Please find the official referral invoice ${invoiceNumber}.`,
        "",
        `The PDF has been downloaded as ${filename}. Please attach it to this email before sending.`,
        "",
        "Kind regards,",
        managerSigner?.full_name || "Laboratory Manager",
        "Laboratory Manager",
        BUSINESS_NAME,
      ].join("\n");

      window.location.href =
        `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      await logActivity(
        "Prepared Invoice PDF For Email",
        referral?.name || "Referral"
      );
    } catch (error) {
      console.error("Invoice sharing error:", error);
      alert(
        error?.message ||
        "Unable to prepare the invoice PDF."
      );
    } finally {
      invoiceShareInProgressRef.current = false;
    }
  };

  const emailInvoice = async () => {
    await shareReferralInvoicePdf("email");
  };


  const whatsappInvoice =
    async () => {
      await shareReferralInvoicePdf("whatsapp");
    };


  /* =======================================================
     PAYMENT RECEIPT DATA / PDF / SHARING

     INVOICE = request for pending payment only.
     RECEIPT = proof of payment and contains payment information.
  ======================================================= */

  const loadLatestReceiptData = async (patientOrPayment) => {
    const invoiceId =
      patientOrPayment?.invoice_id ||
      patientOrPayment?.referral_invoice_id ||
      patientOrPayment?.invoice?.id;

    if (!invoiceId) {
      throw new Error("No referral invoice is linked to this receipt.");
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from("referral_invoices")
      .select("*")
      .eq("id", invoiceId)
      .maybeSingle();

    if (invoiceError) throw invoiceError;
    if (!invoice) {
      throw new Error("The referral invoice linked to this receipt could not be found.");
    }

    let latestPayment = null;

    // Payment History passes the exact payment row. Use it directly so
    // each receipt represents the transaction the user selected.
    const suppliedPayment =
      patientOrPayment?.id &&
      patientOrPayment?.invoice_id &&
      (patientOrPayment?.amount_paid != null ||
        patientOrPayment?.amount != null)
        ? patientOrPayment
        : null;

    if (suppliedPayment) {
      latestPayment = suppliedPayment;
    } else {
      const { data: payments, error: paymentError } = await supabase
        .from("referral_payments")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("payment_date", { ascending: false })
        .limit(1);

      if (paymentError) throw paymentError;
      latestPayment = payments?.[0] || null;
    }

    if (!latestPayment || Number(latestPayment.amount_paid ?? latestPayment.amount ?? 0) <= 0) {
      throw new Error("No recorded payment was found. A receipt can only be issued after payment.");
    }

    const patient =
      (referralPatients || []).find(
        (row) => row?.referral_invoice_id === invoiceId
      ) || patientOrPayment;

    /*
      referral_payments uses receipt_no as the authoritative receipt field.
      Older payments may have it NULL, so create a deterministic receipt
      number from the payment UUID and persist it back to the payment row.
      This keeps the same receipt number across View / Print / PDF / Email /
      WhatsApp without requiring columns that do not exist in the schema.
    */
    let receiptNumber =
      latestPayment.receipt_no ||
      latestPayment.receipt_number ||
      `RCP-${String(latestPayment.id || invoiceId)
        .replace(/-/g, "")
        .slice(-10)
        .toUpperCase()}`;

    if (!latestPayment.receipt_no && latestPayment.id) {
      try {
        const { error: receiptUpdateError } = await supabase
          .from("referral_payments")
          .update({ receipt_no: receiptNumber })
          .eq("id", latestPayment.id);

        if (receiptUpdateError) {
          console.warn(
            "Unable to persist generated receipt number:",
            receiptUpdateError
          );
        }
      } catch (receiptUpdateError) {
        console.warn(
          "Unable to persist generated receipt number:",
          receiptUpdateError
        );
      }
    }

    return {
      ...patient,
      ...invoice,
      ...latestPayment,
      invoice_id: invoiceId,
      invoice_no: invoice.invoice_no || patient?.invoice_no || "-",
      receipt_number: receiptNumber,
      receipt_date:
        latestPayment.payment_date ||
        latestPayment.created_at ||
        new Date().toISOString(),
      payment_amount: Number(
        latestPayment.amount_paid ??
        latestPayment.amount ??
        0
      ),
      previous_balance: Number(
        latestPayment.previous_balance ?? 0
      ),
      new_balance: Number(
        latestPayment.new_balance ??
        latestPayment.balance_after ??
        invoice.balance ??
        0
      ),
      /* referral_payments does not contain payment_method or received_by. */
      payment_method: "Referral Account Payment",
      received_by: "Authenticated User",
      payment_status: "PAID",
      final_amount: Number(
        invoice.final_amount ??
        invoice.total_amount ??
        patient?.invoice_total ??
        0
      ),
    };
  };

  const setReceiptDataAndWait = async (patientOrPayment) => {
    const receiptData = await loadLatestReceiptData(patientOrPayment);
    setPrintReceiptData(receiptData);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const target = await waitForPrintTarget("referral-receipt-print");
    if (!target || !target.innerHTML.trim()) {
      throw new Error("The payment receipt could not be prepared.");
    }
    return { receiptData, target };
  };

  const loadLatestReferralPayment = async () => {
    if (!selectedReferral?.name) {
      throw new Error("Please select a referral first.");
    }

    const referralName = String(selectedReferral.name).trim();

    // Use the actual payment ledger. This works for fully paid invoices
    // even when the invoice is no longer considered the current pending invoice.
    const { data: payments, error: paymentError } = await supabase
      .from("referral_payments")
      .select("*")
      .eq("referral_name", referralName)
      .order("payment_date", { ascending: false })
      .limit(1);

    if (paymentError) throw paymentError;

    const payment = payments?.[0];
    if (!payment || Number(payment.amount_paid ?? 0) <= 0) {
      throw new Error("No recorded payment was found. A receipt can only be issued after payment.");
    }

    let invoice = null;
    if (payment.invoice_id) {
      const { data, error: invoiceError } = await supabase
        .from("referral_invoices")
        .select("*")
        .eq("id", payment.invoice_id)
        .maybeSingle();

      if (invoiceError) throw invoiceError;
      invoice = data;
    }

    return {
      ...payment,
      invoice,
      invoice_id: payment.invoice_id || invoice?.id || null,
      invoice_no: payment.invoice_no || invoice?.invoice_no || "-",
      referral_name: payment.referral_name || invoice?.referral_name || referralName,
    };
  };

  const printLatestReferralReceipt = async () => {
    try {
      const payment = await loadLatestReferralPayment();
      await printReceipt(payment);
    } catch (error) {
      console.error("Latest receipt print error:", error);
      alert(error?.message || "Unable to prepare the payment receipt.");
    }
  };

  const downloadLatestReferralReceipt = async () => {
    try {
      const payment = await loadLatestReferralPayment();
      await downloadReceipt(payment);
    } catch (error) {
      console.error("Latest receipt download error:", error);
      alert(error?.message || "Unable to generate the payment receipt PDF.");
    }
  };

  const emailLatestReferralReceipt = async () => {
    try {
      const payment = await loadLatestReferralPayment();
      await emailReceipt(payment);
    } catch (error) {
      console.error("Latest receipt email error:", error);
      alert(error?.message || "Unable to prepare the payment receipt.");
    }
  };

  const whatsappLatestReferralReceipt = async () => {
    try {
      const payment = await loadLatestReferralPayment();
      await whatsappReceipt(payment);
    } catch (error) {
      console.error("Latest receipt WhatsApp error:", error);
      alert(error?.message || "Unable to prepare the payment receipt.");
    }
  };

  const printReceipt = async (patientOrPayment) => {
    try {
      const { receiptData } = await setReceiptDataAndWait(patientOrPayment);
      await logActivity("Prepared Payment Receipt", `${receiptData.patient_name || selectedReferral?.name || "Referral"} - ${receiptData.receipt_number}`);
      PrintEngine.print("referral-receipt-print");
    } catch (error) {
      console.error("Receipt print error:", error);
      alert(error?.message || "Unable to prepare payment receipt.");
    }
  };

  const buildReferralReceiptPdf = async (patientOrPayment) => {
    const { target, receiptData } = await setReceiptDataAndWait(patientOrPayment);
    const { default: html2pdf } = await import("html2pdf.js");
    const filename = `${receiptData.receipt_number || "Receipt"}-${escapeFileName(receiptData.patient_name || selectedReferral?.name || "Referral")}.pdf`;
    const blob = await html2pdf()
      .set({
        margin: [8, 7, 8, 7],
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait", compress: true },
        pagebreak: { mode: ["css", "legacy"] },
      })
      .from(target)
      .outputPdf("blob");
    if (!(blob instanceof Blob)) throw new Error("Unable to create the payment receipt PDF.");
    return { blob, filename, receiptData };
  };

  const downloadReceipt = async (patientOrPayment) => {
    try {
      const { blob, filename, receiptData } = await buildReferralReceiptPdf(patientOrPayment);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      await logActivity("Downloaded Payment Receipt", `${receiptData.patient_name || selectedReferral?.name || "Referral"} - ${receiptData.receipt_number}`);
    } catch (error) {
      console.error("Receipt PDF error:", error);
      alert(error?.message || "Unable to generate payment receipt PDF.");
    }
  };

  const shareReferralReceiptPdf = async (patientOrPayment, channel) => {
    try {
      const { blob, filename, receiptData } = await buildReferralReceiptPdf(patientOrPayment);
      const file = new File([blob], filename, { type: "application/pdf" });
      const recipient = channel === "email" ? String(selectedReferral?.email || "").trim() : "";
      const rawPhone = String(selectedReferral?.phone || "").replace(/\D/g, "");
      const whatsappNumber = rawPhone.startsWith("0") ? `234${rawPhone.slice(1)}` : rawPhone.startsWith("234") ? rawPhone : rawPhone ? `234${rawPhone}` : "";
      const title = `${receiptData.receipt_number} | Payment Receipt`;
      const text = `Please find attached the official payment receipt ${receiptData.receipt_number} from ${BUSINESS_NAME}.`;
      const canFileShare = typeof navigator !== "undefined" && typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare({ files: [file] }));
      if (canFileShare) {
        await navigator.share({ title, text, files: [file] });
        await logActivity(channel === "email" ? "Shared Receipt PDF By Email" : "Shared Receipt PDF By WhatsApp", `${receiptData.patient_name || selectedReferral?.name || "Referral"} - ${receiptData.receipt_number}`);
        return;
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      if (channel === "email") {
        const subject = `${receiptData.receipt_number} | Payment Receipt | ${BUSINESS_NAME}`;
        const body = [`Dear ${selectedReferral?.contact_person || selectedReferral?.name || "Sir/Madam"},`, "", `Please find the official payment receipt ${receiptData.receipt_number}.`, "", "The receipt PDF has been downloaded because this browser does not support direct file attachment through the email composer.", "Please attach the downloaded receipt PDF before sending.", "", "Kind regards,", managerSigner?.full_name || "Laboratory Manager", "Laboratory Manager", BUSINESS_NAME].join("\n");
        window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      } else {
        if (!whatsappNumber) throw new Error("This referral does not have a phone number.");
        const message = [`*${BUSINESS_NAME.toUpperCase()}*`, "", `*PAYMENT RECEIPT ${receiptData.receipt_number}*`, "", "The official payment receipt PDF has been downloaded.", "Please attach the downloaded PDF to this WhatsApp conversation before sending."].join("\n");
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.error("Receipt sharing error:", error);
      alert(error?.message || "Unable to share the payment receipt PDF.");
    }
  };

  const emailReceipt = async (patientOrPayment) => shareReferralReceiptPdf(patientOrPayment, "email");
  const whatsappReceipt = async (patientOrPayment) => shareReferralReceiptPdf(patientOrPayment, "whatsapp");

  /* =======================================================
     PRINT COMMISSION RECEIPT
  ======================================================= */

  const printCommissionReceipt =
    async payment => {
      const receiptData = {
        ...payment,

        receipt_number:
          payment.receipt_number ||
          generateReference("COM"),
      };

      setPrintCommissionData(
        receiptData
      );

      await logActivity(
        "Prepared Commission Receipt",
        payment.referral_name
      );

      await waitForPrintTarget(
        "referral-commission-receipt-print"
      );

      await new Promise(
        resolve =>
          requestAnimationFrame(
            () =>
              requestAnimationFrame(
                resolve
              )
          )
      );

      PrintEngine.print(
        "referral-commission-receipt-print"
      );
    };


  /* =======================================================
     EXPORT REFERRALS
  ======================================================= */

  const exportReferrals =
    () => {
      const exportData =
        filteredReferrals.map(
          item => ({
            "Referral Code":
              item.referral_code,

            Name:
              item.name,

            Type:
              item.type,

            Phone:
              item.phone,

            "Contact Person":
              item.contact_person,

            Email:
              item.email,

            Commission:
              `${item.commission_rate}%`,

            "Credit Limit":
              item.credit_limit,

            Status:
              item.status,
          })
        );

      const worksheet =
        XLSX.utils.json_to_sheet(
          exportData
        );

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Referrals"
      );

      XLSX.writeFile(
        workbook,
        "PEFA_Referrals.xlsx"
      );
    };


  /* =======================================================
     PAYMENT STATUS CLASS
  ======================================================= */

  const getPaymentStatusClass =
    status => {
      if (status === "Paid") {
        return "status-paid";
      }

      if (status === "Part Paid") {
        return "status-part-paid";
      }

      return "status-unpaid";
    };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="referral-dashboard">

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div className="referral-header">

        <div>
          <h1>
            Referral Dashboard
          </h1>

          <p>
            Manage referral partners,
            invoices, payments and
            commissions.
          </p>
        </div>

        <button
          className="add-referral-btn"
          onClick={() => {
            setEditingReferral(null);

            setNewReferral({
              ...EMPTY_REFERRAL,
            });

            setShowModal(true);
          }}
        >
          + New Referral
        </button>

      </div>


      {/* ===================================================
          STATISTICS
      =================================================== */}

      <div className="stats-grid">

        <div className="stat-card">
          <Building2 size={22} />

          <div className="stat-title">
            Total Referrals
          </div>

          <div className="stat-value">
            {referrals.length}
          </div>
        </div>


        <div className="stat-card">
          <Users size={22} />

          <div className="stat-title">
            Patients Referred
          </div>

          <div className="stat-value">
            {totalPatients}
          </div>
        </div>


        <div className="stat-card">
          <Wallet size={22} />

          <div className="stat-title">
            Revenue
          </div>

          <div className="stat-value">
            {naira(totalRevenue)}
          </div>
        </div>


        <div className="stat-card">
          <Wallet size={22} />

          <div className="stat-title">
            Outstanding
          </div>

          <div className="stat-value">
            {naira(totalBalance)}
          </div>
        </div>

      </div>


      {/* ===================================================
          RANKING
      =================================================== */}

      <div className="ranking-grid">

        <div className="ranking-card">
          <span>
            🥇 Top Revenue
          </span>

          <h3>
            {topRevenueReferral?.name ||
              "-"}
          </h3>

          <p>
            {naira(
              topRevenueReferral?.revenue
            )}
          </p>
        </div>


        <div className="ranking-card">
          <span>
            ðŸ‘¥ Most Patients
          </span>

          <h3>
            {topPatientReferral?.name ||
              "-"}
          </h3>

          <p>
            {topPatientReferral?.patients ||
              0}
          </p>
        </div>


        <div className="ranking-card">
          <span>
            ðŸ’° Top Commission
          </span>

          <h3>
            {topCommissionReferral?.name ||
              "-"}
          </h3>

          <p>
            {naira(
              topCommissionReferral?.commission
            )}
          </p>
        </div>


        <div className="ranking-card">
          <span>
            âš  Outstanding
          </span>

          <h3>
            {topOutstandingReferral?.name ||
              "-"}
          </h3>

          <p>
            {naira(
              topOutstandingReferral?.outstanding
            )}
          </p>
        </div>

      </div>


      {/* ===================================================
          EXPORT
      =================================================== */}

      <div className="export-bar">

        <button
          className="export-btn"
          onClick={
            exportReferrals
          }
        >
          ðŸ“Š Export Referrals
        </button>

      </div>


      {/* ===================================================
          SEARCH
      =================================================== */}

      <div className="search-section">

        <Search size={18} />

        <input
          type="text"
          placeholder="Search referral name, phone or contact person..."
          value={searchTerm}
          onChange={e =>
            setSearchTerm(
              e.target.value
            )
          }
          className="search-input"
        />

      </div>


      {/* ===================================================
          FILTER
      =================================================== */}

      <div className="filter-bar">

        {[
          "All",
          "Active",
          "Inactive",
        ].map(type => (
          <button
            key={type}
            className={
              filterType === type
                ? "filter-btn active"
                : "filter-btn"
            }
            onClick={() =>
              setFilterType(type)
            }
          >
            {type}
          </button>
        ))}

      </div>


     {/* ===================================================
    REFERRALS TABLE

    IMPORTANT:
    This table is intentionally BEFORE the bar chart.

    It displays REFERRAL PARTNERS only.
    Patient/referral invoice records are displayed
    inside the referral details view, not here.
=================================================== */}

<div className="table-card">

  {/* =================================================
      TABLE HEADER
  ================================================= */}

  <div className="table-card-header">

    <div>

      <h2>
        Referral Partners
      </h2>

      <p>
        {filteredReferrals.length}{" "}
        referral
        {filteredReferrals.length === 1
          ? ""
          : "s"}{" "}
        displayed
      </p>

    </div>

  </div>


  {/* =================================================
      TABLE
  ================================================= */}

  <div className="table-wrapper">

    <table>

      <thead>

        <tr>

          <th>
            Referral Name
          </th>

          <th>
            Referral Code
          </th>

          <th>
            Phone
          </th>

          <th>
            Commission
          </th>

          <th>
            Status
          </th>

          <th>
            Action
          </th>

        </tr>

      </thead>


      <tbody>

        {/* =============================================
            EMPTY STATE
        ============================================= */}

        {filteredReferrals.length === 0 && (

          <tr>

            <td
              colSpan={6}
              style={{
                textAlign: "center",
                padding: "30px",
              }}
            >

              No referrals found.

            </td>

          </tr>

        )}


        {/* =============================================
            REFERRAL PARTNERS
        ============================================= */}

        {filteredReferrals.map((item) => {

          const referralName =
            item?.name?.trim() ||
            "Unnamed Referral";


          const referralCode =
            item?.referral_code?.trim() ||
            "-";


          const phone =
            item?.phone?.trim() ||
            "-";


          const commissionRate =
            Number(
              item?.commission_rate || 0
            );


          const status =
            item?.status ||
            "Inactive";


          const isActive =
            String(status).toLowerCase() ===
            "active";


          return (

            <tr
              key={item.id}
            >

              {/* =======================================
                  REFERRAL NAME
              ======================================= */}

              <td>

                <strong>
                  {referralName}
                </strong>

              </td>


              {/* =======================================
                  REFERRAL CODE
              ======================================= */}

              <td>

                <span>
                  {referralCode}
                </span>

              </td>


              {/* =======================================
                  PHONE
              ======================================= */}

              <td>

                {phone}

              </td>


              {/* =======================================
                  COMMISSION
              ======================================= */}

              <td>

                {commissionRate.toLocaleString(
                  "en-NG",
                  {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  }
                )}

                %

              </td>


              {/* =======================================
                  STATUS
              ======================================= */}

              <td>

                <span
                  className={
                    isActive
                      ? "status-active"
                      : "status-inactive"
                  }
                >

                  {status}

                </span>

              </td>


              {/* =======================================
                  ACTIONS
              ======================================= */}

              <td>

                <div className="action-buttons">

                  {/* VIEW */}

                  <button
                    type="button"
                    className="view-btn"
                    onClick={() =>
                      viewReferral(item)
                    }
                    disabled={!item?.id}
                  >

                    <Eye
                      size={16}
                    />

                    View

                  </button>


                  {/* EDIT */}

                  <button
                    type="button"
                    className="payment-btn"
                    onClick={() =>
                      editReferral(item)
                    }
                    disabled={!item?.id}
                  >

                    <Edit3
                      size={16}
                    />

                    Edit

                  </button>

                </div>

              </td>

            </tr>

          );

        })}

      </tbody>

    </table>

  </div>

</div>

      {/* ===================================================
          CHART
          
          TABLE IS ABOVE THIS SECTION.
      =================================================== */}

      <div
        className="analytics-card"
        style={{
          minHeight:
            "380px",
        }}
      >

        <h2>
          Revenue By Referral
        </h2>

        <div
          style={{
            position:
              "relative",
            height:
              "320px",
          }}
        >
          <Bar
            data={
              revenueChartData
            }
            options={{
              responsive: true,

              maintainAspectRatio:
                false,

              plugins: {
                legend: {
                  display:
                    true,
                },

                tooltip: {
                  callbacks: {
                    label:
                      context =>
                        `Revenue: ${naira(
                          context.raw
                        )}`,
                  },
                },
              },

              scales: {
                y: {
                  beginAtZero:
                    true,

                  ticks: {
                    callback:
                      value =>
                        naira(
                          value
                        ),
                  },
                },
              },
            }}
          />
        </div>

      </div>


      {/* ===================================================
          REFERRAL DETAIL MODAL
      =================================================== */}

      {selectedReferral && (
        <PEFAModalPortal>
        <div className="modal-overlay">

          <div className="modal-content referral-detail-modal">

            <div className="modal-header">

              <div>
                <h2>
                  {selectedReferral.name}
                </h2>

                <p>
                  {selectedReferral.referral_code ||
                    "Referral Account"}
                </p>
              </div>

              <button
                className="close-btn"
                onClick={() =>
                  setSelectedReferral(
                    null
                  )
                }
              >
                <X size={20} />
              </button>

            </div>


            {/* =================================================
                ACTION BAR
            ================================================= */}

            <div className="dashboard-actions">

              <button
                className="statement-btn"
                onClick={() =>
                  loadPaymentHistory(
                    selectedReferral,
                    { openModal: true }
                  )
                }
              >
                <History size={16} />
                Payment History
              </button>


              <button
                className="statement-btn"
                onClick={() =>
                  setShowStatement(
                    true
                  )
                }
              >
                <FileText size={16} />
                Statement
              </button>


              {Number(currentReferralInvoice?.balance ?? 0) > 0 ? (
                <button
                  className="invoice-btn"
                  onClick={viewInvoice}
                  disabled={viewerLoading}
                >
                  <Eye size={16} />
                  {viewerLoading ? "Opening..." : "View Invoice"}
                </button>
              ) : (
                <>
                  <div className="paid-document-banner">
                    <ReceiptText size={17} />
                    <span>Invoice fully paid — use the payment receipt for the paid transaction.</span>
                  </div>
                  <button
                    className="receipt-btn"
                    onClick={async () => {
                      try {
                        const payment = await loadLatestReferralPayment();
                        await viewReceipt(payment);
                      } catch (error) {
                        console.error("Receipt view error:", error);
                        alert(error?.message || "Unable to open the payment receipt.");
                      }
                    }}
                  >
                    <ReceiptText size={16} />
                    View Receipt
                  </button>
                </>
              )}


              {currentReferralInvoice?.id && currentInvoiceNetBalance > 0 && (
                <button
                  type="button"
                  className="payment-btn full-invoice-payment-btn"
                  disabled={savingPayment}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!currentReferralInvoice?.id || currentInvoiceNetBalance <= 0) return;

                    setSelectedInvoice({
                      ...currentReferralInvoice,
                      patient_name: `${selectedReferral?.name || "Referral"} — FULL INVOICE`,
                      final_amount: currentInvoiceTotalPayable,
                      amount_paid: currentInvoicePaidAmount,
                      balance: currentInvoiceNetBalance,
                      tests: "Full referral invoice",
                    });
                    setPaymentAmount(String(currentInvoiceNetBalance));
                    setShowPaymentModal(true);
                  }}
                >
                  <Wallet size={16} />
                  Pay Full Invoice
                </button>
              )}


              <button
                className="commission-btn"
                onClick={async () => {
                  await loadCommissionHistory();

                  setShowCommissionModal(
                    true
                  );
                }}
              >
                <BadgePercent size={16} />
                Commission
              </button>


            </div>


            {/* =================================================
                PAYMENT MANAGEMENT
            ================================================= */}

            <div className="payment-manager">

              <h3>
                Payment Management
              </h3>

              <div className="table-wrapper">

                <table>

                  <thead>
                    <tr>
                      <th>
                        Patient
                      </th>

                      <th>
                        Lab No
                      </th>

                      <th>
                        Amount
                      </th>

                      <th>
                        Paid
                      </th>

                      <th>
                        Balance
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {outstandingReferralPatients.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan="7"
                          style={{
                            textAlign:
                              "center",
                            padding:
                              "30px",
                          }}
                        >
                          No outstanding payments
                          for this referral.
                        </td>
                      </tr>
                    )}


                    {outstandingReferralPatients.map(
                      patient => {
                        /* Use patient/order-level amounts here. The invoice
                           header may aggregate several patients. */
                        const paid = Number(
                          patient.patient_paid ??
                          patient.service_order_paid ??
                          0
                        );

                        const rowAmount = Number(
                          patient.patient_amount ??
                          patient.item?.amount ??
                          patient.service_order?.total_amount ??
                          patient.amount ??
                          0
                        );

                        const rowBalance = Number(
                          patient.patient_balance ??
                          patient.service_order_balance ??
                          patient.item?.amount ??
                          0
                        );

                        const rowStatus =
                          patient.patient_payment_status ||
                          patient.service_order_payment_status ||
                          (rowBalance > 0 ? "Outstanding" : "Paid");

                        return (
                          <tr
                            key={
                              patient.service_order_id ||
                              `${patient.referral_invoice_id}-${patient.lab_number}-${patient.patient_name}`
                            }
                          >

                            <td>
                              {
                                patient.patient_name
                              }
                            </td>

                            <td>
                              {
                                patient.lab_number ||
                                "-"
                              }
                            </td>

                            <td>
                              {naira(
                                rowAmount
                              )}
                            </td>

                            <td>
                              {naira(
                                paid
                              )}
                            </td>

                            <td>
                              {naira(
                                rowBalance
                              )}
                            </td>

                            <td>
                              <span
                                className={
                                  getPaymentStatusClass(
                                    rowStatus
                                  )
                                }
                              >
                                {rowStatus}
                              </span>
                            </td>

                            <td>
                              <div className="action-buttons">

                                <button
                                  className="payment-btn"
                                  disabled={
                                    rowBalance <= 0
                                  }
                                  onClick={() => {
                                    setSelectedInvoice(
                                      patient.invoice
                                    );

                                    setPaymentAmount(
                                      ""
                                    );

                                    setShowPaymentModal(
                                      true
                                    );
                                  }}
                                >
                                  Record Payment
                                </button>

                                <button
                                  type="button"
                                  className="remove-referral-btn"
                                  title="Remove this patient from this referral account"
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openRemoveReferralModal(patient);
                                  }}
                                >
                                  <Trash2 size={15} />
                                  Remove Referral
                                </button>


                                {paid > 0 && (
                                  <>
                                    <button
                                      className="receipt-btn"
                                      onClick={() => printReceipt(patient)}
                                    >
                                      <ReceiptText size={16} />
                                      Receipt
                                    </button>

                                    <button
                                      className="receipt-btn"
                                      onClick={() => downloadReceipt(patient)}
                                    >
                                      <Download size={16} />
                                      PDF
                                    </button>

                                    <button className="receipt-btn" onClick={() => emailReceipt(patient)}><Mail size={16} />Email</button>
                                    <button className="receipt-btn" onClick={() => whatsappReceipt(patient)}><MessageCircle size={16} />WhatsApp</button>
                                  </>
                                )}

                              </div>
                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            </div>


            {/* =================================================
                PERFORMANCE
            ================================================= */}

            <div className="referral-performance">

              <div className="performance-card">
                <span>
                  Patients
                </span>

                <h2>
                  {
                    referralPatients.length
                  }
                </h2>
              </div>


              <div className="performance-card">
                <span>
                  Revenue
                </span>

                <h2>
                  {naira(
                    referralRevenue
                  )}
                </h2>
              </div>


              <div className="performance-card">
                <span>
                  Paid
                </span>

                <h2>
                  {naira(
                    referralPaid
                  )}
                </h2>
              </div>


              <div className="performance-card">
                <span>
                  Outstanding
                </span>

                <h2>
                  {naira(
                    referralOutstanding
                  )}
                </h2>
              </div>


              <div className="performance-card">
                <span>
                  Commission
                </span>

                <h2>
                  {naira(
                    referralCommission
                  )}
                </h2>
              </div>

            </div>

          </div>
        </div>
        </PEFAModalPortal>
      )}


      {/* ===================================================
          COMMISSION MODAL
      =================================================== */}

      {showCommissionModal &&
        selectedReferral && (
        <PEFAModalPortal>
          <div className="modal-overlay">

            <div className="modal-content">

              <div className="modal-header">

                <h2>
                  Commission Management
                </h2>

                <button
                  className="close-btn"
                  onClick={() =>
                    setShowCommissionModal(
                      false
                    )
                  }
                >
                  <X size={20} />
                </button>

              </div>


              <div className="commission-form">

                <div className="commission-summary">

                  <h3>
                    Commission Due
                  </h3>

                  <h1>
                    {naira(
                      referralCommission
                    )}
                  </h1>

                </div>


                <label>
                  Amount Paying
                </label>

                <input
                  type="number"
                  min="0"
                  max={
                    referralCommission
                  }
                  value={
                    commissionAmount
                  }
                  onChange={e =>
                    setCommissionAmount(
                      e.target.value
                    )
                  }
                  placeholder="Enter amount"
                />


                <label>
                  Notes
                </label>

                <textarea
                  value={
                    commissionNote
                  }
                  onChange={e =>
                    setCommissionNote(
                      e.target.value
                    )
                  }
                  placeholder="Optional notes"
                />


                <button
                  className="commission-save-btn"
                  disabled={
                    savingCommission
                  }
                  onClick={
                    saveCommissionPayment
                  }
                >
                  {savingCommission
                    ? "Saving..."
                    : "Save Commission Payment"}
                </button>


                <h3
                  style={{
                    marginTop:
                      "25px",
                  }}
                >
                  Commission History
                </h3>


                <div className="table-wrapper">

                  <table className="commission-table">

                    <thead>
                      <tr>
                        <th>
                          Date
                        </th>

                        <th>
                          Receipt
                        </th>

                        <th>
                          Amount
                        </th>

                        <th>
                          Balance
                        </th>

                        <th>
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {commissionHistory.length ===
                        0 && (
                        <tr>
                          <td
                            colSpan="5"
                            style={{
                              textAlign:
                                "center",
                              padding:
                                "20px",
                            }}
                          >
                            No commission
                            payments yet.
                          </td>
                        </tr>
                      )}


                      {commissionHistory.map(
                        item => (
                          <tr
                            key={
                              item.id
                            }
                          >

                            <td>
                              {formatDate(
                                item.payment_date
                              )}
                            </td>

                            <td>
                              {item.receipt_number ||
                                "-"}
                            </td>

                            <td>
                              {naira(
                                item.amount_paid
                              )}
                            </td>

                            <td>
                              {naira(
                                item.balance
                              )}
                            </td>

                            <td>
                              <button
                                className="receipt-btn"
                                onClick={() =>
                                  printCommissionReceipt(
                                    item
                                  )
                                }
                              >
                                <ReceiptText
                                  size={
                                    16
                                  }
                                />
                                Receipt
                              </button>
                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>

          </div>
        </PEFAModalPortal>
        )}


      {/* ===================================================
          INVOICE VIEWER

          The viewer is the document workspace. Printing, PDF
          download, email and WhatsApp are deliberately inside
          the viewer so the action bar stays clean.
      =================================================== */}

      {showInvoiceViewer && (
        <PEFAModalPortal>
        <div className="modal-overlay document-viewer-overlay">
          <div className="modal-content document-viewer-modal">
            <div className="modal-header document-viewer-header">
              <div>
                <h2>Referral Invoice</h2>
                <p>Pending Payment Document</p>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowInvoiceViewer(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="document-viewer-actions">
              <button className="invoice-btn" onClick={printInvoice}>
                <Printer size={16} />
                Print
              </button>
              <button className="invoice-btn" onClick={downloadInvoice}>
                <Download size={16} />
                Download PDF
              </button>
              <button className="invoice-btn" onClick={emailInvoice}>
                <Mail size={16} />
                Email
              </button>
              <button className="commission-btn" onClick={whatsappInvoice}>
                <MessageCircle size={16} />
                WhatsApp
              </button>
            </div>

            <div className="document-viewer-paper">
              <div
                className="document-viewer-render"
                dangerouslySetInnerHTML={{ __html: invoiceViewerHtml }}
              />
            </div>
          </div>
        </div>
        </PEFAModalPortal>
      )}


      {/* ===================================================
          RECEIPT VIEWER

          A receipt is the paid transaction document. All
          receipt actions are kept inside this viewer.
      =================================================== */}

      {showReceiptViewer && (
        <PEFAModalPortal>
        <div className="modal-overlay document-viewer-overlay">
          <div className="modal-content document-viewer-modal">
            <div className="modal-header document-viewer-header">
              <div>
                <h2>Payment Receipt</h2>
                <p>Official Paid Transaction Receipt</p>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowReceiptViewer(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="document-viewer-actions">
              <button
                className="receipt-btn"
                onClick={() => printReceipt(viewerReceiptData)}
              >
                <Printer size={16} />
                Print
              </button>
              <button
                className="receipt-btn"
                onClick={() => downloadReceipt(viewerReceiptData)}
              >
                <Download size={16} />
                Download PDF
              </button>
              <button
                className="receipt-btn"
                onClick={() => emailReceipt(viewerReceiptData)}
              >
                <Mail size={16} />
                Email
              </button>
              <button
                className="receipt-btn"
                onClick={() => whatsappReceipt(viewerReceiptData)}
              >
                <MessageCircle size={16} />
                WhatsApp
              </button>
            </div>

            <div className="document-viewer-paper">
              <div
                className="document-viewer-render"
                dangerouslySetInnerHTML={{ __html: receiptViewerHtml }}
              />
            </div>
          </div>
        </div>
        </PEFAModalPortal>
      )}


      {/* ===================================================
          STATEMENT MODAL
      =================================================== */}

      {showStatement &&
        selectedReferral && (
        <PEFAModalPortal>
          <div className="modal-overlay">

            <div className="modal-content">

              <div className="modal-header">

                <div>
                  <h2>
                    Statement Of Account
                  </h2>

                  <p>
                    {
                      selectedReferral.name
                    }
                  </p>
                </div>

                <button
                  className="close-btn"
                  onClick={() =>
                    setShowStatement(
                      false
                    )
                  }
                >
                  <X size={20} />
                </button>

              </div>


              <div className="table-wrapper">

                <table>

                  <tbody>

                    <tr>
                      <td>
                        Revenue
                      </td>

                      <td>
                        {naira(
                          referralRevenue
                        )}
                      </td>
                    </tr>


                    <tr>
                      <td>
                        Paid
                      </td>

                      <td>
                        {naira(
                          referralPaid
                        )}
                      </td>
                    </tr>


                    <tr>
                      <td>
                        Outstanding
                      </td>

                      <td>
                        {naira(
                          referralOutstanding
                        )}
                      </td>
                    </tr>


                    <tr>
                      <td>
                        Commission Rate
                      </td>

                      <td>
                        {
                          selectedReferral.commission_rate ||
                          0
                        }
                        %
                      </td>
                    </tr>


                    <tr>
                      <td>
                        Commission Due
                      </td>

                      <td>
                        {naira(
                          referralCommission
                        )}
                      </td>
                    </tr>

                  </tbody>

                </table>

              </div>

            </div>

          </div>
        </PEFAModalPortal>
        )}


      {/* ===================================================
          REMOVE REFERRAL / AUDIT MODAL
      =================================================== */}

      {createPortal(showRemoveReferralModal && removeReferralPatient && (
        <div
          className="modal-overlay referral-remove-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !removingReferral) closeRemoveReferralModal();
          }}
        >
          <div
            className="modal-content referral-remove-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-referral-title"
          >
            <div className="modal-header referral-remove-header">
              <div>
                <span className="remove-referral-eyebrow">REFERRAL ACCOUNT CONTROL</span>
                <h2 id="remove-referral-title">Remove Patient From Referral</h2>
                <p>This action is permanently recorded in the PEFA Audit Trail.</p>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={closeRemoveReferralModal}
                disabled={removingReferral}
                aria-label="Close remove referral dialog"
                title="Cancel"
              >
                <X size={22} />
              </button>
            </div>

            <div className="referral-remove-warning">
              <strong>Important:</strong> This removes only the patient's referral billing association.
              The patient registration, laboratory results and service order will remain intact.
              If payment has already been posted, the paid transaction is preserved in Payment History.
            </div>

            <div className="referral-remove-patient-card">
              <div><span>PATIENT</span><strong>{removeReferralPatient.patient_name || "Unknown Patient"}</strong></div>
              <div><span>LAB NO.</span><strong>{removeReferralPatient.lab_number || "-"}</strong></div>
              <div><span>REFERRAL</span><strong>{selectedReferral?.name || removeReferralPatient.referral_name || "-"}</strong></div>
              <div><span>AMOUNT BILLED</span><strong>{naira(removeReferralPatient.patient_amount ?? removeReferralPatient.amount ?? 0)}</strong></div>
            </div>

            <div className="referral-remove-form">
              <div className="form-group">
                <label htmlFor="remove-referral-reason">Reason for Removal <em>*</em></label>
                <select
                  id="remove-referral-reason"
                  value={removeReferralReason}
                  onChange={(e) => setRemoveReferralReason(e.target.value)}
                  disabled={removingReferral}
                >
                  <option value="">Select a reason</option>
                  <option value="Patient was assigned to wrong referral">Patient was assigned to wrong referral</option>
                  <option value="Registration error">Registration error</option>
                  <option value="Referral changed">Referral changed</option>
                  <option value="Duplicate referral assignment">Duplicate referral assignment</option>
                  <option value="Patient requested correction">Patient requested correction</option>
                  <option value="Administrative correction">Administrative correction</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="remove-referral-details">Detailed Explanation <em>*</em></label>
                <textarea
                  id="remove-referral-details"
                  value={removeReferralDetails}
                  onChange={(e) => setRemoveReferralDetails(e.target.value)}
                  disabled={removingReferral}
                  rows={5}
                  maxLength={1000}
                  placeholder="Explain why this patient is being removed from the referral account..."
                />
                <small>{removeReferralDetails.length}/1000 characters</small>
              </div>
            </div>

            <div className="referral-remove-audit-box">
              <strong>Audit record will contain:</strong>
              <span>Staff identity · Role · Patient · Lab No. · Referral · Invoice · Amount · Reason · Explanation · Date/Time</span>
            </div>

            <div className="referral-remove-actions">
              <button type="button" className="secondary-modal-btn" onClick={closeRemoveReferralModal} disabled={removingReferral}>
                Cancel
              </button>
              <button
                type="button"
                className="danger-confirm-btn"
                onClick={removePatientFromReferral}
                disabled={removingReferral || !removeReferralReason.trim() || !removeReferralDetails.trim()}
              >
                <Trash2 size={17} />
                {removingReferral ? "Removing & Auditing..." : "Remove & Record Audit"}
              </button>
            </div>
          </div>
        </div>
      ), document.body)}


      {/* ===================================================
          PAYMENT MODAL
      =================================================== */}

      {showPaymentModal &&
        selectedInvoice && (
        <PEFAModalPortal>
          <div className="modal-overlay">

            <div className="modal-content">

              <div className="modal-header">

                <h2>
                  Record Payment
                </h2>

                <button
                  className="close-btn"
                  onClick={() =>
                    setShowPaymentModal(
                      false
                    )
                  }
                >
                  <X size={20} />
                </button>

              </div>


              <p>
                <strong>
                  Patient:
                </strong>{" "}
                {
                  selectedInvoice.patient_name
                }
              </p>


              <p>
                <strong>
                  Invoice Amount:
                </strong>{" "}
                {naira(
                  selectedInvoice.final_amount
                )}
              </p>


              <p>
                <strong>
                  Already Paid:
                </strong>{" "}
                {naira(
                  selectedInvoice.amount_paid
                )}
              </p>


              <p>
                <strong>
                  Current Balance:
                </strong>{" "}
                {naira(
                  selectedInvoice.balance
                )}
              </p>


              <input
                type="number"
                min="0"
                max={
                  selectedInvoice.balance
                }
                value={
                  paymentAmount
                }
                onChange={e =>
                  setPaymentAmount(
                    e.target.value
                  )
                }
                placeholder="Amount Paid"
              />


              <div
                style={{
                  display:
                    "flex",
                  gap: "10px",
                  marginTop:
                    "20px",
                }}
              >

                <button
                  className="payment-btn"
                  disabled={
                    savingPayment
                  }
                  onClick={
                    recordPayment
                  }
                >
                  {savingPayment
                    ? "Saving..."
                    : "Save Payment"}
                </button>

              </div>

            </div>

          </div>
        </PEFAModalPortal>
        )}


      {/* ===================================================
          NEW / EDIT REFERRAL
      =================================================== */}

      {showModal && (
        <PEFAModalPortal>
        <div className="modal-overlay">

          <div className="modal-content">

            <div className="modal-header">

              <h2>
                {editingReferral
                  ? "Edit Referral"
                  : "New Referral"}
              </h2>

              <button
                className="close-btn"
                onClick={
                  resetReferralForm
                }
              >
                <X size={20} />
              </button>

            </div>


            <input
              type="text"
              placeholder="Referral Name"
              value={
                newReferral.name
              }
              onChange={e =>
                setNewReferral({
                  ...newReferral,
                  name:
                    e.target.value,
                })
              }
            />


            <input
              type="text"
              placeholder="Referral Type"
              value={
                newReferral.type
              }
              onChange={e =>
                setNewReferral({
                  ...newReferral,
                  type:
                    e.target.value,
                })
              }
            />


            <input
              type="text"
              placeholder="Phone Number"
              value={
                newReferral.phone
              }
              onChange={e =>
                setNewReferral({
                  ...newReferral,
                  phone:
                    e.target.value,
                })
              }
            />


            <input
              type="text"
              placeholder="Contact Person"
              value={
                newReferral.contact_person
              }
              onChange={e =>
                setNewReferral({
                  ...newReferral,
                  contact_person:
                    e.target.value,
                })
              }
            />


            <input
              type="email"
              placeholder="Email"
              value={
                newReferral.email
              }
              onChange={e =>
                setNewReferral({
                  ...newReferral,
                  email:
                    e.target.value,
                })
              }
            />


            <input
              type="number"
              min="0"
              placeholder="Commission %"
              value={
                newReferral.commission_rate
              }
              onChange={e =>
                setNewReferral({
                  ...newReferral,
                  commission_rate:
                    e.target.value,
                })
              }
            />


            <input
              type="number"
              min="0"
              placeholder="Credit Limit"
              value={
                newReferral.credit_limit
              }
              onChange={e =>
                setNewReferral({
                  ...newReferral,
                  credit_limit:
                    e.target.value,
                })
              }
            />


            <textarea
              placeholder="Address"
              value={
                newReferral.address
              }
              onChange={e =>
                setNewReferral({
                  ...newReferral,
                  address:
                    e.target.value,
                })
              }
            />


            <select
              value={
                newReferral.status
              }
              onChange={e =>
                setNewReferral({
                  ...newReferral,
                  status:
                    e.target.value,
                })
              }
            >

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>

            </select>


            <div
              style={{
                display:
                  "flex",
                gap: "10px",
                marginTop:
                  "20px",
              }}
            >

              <button
                className="payment-btn"
                disabled={
                  savingReferral
                }
                onClick={() =>
                  editingReferral
                    ? updateReferral()
                    : createReferral()
                }
              >
                {savingReferral
                  ? "Saving..."
                  : editingReferral
                  ? "Update Referral"
                  : "Save Referral"}
              </button>

            </div>

          </div>

        </div>
        </PEFAModalPortal>
      )}


      {/* ===================================================
          PAYMENT HISTORY
      =================================================== */}

      {showHistoryModal && (
        <PEFAModalPortal>
        <div className="modal-overlay">

          <div className="modal-content">

            <div className="modal-header">

              <div>
                <h2>
                  Payment History
                </h2>

                <p>
                  {
                    selectedReferral?.name
                  }
                </p>
              </div>

              <button
                className="close-btn"
                onClick={() =>
                  setShowHistoryModal(
                    false
                  )
                }
              >
                <X size={20} />
              </button>

            </div>


            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>
                      Date
                    </th>

                    <th>
                      Patient
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Previous Balance
                    </th>

                    <th>
                      New Balance
                    </th>
                    <th>Receipt</th>
                  </tr>

                </thead>

                <tbody>

                  {paymentHistory.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "25px",
                        }}
                      >
                        No payment history.
                      </td>
                    </tr>
                  )}


                  {paymentHistory.map(
                    item => (
                      <tr
                        key={
                          item.id
                        }
                      >

                        <td>
                          {formatDateTime(
                            item.payment_date
                          )}
                        </td>

                        <td>
                          {
                            item.patient_name
                          }
                        </td>

                        <td>
                          {naira(
                            item.amount_paid
                          )}
                        </td>

                        <td>
                          {naira(
                            item.previous_balance
                          )}
                        </td>

                        <td>
                          {naira(
                            item.new_balance
                          )}
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="receipt-btn"
                              onClick={() => viewReceipt(item)}
                            >
                              <Eye size={15} />
                              View Receipt
                            </button>
                          </div>
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>
        </PEFAModalPortal>
      )}


      {/* ===================================================
          ===================================================
          SHARED LETTERHEAD — REFERRAL INVOICE
          
          IMPORTANT:
          Do NOT use display:none here.
          
          The document remains mounted so PrintEngine can
          reliably clone/render the complete PEFADigitalLetterhead.
          ===================================================
      =================================================== */}

      <div
        ref={invoicePrintRef}
        id="referral-invoice-print"
        className="print-render-target"
        aria-hidden="true"
      >

        {selectedReferral && currentReferralInvoice && (
          <PEFADigitalLetterhead verificationId="PEFA">

            <div className="referral-print-document">

              {/* =========================================
                  INVOICE TITLE
              ========================================= */}

              <div className="referral-print-title">

                <h1>
                  REFERRAL INVOICE
                </h1>

                <p>
                  Referral Account Statement
                </p>

              </div>


              {/* =========================================
                  INVOICE META
              ========================================= */}

              <div className="referral-print-meta">

                <div>
                  <strong>
                    Referral
                  </strong>

                  <span>
                    {
                      selectedReferral.name
                    }
                  </span>
                </div>


                <div>
                  <strong>
                    Referral Code
                  </strong>

                  <span>
                    {
                      selectedReferral.referral_code ||
                      "-"
                    }
                  </span>
                </div>


                <div>
                  <strong>
                    Invoice No.
                  </strong>

                  <span>
                    {getInvoiceNumber()}
                  </span>
                </div>


                <div>
                  <strong>
                    Date
                  </strong>

                  <span>
                    {formatDate(currentReferralInvoice?.created_at || new Date())}
                  </span>
                </div>


                <div>
                  <strong>
                    Commission Rate
                  </strong>

                  <span>
                    {
                      selectedReferral.commission_rate ||
                      0
                    }
                    %
                  </span>
                </div>


                <div>
                  <strong>
                    Contact
                  </strong>

                  <span>
                    {
                      selectedReferral.phone ||
                      "-"
                    }
                  </span>
                </div>

              </div>


              {/* =========================================
                  PENDING PAYMENT TRANSACTIONS
              ========================================= */}

              <div className="referral-invoice-pending-banner">
                <strong>PENDING PAYMENT</strong>
                <span>Payment is due against this invoice. Official receipts are issued only after payment is recorded.</span>
              </div>

              <h3 className="print-section-title">REFERRAL TRANSACTION DETAILS</h3>

              <table className="premium-print-table">
                <thead>
                  <tr>
                    <th>S/N</th>
                    <th>Lab No.</th>
                    <th>Patient</th>
                    <th>Tests / Services</th>
                    <th>Amount Due</th>
                  </tr>
                </thead>
                <tbody>
                  {currentReferralInvoicePatients.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>No transactions recorded for this invoice.</td>
                    </tr>
                  ) : currentReferralInvoicePatients.map((patient, index) => (
                    <tr key={patient.service_order_id || `${patient.referral_invoice_id}-${patient.lab_number}-${patient.patient_name}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{patient.lab_number || "-"}</td>
                      <td>{patient.patient_name || "-"}</td>
                      <td>{patient.tests || patient.test_name || "-"}</td>
                      <td>{naira(patient.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="print-section-title">INVOICE SUMMARY</h3>

              <div className="print-summary-grid referral-invoice-due-summary referral-invoice-financial-summary">
                <div>
                  <span>Gross Invoice Amount</span>
                  <strong>{naira(currentInvoiceGrossAmount)}</strong>
                </div>

                <div>
                  <span>Commission ({currentInvoiceCommissionRate}%)</span>
                  <strong>- {naira(currentInvoiceCommissionAmount)}</strong>
                </div>

                <div className="invoice-total-payable">
                  <span>TOTAL PAYABLE</span>
                  <strong>{naira(currentInvoiceTotalPayable)}</strong>
                </div>

                <div>
                  <span>Amount Paid</span>
                  <strong>{naira(currentInvoicePaidAmount)}</strong>
                </div>

                <div>
                  <span>Balance Payable</span>
                  <strong>{naira(currentInvoiceNetBalance)}</strong>
                </div>

                <div>
                  <span>Payment Status</span>
                  <strong>PENDING PAYMENT</strong>
                </div>
              </div>

              <div className="invoice-commission-note">
                Commission is calculated at the agreed referral rate and
                deducted from the gross invoice amount to determine the
                total payable.
              </div>

              {/* =========================================
                  OFFICIAL AUTHORIZATION
                  -------------------------------------------------
                  ONLY THE MANAGER SIGNS REFERRAL INVOICES.
                  Name and signature are sourced from Staff Management.
              ========================================= */}

              <div className="invoice-manager-signature">
                <div className="invoice-manager-signature-label">
                  AUTHORIZED BY
                </div>

                <div className="invoice-manager-signature-line">
                  {managerSigner?.signature_url ? (
                    <img
                      src={managerSigner.signature_url}
                      alt="Manager official signature"
                      className="invoice-manager-signature-image"
                    />
                  ) : (
                    <div className="invoice-manager-signature-missing">
                      Official manager signature not configured
                    </div>
                  )}
                </div>

                <div className="invoice-manager-name">
                  {managerSigner?.full_name || "Manager Not Configured"}
                </div>

                <div className="invoice-manager-role">
                  Laboratory Manager
                </div>
              </div>

              <div className="print-note">
                This invoice is a computer-generated financial document.
                The official authorization signature shown above is
                retrieved from Staff Management and is restricted to the
                active Manager account.
              </div>

            </div>

          </PEFADigitalLetterhead>
        )}

      </div>


      {/* ===================================================
          ===================================================
          PREMIUM PAYMENT RECEIPT
          
          SHARED LETTERHEAD
      ===================================================
      =================================================== */}

      <div
        ref={receiptPrintRef}
        id="referral-receipt-print"
        className="print-render-target"
        aria-hidden="true"
      >

        {printReceiptData && (
          <PEFADigitalLetterhead verificationId="PEFA">

            <div className="premium-receipt">

              {/* =========================================
                  RECEIPT HEADER
              ========================================= */}

              <div className="premium-receipt-banner">

                <div>
                  <span>
                    OFFICIAL RECEIPT
                  </span>

                  <h1>
                    PAYMENT RECEIPT
                  </h1>

                  <small>
                    {BUSINESS_NAME}
                  </small>
                </div>

                <div className="receipt-status">
                  {
                    printReceiptData.payment_status ||
                    "PAID"
                  }
                </div>

              </div>


              {/* =========================================
                  REFERENCE DETAILS
              ========================================= */}

              <div className="receipt-reference">

                <div>
                  <span>
                    Receipt No.
                  </span>

                  <strong>
                    {
                      printReceiptData.receipt_number ||
                      "-"
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    Receipt Date
                  </span>

                  <strong>
                    {formatDate(
                      printReceiptData.receipt_date
                    )}
                  </strong>
                </div>


                <div>
                  <span>
                    Invoice No.
                  </span>

                  <strong>
                    {printReceiptData.invoice_no || "-"}
                  </strong>
                </div>


                <div>
                  <span>
                    Lab Number
                  </span>

                  <strong>
                    {
                      printReceiptData.lab_number ||
                      "-"
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    Referral
                  </span>

                  <strong>
                    {
                      printReceiptData.referral_name ||
                      "-"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Payment Method
                  </span>

                  <strong>
                    {
                      printReceiptData.payment_method ||
                      "Referral"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    PAYMENT RECORD
                  </span>

                  <strong>
                    {
                      printReceiptData.id ||
                      "Recorded Transaction"
                    }
                  </strong>
                </div>

              </div>


              {/* =========================================
                  PATIENT
              ========================================= */}

              <div className="receipt-patient-card">

                <div>
                  <span>
                    PATIENT
                  </span>

                  <strong>
                    {
                      printReceiptData.patient_name ||
                      "-"
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    TESTS / SERVICES
                  </span>

                  <strong>
                    {
                      printReceiptData.tests ||
                      printReceiptData.test_name ||
                      "-"
                    }
                  </strong>
                </div>

              </div>


              {/* =========================================
                  PAYMENT BREAKDOWN
              ========================================= */}

<div className="receipt-payment-box">

  <div>

    <span>
      INVOICE AMOUNT
    </span>

    <strong>
      {naira(
        printReceiptData.final_amount
      )}
    </strong>

  </div>


  <div>

    <span>
      PREVIOUS BALANCE
    </span>

    <strong>
      {naira(
        printReceiptData.previous_balance
      )}
    </strong>

  </div>


  <div className="receipt-paid">

    <span>
      AMOUNT RECEIVED
    </span>

    <strong>
      {naira(
        printReceiptData.payment_amount
      )}
    </strong>

  </div>


  <div>

    <span>
      NEW BALANCE
    </span>

    <strong>
      {naira(
        printReceiptData.new_balance
      )}
    </strong>

  </div>

  <div>
    <span>
      PAYMENT METHOD
    </span>
    <strong>
      {printReceiptData.payment_method || "Referral"}
    </strong>
  </div>

</div>

              {/* =========================================
                  PAYMENT CONFIRMATION
              ========================================= */}

              <div className="receipt-thank-you">

                <h3>
                  ✓ Payment Successfully Recorded
                </h3>

                <p>
                  This receipt confirms that
                  payment has been recorded
                  against the above invoice.
                </p>

                <p>
                  Thank you for choosing{" "}
                  <strong>
                    {BUSINESS_NAME}
                  </strong>
                  .
                </p>

              </div>


              {/* =========================================
                  SIGNATURES
              ========================================= */}

              <div className="receipt-signatures">

                <div>
                  {managerSigner?.signature_url && (
                    <img
                      src={managerSigner.signature_url}
                      alt="Manager official signature"
                      className="receipt-manager-signature-image"
                    />
                  )}

                  <strong>
                    {managerSigner?.full_name || "Manager Not Configured"}
                  </strong>

                  <span>
                    Laboratory Manager
                  </span>
                </div>

              </div>


              <div className="receipt-security-note">
                Computer generated receipt •
                Valid without physical signature •
                Receipt No.{" "}
                {
                  printReceiptData.receipt_number ||
                  "-"
                }
              </div>

            </div>

          </PEFADigitalLetterhead>
        )}

      </div>


      {/* ===================================================
          ===================================================
          PREMIUM COMMISSION RECEIPT
      ===================================================
      =================================================== */}

      <div
        ref={commissionPrintRef}
        id="referral-commission-receipt-print"
        className="print-render-target"
        aria-hidden="true"
      >

        {printCommissionData && (
          <PEFADigitalLetterhead verificationId="PEFA">

            <div className="premium-receipt">

              <div className="premium-receipt-banner">

                <div>

                  <span>
                    OFFICIAL RECEIPT
                  </span>

                  <h1>
                    COMMISSION RECEIPT
                  </h1>

                  <small>
                    {BUSINESS_NAME}
                  </small>

                </div>

              </div>


              <div className="receipt-reference">

                <div>
                  <span>
                    Receipt No.
                  </span>

                  <strong>
                    {
                      printCommissionData.receipt_number ||
                      "-"
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    Date
                  </span>

                  <strong>
                    {formatDate(
                      printCommissionData.payment_date
                    )}
                  </strong>
                </div>


                <div>
                  <span>
                    Referral
                  </span>

                  <strong>
                    {
                      printCommissionData.referral_name
                    }
                  </strong>
                </div>

              </div>


              <div className="receipt-payment-box">

                <div>
                  <span>
                    COMMISSION DUE
                  </span>

                  <strong>
                    {naira(
                      printCommissionData.commission_due
                    )}
                  </strong>
                </div>


                <div className="receipt-paid">
                  <span>
                    AMOUNT RECEIVED
                  </span>

                  <strong>
                    {naira(
                      printCommissionData.amount_paid
                    )}
                  </strong>
                </div>


                <div>
                  <span>
                    REMAINING BALANCE
                  </span>

                  <strong>
                    {naira(
                      printCommissionData.balance
                    )}
                  </strong>
                </div>

              </div>


              {printCommissionData.notes && (
                <div className="receipt-thank-you">

                  <h3>
                    Payment Notes
                  </h3>

                  <p>
                    {
                      printCommissionData.notes
                    }
                  </p>

                </div>
              )}


              <div className="receipt-signatures">

                <div>
                  {managerSigner?.signature_url && (
                    <img
                      src={managerSigner.signature_url}
                      alt="Manager official signature"
                      className="receipt-manager-signature-image"
                    />
                  )}

                  <strong>
                    {managerSigner?.full_name || "Manager Not Configured"}
                  </strong>

                  <span>
                    Laboratory Manager
                  </span>
                </div>

              </div>


              <div className="receipt-security-note">
                Computer generated receipt •
                Valid without physical signature •
                Receipt No.{" "}
                {
                  printCommissionData.receipt_number ||
                  "-"
                }
              </div>

            </div>

          </PEFADigitalLetterhead>
        )}

      </div>

    </div>
  );
}
