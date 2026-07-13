import "../styles/referralDashboard.css";

import { useEffect, useState } from "react";

import { supabase } from "../supabase";

import { useRef } from "react";

import * as XLSX from "xlsx";

import {
  logActivity
} from "../utils/logActivity";

import {
  Building2,
  Users,
  Wallet,
  Eye,
  X,
} from "lucide-react";

import {
  Bar
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ReferralDashboard() {

const [paymentHistory, setPaymentHistory] =
  useState([]);

const [showHistoryModal, setShowHistoryModal] =
  useState(false);

const [searchTerm, setSearchTerm] =
  useState("");

const [filterType, setFilterType] =
  useState("All");

const loadPaymentHistory =
  async () => {

    const { data, error } =
      await supabase
        .from("referral_payments")
        .select("*")
        .eq(
          "referral_name",
          selectedReferral.name
        )
        .order(
          "payment_date",
          { ascending: false }
        );

    console.log(
      "History:",
      data
    );

    console.log(
      "History Error:",
      error
    );

    if (!error) {

      setPaymentHistory(
        data || []
      );

      setShowHistoryModal(
        true
      );

    }

  };

  const [loading, setLoading] =
    useState(false);

const [commissionAmount, setCommissionAmount] =
  useState("");

const [commissionNote, setCommissionNote] =
  useState("");

const [commissionHistory, setCommissionHistory] =
  useState([]);

const invoiceRef = useRef(null);

  const [referrals, setReferrals] =
    useState([]);

  const [invoices, setInvoices] =
    useState([]);

const [
  showStatement,
  setShowStatement
] = useState(false);

  const [
    selectedReferral,
    setSelectedReferral,
  ] = useState(null);

  const [
    referralPatients,
    setReferralPatients,
  ] = useState([]);

  useEffect(() => {
    loadReferrals();
    loadInvoices();
  }, []);

const [showModal, setShowModal] =
  useState(false);

const [showPaymentModal, setShowPaymentModal] =
  useState(false);

const [selectedInvoice, setSelectedInvoice] =
  useState(null);

const [showCommissionModal, setShowCommissionModal] =
  useState(false);

const [paymentAmount, setPaymentAmount] =
  useState("");

const managerName =
  "Taiwo A. D.";

const directorName =
  "Adebori P. S.";

const printInvoice = () => {

logActivity(
  "Generated Invoice",
  selectedReferral?.name
);

  const invoiceContent =
    invoiceRef.current;

  const originalBody =
    document.body.innerHTML;

  document.body.innerHTML =
    invoiceContent.outerHTML;

  window.print();

  document.body.innerHTML =
    originalBody;

  window.location.reload();

};

const [editingReferral, setEditingReferral] =
  useState(null);

const [newReferral, setNewReferral] =
  useState({

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

  });



  /* =====================================
     LOAD REFERRALS
  ===================================== */

  const loadReferrals =
    async () => {
      try {
        const { data, error } =
          await supabase
            .from("referrals")
            .select("*")
            .order(
              "created_at",
              {
                ascending: false,
              }
            );

        if (error) throw error;

        setReferrals(data || []);
      } catch (error) {
        console.log(error);
      }
    };

const createReferral =
  async () => {

    try {

      const code =
        "REF-" +
        Date.now()
          .toString()
          .slice(-6);

      const { error } =
        await supabase

          .from("referrals")

          .insert([{

            ...newReferral,

            referral_code:
              code,

          }]);

      if (error)
        throw error;

await logActivity(
  "Created Referral",
  newReferral.name
);
 
alert(`✅ ${newReferral.name} added successfully`);

setNewReferral({
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
});

setShowModal(false);

loadReferrals();

    } catch (error) {

      console.log(error);

      alert(error.message);

    }
  };

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
      referral.commission_rate || 10,

    credit_limit:
      referral.credit_limit || 0,

    status:
      referral.status || "Active",

  });

  setShowModal(true);

};

const updateReferral = async () => {

  try {

    const { error } =

      await supabase

        .from("referrals")

        .update({

          ...newReferral,

        })

        .eq(
          "id",
          editingReferral.id
        );

    if (error)
      throw error;

    alert(
  "Referral updated successfully"
);

setNewReferral({
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
});

setEditingReferral(null);

setShowModal(false);

loadReferrals();

  } catch (error) {

    alert(error.message);

  }

};

  /* =====================================
     LOAD INVOICES
  ===================================== */

const loadInvoices = async () => {

  try {

    const { data, error } =

      await supabase
        .from(
          "referral_invoices"
        )
        .select("*");

    console.log(
      "Invoices:",
      data
    );

    console.log(
      "Invoice Error:",
      error
    );

    if (error)
      throw error;

    setInvoices(
      data || []
    );

  } catch (error) {

    console.log(error);

  }

};


  /* =====================================
     VIEW REFERRAL
  ===================================== */

 const viewReferral =
  async (referralName) => {

    console.log(
      "Clicked Referral:",
      referralName
    );

    console.log(
      "Referrals:",
      referrals
    );

    try {

      setLoading(true);

      const { data, error } =
        await supabase
          .from("referral_invoices")
          .select("*")
          .eq(
            "referral_name",
            referralName
          );

      console.log(
        "Invoices Found:",
        data
      );

      console.log(
        "Query Error:",
        error
      );

      if (error) throw error;

      setReferralPatients(
        data || []
      );

      const referral =
        referrals.find(
          (r) =>
            r.name?.trim() ===
            referralName?.trim()
        );

      console.log(
        "Found Referral:",
        referral
      );

      setSelectedReferral(
        referral
      );

await logActivity(
  "Viewed Referral",
  referralName
);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  };

const recordPayment =
  async () => {

    try {

      const amount =
        Number(paymentAmount);

      const newPaid =

        Number(
          selectedInvoice.amount_paid || 0
        ) + amount;

      const newBalance =

        Number(
          selectedInvoice.final_amount
        ) - newPaid;

console.log(
  "Saving Payment History"
);

const historyResult =
  await supabase
    .from(
      "referral_payments"
    )
    .insert([{

      invoice_id:
        selectedInvoice.id,

      referral_name:
        selectedReferral.name,

      patient_name:
        selectedInvoice.patient_name,

      amount_paid:
        amount,

      previous_balance:
        selectedInvoice.balance,

      new_balance:
        newBalance,

    }]);

console.log(
  "History Insert:",
  historyResult
);

      let status =
        "Outstanding";

      if (
        newBalance <= 0
      ) {

        status = "Paid";

      } else if (

        newPaid > 0

      ) {

        status = "Part Paid";

      }
     
        await supabase

          .from(
            "referral_invoices"
          )

          .update({

            amount_paid:
              newPaid,

            balance:
              newBalance,

            payment_status:
              status,

            payment_date:
              new Date(),

          })

          .eq(
            "id",
            selectedInvoice.id
          );

      if (error)
        throw error;

await logActivity(
  "Recorded Payment",
  `₦${amount}`
);

      alert(
        "Payment Recorded"
      );

      setShowPaymentModal(
        false
      );

      loadInvoices();

      if (
        selectedReferral
      ) {

        viewReferral(
          selectedReferral.name
        );

      }

    } catch (error) {

      console.log(error);

      alert(
        error.message
      );

    }
  };

  /* =====================================
     STATS
  ===================================== */

  const totalRevenue =
    invoices.reduce(
      (sum, item) =>
        sum +
        Number(
          item.final_amount || 0
        ),
      0
    );

  const totalBalance =
    invoices.reduce(
      (sum, item) =>
        sum +
        Number(item.balance || 0),
      0
    );

const referralRevenue =
  referralPatients.reduce(
    (sum, item) =>
      sum +
      Number(
        item.final_amount || 0
      ),
    0
  );

const referralOutstanding =
  referralPatients.reduce(
    (sum, item) =>
      sum +
      Number(
        item.balance || 0
      ),
    0
  );

const referralCommission =
  referralRevenue *
  (
    Number(
      selectedReferral
        ?.commission_rate || 0
    ) / 100
  );

const referralPaid =
  referralRevenue -
  referralOutstanding;

const totalPatients =
  new Set(
    invoices.map(
      item =>
        item.patient_name
    )
  ).size;

const filteredReferrals =
  referrals.filter((item) => {

    const matchesSearch =

      item.name
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        ) ||

      item.phone
        ?.includes(searchTerm);

    if (!matchesSearch)
      return false;

    if (
      filterType === "Active"
    ) {
      return (
        item.status ===
        "Active"
      );
    }

    if (
      filterType === "Inactive"
    ) {
      return (
        item.status !==
        "Active"
      );
    }

    return true;

  });


const referralStats =
  referrals.map((referral) => {

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
          referral.commission_rate || 0
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

  });

const topRevenueReferral =
  [...referralStats]
    .sort(
      (a,b) =>
        b.revenue -
        a.revenue
    )[0];

const topPatientReferral =
  [...referralStats]
    .sort(
      (a,b) =>
        b.patients -
        a.patients
    )[0];

const topCommissionReferral =
  [...referralStats]
    .sort(
      (a,b) =>
        b.commission -
        a.commission
    )[0];

const topOutstandingReferral =
  [...referralStats]
    .sort(
      (a,b) =>
        b.outstanding -
        a.outstanding
    )[0];


const printReceipt = (
  patient
) => {

logActivity(
  "Printed Receipt",
  patient.patient_name
);

  const receiptWindow =
    window.open(
      "",
      "",
      "width=800,height=900"
    );

  receiptWindow.document.write(`

<html>

<head>

<title>
Payment Receipt
</title>

<style>

body{
  font-family:Arial,sans-serif;
  padding:30px;
}

.receipt{
  border:2px solid #0f4cbd;
  padding:25px;
}

h1{
  color:#0f4cbd;
  text-align:center;
}

table{
  width:100%;
  margin-top:20px;
}

td{
  padding:10px;
}

</style>

</head>

<body>

<div class="receipt">

<h1>
PEFA MEDICAL
DIAGNOSTIC SERVICES
</h1>

<h2>
PAYMENT RECEIPT
</h2>

<table>

<tr>
<td><strong>Patient</strong></td>
<td>${patient.patient_name}</td>
</tr>

<tr>
<td><strong>Lab No</strong></td>
<td>${patient.lab_number}</td>
</tr>

<tr>
<td><strong>Amount Paid</strong></td>
<td>₦${Number(
  patient.final_amount -
  patient.balance
).toLocaleString()}</td>
</tr>

<tr>
<td><strong>Date</strong></td>
<td>${new Date().toLocaleDateString()}</td>
</tr>

<tr>
<td><strong>Status</strong></td>
<td>${patient.payment_status}</td>
</tr>

</table>

</div>

</body>

</html>

`);

  receiptWindow.document.close();

  receiptWindow.print();

};


const exportReferrals = () => {

  const exportData =
    filteredReferrals.map(
      (item) => ({

        Name:
          item.name,

        Phone:
          item.phone,

        Commission:
          item.commission_rate + "%",

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


const revenueChartData = {

  labels:
    referralStats.map(
      item => item.name
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

    },

  ],

};

const saveCommissionPayment =
  async () => {

    try {

      const amount =
        Number(
          commissionAmount
        );

if (
  amount <= 0
) {

  alert(
    "Enter a valid amount"
  );

  return;

}

if (
  amount >
  referralCommission
) {

  alert(
    "Amount exceeds commission due"
  );

  return;

}

      const balance =
        referralCommission -
        amount;

      const { error } =
        await supabase

          .from(
            "referral_commissions"
          )

          .insert([{

            referral_name:
              selectedReferral.name,

            amount_paid:
              amount,

            commission_due:
              referralCommission,

            balance,

            notes:
              commissionNote,

          }]);

      if (error)
        throw error;

await logActivity(
  "Commission Payment",
  `₦${amount}`
);

      alert(
        "Commission payment saved successfully"
      );

await loadCommissionHistory();

      setCommissionAmount("");

      setCommissionNote("");

      setShowCommissionModal(
        false
      );

    } catch (err) {

      alert(
        err.message
      );

    }

  };

const loadCommissionHistory =
  async () => {

    if (!selectedReferral)
      return;

    const { data, error } =
      await supabase

        .from(
          "referral_commissions"
        )

        .select("*")

        .eq(
          "referral_name",
          selectedReferral.name
        )

        .order(
          "payment_date",
          {
            ascending:false
          }
        );

    if (!error) {

      setCommissionHistory(
        data || []
      );

    }

  };

const printCommissionReceipt =
  (payment) => {

logActivity(
  "Printed Commission Receipt",
  payment.referral_name
);

    const receiptWindow =
      window.open(
        "",
        "",
        "width=900,height=900"
      );

    receiptWindow.document.write(`

<html>

<head>

<title>
Commission Receipt
</title>

<style>

body{
  font-family:Arial,sans-serif;
  padding:30px;
}

.receipt{
  border:2px solid #2563eb;
  border-radius:12px;
  padding:25px;
}

h1{
  color:#2563eb;
  text-align:center;
}

table{
  width:100%;
  margin-top:20px;
}

td{
  padding:10px;
}

.footer{
  margin-top:50px;
}

</style>

</head>

<body>

<div class="receipt">

<h1>
PEFA MEDICAL
DIAGNOSTIC SERVICES
</h1>

<h2>
COMMISSION PAYMENT RECEIPT
</h2>

<table>

<tr>
<td><strong>Referral</strong></td>
<td>${payment.referral_name}</td>
</tr>

<tr>
<td><strong>Commission Due</strong></td>
<td>₦${Number(
  payment.commission_due
).toLocaleString()}</td>
</tr>

<tr>
<td><strong>Amount Paid</strong></td>
<td>₦${Number(
  payment.amount_paid
).toLocaleString()}</td>
</tr>

<tr>
<td><strong>Balance</strong></td>
<td>₦${Number(
  payment.balance
).toLocaleString()}</td>
</tr>

<tr>
<td><strong>Date</strong></td>
<td>${new Date(
  payment.payment_date
).toLocaleDateString()}</td>
</tr>

</table>

<div class="footer">

<p>
Prepared By:
Taiwo A. D.
</p>

<p>
Approved By:
Adebori P. S.
</p>

</div>

</div>

</body>

</html>

`);

    receiptWindow.document.close();

    receiptWindow.print();

};




  return (

  <div className="referral-dashboard">

    {/* HEADER */}

    <div className="referral-header">

      <h1>
        Referral Dashboard
      </h1>

      <button
        className="add-referral-btn"
        onClick={() =>
          setShowModal(true)
        }
      >
        + New Referral
      </button>

    </div>

    {/* STATS */}

    <div className="stats-grid">

      <div className="stat-card">

        <div className="stat-title">
          Total Referrals
        </div>

        <div className="stat-value">
          {referrals.length}
        </div>

      </div>

      <div className="stat-card">

        <div className="stat-title">
          Patients Referred
        </div>

        <div className="stat-value">
          {totalPatients}
        </div>

      </div>

      <div className="stat-card">

        <div className="stat-title">
          Revenue
        </div>

        <div className="stat-value">
          ₦
          {totalRevenue.toLocaleString()}
        </div>

      </div>

      <div className="stat-card">

        <div className="stat-title">
          Outstanding
        </div>

        <div className="stat-value">
          ₦
          {totalBalance.toLocaleString()}
        </div>

      </div>

    </div>


{/* RANKING CARDS */}

<div className="ranking-grid">

  <div className="ranking-card">

    <span>
      🥇 Top Revenue
    </span>

    <h3>
      {topRevenueReferral?.name || "-"}
    </h3>

    <p>
      ₦
      {topRevenueReferral?.revenue?.toLocaleString() || 0}
    </p>

  </div>

  <div className="ranking-card">

    <span>
      👥 Most Patients
    </span>

    <h3>
      {topPatientReferral?.name || "-"}
    </h3>

    <p>
      {topPatientReferral?.patients || 0}
    </p>

  </div>

  <div className="ranking-card">

    <span>
      💰 Top Commission
    </span>

    <h3>
      {topCommissionReferral?.name || "-"}
    </h3>

    <p>
      ₦
      {topCommissionReferral?.commission?.toLocaleString() || 0}
    </p>

  </div>

  <div className="ranking-card">

    <span>
      ⚠ Outstanding
    </span>

    <h3>
      {topOutstandingReferral?.name || "-"}
    </h3>

    <p>
      ₦
      {topOutstandingReferral?.outstanding?.toLocaleString() || 0}
    </p>

  </div>

</div>




{/* EXPORT */}


<div className="export-bar">

  <button
    className="export-btn"
    onClick={
      exportReferrals
    }
  >
    📊 Export Referrals
  </button>

</div>


{/* SEARCH */}


<div className="search-section">

  <input
    type="text"
    placeholder="Search referral name or phone..."
    value={searchTerm}
    onChange={(e) =>
      setSearchTerm(
        e.target.value
      )
    }
    className="search-input"
  />

</div>


{/* FILTER */}

<div className="filter-bar">

  <button
    className={
      filterType === "All"
        ? "filter-btn active"
        : "filter-btn"
    }
    onClick={() =>
      setFilterType("All")
    }
  >
    All
  </button>

  <button
    className={
      filterType === "Active"
        ? "filter-btn active"
        : "filter-btn"
    }
    onClick={() =>
      setFilterType("Active")
    }
  >
    Active
  </button>

  <button
    className={
      filterType === "Inactive"
        ? "filter-btn active"
        : "filter-btn"
    }
    onClick={() =>
      setFilterType("Inactive")
    }
  >
    Inactive
  </button>

</div>

{/* CHART */}

<div className="analytics-card">

  <h2>
    Revenue By Referral
  </h2>

  <Bar
    data={
      revenueChartData
    }
  />

</div>


<div className="audit-toolbar">

  <input
    type="text"
    placeholder="Search user or action..."
    value={searchTerm}
    onChange={(e) =>
      setSearchTerm(
        e.target.value
      )
    }
    className="audit-search"
  />

</div>


{/* REFERRALS TABLE */}


<div className="table-card">

  <div className="table-wrapper">

    <table>

      <thead>

        <tr>

          <th>Referral Name</th>

          <th>Phone</th>

          <th>Commission</th>

          <th>Status</th>

       <th>
  Action
</th>

        </tr>

      </thead>

      <tbody>

       {filteredReferrals.map((item) => (

          <tr key={item.id}>

            <td>
              {item.name}
            </td>

            <td>
              {item.phone}
            </td>

            <td>
              {item.commission_rate}%
            </td>

            <td>

  <span
    className="status-active"
  >

    {item.status}

  </span>

</td>

            <td className="action-cell">

  <div className="action-buttons">

  <button
    className="view-btn"
    onClick={() =>
      viewReferral(item.name)
    }
  >
    <Eye size={16}/>
    View
  </button>

  <button
    className="payment-btn"
    onClick={() =>
      editReferral(item)
    }
  >
    Edit
  </button>

</div>

            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </div>

</div>


{/* REFERRAL DETAILS */}

{selectedReferral && (

  <div className="modal-overlay print-area">

    <div className="modal-content">

      {/* HEADER */}

      <div className="modal-header">

        <h2>
          {selectedReferral.name}
        </h2>

        <button
          className="close-btn no-print"
          onClick={() =>
            setSelectedReferral(null)
          }
        >
          ×
        </button>

      </div>

      {/* ACTIONS */}

      <div className="dashboard-actions no-print">

        <button
          className="statement-btn"
          onClick={() =>
            loadPaymentHistory()
          }
        >
          Payment History
        </button>

        <button
          className="statement-btn"
          onClick={() =>
            setShowStatement(true)
          }
        >
          Statement
        </button>

        <button
          className="invoice-btn"
          onClick={printInvoice}
        >
          Generate Invoice
        </button>

<button
  className="commission-btn"
  onClick={() => {

  loadCommissionHistory();

  setShowCommissionModal(
    true
  );

}}
>
  Commission
</button>

      </div>

<div className="payment-manager no-print">

  <h3>
    Payment Management
  </h3>

  <table>

    <thead>

      <tr>

        <th>Patient</th>

        <th>Balance</th>

        <th>Status</th>

        <th>Action</th>

      </tr>

    </thead>

    <tbody>

      {referralPatients.map(
        (patient) => (

          <tr key={patient.id}>

            <td>
              {patient.patient_name}
            </td>

            <td>
              ₦
              {Number(
                patient.balance
              ).toLocaleString()}
            </td>

            <td>

              <span
                className={
                  patient.payment_status === "Paid"
                    ? "status-paid"
                    : patient.payment_status === "Part Paid"
                    ? "status-part-paid"
                    : "status-unpaid"
                }
              >

                {patient.payment_status}

              </span>

            </td>

            <td>

          <div className="action-buttons">

  <button
    className="payment-btn"
    onClick={() => {

      setSelectedInvoice(
        patient
      );

      setShowPaymentModal(
        true
      );

    }}
  >

    Record Payment

  </button>

  <button
    className="receipt-btn"
    onClick={() =>
      printReceipt(patient)
    }
  >

    Receipt

  </button>

</div>

            </td>

          </tr>

        )
      )}

    </tbody>

  </table>

</div>


{/* PERFORMANCE */}

<div className="referral-performance">

  <div className="performance-card">

    <span>
      Patients
    </span>

    <h2>
      {referralPatients.length}
    </h2>

  </div>

  <div className="performance-card">

    <span>
      Revenue
    </span>

    <h2>
      ₦{referralRevenue.toLocaleString()}
    </h2>

  </div>

  <div className="performance-card">

    <span>
      Outstanding
    </span>

    <h2>
      ₦{referralOutstanding.toLocaleString()}
    </h2>

  </div>

  <div className="performance-card">

    <span>
      Commission
    </span>

    <h2>
      ₦{referralCommission.toLocaleString()}
    </h2>

  </div>

</div>


      {/* PRINT AREA */}

      <div
        ref={invoiceRef}
        className="invoice-print-area"
      >

        {/* INVOICE HEADER HERE */}

<div className="invoice-top">

  <img
    src="/logo.png"
    alt="PEFA Logo"
    className="invoice-logo"
  />

  <div>

    <div className="company-details">

      <h1>
        PEFA MEDICAL
      </h1>

      <h2>
        DIAGNOSTIC SERVICES
      </h2>

      <p>
        Leading the way in Medical Excellence, Through Timely, Affordable & Acuracy
      </p>

    </div>

    <div className="contact-block">

      <p>
        📍 32 Ogunru-Ori, Pakuro Road,
        Mowe, Ogun State
      </p>

      <p>
        📞 08086618621 |
        08088336440
      </p>

      <p>
        ✉ pefa.medlab@gmail.com
      </p>

      <p>
        🌐 www.pefamed.com
      </p>

    </div>

  </div>

  <div className="invoice-box">

    <h3>
      INVOICE NO
    </h3>

    <h2>

      INV-
      {new Date().getFullYear()}
      -
      {String(
        referrals.findIndex(
          r =>
            r.id ===
            selectedReferral?.id
        ) + 1
      ).padStart(3,"0")}

    </h2>

    <h3>
      DATE
    </h3>

    <p>

      {
        new Date()
          .toLocaleDateString()
      }

    </p>

  </div>

</div>

<div className="invoice-divider"></div>

<h1 className="referral-title">
  REFERRAL INVOICE
</h1>

<div className="invoice-subtitle">

<div className="invoice-header-grid">

  <div className="invoice-info-card">

    <p>

      <strong>
        Referral:
      </strong>

      {" "}
      {selectedReferral.name}

    </p>

    <p>

      <strong>
        Commission:
      </strong>

      {" "}
      {selectedReferral.commission_rate}%

    </p>

  </div>

  <div className="invoice-info-card">

    <p>

      <strong>
        Invoice No:
      </strong>

      {" "}

      INV-
      {new Date().getFullYear()}
      -
      {String(
        referrals.findIndex(
          r =>
            r.id ===
            selectedReferral?.id
        ) + 1
      ).padStart(3,"0")}

    </p>

    <p>

      <strong>
        Date:
      </strong>

      {" "}

      {
        new Date()
          .toLocaleDateString()
      }

    </p>

  </div>

</div>

  Referral Summary Statement

</div>


        {/* PATIENT TABLE HERE */}

<table>

  <thead>

    <tr>

      <th>S/N</th>

      <th>Lab No</th>

      <th>Patient</th>

      <th>Test</th>

      <th>Amount</th>

      <th>Balance</th>

      <th>Status</th>

    </tr>

  </thead>

  <tbody>

    {referralPatients.map(
      (
        patient,
        index
      ) => (

        <tr
          key={patient.id}
        >

          <td>
            {index + 1}
          </td>

          <td>
            {patient.lab_number}
          </td>

          <td>
            {patient.patient_name}
          </td>

          <td>
            {patient.tests}
          </td>

          <td>
            ₦
            {Number(
              patient.final_amount
            ).toLocaleString()}
          </td>

          <td>
            ₦
            {Number(
              patient.balance
            ).toLocaleString()}
          </td>

          <td>

            <span
              className={
                patient.payment_status === "Paid"
                  ? "status-paid"
                  : patient.payment_status === "Part Paid"
                  ? "status-part-paid"
                  : "status-unpaid"
              }
            >

              {patient.payment_status}

            </span>

          </td>

        </tr>

      )
    )}

  </tbody>

</table>


        {/* FINANCIAL SUMMARY HERE */}

<h2 className="statement-title">
  FINANCIAL SUMMARY
</h2>

<div className="statement-grid">

  <div className="statement-card">

    <span>
      Total Revenue
    </span>

    <h2>
      ₦
      {referralRevenue.toLocaleString()}
    </h2>

  </div>

  <div className="statement-card">

    <span>
      Total Paid
    </span>

    <h2>
      ₦
      {referralPaid.toLocaleString()}
    </h2>

  </div>

  <div className="statement-card">

    <span>
      Outstanding
    </span>

    <h2>
      ₦
      {referralOutstanding.toLocaleString()}
    </h2>

  </div>

  <div className="statement-card">

    <span>
      Commission Due
    </span>

    <h2>
      ₦
      {referralCommission.toLocaleString()}
    </h2>

  </div>

</div>


        {/* FOOTER HERE */}

<div className="invoice-footer">

  <div className="footer-sign">

    <div className="signature-box">

      <strong>
        {managerName}
      </strong>

      <small>
        Laboratory Manager
      </small>

    </div>

    <div className="stamp-box">

      PEFA MEDICAL
      <br />
      DIAGNOSTIC
      <br />
      SERVICES

    </div>

    <div className="signature-box">

      <strong>
        {directorName}
      </strong>

      <small>
        Medical Director
      </small>

    </div>

  </div>

  <div className="footer-note">

    This is a computer generated invoice and
    does not require a physical signature.

    <br />

    Thank you for your continued partnership
    with PEFA Medical Diagnostic Services.

  </div>

</div>


      </div>

    </div>

  </div>

)}





    {/* COMMISSION MODAL */}

{showCommissionModal && (

  <div className="modal-overlay">

    <div className="modal-content">

      <div className="modal-header">

        <h2>
          Commission Management
        </h2>

        <button
          className="close-btn"
          onClick={() =>
            setShowCommissionModal(false)
          }
        >
          ✕
        </button>

      </div>

      <div className="commission-form">

  <div className="commission-summary">

    <h3>
      Commission Due
    </h3>

    <h1>
      ₦
      {referralCommission.toLocaleString()}
    </h1>

  </div>

  <label>
    Amount Paying
  </label>

  <input
    type="number"
    value={commissionAmount}
    onChange={(e) =>
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
    value={commissionNote}
    onChange={(e) =>
      setCommissionNote(
        e.target.value
      )
    }
    placeholder="Optional notes"
  />

  <button
  className="commission-save-btn"
  onClick={
    saveCommissionPayment
  }
>
  Save Commission Payment
</button>

<h3
  style={{
    marginTop:"25px"
  }}
>
  Commission History
</h3>

<table
  className="commission-table"
>

  <thead>

    <tr>

      <th>Date</th>
<th>Amount</th>
<th>Balance</th>
<th>Action</th>

    </tr>

  </thead>

  <tbody>

    {commissionHistory.map(
      (item) => (

        <tr
          key={item.id}
        >

          <td>

            {
              new Date(
                item.payment_date
              )
              .toLocaleDateString()
            }

          </td>

          <td>

            ₦
            {Number(
              item.amount_paid
            ).toLocaleString()}

          </td>

<td>

  ₦
  {Number(
    item.balance
  ).toLocaleString()}

</td>

<td>

  <button
    className="receipt-btn"
    onClick={() =>
      printCommissionReceipt(item)
    }
  >
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

)}



{/* STATEMENT MODAL */}


    {showStatement &&
      selectedReferral && (

      <div className="modal-overlay">

        <div className="modal-content">

          <h2>
            Statement Of Account
          </h2>

          <table>

            <tbody>

              <tr>

                <td>
                  Revenue
                </td>

                <td>
                  ₦
                  {
                    referralRevenue
                      .toLocaleString()
                  }
                </td>

              </tr>

              <tr>

                <td>
                  Paid
                </td>

                <td>
                  ₦
                  {
                    referralPaid
                      .toLocaleString()
                  }
                </td>

              </tr>

              <tr>

                <td>
                  Outstanding
                </td>

                <td>
                  ₦
                  {
                    referralOutstanding
                      .toLocaleString()
                  }
                </td>

              </tr>

            </tbody>

          </table>

          <button
            onClick={() =>
              setShowStatement(
                false
              )
            }
          >
            Close
          </button>

        </div>

      </div>

    )}

{/* PAYMENT MODAL */}

    {showPaymentModal &&
      selectedInvoice && (

      <div className="modal-overlay">

        <div className="modal-content">

          <h2>
            Record Payment
          </h2>

<p>

  Patient:

  {" "}

  {
    selectedInvoice
      ?.patient_name
  }

</p>

<p>

  Balance:

  {" "}

  ₦

  {
    Number(
      selectedInvoice
        ?.balance || 0
    ).toLocaleString()
  }

</p>

          <input
            type="number"
            value={paymentAmount}
            onChange={(e) =>
              setPaymentAmount(
                e.target.value
              )
            }
            placeholder="Amount Paid"
          />

          <div
            style={{
              display:"flex",
              gap:"10px",
              marginTop:"20px"
            }}
          >

           <button
  className="payment-btn"
  onClick={
    recordPayment
  }
>
  Save Payment
</button>

            <button
  className="close-btn"
  onClick={() =>
    setShowPaymentModal(false)
  }
>
  ✕
</button>

          </div>

        </div>

      </div>

    )}

    {/* NEW REFERRAL */}

  {showModal && (

  <div className="modal-overlay">

    <div className="modal-content">

     <h2>

  {

    editingReferral

      ? "Edit Referral"

      : "New Referral"

  }

</h2>

      <input
        type="text"
        placeholder="Referral Name"
        value={newReferral.name}
        onChange={(e) =>
          setNewReferral({
            ...newReferral,
            name: e.target.value,
          })
        }
      />

      <input
        type="text"
        placeholder="Phone Number"
        value={newReferral.phone}
        onChange={(e) =>
          setNewReferral({
            ...newReferral,
            phone: e.target.value,
          })
        }
      />

      <input
        type="text"
        placeholder="Contact Person"
        value={newReferral.contact_person}
        onChange={(e) =>
          setNewReferral({
            ...newReferral,
            contact_person: e.target.value,
          })
        }
      />

      <input
        type="email"
        placeholder="Email"
        value={newReferral.email}
        onChange={(e) =>
          setNewReferral({
            ...newReferral,
            email: e.target.value,
          })
        }
      />

      <input
        type="number"
        placeholder="Commission %"
        value={newReferral.commission_rate}
        onChange={(e) =>
          setNewReferral({
            ...newReferral,
            commission_rate: e.target.value,
          })
        }
      />

      <textarea
        placeholder="Address"
        value={newReferral.address}
        onChange={(e) =>
          setNewReferral({
            ...newReferral,
            address: e.target.value,
          })
        }
      />

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
        }}
      >

       <button
  className="payment-btn"
  onClick={() =>

    editingReferral

      ? updateReferral()

      : createReferral()

  }
>

  {

    editingReferral

      ? "Update Referral"

      : "Save Referral"

  }

</button>

        <button
          className="close-btn"
          onClick={() =>
            setShowModal(false)
          }
        >
          ✕
        </button>

      </div>

    </div>

  </div>

)}

{
  showHistoryModal && (

    <div className="modal-overlay">

      <div className="modal-content">

        <h2>
          Payment History
        </h2>

        <table>

          <thead>

            <tr>

              <th>Date</th>

              <th>Patient</th>

              <th>Amount</th>

            </tr>

          </thead>

          <tbody>

            {paymentHistory.map(
              (item) => (

                <tr key={item.id}>

                  <td>
                    {
                      new Date(
                        item.payment_date
                      ).toLocaleDateString()
                    }
                  </td>

                  <td>
                    {
                      item.patient_name
                    }
                  </td>

                  <td>
                    ₦
                    {
                      Number(
                        item.amount_paid
                      ).toLocaleString()
                    }
                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

        <button
          onClick={() =>
            setShowHistoryModal(
              false
            )
          }
        >
          Close
        </button>

      </div>

    </div>

  )
}

  </div>

);

}