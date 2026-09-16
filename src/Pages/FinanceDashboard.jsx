import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  BarChart3,
  CalendarDays,
  CreditCard,
  Download,
  RefreshCw,
  Search,
  Wallet,
  TrendingUp,
  Users,
  Receipt,
} from "lucide-react";
import "../styles/financeDashboard.css";

const money = (value) => `₦${Number(value || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const text = (value) => String(value ?? "").trim();
const startToday = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const startMonth = () => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d; };
const dateValue = (row) => row?.created_at || row?.payment_date || row?.transaction_date || row?.paid_at || row?.updated_at || null;

export default function FinanceDashboard() {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadFinance = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [paymentResult, orderResult, expenseResult] = await Promise.all([
        supabase.from("payment_transactions").select("id, lab_number, amount, payment_method, received_by, created_at").order("created_at", { ascending: false }).limit(5000),
        supabase.from("service_orders").select("*").order("created_at", { ascending: false }).limit(5000),
        supabase.from("expenses").select("*").order("created_at", { ascending: false }).limit(2000),

      ]);
      if (paymentResult.error) console.warn("[FINANCE] payment_transactions:", paymentResult.error);
      if (orderResult.error) console.warn("[FINANCE] service_orders:", orderResult.error);
      if (expenseResult.error) console.warn("[FINANCE] expenses:", expenseResult.error);

      setPayments(Array.isArray(paymentResult.data) ? paymentResult.data : []);
      setOrders(Array.isArray(orderResult.data) ? orderResult.data : []);
      setExpenses(Array.isArray(expenseResult.data) ? expenseResult.data : []);
      const orderRows = Array.isArray(orderResult.data) ? orderResult.data : [];
      const orderMap = new Map(orderRows.map((order) => [String(order.id), order]));
      const enrichedPayments = (Array.isArray(paymentResult.data) ? paymentResult.data : []).map((payment) => {
        const order = orderRows.find((row) => String(row.lab_number || "") === String(payment.lab_number || "")) || {};
        return {
          ...payment,
          patient_name: order.patient_name || "",
          order_number: order.order_number || "",
          invoice_no: order.invoice_no || "",
        };
      });
      setPaymentDetails(enrichedPayments);
      setLastUpdated(new Date());
      if (paymentResult.error && orderResult.error) setError("Finance data could not be loaded. Check Supabase table access and RLS policies.");
    } catch (e) {
      console.error("[FINANCE] Load failed:", e); setError(e?.message || "Unable to load finance data.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadFinance(); const timer = setInterval(loadFinance, 60000); return () => clearInterval(timer); }, [loadFinance]);

  const stats = useMemo(() => {
    const today = startToday(), month = startMonth();
    const valid = payments.filter(p => Number(p?.amount ?? p?.amount_paid ?? 0) > 0);
    const todayPayments = valid.filter(p => { const d = new Date(dateValue(p)); return !Number.isNaN(d.getTime()) && d >= today; });
    const monthPayments = valid.filter(p => { const d = new Date(dateValue(p)); return !Number.isNaN(d.getTime()) && d >= month; });
    const todayRevenue = todayPayments.reduce((s,p)=>s+Number(p?.amount ?? p?.amount_paid ?? 0),0);
    const monthRevenue = monthPayments.reduce((s,p)=>s+Number(p?.amount ?? p?.amount_paid ?? 0),0);
    const outstanding = orders.reduce((s,o)=>s+Math.max(0,Number(o?.balance || 0)),0);
    const expenseMonth = expenses.filter(e=>{const d=new Date(dateValue(e)); return !Number.isNaN(d.getTime())&&d>=month;}).reduce((s,e)=>s+Number(e?.amount||e?.total_amount||0),0);
    return { todayRevenue, monthRevenue, outstanding, expenseMonth, netMonth: monthRevenue-expenseMonth, transactions: monthPayments.length, patients: new Set(monthPayments.map(p=>text(p?.lab_number)).filter(Boolean)).size };
  }, [payments, orders, expenses]);

  const filtered = useMemo(() => {
    const q=search.trim().toLowerCase();
    const rows = paymentDetails.length ? paymentDetails : payments;
    if(!q) return rows.slice(0,50);
    return rows.filter(p => [p?.patient_name,p?.lab_number,p?.payment_method,p?.received_by,p?.receipt_number,p?.payment_reference].some(v=>text(v).toLowerCase().includes(q))).slice(0,50);
  }, [paymentDetails,payments,search]);

  const exportCsv = () => {
    const rows = (paymentDetails.length ? paymentDetails : payments).map(p => [dateValue(p),p?.patient_name||"",p?.lab_number||"",p?.amount||p?.amount_paid||0,p?.payment_method||"",p?.received_by||"",p?.payment_reference||"",p?.receipt_number||""]);
    const csv=[['Date','Patient','Lab Number','Amount','Method','Received By','Reference','Receipt'],...rows].map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`PEFA-Finance-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(a.href);
  };

  return <div className="finance-page">
    <header className="finance-hero">
      <div><span className="finance-kicker">PEFA ENTERPRISE FINANCE</span><h1>Finance Overview</h1><p>Central financial control linked directly to the payment transaction ledger and service orders.</p></div>
      <div className="finance-hero-actions"><button type="button" onClick={loadFinance} disabled={loading}><RefreshCw size={17} className={loading?"finance-spin":""}/>Refresh</button><button type="button" onClick={exportCsv}><Download size={17}/>Export Ledger</button></div>
    </header>
    {error && <div className="finance-alert">{error}</div>}
    <section className="finance-kpi-grid">
      <div className="finance-kpi"><span><Banknote size={19}/>Revenue Today</span><strong>{money(stats.todayRevenue)}</strong><small>Actual recorded payments</small></div>
      <div className="finance-kpi"><span><TrendingUp size={19}/>Revenue This Month</span><strong>{money(stats.monthRevenue)}</strong><small>{stats.transactions} transactions</small></div>
      <div className="finance-kpi"><span><Wallet size={19}/>Outstanding</span><strong>{money(stats.outstanding)}</strong><small>Open service-order balances</small></div>
      <div className="finance-kpi"><span><ArrowDownRight size={19}/>Expenses This Month</span><strong>{money(stats.expenseMonth)}</strong><small>Recorded expenses</small></div>
      <div className="finance-kpi"><span><BarChart3 size={19}/>Net This Month</span><strong>{money(stats.netMonth)}</strong><small>Revenue less expenses</small></div>
      <div className="finance-kpi"><span><Users size={19}/>Paying Patients</span><strong>{stats.patients}</strong><small>Unique lab numbers this month</small></div>
    </section>
    <section className="finance-card">
      <div className="finance-card-head"><div><span className="finance-section-kicker">TRANSACTION LEDGER</span><h2>Recent Payments</h2></div><div className="finance-search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search patient, lab no., method, receipt..."/></div></div>
      <div className="finance-table-wrap"><table className="finance-table"><thead><tr><th>Date</th><th>Patient</th><th>Lab No.</th><th>Amount</th><th>Method</th><th>Received By</th><th>Reference</th><th>Receipt</th></tr></thead><tbody>{loading && !filtered.length ? <tr><td colSpan="8" className="finance-empty">Loading financial ledger...</td></tr> : filtered.length ? filtered.map((p,i)=><tr key={p?.id||i}><td>{dateValue(p)?new Date(dateValue(p)).toLocaleString('en-NG',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—'}</td><td><strong>{p?.patient_name||'—'}</strong></td><td>{p?.lab_number||'—'}</td><td className="finance-amount">{money(p?.amount ?? p?.amount_paid)}</td><td><span className="finance-method">{p?.payment_method||'—'}</span></td><td>{p?.received_by||'—'}</td><td>{p?.payment_reference||'—'}</td><td>{p?.receipt_number||p?.invoice_no||'—'}</td></tr>) : <tr><td colSpan="8" className="finance-empty">No payment transactions found.</td></tr>}</tbody></table></div>
    </section>
    <section className="finance-two-col">
      <div className="finance-card finance-mini"><div className="finance-mini-icon"><Receipt size={20}/></div><div><span>Open Service Orders</span><strong>{orders.filter(o=>Number(o?.balance||0)>0).length}</strong><small>Awaiting full settlement</small></div></div>
      <div className="finance-card finance-mini"><div className="finance-mini-icon"><CalendarDays size={20}/></div><div><span>Last Financial Refresh</span><strong>{lastUpdated?lastUpdated.toLocaleTimeString('en-NG',{hour:'2-digit',minute:'2-digit'}):'—'}</strong><small>Automatic refresh every 60 seconds</small></div></div>
    </section>
  </div>;
}
