import { useState } from "react";
import { supabase } from "../supabase";
import "../styles/patientFinanceHistory.css";
import "../styles/financePremium.css";

const money = (v) => `₦${Number(v || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dateOnly = (v) => v ? new Date(v).toLocaleDateString("en-NG") : "—";
const clean = (v) => String(v ?? "").trim();

export default function PatientFinanceHistory() {
  const [search, setSearch] = useState("");
  const [patient, setPatient] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchPatient = async () => {
    const q = search.trim();
    if (!q) return;
    setLoading(true); setError("");
    try {
      const { data, error: regError } = await supabase.from("registrations").select("*").or(`lab_number.ilike.%${q}%,full_name.ilike.%${q}%`).order("created_at", { ascending: false }).limit(1);
      if (regError) throw regError;
      if (!data?.length) throw new Error("Patient not found.");
      const found = data[0];
      setPatient(found);

      const patientId = found.patient_id || found.id;
      const [ordersRes, paymentsRes] = await Promise.all([
        supabase.from("service_orders").select("id, patient_id, patient_name, lab_number, order_number, service_type, total_amount, amount_paid, balance, payment_status, created_at, updated_at").eq("patient_id", patientId).order("created_at", { ascending: false }),
        supabase.from("service_payments").select("id, order_id, receipt_number, amount, payment_method, payment_reference, notes, received_by, payment_date, created_at").order("created_at", { ascending: false }),
      ]);
      if (ordersRes.error) throw ordersRes.error;
      if (paymentsRes.error) throw paymentsRes.error;

      const patientOrders = ordersRes.data || [];
      const patientOrderIds = new Set(patientOrders.map((order) => String(order.id)));
      const patientPayments = (paymentsRes.data || [])
        .filter((payment) => patientOrderIds.has(String(payment.order_id)))
        .map((payment) => ({
          ...payment,
          patient_name: found.full_name || "",
          lab_number: found.lab_number || "",
          display_date: payment.payment_date || payment.created_at,
        }));

      setOrders(patientOrders);
      setPayments(patientPayments);
    } catch (e) {
      console.error("[PEFA PATIENT FINANCE]", e);
      setPatient(null); setOrders([]); setPayments([]); setError(e?.message || "Unable to load patient financial history.");
    } finally { setLoading(false); }
  };

  const totalBilled = orders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const outstanding = orders.reduce((s, o) => s + Number(o.balance || 0), 0);

  return <div className="page pefa-finance-page">
    <div className="pefa-finance-header"><div><span className="pefa-eyebrow">PATIENT ACCOUNT</span><h1>Patient Financial History</h1><p>Consolidated visits, service orders and actual payment transactions.</p></div></div>
    <div className="pefa-finance-toolbar"><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchPatient()} placeholder="Enter Lab Number or Patient Name…" /><button type="button" className="pefa-finance-primary" onClick={searchPatient} disabled={loading}>{loading ? "Searching…" : "Search Patient"}</button></div>
    {error && <div className="pefa-finance-alert">{error}</div>}
    {patient && <>
      <div className="pefa-patient-banner"><div><span>Patient</span><strong>{patient.full_name}</strong></div><div><span>Lab Number</span><strong>{patient.lab_number || "—"}</strong></div><div><span>Visits / Orders</span><strong>{orders.length}</strong></div></div>
      <div className="pefa-finance-cards"><div><span>Total Billed</span><strong>{money(totalBilled)}</strong></div><div><span>Total Paid</span><strong>{money(totalPaid)}</strong></div><div><span>Outstanding</span><strong>{money(outstanding)}</strong></div><div><span>Transactions</span><strong>{payments.length}</strong></div></div>
      <section className="pefa-finance-section"><h2>Service Order / Visit History</h2><div className="pefa-table-wrap"><table className="payment-table pefa-finance-table"><thead><tr><th>Date</th><th>Order No</th><th>Lab No</th><th>Patient</th><th>Service</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead><tbody>{orders.length ? orders.map((o) => <tr key={o.id}><td>{dateOnly(o.created_at)}</td><td>{o.order_number || "—"}</td><td>{o.lab_number || patient.lab_number || "—"}</td><td>{o.patient_name || patient.full_name || "—"}</td><td>{o.service_type || "—"}</td><td>{money(o.total_amount)}</td><td>{money(o.amount_paid)}</td><td>{money(o.balance)}</td><td><span className={`pefa-status ${Number(o.balance || 0) <= 0 ? "paid" : Number(o.amount_paid || 0) > 0 ? "part" : "unpaid"}`}>{Number(o.balance || 0) <= 0 ? "Paid" : Number(o.amount_paid || 0) > 0 ? "Part Payment" : "Unpaid"}</span></td></tr>) : <tr><td colSpan="9" className="pefa-empty">No service orders found.</td></tr>}</tbody></table></div></section>
      <section className="pefa-finance-section"><h2>Actual Payment Transactions</h2><div className="pefa-table-wrap"><table className="payment-table pefa-finance-table"><thead><tr><th>Date</th><th>Patient</th><th>Lab No</th><th>Amount</th><th>Method</th><th>Reference</th><th>Receipt</th><th>Cashier</th></tr></thead><tbody>{payments.length ? payments.map((p) => <tr key={p.id}><td>{dateOnly(p.display_date)}</td><td>{p.patient_name || patient.full_name || "—"}</td><td>{p.lab_number || patient.lab_number || "—"}</td><td><strong>{money(p.amount)}</strong></td><td>{p.payment_method || "—"}</td><td>{p.payment_reference || "—"}</td><td>{p.receipt_number || "—"}</td><td>{p.received_by || "—"}</td></tr>) : <tr><td colSpan="8" className="pefa-empty">No payment transactions found for this lab number.</td></tr>}</tbody></table></div></section>
    </>}
  </div>;
}
