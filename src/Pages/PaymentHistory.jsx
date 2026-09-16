import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import "../styles/paymentHistory.css";
import "../styles/financePremium.css";

const money = (value) => `₦${Number(value || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dateTime = (value) => value ? new Date(value).toLocaleString("en-NG") : "—";
const clean = (value) => String(value ?? "").trim();

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // service_payments is the authoritative detailed payment ledger.
      // Patient/lab information is resolved from service_orders because
      // service_payments does NOT contain lab_number or patient_name.
      const [paymentsRes, ordersRes] = await Promise.all([
        supabase
          .from("service_payments")
          .select("id, order_id, receipt_number, amount, payment_method, payment_reference, notes, received_by, payment_date, created_at")
          .order("created_at", { ascending: false })
          .limit(5000),
        supabase
          .from("service_orders")
          .select("id, patient_id, patient_name, lab_number, order_number, invoice_no")
          .limit(5000),
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
          invoice_no: order.invoice_no || "",
          display_date: payment.payment_date || payment.created_at,
        };
      });

      setPayments(rows);
    } catch (queryError) {
      console.error("[PEFA PAYMENT HISTORY]", queryError);
      setError(queryError?.message || "Unable to load payment history.");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments.filter((item) => {
      const matchesSearch = !q || [
        item.patient_name,
        item.lab_number,
        item.receipt_number,
        item.payment_reference,
        item.payment_method,
        item.received_by,
      ].some((v) => clean(v).toLowerCase().includes(q));
      const matchesMethod = method === "all" || clean(item.payment_method).toLowerCase() === method.toLowerCase();
      return matchesSearch && matchesMethod;
    });
  }, [payments, search, method]);

  const total = filtered.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const cash = filtered.filter((x) => clean(x.payment_method).toLowerCase() === "cash").reduce((s, x) => s + Number(x.amount || 0), 0);
  const transfer = filtered.filter((x) => clean(x.payment_method).toLowerCase() === "transfer").reduce((s, x) => s + Number(x.amount || 0), 0);

  return (
    <div className="page pefa-finance-page">
      <div className="pefa-finance-header">
        <div><span className="pefa-eyebrow">FINANCE CONTROL</span><h1>Payment History</h1><p>Complete payment history from the Payment Portal, including patient and reference information.</p></div>
        <button type="button" className="pefa-finance-refresh" onClick={loadPayments} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button>
      </div>

      <div className="pefa-finance-cards">
        <div><span>Total Shown</span><strong>{money(total)}</strong></div>
        <div><span>Cash</span><strong>{money(cash)}</strong></div>
        <div><span>Transfer</span><strong>{money(transfer)}</strong></div>
        <div><span>Transactions</span><strong>{filtered.length}</strong></div>
      </div>

      <div className="pefa-finance-toolbar">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient, lab no., receipt or reference…" />
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="all">All Methods</option><option value="Cash">Cash</option><option value="Transfer">Transfer</option><option value="POS">POS</option><option value="Card">Card</option><option value="Online">Online</option>
        </select>
      </div>

      {error && <div className="pefa-finance-alert">Unable to load payment history: {error}</div>}
      <div className="pefa-table-wrap">
        <table className="payment-table pefa-finance-table">
          <thead><tr><th>Date</th><th>Lab No</th><th>Patient</th><th>Amount</th><th>Method</th><th>Cashier</th><th>Reference</th><th>Receipt</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="8" className="pefa-empty">Loading payment transactions…</td></tr> : filtered.length === 0 ? <tr><td colSpan="8" className="pefa-empty">No payment transactions found.</td></tr> : filtered.map((item) => (
              <tr key={item.id}>
                <td>{dateTime(item.display_date)}</td>
                <td>{item.lab_number || "—"}</td>
                <td><strong>{item.patient_name || "—"}</strong></td>
                <td><strong>{money(item.amount)}</strong></td>
                <td>{item.payment_method || "—"}</td>
                <td>{item.received_by || "—"}</td>
                <td>{item.payment_reference || "—"}</td>
                <td>{item.receipt_number || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
