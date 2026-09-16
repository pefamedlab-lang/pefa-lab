import "../styles/paymentPortal.css";
import "../styles/paymentPortalPremium.css";

import LetterHeadDocument from "../components/printing/LetterHeadDocument";
import PrintEngine from "../utils/PrintEngine";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CreditCard,
  FileText,
  Loader2,
  Receipt,
  User,
  Printer,
  Download,
  Mail,
  MessageCircle,
  X,
  LogIn,
} from "lucide-react";

import { supabase } from "../supabase";


// ============================================================
// PAYMENT MODES
// ============================================================
//
// Payment Mode answers:
// WHO is responsible for the bill?
//
// Patient  -> Patient pays
// Referral -> Referral organization pays / is billed
// HMO      -> HMO organization pays / is billed
//
// ============================================================

const PAYMENT_MODES = [
  "Patient",
  "Referral",
  "HMO",
];


// ============================================================
// PAYMENT METHODS
// ============================================================
//
// Payment Method answers:
// HOW is the payment being received?
//
// ============================================================

const PAYMENT_METHODS = [
  "Cash",
  "POS",
  "Transfer",
  "Online",
];


// ============================================================
// CURRENCY
// ============================================================

const formatCurrency = (value) => {
  return `₦${Number(value || 0).toLocaleString(
    "en-NG",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};


// ============================================================
// TEXT CLEANER
// ============================================================

const cleanText = (value) => {
  const text = String(value ?? "").trim();

  return text || null;
};


// ============================================================
// PAYMENT PORTAL
// ============================================================

export default function PaymentPortal() {

  // ==========================================================
  // ROUTER
  // ==========================================================

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // ==========================================================
  // ORDER CONTEXT
  // ==========================================================

  const statePatient = location.state?.patient || null;
  const orderId = searchParams.get("order_id") || statePatient?.service_order_id || statePatient?.order_id || null;
  const requestedLabNumber = searchParams.get("lab_number") || statePatient?.lab_number || null;
  const requestedPatientId = searchParams.get("patient_id") || statePatient?.patient_id || null;


  // ==========================================================
  // STATE
  // ==========================================================

  const [order, setOrder] =
    useState(null);

  const [items, setItems] =
    useState([]);

  const [amount, setAmount] =
    useState("");

  // ----------------------------------------------------------
  // PAYMENT MODE
  // ----------------------------------------------------------

  const [paymentMode, setPaymentMode] =
    useState("Patient");

  // ----------------------------------------------------------
  // PAYMENT METHOD
  // ----------------------------------------------------------

  const [paymentMethod, setPaymentMethod] =
    useState("Cash");

  const referenceRequired = ["POS", "Transfer", "Online"].includes(paymentMethod);

  const [reference, setReference] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [authChecking, setAuthChecking] =
    useState(true);

  const [authenticatedUser, setAuthenticatedUser] =
    useState(null);

  const [paymentResult, setPaymentResult] =
    useState(null);

  // ==========================================================
  // INVOICE DOCUMENT VIEWER
  // ==========================================================

  const [showInvoiceViewer, setShowInvoiceViewer] =
    useState(false);

  const [invoiceViewerLoading, setInvoiceViewerLoading] =
    useState(false);

  const invoicePrintRef =
    useRef(null);

  const [invoiceActionLoading, setInvoiceActionLoading] =
    useState(false);


  // ==========================================================
  // AUTHENTICATION
  // ==========================================================

  useEffect(() => {

    let mounted = true;


    const checkAuthentication = async () => {

      try {

        setAuthChecking(true);


        // ----------------------------------------------------
        // Get persisted Supabase session
        // ----------------------------------------------------

        const {
          data: sessionData,
          error: sessionError,
        } =
          await supabase.auth.getSession();


        if (sessionError) {
          throw sessionError;
        }


        const session =
          sessionData?.session;


        // ----------------------------------------------------
        // No session
        // ----------------------------------------------------

        if (!session) {

          if (mounted) {
            setAuthenticatedUser(null);
          }

          return;
        }


        // ----------------------------------------------------
        // Verify session with Supabase
        // ----------------------------------------------------

        const {
          data: userData,
          error: userError,
        } =
          await supabase.auth.getUser();


        if (userError) {
          throw userError;
        }


        if (mounted) {

          setAuthenticatedUser(
            userData?.user || null
          );

        }

      } catch (error) {

        console.error(
          "PaymentPortal authentication check:",
          error
        );


        if (mounted) {
          setAuthenticatedUser(null);
        }

      } finally {

        if (mounted) {
          setAuthChecking(false);
        }

      }

    };


    checkAuthentication();


    // ========================================================
    // AUTH STATE LISTENER
    // ========================================================

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {

          if (!mounted) {
            return;
          }


          setAuthenticatedUser(
            session?.user || null
          );


          setAuthChecking(false);

        }
      );


    return () => {

      mounted = false;

      authListener?.subscription?.unsubscribe();

    };

  }, []);


  // ==========================================================
  // LOAD ORDER
  // ==========================================================

  const loadOrder =
    useCallback(async () => {

      if (!orderId) {

        setOrder(null);
        setItems([]);
        setLoading(false);

        return;
      }


      try {

        setLoading(true);


        // ====================================================
        // SERVICE ORDER
        // ====================================================

        const orderSelect = `
          id,
          order_number,
          patient_name,
          patient_id,
          lab_number,
          sex,
          dob,
          age,
          phone,
          address,
          branch,
          referral_id,
          referral_name,
          referring_doctor,
          clinical_history,
          service_type,
          subtotal,
          discount_amount,
          total_amount,
          amount_paid,
          balance,
          payment_status,
          status,
          payment_mode,
          invoice_no,
          created_at,
          updated_at
        `;

        let orderData = null;
        let orderError = null;

        if (orderId) {
          const response = await supabase
            .from("service_orders")
            .select(orderSelect)
            .eq("id", orderId)
            .maybeSingle();
          orderData = response.data;
          orderError = response.error;
        }

        // Registration Records may not have stored service_order_id on legacy rows.
        // Resolve the latest service order by lab number or patient ID instead of
        // sending the user to a dead "Service order not found" screen.
        if (!orderData && !orderError && requestedLabNumber) {
          const response = await supabase
            .from("service_orders")
            .select(orderSelect)
            .eq("lab_number", requestedLabNumber)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          orderData = response.data;
          orderError = response.error;
        }

        if (!orderData && !orderError && requestedPatientId) {
          const response = await supabase
            .from("service_orders")
            .select(orderSelect)
            .eq("patient_id", requestedPatientId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          orderData = response.data;
          orderError = response.error;
        }

        if (orderError) throw orderError;
        if (!orderData) {
          throw new Error(
            "No service order is linked to this registration. Please refresh Registration Records or open the original registration before continuing payment."
          );
        }


        // ====================================================
        // SERVICE ORDER ITEMS
        // ====================================================

        const {
          data: itemData,
          error: itemError,
        } =
          await supabase
            .from("service_order_items")
            .select("*")
            .eq("order_id", orderData.id)
            .order(
              "created_at",
              {
                ascending: true,
              }
            );


        if (itemError) {
          throw itemError;
        }


        setOrder(orderData);

        setItems(
          itemData || []
        );


        // ====================================================
        // RESTORE SAVED PAYMENT MODE
        // ====================================================

        if (
          orderData?.payment_mode &&
          PAYMENT_MODES.includes(
            orderData.payment_mode
          )
        ) {

          setPaymentMode(
            orderData.payment_mode
          );

        } else {

          setPaymentMode(
            "Patient"
          );

        }

      } catch (error) {

        console.error(
          "PaymentPortal.loadOrder:",
          error
        );


        alert(
          error?.message ||
          "Unable to load payment order."
        );


        setOrder(null);
        setItems([]);

      } finally {

        setLoading(false);

      }

    }, [orderId]);


  // ==========================================================
  // LOAD ORDER
  // ==========================================================

  useEffect(() => {

    loadOrder();

  }, [loadOrder]);


  // ==========================================================
  // CURRENT BALANCE
  // ==========================================================

  const currentBalance =
    useMemo(() => {

      if (!order) {
        return 0;
      }


      const storedBalance =
        Number(order.balance);


      if (
        Number.isFinite(
          storedBalance
        )
      ) {

        return Math.max(
          0,
          storedBalance
        );

      }


      return Math.max(
        0,
        Number(
          order.total_amount || 0
        ) -
        Number(
          order.amount_paid || 0
        )
      );

    }, [order]);


  // ==========================================================
  // PAYMENT CALCULATION
  // ==========================================================

  const numericAmount =
    Number(amount || 0);


  const remainingAfterPayment =
    Math.max(
      0,
      currentBalance -
      numericAmount
    );


  // ==========================================================
  // PAYMENT MODE CHANGE
  // ==========================================================

  const handlePaymentModeChange =
    (event) => {

      const newMode =
        event.target.value;


      setPaymentMode(
        newMode
      );


      // ------------------------------------------------------
      // When changing mode away from Referral, there is no
      // reason to retain referral-specific payment information.
      // ------------------------------------------------------

      if (
        newMode !== "Referral"
      ) {

        // Keep the payment method intact.
        // Only mode changes here.

      }

    };


  // ==========================================================
  // PROCESS PAYMENT
  // ==========================================================

  const processPayment =
    async () => {

      if (
        processing ||
        !order
      ) {

        return;

      }


      // ======================================================
      // AUTH CHECK
      // ======================================================

      if (authChecking) {

        alert(
          "Please wait while your login session is being verified."
        );

        return;
      }


      if (!authenticatedUser) {

        alert(
          "Auth session missing. Please log in before processing a payment."
        );


        navigate(
          `/login?redirect=${encodeURIComponent(
            `/payment-portal?order_id=${order.id}`
          )}`
        );


        return;

      }


      // ======================================================
      // PAYMENT MODE VALIDATION
      // ======================================================

      if (
        !PAYMENT_MODES.includes(
          paymentMode
        )
      ) {

        alert(
          "Please select a valid payment mode."
        );

        return;

      }


      // ======================================================
      // PAYMENT METHOD VALIDATION
      // ======================================================

      if (
        !PAYMENT_METHODS.includes(
          paymentMethod
        )
      ) {

        alert(
          "Invalid payment method."
        );

        return;

      }


      // ======================================================
      // AMOUNT VALIDATION
      // ======================================================

      if (
        !Number.isFinite(
          numericAmount
        ) ||
        numericAmount <= 0
      ) {

        alert(
          "Enter a valid payment amount."
        );

        return;

      }


      if (
        numericAmount >
        currentBalance
      ) {

        alert(
          "Payment cannot be greater than the outstanding balance."
        );

        return;

      }


      // ======================================================
      // REFERRAL VALIDATION
      // ======================================================

      if (
        paymentMode === "Referral" &&
        !order.referral_id &&
        !order.referral_name
      ) {

        alert(
          "This order has no referral partner. Please return to registration and select the referral partner."
        );

        return;

      }


      const normalizedReference = cleanText(reference);

      if (referenceRequired && !normalizedReference) {
        alert(
          `Payment reference is required for ${paymentMethod} payments. Enter the transaction/reference number before receiving the payment.`
        );
        return;
      }

      try {

        setProcessing(true);


        // ====================================================
        // RE-CHECK AUTH SESSION
        // ====================================================

        const {
          data: sessionData,
          error: sessionError,
        } =
          await supabase.auth.getSession();


        if (sessionError) {
          throw sessionError;
        }


        if (!sessionData?.session) {

          setAuthenticatedUser(null);

          throw new Error(
            "Auth session missing. Please log in again."
          );

        }


        // ====================================================
        // GET VERIFIED USER
        // ====================================================

        const {
          data: userData,
          error: userError,
        } =
          await supabase.auth.getUser();


        if (userError) {
          throw userError;
        }


        const user =
          userData?.user;


        if (!user) {

          setAuthenticatedUser(null);

          throw new Error(
            "Unable to verify your login session. Please log in again."
          );

        }


        setAuthenticatedUser(user);


        // ====================================================
        // RECEIVED BY
        // ====================================================

        const receivedBy =
          user.email ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          "Authenticated User";


        // ====================================================
        // SAVE PAYMENT MODE
        //
        // This updates:
        //
        // service_orders.payment_mode
        //
        // before the payment RPC.
        // ====================================================

        const {
          error: modeError,
        } =
          await supabase
            .from("service_orders")
            .update({
              payment_mode:
                paymentMode,

              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              order.id
            );


        if (modeError) {

          console.error(
            "Payment mode update error:",
            modeError
          );

          throw modeError;

        }


        // ====================================================
        // PROCESS PAYMENT RPC
        //
        // IMPORTANT:
        // The existing RPC remains unchanged.
        //
        // Referral processing is still activated by:
        //
        // p_payment_method = "Referral"
        //
        // However, Referral is now a PAYMENT MODE.
        //
        // Therefore:
        //
        // Referral Mode -> existing RPC receives "Referral"
        // Patient Mode  -> existing RPC receives Cash/POS/etc.
        // HMO Mode      -> existing RPC receives Cash/POS/etc.
        //
        // ====================================================

        const rpcPaymentMethod =
          paymentMode === "Referral"
            ? "Referral"
            : paymentMethod;


        const {
          data,
          error,
        } =
          await supabase.rpc(
            "process_service_payment",
            {
              p_order_id:
                order.id,

              p_amount:
                numericAmount,

              p_payment_method:
                rpcPaymentMethod,

              p_payment_reference:
                normalizedReference,

              p_notes:
                cleanText(
                  notes
                ),

              p_received_by:
                receivedBy,
            }
          );


        if (error) {

          console.error(
            "process_service_payment RPC error:",
            error
          );

          throw error;

        }


        // ====================================================
        // NORMALIZE RPC RESULT
        // ====================================================

        const result =
          Array.isArray(data)
            ? data[0]
            : data;


        // ====================================================
        // VALIDATE RESULT
        // ====================================================

        if (
          !result ||
          result.success !== true
        ) {

          throw new Error(
            result?.message ||
            "Payment transaction was not completed."
          );

        }


        // ====================================================
        // ADD PAYMENT MODE TO RESULT
        // ====================================================

        const completeResult = {
          ...result,

          payment_mode:
            paymentMode,

          payment_method:
            paymentMode === "Referral"
              ? "Referral"
              : paymentMethod,

          payment_reference:
            result.payment_reference ||
            normalizedReference ||
            null,
        };


        // ====================================================
        // STORE RESULT
        // ====================================================

        setPaymentResult(
          completeResult
        );


        // ====================================================
        // CLEAR FORM
        // ====================================================

        setAmount("");

        setReference("");

        setNotes("");


        // ====================================================
        // RELOAD ORDER
        // ====================================================

        await loadOrder();

        // Record the financial event in the enterprise audit trail.
        const auditUserName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email ||
          "Authenticated User";

        const { error: auditError } = await supabase
          .from("audit_logs")
          .insert([{
            user_name: auditUserName,
            user_role: user.user_metadata?.role || "",
            action: "Payment Recorded",
            module: "Payment Portal",
            description: `${order.patient_name || "Patient"} (${order.lab_number || "No Lab No."}) — ${formatCurrency(numericAmount)} received via ${paymentMode === "Referral" ? "Referral Billing" : paymentMethod}. Invoice: ${result.invoice_no || "-"}; Receipt: ${result.receipt_number || "-"}.`,
          }]);

        if (auditError) {
          console.warn("[PAYMENT PORTAL] Audit log failed:", auditError);
        }

        // ====================================================
        // SUCCESS
        // ====================================================

        alert(
          `Payment recorded successfully.\n\nPayment Mode: ${
            paymentMode
          }\nInvoice: ${
            result.invoice_no ||
            "-"
          }\nReceipt: ${
            result.receipt_number ||
            "-"
          }`
        );

      } catch (error) {

        console.error(
          "PaymentPortal.processPayment:",
          error
        );


        const message =
          error?.message ||
          "Payment failed. No payment was recorded.";


        // ====================================================
        // AUTH SESSION ERROR
        // ====================================================

        if (
          message
            .toLowerCase()
            .includes(
              "auth session missing"
            ) ||
          message
            .toLowerCase()
            .includes(
              "jwt"
            ) ||
          message
            .toLowerCase()
            .includes(
              "not authenticated"
            )
        ) {

          setAuthenticatedUser(null);


          alert(
            "Your login session is missing or expired. Please log in again."
          );


          navigate(
            `/login?redirect=${encodeURIComponent(
              `/payment-portal?order_id=${order.id}`
            )}`
          );


          return;

        }


        alert(message);

      } finally {

        setProcessing(false);

      }

    };


  // ==========================================================
  // INVOICE DOCUMENT HELPERS
  // ==========================================================

  const getInvoiceNumber = useCallback(() => {
    if (order?.invoice_no) return order.invoice_no;
    if (order?.order_number) return `INV-${order.order_number}`;
    return "INV-PENDING";
  }, [order]);

  const invoiceGross = Number(
    order?.subtotal ??
    order?.total_amount ??
    items.reduce(
      (sum, item) => sum + Number(item?.total_price || 0),
      0
    )
  );

  const invoiceDiscount = Number(order?.discount_amount || 0);

  const invoiceTotal = Math.max(
    0,
    Number(order?.total_amount ?? invoiceGross - invoiceDiscount)
  );

  const invoiceIsPending = currentBalance > 0;

  const waitForPaymentInvoiceTarget = async () => {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const target = document.getElementById("payment-invoice-print");
      if (target && target.innerHTML.trim()) return target;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return null;
  };

  const openInvoiceViewer = async () => {
    if (!order) return;

    try {
      setInvoiceViewerLoading(true);
      setShowInvoiceViewer(true);
      const target = await waitForPaymentInvoiceTarget();
      if (!target) {
        throw new Error("Unable to prepare the service invoice.");
      }
    } catch (error) {
      console.error("Payment invoice viewer error:", error);
      setShowInvoiceViewer(false);
      alert(error?.message || "Unable to open invoice.");
    } finally {
      setInvoiceViewerLoading(false);
    }
  };

  const printInvoice = async () => {
    if (!order) return;

    try {
      setInvoiceActionLoading(true);
      setShowInvoiceViewer(true);
      const target = await waitForPaymentInvoiceTarget();
      if (!target) throw new Error("Unable to prepare the invoice for printing.");
      PrintEngine.print("payment-invoice-print");
    } catch (error) {
      console.error("Payment invoice print error:", error);
      alert(error?.message || "Unable to print invoice.");
    } finally {
      setInvoiceActionLoading(false);
    }
  };

  const buildPaymentInvoicePdf = async () => {
    const target = await waitForPaymentInvoiceTarget();
    if (!target) {
      throw new Error("The visible invoice could not be prepared.");
    }

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    const images = Array.from(target.querySelectorAll("img"));
    await Promise.all(
      images.map(
        (img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.addEventListener("load", resolve, { once: true });
                img.addEventListener("error", resolve, { once: true });
              })
      )
    );

    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );

    const { default: html2pdf } = await import("html2pdf.js");

    const filename = `${getInvoiceNumber()}-${String(
      order.patient_name || "Patient"
    )
      .trim()
      .replace(/[^a-z0-9-_]+/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")}.pdf`;

    const options = {
      margin: [8, 7, 8, 7],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: target.scrollWidth || 794,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
      },
      pagebreak: { mode: ["css", "legacy"] },
    };

    const blob = await html2pdf()
      .set(options)
      .from(target)
      .outputPdf("blob");

    if (!(blob instanceof Blob) || blob.size < 1000) {
      throw new Error("The generated invoice PDF is empty.");
    }

    return { blob, filename };
  };

  const downloadInvoice = async () => {
    if (!order) return;

    try {
      setInvoiceActionLoading(true);
      setShowInvoiceViewer(true);
      const { blob, filename } = await buildPaymentInvoicePdf();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 15000);
    } catch (error) {
      console.error("Payment invoice PDF error:", error);
      alert(error?.message || "Unable to generate invoice PDF.");
    } finally {
      setInvoiceActionLoading(false);
    }
  };

  const shareInvoice = async (channel) => {
    if (!order) return;

    try {
      setInvoiceActionLoading(true);
      setShowInvoiceViewer(true);
      const { blob, filename } = await buildPaymentInvoicePdf();
      const file = new File([blob], filename, { type: "application/pdf" });

      if (
        channel === "whatsapp" &&
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        (!navigator.canShare || navigator.canShare({ files: [file] }))
      ) {
        await navigator.share({
          title: `${getInvoiceNumber()} | Service Invoice`,
          text: `Official service invoice ${getInvoiceNumber()} from PEFA Medical Diagnostic Services.`,
          files: [file],
        });
        return;
      }

      if (
        channel === "email" &&
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        (!navigator.canShare || navigator.canShare({ files: [file] }))
      ) {
        await navigator.share({
          title: `${getInvoiceNumber()} | Service Invoice`,
          text: `Official service invoice ${getInvoiceNumber()} from PEFA Medical Diagnostic Services.`,
          files: [file],
        });
        return;
      }

      // Browser fallback: download the exact PDF, then open the channel.
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 15000);

      if (channel === "email") {
        const recipient = String(order.referral_name ? "" : "").trim();
        const subject = `${getInvoiceNumber()} | Service Invoice | PEFA Medical Diagnostic Services`;
        const body = [
          `Dear ${order.patient_name || "Patient"},`,
          "",
          `The official service invoice ${getInvoiceNumber()} has been generated.`,
          "",
          `The PDF has been downloaded as ${filename}. Please attach it before sending.`,
          "",
          "Kind regards,",
          "PEFA Medical Diagnostic Services",
        ].join("\n");
        window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      } else {
        const rawPhone = String(order.phone || "").replace(/\D/g, "");
        const whatsappNumber = rawPhone.startsWith("0")
          ? `234${rawPhone.slice(1)}`
          : rawPhone.startsWith("234")
          ? rawPhone
          : rawPhone
          ? `234${rawPhone}`
          : "";
        if (!whatsappNumber) {
          throw new Error("This patient does not have a phone number.");
        }
        const message = [
          "*PEFA MEDICAL DIAGNOSTIC SERVICES*",
          "",
          `*SERVICE INVOICE ${getInvoiceNumber()}*`,
          "",
          `The official invoice PDF has been downloaded as ${filename}.`,
          "Please attach the downloaded PDF to this WhatsApp conversation before sending.",
        ].join("\n");
        window.open(
          `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
          "_blank",
          "noopener,noreferrer"
        );
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.error("Payment invoice share error:", error);
      alert(error?.message || "Unable to share the invoice.");
    } finally {
      setInvoiceActionLoading(false);
    }
  };

  const emailInvoice = () => shareInvoice("email");
  const whatsappInvoice = () => shareInvoice("whatsapp");

  // ==========================================================
  // PRINT RECEIPT
  // ==========================================================

  const printReceipt =
    () => {

      if (!order) {
        return;
      }


      const receiptNumber =
        paymentResult?.receipt_number;


      if (!receiptNumber) {

        alert(
          "No receipt number is available for this payment."
        );

        return;

      }


      navigate(
        `/invoice?order_id=${encodeURIComponent(
          order.id
        )}&invoice_no=${encodeURIComponent(
          paymentResult?.invoice_no ||
          order.invoice_no ||
          ""
        )}&receipt=${encodeURIComponent(
          receiptNumber
        )}&document=receipt`
      );

    };


  // ==========================================================
  // AUTH CHECKING SCREEN
  // ==========================================================

  if (authChecking) {

    return (
      <div className="payment-loading">

        <Loader2
          size={22}
          className="spin"
        />

        <span>
          Verifying secure payment session...
        </span>

      </div>
    );

  }


  // ==========================================================
  // LOADING ORDER
  // ==========================================================

  if (loading) {

    return (
      <div className="payment-loading">

        <Loader2
          size={22}
          className="spin"
        />

        <span>
          Loading payment...
        </span>

      </div>
    );

  }


  // ==========================================================
  // NO ORDER
  // ==========================================================

  if (!order) {

    return (
      <div className="payment-loading">

        <p>
          Service order not found.
        </p>

        <button
          type="button"
          className="payment-btn"
          onClick={() =>
            navigate(
              "/registration"
            )
          }
        >
          Back to Registration
        </button>

      </div>
    );

  }


  // ==========================================================
  // NOT AUTHENTICATED
  // ==========================================================

  if (!authenticatedUser) {

    return (
      <div className="payment-loading">

        <LogIn
          size={24}
        />

        <h2>
          Login Required
        </h2>

        <p>
          You must be logged in to receive
          and record payments.
        </p>

        <button
          type="button"
          className="payment-btn"
          onClick={() =>
            navigate(
              `/login?redirect=${encodeURIComponent(
                `/payment-portal?order_id=${order.id}`
              )}`
            )
          }
        >
          Log In
        </button>

        <button
          type="button"
          className="payment-btn"
          onClick={() =>
            navigate(
              "/registration"
            )
          }
        >
          Back to Registration
        </button>

      </div>
    );

  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div className="payment-page">

      <div className="payment-container">


        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="payment-header">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/registration"
              )
            }
            disabled={processing}
          >

            <ArrowLeft
              size={18}
            />

            Back

          </button>


          <div>

            <h1>
              Payment Portal
            </h1>


            <p>
              Order No:
              {" "}
              <strong>
                {order.order_number}
              </strong>
            </p>


            <p>
              Invoice No:
              {" "}
              <strong>
                {order.invoice_no ||
                  "Will be generated"}
              </strong>
            </p>


            <p>
              Logged in as:
              {" "}
              <strong>
                {authenticatedUser.email ||
                  authenticatedUser.user_metadata?.full_name ||
                  "Authenticated User"}
              </strong>
            </p>

          </div>

        </div>


        {/* ====================================================
            PATIENT INFORMATION
        ==================================================== */}

        <div className="payment-card">

          <div className="section-title">

            <User
              size={20}
            />

            <h2>
              Patient Information
            </h2>

          </div>


          <div className="payment-patient">

            <span>
              <strong>
                Patient Name:
              </strong>{" "}
              {order.patient_name ||
                "-"}
            </span>


            <span>
              <strong>
                Patient ID:
              </strong>{" "}
              {order.patient_id ||
                "-"}
            </span>


            <span>
              <strong>
                Lab No:
              </strong>{" "}
              {order.lab_number ||
                "-"}
            </span>


            <span>
              <strong>
                Service:
              </strong>{" "}
              {order.service_type ||
                "-"}
            </span>


            <span>
              <strong>
                Referral:
              </strong>{" "}
              {order.referral_name ||
                "-"}
            </span>


            <span>
              <strong>
                Referring Doctor:
              </strong>{" "}
              {order.referring_doctor ||
                "-"}

            </span>


            <span>
              <strong>
                Payment Mode:
              </strong>{" "}
              {order.payment_mode ||
                "Not selected"}

            </span>

          </div>

        </div>


        {/* ====================================================
            DOCUMENTS
        ==================================================== */}

        <div className="payment-card">

          <div className="section-title">

            <FileText
              size={20}
            />

            <h2>
              Documents
            </h2>

          </div>


          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >

            <button
              type="button"
              className="payment-btn"
              onClick={openInvoiceViewer}
              disabled={processing || invoiceActionLoading}
            >
              <FileText size={18} />
              View Invoice
            </button>


            {paymentResult?.receipt_number && (

              <button
                type="button"
                className="payment-btn"
                onClick={
                  printReceipt
                }
              >

                <Receipt
                  size={18}
                />

                Print Receipt{" "}
                {paymentResult.receipt_number}

              </button>

            )}

          </div>

        </div>


        {/* ====================================================
            INVOICE SUMMARY
        ==================================================== */}

        <div className="payment-card payment-invoice-summary-card">

          <div className="section-title">
            <Receipt size={20} />
            <h2>Invoice</h2>
          </div>

          <div className="payment-invoice-summary-head">
            <div>
              <span>Invoice No.</span>
              <strong>{getInvoiceNumber()}</strong>
            </div>
            <div>
              <span>Invoice Date</span>
              <strong>{new Date(order.created_at || Date.now()).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}</strong>
            </div>
            <div>
              <span>Patient</span>
              <strong>{order.patient_name || "-"}</strong>
            </div>
            <div>
              <span>Lab No.</span>
              <strong>{order.lab_number || order.patient_id || "-"}</strong>
            </div>
          </div>

          <div className="payment-invoice-financial-row">
            <div><span>Total Invoice</span><strong>{formatCurrency(invoiceTotal)}</strong></div>
            <div><span>Outstanding</span><strong>{formatCurrency(currentBalance)}</strong></div>
            <div className={currentBalance > 0 ? "is-pending" : "is-paid"}>
              <span>Status</span>
              <strong>{currentBalance > 0 ? "PENDING PAYMENT" : "PAID"}</strong>
            </div>
          </div>

          <div className="payment-invoice-actions">
            <button type="button" className="payment-btn" onClick={openInvoiceViewer} disabled={invoiceActionLoading}>
              <FileText size={18} /> View Invoice
            </button>
            <button type="button" className="payment-btn payment-btn-secondary" onClick={printInvoice} disabled={invoiceActionLoading}>
              <Printer size={18} /> Print
            </button>
          </div>

          <p className="payment-invoice-note">
            The official invoice contains the service transactions and amount due. Payment details are issued on the official receipt after payment is recorded.
          </p>
        </div>

        {/* ====================================================
            PAYMENT FORM
        ==================================================== */}

        {currentBalance > 0 && (

          <div className="payment-card">

            <div className="section-title">

              <CreditCard
                size={20}
              />

              <h2>
                Receive Payment
              </h2>

            </div>


            <div className="payment-form-grid">


              {/* =================================================
                  PAYMENT MODE
              ================================================= */}

              <div className="form-group">

                <label>
                  Payment Mode
                </label>

                <select
                  value={paymentMode}
                  onChange={
                    handlePaymentModeChange
                  }
                  disabled={processing}
                >

                  {PAYMENT_MODES.map(
                    (mode) => (

                      <option
                        key={mode}
                        value={mode}
                      >
                        {mode}
                      </option>

                    )
                  )}

                </select>


                <small>

                  {paymentMode === "Patient" &&
                    "Patient is responsible for this payment."}

                  {paymentMode === "Referral" &&
                    "This payment mode will be linked to the Referral Portal."}

                  {paymentMode === "HMO" &&
                    "This payment mode is reserved for HMO billing and the HMO Portal."}

                </small>

              </div>


              {/* =================================================
                  AMOUNT
              ================================================= */}

              <div className="form-group">

                <label>
                  Amount
                </label>

                <input
                  type="number"
                  min="0.01"
                  max={currentBalance}
                  step="0.01"
                  value={amount}
                  onChange={(event) =>
                    setAmount(
                      event.target.value
                    )
                  }
                  disabled={processing}
                  inputMode="decimal"
                />


                <small>
                  Outstanding:{" "}
                  {formatCurrency(
                    currentBalance
                  )}
                </small>

              </div>


              {/* =================================================
                  PAYMENT METHOD
              ================================================= */}

              <div className="form-group">

                <label>
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target.value
                    )
                  }
                  disabled={processing}
                >

                  {PAYMENT_METHODS.map(
                    (method) => (

                      <option
                        key={method}
                        value={method}
                      >
                        {method}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* =================================================
                  REFERRAL INFORMATION
              ================================================= */}

              {paymentMode ===
                "Referral" && (

                <div
                  className="form-group"
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >

                  <label>
                    Referral Partner
                  </label>


                  <input
                    type="text"
                    value={
                      order.referral_name ||
                      "-"
                    }
                    readOnly
                  />


                  {!order.referral_id &&
                    !order.referral_name && (

                    <small>
                      No referral partner is
                      attached to this order.
                    </small>

                  )}


                  {(order.referral_id ||
                    order.referral_name) && (

                    <small>
                      This payment will be
                      automatically posted to:{" "}
                      <strong>
                        {order.referral_name}
                      </strong>{" "}
                      referral invoice.
                    </small>

                  )}

                </div>

              )}


              {/* =================================================
                  HMO INFORMATION
              ================================================= */}

              {paymentMode ===
                "HMO" && (

                <div
                  className="form-group"
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >

                  <label>
                    HMO Billing
                  </label>


                  <input
                    type="text"
                    value="HMO Portal integration pending"
                    readOnly
                  />


                  <small>
                    HMO billing is selected for
                    this order. HMO Portal
                    integration will be connected
                    in the next stage.
                  </small>

                </div>

              )}


              {/* =================================================
                  REFERENCE
              ================================================= */}

              <div className="form-group">

                <label>
                  Payment Reference{referenceRequired ? " *" : ""}
                </label>


                <input
                  type="text"
                  value={reference}
                  required={referenceRequired}
                  onChange={(event) =>
                    setReference(
                      event.target.value
                    )
                  }
                  disabled={processing}
                  placeholder={
                    paymentMethod ===
                      "POS"
                      ? "POS reference"
                      : paymentMethod ===
                        "Transfer"
                        ? "Bank transfer reference"
                        : paymentMethod ===
                          "Online"
                          ? "Online payment reference"
                          : "Optional"
                  }
                />

                <small className="payment-reference-help">
                  {referenceRequired
                    ? "Required for electronic payments."
                    : "Optional for cash payments."}
                </small>
              </div>


              {/* =================================================
                  NOTES
              ================================================= */}

              <div className="form-group">

                <label>
                  Notes
                </label>


                <input
                  type="text"
                  value={notes}
                  onChange={(event) =>
                    setNotes(
                      event.target.value
                    )
                  }
                  disabled={processing}
                  placeholder="Optional payment note"
                />

              </div>

            </div>


            {/* =================================================
                PAYMENT PREVIEW
            ================================================= */}

            {numericAmount > 0 && (

              <div
                style={{
                  marginTop: 20,
                  padding: 16,
                  borderRadius: 8,
                }}
              >

                <strong>
                  Payment Preview
                </strong>


                <div>
                  Payment Mode:{" "}
                  {paymentMode}
                </div>


                <div>
                  Payment Method:{" "}
                  {paymentMode === "Referral"
                    ? "Referral Billing"
                    : paymentMethod}
                </div>


                <div>
                  Payment:{" "}
                  {formatCurrency(
                    numericAmount
                  )}
                </div>


                <div>
                  Remaining:{" "}
                  {formatCurrency(
                    remainingAfterPayment
                  )}
                </div>

              </div>

            )}


            {/* =================================================
                RECEIVE PAYMENT BUTTON
            ================================================= */}

            <button
              type="button"
              className="payment-btn"
              onClick={
                processPayment
              }
              disabled={
                processing ||
                authChecking ||
                !authenticatedUser ||
                !PAYMENT_MODES.includes(
                  paymentMode
                ) ||
                !PAYMENT_METHODS.includes(
                  paymentMethod
                ) ||
                numericAmount <= 0 ||
                numericAmount >
                  currentBalance ||
                (
                  referenceRequired &&
                  !cleanText(reference)
                ) ||
                (
                  paymentMode ===
                    "Referral" &&
                  !order.referral_name &&
                  !order.referral_id
                )
              }
            >

              {processing ? (

                <>

                  <Loader2
                    size={18}
                    className="spin"
                  />

                  Processing Payment...

                </>

              ) : (

                <>

                  <CreditCard
                    size={18}
                  />

                  Receive Payment

                </>

              )}

            </button>

          </div>

        )}


        {/* ====================================================
            PAYMENT SUCCESS
        ==================================================== */}

        {paymentResult && (

          <div className="payment-card">

            <div className="section-title">

              <Receipt
                size={20}
              />

              <h2>
                Payment Successful
              </h2>

            </div>


            <div className="payment-patient">

              <span>
                Patient:{" "}
                <strong>
                  {order.patient_name ||
                    "-"}
                </strong>
              </span>


              <span>
                Lab No:{" "}
                <strong>
                  {order.lab_number ||
                    "-"}
                </strong>
              </span>


              <span>
                Payment Mode:{" "}
                <strong>
                  {paymentResult.payment_mode ||
                    paymentMode}
                </strong>
              </span>


              <span>
                Payment Method:{" "}
                <strong>
                  {paymentResult.payment_method ||
                    "-"}
                </strong>
              </span>


              <span>
                Invoice No:{" "}
                <strong>
                  {paymentResult.invoice_no ||
                    "-"}
                </strong>
              </span>


              <span>
                Receipt No:{" "}
                <strong>
                  {paymentResult.receipt_number ||
                    "-"}
                </strong>
              </span>


              <span>
                Amount:{" "}
                <strong>
                  {formatCurrency(
                    paymentResult.amount
                  )}
                </strong>
              </span>


              <span>
                New Balance:{" "}
                <strong>
                  {formatCurrency(
                    paymentResult.balance
                  )}
                </strong>
              </span>


              {paymentResult.referral_name && (

                <span>
                  Referral:{" "}
                  <strong>
                    {paymentResult.referral_name}
                  </strong>
                </span>

              )}


              {paymentResult.referral_invoice_no && (

                <span>
                  Referral Invoice:{" "}
                  <strong>
                    {paymentResult.referral_invoice_no}
                  </strong>
                </span>

              )}


              {paymentResult.referral_receipt_no && (

                <span>
                  Referral Receipt:{" "}
                  <strong>
                    {paymentResult.referral_receipt_no}
                  </strong>
                </span>

              )}

            </div>


            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 20,
              }}
            >

              <button
                type="button"
                className="payment-btn"
                onClick={
                  printInvoice
                }
              >

                <Printer
                  size={18}
                />

                Print Invoice

              </button>


              <button
                type="button"
                className="payment-btn"
                onClick={
                  printReceipt
                }
              >

                <Receipt
                  size={18}
                />

                Print Receipt

              </button>

            </div>

          </div>

        )}


        {/* ====================================================
            PREMIUM SERVICE INVOICE VIEWER
        ==================================================== */}

        {showInvoiceViewer && (
          <div className="payment-document-overlay">
            <div className="payment-document-modal">
              <div className="payment-document-header">
                <div>
                  <h2>Service Invoice</h2>
                  <p>Official pending-payment document</p>
                </div>
                <button
                  type="button"
                  className="payment-document-close"
                  onClick={() => setShowInvoiceViewer(false)}
                  disabled={invoiceActionLoading}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="payment-document-actions">
                <button type="button" onClick={printInvoice} disabled={invoiceActionLoading || invoiceViewerLoading}>
                  <Printer size={16} /> Print
                </button>
                <button type="button" onClick={downloadInvoice} disabled={invoiceActionLoading || invoiceViewerLoading}>
                  <Download size={16} /> Download PDF
                </button>
                <button type="button" onClick={emailInvoice} disabled={invoiceActionLoading || invoiceViewerLoading}>
                  <Mail size={16} /> Email
                </button>
                <button type="button" onClick={whatsappInvoice} disabled={invoiceActionLoading || invoiceViewerLoading}>
                  <MessageCircle size={16} /> WhatsApp
                </button>
              </div>

              <div className="payment-document-paper">
                {invoiceViewerLoading && (
                  <div className="payment-document-loading">
                    <Loader2 size={20} className="spin" />
                    Preparing invoice...
                  </div>
                )}

                <div
                  ref={invoicePrintRef}
                  id="payment-invoice-print"
                  className="payment-print-target"
                >
                  <LetterHeadDocument showHeader={true} showFooter={true}>
                    <div className="payment-invoice-document">
                      <div className="payment-invoice-title-block">
                        <div>
                          <h1>SERVICE INVOICE</h1>
                          <p>Official Request for Payment</p>
                        </div>
                        <div className="payment-invoice-status-stamp">
                          {invoiceIsPending ? "PENDING PAYMENT" : "PAID"}
                        </div>
                      </div>

                      <div className="payment-invoice-meta-grid">
                        <div><strong>Patient Name</strong><span>{order.patient_name || "-"}</span></div>
                        <div><strong>Patient ID</strong><span>{order.patient_id || "-"}</span></div>
                        <div><strong>Lab No.</strong><span>{order.lab_number || "-"}</span></div>
                        <div><strong>Invoice No.</strong><span>{getInvoiceNumber()}</span></div>
                        <div><strong>Order No.</strong><span>{order.order_number || "-"}</span></div>
                        <div><strong>Date</strong><span>{new Date(order.created_at || Date.now()).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
                        <div><strong>Service</strong><span>{order.service_type || "Laboratory Services"}</span></div>
                        <div><strong>Payment Mode</strong><span>{order.payment_mode || paymentMode || "Patient"}</span></div>
                        <div><strong>Referral</strong><span>{order.referral_name || "-"}</span></div>
                        <div><strong>Referring Doctor</strong><span>{order.referring_doctor || "-"}</span></div>
                      </div>

                      {order.clinical_history && (
                        <div className="payment-invoice-clinical">
                          <strong>Clinical Information</strong>
                          <span>{order.clinical_history}</span>
                        </div>
                      )}

                      <h3 className="payment-print-section-title">SERVICE TRANSACTION DETAILS</h3>
                      <table className="payment-premium-table">
                        <thead>
                          <tr>
                            <th>S/N</th>
                            <th>Service / Test</th>
                            <th>Category</th>
                            <th>Qty</th>
                            <th>Amount Due</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.length === 0 ? (
                            <tr><td colSpan="5" className="payment-empty-row">No service items found.</td></tr>
                          ) : items.map((item, index) => (
                            <tr key={item.id || `${item.service_name}-${index}`}>
                              <td>{index + 1}</td>
                              <td><strong>{item.service_name || "Service"}</strong></td>
                              <td>{item.service_category || "-"}</td>
                              <td>{item.quantity || 1}</td>
                              <td>{formatCurrency(item.total_price)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <h3 className="payment-print-section-title">INVOICE SUMMARY</h3>
                      <div className="payment-invoice-financial-summary">
                        <div><span>Subtotal</span><strong>{formatCurrency(invoiceGross)}</strong></div>
                        <div><span>Discount</span><strong>- {formatCurrency(invoiceDiscount)}</strong></div>
                        <div className="payment-total-payable"><span>TOTAL PAYABLE</span><strong>{formatCurrency(invoiceTotal)}</strong></div>
                        <div><span>Payment Status</span><strong>{invoiceIsPending ? "PENDING PAYMENT" : "PAID"}</strong></div>
                      </div>

                      <div className="payment-invoice-note-print">
                        This invoice is a computer-generated financial document. Official payment receipts are issued separately after payment is successfully recorded.
                      </div>
                    </div>
                  </LetterHeadDocument>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            FULLY PAID
        ==================================================== */}

        {currentBalance === 0 &&
          !paymentResult && (

            <div className="payment-card">

              <div className="section-title">

                <Receipt
                  size={20}
                />

                <h2>
                  Fully Paid
                </h2>

              </div>


              <p>
                This service order has no
                outstanding balance.
              </p>


              <button
                type="button"
                className="payment-btn"
                onClick={
                  printInvoice
                }
              >

                <Printer
                  size={18}
                />

                Print Invoice

              </button>

            </div>

          )}

      </div>

    </div>

  );

}