import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Eye,
  Filter,
  Loader2,
  Search,
  X,
} from "lucide-react";
import "../styles/wellnessOrderDashboard.css";

const STATUS_OPTIONS = [
  "Pending",
  "Reviewed",
  "Accepted",
  "Registered",
  "Completed",
  "Rejected",
  "Cancelled",
];

export default function WellnessOrderDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [payment, setPayment] = useState("All");
  const [selected, setSelected] = useState(null);
  const [staffNotes, setStaffNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("wellness-orders-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wellness_orders" },
        () => loadOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadOrders() {
    const { data, error: fetchError } = await supabase
      .from("wellness_orders")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message || "Unable to load wellness orders.");
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  }

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !q ||
        [
          order.order_number,
          order.patient_name,
          order.patient_phone,
          order.package_name,
          order.registration_number,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));

      const matchesStatus = status === "All" || order.status === status;
      const matchesPayment =
        payment === "All" || order.payment_status === payment;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, status, payment]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((x) => x.status === "Pending").length,
      accepted: orders.filter((x) => x.status === "Accepted").length,
      registered: orders.filter((x) => x.status === "Registered").length,
      completed: orders.filter((x) => x.status === "Completed").length,
    };
  }, [orders]);

  function openOrder(order) {
    setSelected(order);
    setStaffNotes(order.staff_notes || "");
  }

  async function acceptAndRegister(order) {
    if (!order) return;

    setSaving(true);
    setError("");

    try {
      if (["Registered", "Completed", "Rejected", "Cancelled"].includes(order.status)) {
        throw new Error(`This wellness order is already ${String(order.status).toLowerCase()}.`);
      }

      const { data, error: updateError } = await supabase
        .from("wellness_orders")
        .update({
          status: "Accepted",
          staff_notes: staffNotes.trim() || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .select("*")
        .single();

      if (updateError) throw updateError;

      setOrders((prev) =>
        prev.map((item) => (item.id === data.id ? data : item))
      );
      setSelected(null);

      navigate(
        `/registration?wellness_order_id=${encodeURIComponent(data.id)}`,
        { replace: false }
      );
    } catch (err) {
      setError(err?.message || "Unable to accept wellness order.");
    } finally {
      setSaving(false);
    }
  }

  async function updateOrder(nextStatus) {
    if (!selected) return;

    if (nextStatus === "Accepted") {
      await acceptAndRegister(selected);
      return;
    }

    setSaving(true);
    setError("");

    const { data, error: updateError } = await supabase
      .from("wellness_orders")
      .update({
        status: nextStatus,
        staff_notes: staffNotes.trim() || null,
        reviewed_at:
          nextStatus === "Reviewed"
            ? new Date().toISOString()
            : selected.reviewed_at,
      })
      .eq("id", selected.id)
      .select("*")
      .single();

    if (updateError) {
      setError(updateError.message || "Unable to update order.");
    } else {
      setOrders((prev) =>
        prev.map((item) => (item.id === data.id ? data : item))
      );
      setSelected(data);
    }

    setSaving(false);
  }

  return (
    <main className="wod-page">
      <div className="wod-header">
        <div>
          <span>PEFA ENTERPRISE LIS</span>
          <h1>Wellness Order Dashboard</h1>
          <p>Review public wellness package orders and their complete test/service lists.</p>
        </div>
      </div>

      <section className="wod-stats">
        <div><b>{stats.total}</b><span>Total Orders</span></div>
        <div><b>{stats.pending}</b><span>Pending</span></div>
        <div><b>{stats.accepted}</b><span>Accepted</span></div>
        <div><b>{stats.registered}</b><span>Registered</span></div>
        <div><b>{stats.completed}</b><span>Completed</span></div>
      </section>

      <section className="wod-toolbar">
        <div className="wod-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order, patient, phone or package..."
          />
        </div>

        <div className="wod-filter">
          <Filter size={17} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="wod-filter">
          <select value={payment} onChange={(e) => setPayment(e.target.value)}>
            <option value="All">All Payment Statuses</option>
            <option>Pending</option>
            <option>Paid</option>
            <option>Partially Paid</option>
            <option>Failed</option>
            <option>Refunded</option>
          </select>
        </div>
      </section>

      {error && <div className="wod-error">{error}</div>}

      <section className="wod-table-wrap">
        {loading ? (
          <div className="wod-loading">
            <Loader2 className="spin" size={28} />
            Loading wellness orders...
          </div>
        ) : (
          <table className="wod-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Patient</th>
                <th>Package</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td><b>{order.order_number || "—"}</b></td>
                  <td>
                    <strong>{order.patient_name}</strong>
                    <small>{order.patient_phone}</small>
                  </td>
                  <td>{order.package_name}</td>
                  <td>₦{Number(order.amount || 0).toLocaleString()}</td>
                  <td><span className="wod-badge">{order.payment_status}</span></td>
                  <td><span className="wod-badge">{order.status}</span></td>
                  <td>{order.submitted_at ? new Date(order.submitted_at).toLocaleString() : "—"}</td>
                  <td>
                    <button
                      className="wod-view-btn"
                      type="button"
                      onClick={() => openOrder(order)}
                    >
                      <Eye size={17} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {!filteredOrders.length && (
                <tr>
                  <td colSpan="8" className="wod-empty">No wellness orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>

      {selected && (
        <div className="wod-modal-backdrop">
          <div className="wod-modal">
            <button
              type="button"
              className="wod-close"
              onClick={() => setSelected(null)}
            >
              <X size={21} />
            </button>

            <div className="wod-modal-title">
              <span>{selected.order_number}</span>
              <h2>{selected.package_name}</h2>
              <strong>₦{Number(selected.amount || 0).toLocaleString()}</strong>
            </div>

            <div className="wod-patient-grid">
              <div><label>Patient</label><b>{selected.patient_name}</b></div>
              <div><label>Phone</label><b>{selected.patient_phone}</b></div>
              <div><label>Email</label><b>{selected.patient_email || "—"}</b></div>
              <div><label>Sex</label><b>{selected.patient_sex || "—"}</b></div>
              <div><label>Date of Birth</label><b>{selected.patient_dob || "—"}</b></div>
              <div><label>Preferred Date</label><b>{selected.preferred_date || "—"}</b></div>
            </div>

            <div className="wod-included">
              <h3><CheckCircle2 size={18} /> Complete Tests & Services Included</h3>
              <div className="wod-items">
                {(Array.isArray(selected.included_items)
                  ? selected.included_items.filter((item) => !isUnavailableItem(item))
                  : []
                ).map((item, index) => (
                  <div key={item.id || `${item.item_name}-${index}`}>
                    <CheckCircle2 size={15} />
                    <span>
                      {item.department ? `${item.department}: ` : ""}
                      {item.item_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="wod-note">
              <label>Staff Notes</label>
              <textarea
                rows="3"
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                placeholder="Enter staff notes..."
              />
            </div>

            <div className="wod-actions">
              <button disabled={saving} onClick={() => updateOrder("Reviewed")}>Mark Reviewed</button>
              <button disabled={saving} onClick={() => updateOrder("Accepted")}>Accept & Register</button>
              <button disabled={saving} onClick={() => updateOrder("Rejected")}>Reject</button>
              <button
                disabled={saving || selected.status !== "Accepted"}
                onClick={() => updateOrder("Registered")}
              >
                Register Patient
              </button>
            </div>

            {selected.status !== "Accepted" && (
              <small className="wod-hint">
                Accept the order before using Register Patient.
              </small>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
