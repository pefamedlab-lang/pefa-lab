import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import "../styles/finance.css";
import "../styles/financePremium.css";

const money = (v) => `₦${Number(v || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const clean = (v) => String(v ?? "").trim();
const periodStart = (period) => {
  const n = new Date();
  if (period === "today") return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  if (period === "week") { const d = new Date(n); d.setDate(d.getDate() - 6); d.setHours(0, 0, 0, 0); return d; }
  if (period === "month") return new Date(n.getFullYear(), n.getMonth(), 1);
  if (period === "year") return new Date(n.getFullYear(), 0, 1);
  return null;
};

export default function IncomePortal() {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [paymentsRes, ordersRes] = await Promise.all([
        supabase.from("service_payments").select("id, order_id, receipt_number, amount, payment_method, payment_reference, notes, received_by, payment_date, created_at").order("created_at", { ascending: false }).limit(5000),
        supabase.from("service_orders").select("id, patient_id, patient_name, lab_number, order_number, service_type, total_amount, amount_paid, balance, payment_status, created_at, updated_at").order("created_at", { ascending: false }).limit(5000),
      ]);
      if (paymentsRes.error) throw paymentsRes.error;
      if (ordersRes.error) throw ordersRes.error;

      const orderMap = new Map((ordersRes.data || []).map((order) => [String(order.id), order]));
      const rows = (paymentsRes.data || []).map((payment) => {
        const order = orderMap.get(String(payment.order_id)) || {};
        return {
          ...payment,
          patient_name: order.patient_name || "",
          lab_number: order.lab_number || "",
          order_number: order.order_number || "",
          display_date: payment.payment_date || payment.created_at,
        };
      });
      setPayments(rows);
      setOrders(ordersRes.data || []);
    } catch (e) {
      console.error("[PEFA INCOME]", e);
      setError(e?.message || "Unable to load income data.");
      setPayments([]); setOrders([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const timer = setInterval(load, 60000); return () => clearInterval(timer); }, [load]);

  const start = periodStart(period);
  const filteredPayments = useMemo(() => payments.filter((x) => {
    const d = new Date(x.display_date);
    const q = search.trim().toLowerCase();
    return (!start || d >= start)
      && (!q || [x.patient_name, x.lab_number, x.receipt_number, x.payment_reference].some(v => clean(v).toLowerCase().includes(q)))
      && (paymentFilter === "all" || clean(x.payment_method).toLowerCase() === paymentFilter.toLowerCase());
  }), [payments, start, search, paymentFilter]);

  const filteredOrders = useMemo(() => orders.filter((x) => {
    const q = search.trim().toLowerCase();
    const paid = Number(x.amount_paid || 0), bal = Number(x.balance || 0);
    const status = bal <= 0 ? "paid" : paid > 0 ? "part" : "unpaid";
    return (!q || [x.patient_name, x.lab_number, x.order_number].some(v => clean(v).toLowerCase().includes(q)))
      && (statusFilter === "all" || (statusFilter === "outstanding" ? bal > 0 : status === statusFilter));
  }), [orders, search, statusFilter]);

  const totalIncome = filteredPayments.reduce((s, x) => s + Number(x.amount || 0), 0);
  const cash = filteredPayments.filter(x => clean(x.payment_method).toLowerCase() === "cash").reduce((s, x) => s + Number(x.amount || 0), 0);
  const transfer = filteredPayments.filter(x => clean(x.payment_method).toLowerCase() === "transfer").reduce((s, x) => s + Number(x.amount || 0), 0);
  const outstanding = filteredOrders.reduce((s, x) => s + Number(x.balance || 0), 0);

  return <div className="page pefa-finance-page">
    <div className="pefa-finance-header"><div><span className="pefa-eyebrow">INCOME CONTROL</span><h1>Income Portal</h1><p>Income and payment details are linked directly to Payment Portal transactions.</p></div><button type="button" className="pefa-finance-refresh" onClick={load} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button></div>
    {error && <div className="pefa-finance-alert">{error}</div>}
    <div className="pefa-finance-cards"><div><span>Total Income</span><strong>{money(totalIncome)}</strong></div><div><span>Cash</span><strong>{money(cash)}</strong></div><div><span>Transfer</span><strong>{money(transfer)}</strong></div><div><span>Outstanding</span><strong>{money(outstanding)}</strong></div></div>
    <div className="pefa-finance-toolbar"><select value={period} onChange={e=>setPeriod(e.target.value)}><option value="all">All Time</option><option value="today">Today</option><option value="week">Last 7 Days</option><option value="month">This Month</option><option value="year">This Year</option></select><select value={paymentFilter} onChange={e=>setPaymentFilter(e.target.value)}><option value="all">All Payments</option><option value="cash">Cash</option><option value="transfer">Transfer</option><option value="pos">POS</option><option value="card">Card</option></select><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">All Billing Status</option><option value="paid">Paid</option><option value="part">Part Payment</option><option value="unpaid">Unpaid</option><option value="outstanding">Outstanding</option></select><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search patient, lab no., receipt or reference…" /></div>
    <div className="pefa-table-wrap"><table className="finance-table pefa-finance-table"><thead><tr><th>Date</th><th>Lab No</th><th>Patient</th><th>Amount Paid</th><th>Method</th><th>Reference</th><th>Receipt</th><th>Action</th></tr></thead><tbody>{loading?<tr><td colSpan="8" className="pefa-empty">Loading…</td></tr>:filteredPayments.length?filteredPayments.map(x=><tr key={x.id}><td>{new Date(x.display_date).toLocaleString("en-NG")}</td><td>{x.lab_number||"—"}</td><td><strong>{x.patient_name||"—"}</strong></td><td>{money(x.amount)}</td><td>{x.payment_method||"—"}</td><td>{x.payment_reference||"—"}</td><td>{x.receipt_number||"—"}</td><td><button type="button" className="view-btn" onClick={()=>setSelected(x)}>View</button></td></tr>):<tr><td colSpan="8" className="pefa-empty">No income transactions found.</td></tr>}</tbody></table></div>
    {selected&&<div className="modal-overlay" onClick={()=>setSelected(null)}><div className="modal pefa-finance-modal" onClick={e=>e.stopPropagation()}><h2>Payment Details</h2><p><strong>Patient:</strong> {selected.patient_name||"—"}</p><p><strong>Lab No:</strong> {selected.lab_number||"—"}</p><p><strong>Amount:</strong> {money(selected.amount)}</p><p><strong>Method:</strong> {selected.payment_method||"—"}</p><p><strong>Reference:</strong> {selected.payment_reference||"—"}</p><p><strong>Receipt:</strong> {selected.receipt_number||"—"}</p><p><strong>Cashier:</strong> {selected.received_by||"—"}</p><p><strong>Date:</strong> {new Date(selected.display_date).toLocaleString("en-NG")}</p><button type="button" onClick={()=>setSelected(null)}>Close</button></div></div>}
  </div>;
}
