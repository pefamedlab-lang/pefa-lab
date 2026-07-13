import {
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "../supabase";

import "../styles/finance.css";

import * as XLSX
from "xlsx";

export default function IncomePortal() {

  const [
    records,
    setRecords,
  ] = useState([]);

  const [
    totalIncome,
    setTotalIncome,
  ] = useState(0);

const [
  cashIncome,
  setCashIncome,
] = useState(0);

const [
  transferIncome,
  setTransferIncome,
] = useState(0);

const [
  outstandingBalance,
  setOutstandingBalance,
] = useState(0);

const [
  paidPatients,
  setPaidPatients,
] = useState(0);

const [
  partPaidPatients,
  setPartPaidPatients,
] = useState(0);

const [
  unpaidPatients,
  setUnpaidPatients,
] = useState(0);

const [
  highestPayment,
  setHighestPayment,
] = useState(0);

const [
  averagePayment,
  setAveragePayment,
] = useState(0);

  const [
    search,
    setSearch,
  ] = useState("");

const [
  period,
  setPeriod,
] = useState("all");

const [
  paymentFilter,
  setPaymentFilter,
] = useState("all");

const [
  statusFilter,
  setStatusFilter,
] = useState("all");

const [
  currentPage,
  setCurrentPage,
] = useState(1);

const recordsPerPage =
  25;

const [
  selectedPatient,
  setSelectedPatient,
] = useState(null);

useEffect(() => {

  loadIncome();

}, [
  period,
  paymentFilter,
  statusFilter,
]);

const viewPatient =
  (patient) => {

    setSelectedPatient(
      patient
    );

  };

const exportToExcel =
  () => {

    const worksheet =
      XLSX.utils.json_to_sheet(

        filteredRecords.map(
          (item) => ({

            "Lab Number":
              item.lab_number,

            Patient:
              item.full_name,

            "Amount Paid":
              item.amount_paid,

            "Payment Method":
              item.payment_method,

            Balance:
              item.balance,

            Status:
              item.payment_status,

          })
        )

      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

      workbook,

      worksheet,

      "Income Report"

    );

    XLSX.writeFile(

      workbook,

      "Income_Report.xlsx"

    );

  };

  const loadIncome =
    async () => {

      const {
        data,
        error,
      } = await supabase

        .from("registrations")

     .select(`
  id,
  lab_number,
  full_name,
  total_amount,
  amount_paid,
  balance,
  payment_method,
  payment_status,
  created_at
`)

        .order(
          "id",
          {
            ascending: false,
          }
        );

      if (error) {

        console.error(
          error.message
        );

        return;

      }

     let filteredData =
  data || [];

const now =
  new Date();

if (
  period === "today"
) {

  filteredData =
    filteredData.filter(
      (item) =>

        new Date(
          item.created_at
        ).toDateString()

        ===

        now.toDateString()
    );

}

if (
  period === "week"
) {

  const weekAgo =
    new Date();

  weekAgo.setDate(
    now.getDate() - 7
  );

  filteredData =
    filteredData.filter(
      (item) =>

        new Date(
          item.created_at
        ) >= weekAgo
    );

}

if (
  period === "month"
) {

  filteredData =
    filteredData.filter(
      (item) => {

        const date =
          new Date(
            item.created_at
          );

        return (

          date.getMonth()

          ===

          now.getMonth()

          &&

          date.getFullYear()

          ===

          now.getFullYear()

        );

      }
    );

}

if (
  period === "year"
) {

  filteredData =
    filteredData.filter(
      (item) =>

        new Date(
          item.created_at
        ).getFullYear()

        ===

        now.getFullYear()
    );

}

if (
  paymentFilter !==
  "all"
) {

  filteredData =
    filteredData.filter(
      (item) =>

        item.payment_method

        ===

        paymentFilter
    );

}


if (
  statusFilter ===
  "paid"
) {

  filteredData =
    filteredData.filter(
      (item) =>

        Number(
          item.balance || 0
        ) <= 0
    );

}

if (
  statusFilter ===
  "part"
) {

  filteredData =
    filteredData.filter(
      (item) =>

        Number(
          item.amount_paid || 0
        ) > 0

        &&

        Number(
          item.balance || 0
        ) > 0
    );

}

if (
  statusFilter ===
  "unpaid"
) {

  filteredData =
    filteredData.filter(
      (item) =>

        Number(
          item.amount_paid || 0
        ) === 0
    );

}

if (
  statusFilter ===
  "outstanding"
) {

  filteredData =
    filteredData.filter(
      (item) =>

        Number(
          item.balance || 0
        ) > 0
    );

}

setRecords(
  filteredData
);

let total = 0;

let cash = 0;

let transfer = 0;

let outstanding = 0;

      filteredData?.forEach(
  (item) => {

    total +=
      Number(
        item.amount_paid || 0
      );

const amountPaid =
  Number(
    item.amount_paid || 0
  );

const balance =
  Number(
    item.balance || 0
  );

if (
  amountPaid > highest
) {

  highest =
    amountPaid;

}

if (
  amountPaid === 0
) {

  unpaidCount++;

}

else if (
  balance > 0
) {

  partPaidCount++;

}

else {

  paidCount++;

}

    outstanding +=
      Number(
        item.balance || 0
      );

    if (
      item.payment_method ===
      "Cash"
    ) {

      cash +=
        Number(
          item.amount_paid || 0
        );

    }

    if (
      item.payment_method ===
      "Transfer"
    ) {

      transfer +=
        Number(
          item.amount_paid || 0
        );

    }

  }
);

      setTotalIncome(
        total
      );

setCashIncome(
  cash
);

setTransferIncome(
  transfer
);

setOutstandingBalance(
  outstanding
);

setPaidPatients(
  paidCount
);

setPartPaidPatients(
  partPaidCount
);

setUnpaidPatients(
  unpaidCount
);

setHighestPayment(
  highest
);

setAveragePayment(

  filteredData.length

  ?

  total /
    filteredData.length

  :

  0

);

    };

  const filteredRecords =

    records.filter(
      (item) =>

        item.full_name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )

        ||

        item.lab_number
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )

    );

const lastIndex =
  currentPage *
  recordsPerPage;

const firstIndex =
  lastIndex -
  recordsPerPage;

const paginatedRecords =
  filteredRecords.slice(
    firstIndex,
    lastIndex
  );

const totalPages =
  Math.ceil(

    filteredRecords.length /

    recordsPerPage

  );

  return (

    <div className="page">

      <h1>
        Income Portal
      </h1>

<div className="income-summary-bar">

  <span>

    Income:

    {" "}

    ₦

    {totalIncome.toLocaleString()}

  </span>

  <span>

    Outstanding:

    {" "}

    ₦

    {outstandingBalance.toLocaleString()}

  </span>

  <span>

    Paid:

    {" "}

    {paidPatients}

  </span>

  <span>

    Part Paid:

    {" "}

    {partPaidPatients}

  </span>

  <span>

    Unpaid:

    {" "}

    {unpaidPatients}

  </span>

</div>

      <div className="finance-summary">

        <div className="finance-card">

          <h3>
            Total Income
          </h3>

          <p>

            ₦

            {totalIncome.toLocaleString()}

          </p>

        </div>

<div className="finance-card">

  <h3>
    Cash Payments
  </h3>

  <p>

    ₦

    {cashIncome.toLocaleString()}

  </p>

</div>

<div className="finance-card">

  <h3>
    Transfer Payments
  </h3>

  <p>

    ₦

    {transferIncome.toLocaleString()}

  </p>

</div>

<div
  className="finance-card"
onChange={(e) => {

  setCurrentPage(1);

  setStatusFilter(
      "outstanding"

  );

}}

>
  <h3>
    Outstanding Balance
  </h3>

  <p>

    ₦

    {outstandingBalance.toLocaleString()}

  </p>

</div>

<div
  className="finance-card"
  onClick={() =>
    setStatusFilter(
      "part"
    )
  }
>

  <h3>
    Paid Patients
  </h3>

  <p>
    {paidPatients}
  </p>

</div>

<div className="finance-card">

  <h3>
    Part Payment
  </h3>

  <p>
    {partPaidPatients}
  </p>

</div>

<div
  className="finance-card"
  onClick={() =>
    setStatusFilter(
      "unpaid"
    )
  }
>

  <h3>
    Unpaid Patients
  </h3>

  <p>
    {unpaidPatients}
  </p>

</div>

<div className="finance-card">

  <h3>
    Highest Payment
  </h3>

  <p>

    ₦

    {highestPayment.toLocaleString()}

  </p>

</div>

<div className="finance-card">

  <h3>
    Average Payment
  </h3>

  <p>

    ₦

    {Math.round(
      averagePayment
    ).toLocaleString()}

  </p>

</div>

      </div>

<select
  className="search-box"
  value={period}
  onChange={(e) => {

  setCurrentPage(1);

  setPeriod(
    e.target.value
  );

}}
>

  <option value="all">
    All Time
  </option>

  <option value="today">
    Today
  </option>

  <option value="week">
    This Week
  </option>

  <option value="month">
    This Month
  </option>

  <option value="year">
    This Year
  </option>

</select>

<select
  className="search-box"
  value={paymentFilter}
onChange={(e) => {

  setCurrentPage(1);

  setPaymentFilter(
      e.target.value

  );

}}

>

  <option value="all">
    All Payments
  </option>

  <option value="Cash">
    Cash
  </option>

  <option value="Transfer">
    Transfer
  </option>

</select>



<button
  className="print-btn"
  onClick={() =>
    window.print()
  }
>

  Print Report

</button>

<button
  className="export-btn"
  onClick={() => {

    console.log(
      "EXPORT CLICKED"
    );

    exportToExcel();

  }}
>
  Export Excel
</button>

      <input
        type="text"
        className="search-box"
        placeholder="Search Patient or Lab Number..."
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
      />

      <table className="finance-table">

        <thead>

<tr>

  <th>
    Lab No
  </th>

  <th>
    Patient Name
  </th>

  <th>
    Amount Paid
  </th>

  <th>
    Payment Method
  </th>

  <th>
    Action
  </th>

</tr>

        </thead>

        <tbody>

          {filteredRecords.length >

          0 ? (

            paginatedRecords.map(
              (item) => (

                <tr
                  key={item.id}
                >

                  <td>
                    {
                      item.lab_number
                    }
                  </td>

                  <td>
                    {
                      item.full_name
                    }
                  </td>

                  <td>

                    ₦

                    {Number(
                      item.amount_paid || 0
                    ).toLocaleString()}

                  </td>

                  <td>
                    {
                      item.payment_method
                    }
                  </td>

<td>

  <button
  className="view-btn"
  onClick={() =>
    viewPatient(item)
  }
>
  View
</button>

</td>

                </tr>

              )
            )

          ) : (

            <tr>

              <td
                colSpan="4"
                style={{
                  textAlign:
                    "center",
                }}
              >

                No records found

              </td>

            </tr>

          )}

        </tbody>

      </table>

<div
  className="pagination"
>

  <button
    disabled={
      currentPage === 1
    }
    onClick={() =>
      setCurrentPage(

        currentPage - 1

      )
    }
  >

    Previous

  </button>

  <span>

    Page

    {" "}

    {currentPage}

    {" "}

    of

    {" "}

    {totalPages || 1}

  </span>

  <button
    disabled={
      currentPage ===
      totalPages
    }
    onClick={() =>
      setCurrentPage(

        currentPage + 1

      )
    }
  >

    Next

  </button>

</div>

{
  selectedPatient && (

    <div className="modal-overlay">

      <div className="modal">

        <h2>
          Payment Details
        </h2>

        <p>

          <strong>
            Lab No:
          </strong>

          {" "}

          {
            selectedPatient.lab_number
          }

        </p>

        <p>

          <strong>
            Patient:
          </strong>

          {" "}

          {
            selectedPatient.full_name
          }

        </p>

        <p>

          <strong>
            Amount Paid:
          </strong>

          {" "}

          ₦

          {Number(
            selectedPatient.amount_paid || 0
          ).toLocaleString()}

        </p>

<p>

  <strong>
    Total Amount:
  </strong>

  {" "}

  ₦

  {Number(
    selectedPatient.total_amount || 0
  ).toLocaleString()}

</p>

<p>

  <strong>
    Balance:
  </strong>

  {" "}

  ₦

  {Number(
    selectedPatient.balance || 0
  ).toLocaleString()}

</p>

        <p>

          <strong>
            Payment Method:
          </strong>

          {" "}

          {
            selectedPatient.payment_method
          }

        </p>

<p>

  <strong>
    Status:
  </strong>

  {" "}

  {
    selectedPatient.payment_status ||
    "Unknown"
  }

</p>

        <button
          onClick={() =>
            setSelectedPatient(
              null
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