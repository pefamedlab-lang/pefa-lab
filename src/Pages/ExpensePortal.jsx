import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";
import "../styles/expensePortal.css";
import "../styles/financePremium.css";

const emptyForm = () => ({ expense_date: new Date().toISOString().split("T")[0], category: "", item_name: "", vendor: "", amount: "", description: "" });
const money = (v) => `₦${Number(v || 0).toLocaleString("en-NG")}`;

export default function ExpensePortal() {
  const user = JSON.parse(localStorage.getItem("pefa_user") || "{}") || {};
  const [form, setForm] = useState(emptyForm());
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadExpenses = useCallback(async () => {
    const { data, error: queryError } = await supabase.from("expenses").select("*").order("created_at", { ascending: false });
    if (queryError) { console.error("[PEFA EXPENSE]", queryError); setError(queryError.message); return; }
    setExpenses(data || []); setError("");
  }, []);
  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  const saveExpense = async (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!form.category || !form.item_name.trim() || !Number.isFinite(amount) || amount <= 0) return;
    setLoading(true); setError("");
    const recordedBy = user.full_name || user.username || "Unknown";
    const { data, error: insertError } = await supabase.from("expenses").insert([{ ...form, amount, recorded_by: recordedBy }]).select("*").single();
    if (insertError) { setError(insertError.message); setLoading(false); return; }
    await supabase.from("audit_logs").insert([{ user_name: recordedBy, user_role: user.role || user.user_metadata?.role || "", action: "Expense Recorded", module: "Expense Portal", description: `${form.item_name} — ${money(amount)} (${form.category})` }]);
    setForm(emptyForm());
    if (data) setExpenses((prev) => [data, ...prev]); else await loadExpenses();
    setLoading(false);
  };

  const deleteExpense = async (id) => {
    if (!window.confirm("Delete this expense? This should only be used for an incorrect entry.")) return;
    const { error: deleteError } = await supabase.from("expenses").delete().eq("id", id);
    if (deleteError) { setError(deleteError.message); return; }
    await loadExpenses();
  };

  const total = expenses.reduce((s, x) => s + Number(x.amount || 0), 0);
  return <div className="page pefa-finance-page">
    <div className="pefa-finance-header"><div><span className="pefa-eyebrow">EXPENDITURE CONTROL</span><h1>Expense Portal</h1><p>Record, review and reconcile laboratory operating expenses.</p></div><button type="button" className="pefa-finance-refresh" onClick={loadExpenses}>Refresh</button></div>
    <div className="pefa-finance-cards"><div><span>Total Recorded</span><strong>{money(total)}</strong></div><div><span>Entries</span><strong>{expenses.length}</strong></div><div><span>This Month</span><strong>{money(expenses.filter((x) => { const d=new Date(x.expense_date || x.created_at), n=new Date(); return d.getMonth()===n.getMonth() && d.getFullYear()===n.getFullYear(); }).reduce((s,x)=>s+Number(x.amount||0),0))}</strong></div></div>
    {error && <div className="pefa-finance-alert">{error}</div>}
    <form className="expense-form pefa-expense-form" onSubmit={saveExpense}><input type="date" value={form.expense_date} onChange={(e)=>setForm({...form,expense_date:e.target.value})}/><select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} required><option value="">Select Category</option>{["Reagents","Consumables","Equipment","Fuel","Utilities","Salary","Maintenance","Transportation","Internet","Rent","Others"].map(x=><option key={x}>{x}</option>)}</select><input placeholder="Item Name" value={form.item_name} onChange={(e)=>setForm({...form,item_name:e.target.value})} required/><input placeholder="Vendor" value={form.vendor} onChange={(e)=>setForm({...form,vendor:e.target.value})}/><input type="number" min="0.01" step="0.01" placeholder="Amount" value={form.amount} onChange={(e)=>setForm({...form,amount:e.target.value})} required/><textarea placeholder="Description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/><button type="submit" className="pefa-finance-primary" disabled={loading}>{loading ? "Saving…" : "Save Expense"}</button></form>
    <h2>Expense History</h2><div className="pefa-table-wrap"><table className="expense-table pefa-finance-table"><thead><tr><th>Date</th><th>Category</th><th>Item</th><th>Vendor</th><th>Amount</th><th>Recorded By</th><th>Action</th></tr></thead><tbody>{expenses.length ? expenses.map((item)=><tr key={item.id}><td>{item.expense_date || "—"}</td><td>{item.category || "—"}</td><td>{item.item_name || "—"}</td><td>{item.vendor || "—"}</td><td><strong>{money(item.amount)}</strong></td><td>{item.recorded_by || "—"}</td><td><button type="button" className="delete-btn" onClick={()=>deleteExpense(item.id)}>Delete</button></td></tr>) : <tr><td colSpan="7" className="pefa-empty">No expenses recorded.</td></tr>}</tbody></table></div>
  </div>;
}
