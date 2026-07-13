import "../styles/paymentPortal.css";

import { useNavigate } from "react-router-dom";

import { useState } from "react";

import {
  Printer,
  BadgeCheck,
  Receipt,
  ArrowLeft,
} from "lucide-react";

import { supabase } from "../supabase";

export default function PaymentPortal() {

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const navigate =
    useNavigate();

  /* =====================================================
     PATIENT DATA
  ===================================================== */

  const patient =
    JSON.parse(
      localStorage.getItem(
        "current_invoice"
      )
    );

  /* =====================================================
     CURRENT USER
  ===================================================== */

  const currentUser =
    JSON.parse(
      localStorage.getItem(
        "pefa_user"
      )
    );

  /* =====================================================
     STATES
  ===================================================== */

  const [
    loading,
    setLoading,
  ] = useState(false);

const [
  amountPaid,
  setAmountPaid,
] = useState("");

const [
  paymentMethod,
  setPaymentMethod,
] = useState("Cash");
  /* =====================================================
     EMPTY STATE
  ===================================================== */

  if (!patient) {

    return (

      <div className="payment-empty">

        <h2>
          No Invoice Found
        </h2>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/registration"
            )
          }
        >

          <ArrowLeft size={18} />

          Back to Registration

        </button>

      </div>
    );
  }

  /* =====================================================
     NUMBER TO WORDS
  ===================================================== */

  const numberToWords =
    (num) => {

      const ones = [

        "", "One", "Two",
        "Three", "Four",
        "Five", "Six",
        "Seven", "Eight",
        "Nine", "Ten",
        "Eleven", "Twelve",
        "Thirteen", "Fourteen",
        "Fifteen", "Sixteen",
        "Seventeen", "Eighteen",
        "Nineteen",
      ];

      const tens = [

        "", "", "Twenty",
        "Thirty", "Forty",
        "Fifty", "Sixty",
        "Seventy", "Eighty",
        "Ninety",
      ];

      const convert =
        (n) => {

          if (n < 20)
            return ones[n];

          if (n < 100)
            return (

              tens[
                Math.floor(
                  n / 10
                )
              ] +

              (
                n % 10
                  ? " " +
                    ones[
                      n % 10
                    ]
                  : ""
              )
            );

          if (n < 1000)
            return (

              ones[
                Math.floor(
                  n / 100
                )
              ] +

              " Hundred " +

              (
                n % 100
                  ? convert(
                      n % 100
                    )
                  : ""
              )
            );

          if (n < 1000000)
            return (

              convert(
                Math.floor(
                  n / 1000
                )
              ) +

              " Thousand " +

              (
                n % 1000
                  ? convert(
                      n % 1000
                    )
                  : ""
              )
            );

          return (

            convert(
              Math.floor(
                n / 1000000
              )
            ) +

            " Million " +

            (
              n % 1000000
                ? convert(
                    n % 1000000
                  )
                : ""
            )
          );
        };

      return (
        convert(num) +
        " Naira Only"
      );
    };

  /* =====================================================
     PRINT DOCUMENT
  ===================================================== */

  const printDocument =
    async () => {

      try {

        await supabase

          .from(
            "receipt_logs"
          )

          .insert([{

            patient_name:
              patient.full_name,

            lab_number:
              patient.lab_number,

            amount:
              patient.total_amount,

            payment_method:
              patient.payment_type,

            created_at:
              new Date(),
          }]);

      } catch (error) {

        console.log(
          error
        );
      }

      const invoiceElement =
  document.getElementById(
    "invoice-print-area"
  );

const actionButtons =
  invoiceElement.querySelector(
    ".payment-actions"
  );

if (actionButtons) {
  actionButtons.style.display =
    "none";
}

const printContents =
  invoiceElement.innerHTML;

if (actionButtons) {
  actionButtons.style.display =
    "flex";
}

      const printWindow =
        window.open(
          "",
          "",
          "width=900,height=700"
        );

      printWindow.document.write(`

        <html>

          <head>

            <title>
              PEFA Invoice
            </title>

            <style>

              body{
                font-family:Arial,sans-serif;
                padding:16px;
                color:#111827;
                font-size:13px;
              }

              h1,h2,h3,h4,p{
                margin:0;
              }

              .invoice-top{
                display:flex;
                justify-content:space-between;
                align-items:flex-start;

                gap:20px;

                margin-bottom:14px;

                padding-bottom:10px;

                border-bottom:1px solid #ddd;
              }

              .invoice-top h2{
                font-size:20px;
                margin-bottom:2px;
              }

              .invoice-top p{
                font-size:12px;
                color:#666;
              }

              .paid-badge{
                border:1px solid #ddd;
                padding:5px 10px;
                border-radius:20px;
                font-size:11px;
                font-weight:bold;
              }

              .receipt-patient-grid{
                display:grid;
                grid-template-columns:1fr 1fr;

                gap:12px;

                margin-bottom:14px;
              }

              .receipt-column{
                display:flex;
                flex-direction:column;
                gap:6px;
              }

              .receipt-item{
                display:flex;
                justify-content:space-between;
                align-items:center;

                gap:10px;

                border:1px solid #ddd;
                border-radius:6px;

                padding:7px 10px;

                background:#fafafa;
              }

              .receipt-item strong{
                font-size:12px;
                color:#444;
              }

              .receipt-item span{
                font-size:12px;
                font-weight:600;
                text-align:right;
              }

              .invoice-tests{
                border:1px solid #ddd;
                border-radius:8px;
                overflow:hidden;
                margin-top:12px;
              }

              .invoice-table-header,
              .invoice-row{
                display:flex;
                justify-content:space-between;
                align-items:center;

                padding:9px 12px;

                border-bottom:1px solid #eee;
              }

              .invoice-table-header{
                background:#111827;
                color:white;
                font-weight:bold;
                font-size:12px;
              }

              .invoice-row{
                font-size:12px;
              }

              .invoice-total{
                margin-top:12px;

                background:#111827;
                color:white;

                border-radius:8px;

                padding:14px;

                text-align:center;
              }

              .invoice-total h3{
                font-size:12px;
                margin-bottom:5px;
              }

              .invoice-total h1{
                font-size:24px;
              }

              .amount-words{
                margin-top:12px;

                border:1px solid #ddd;

                border-radius:8px;

                padding:10px;
              }

              .words-row{
                display:flex;
                justify-content:space-between;

                gap:14px;

                padding:5px 0;

                border-bottom:1px dashed #ddd;
              }

              .words-row:last-child{
                border-bottom:none;
              }

              .words-row strong{
                font-size:12px;
              }

              .words-row span{
                font-size:12px;
                font-weight:600;
                text-align:right;
              }

              .invoice-note{
                margin-top:12px;

                text-align:center;

                font-size:11px;

                line-height:1.5;
              }

            </style>

          </head>

          <body>

            ${printContents}

          </body>

        </html>

      `);

      printWindow.document.close();

      printWindow.focus();

      printWindow.print();

      printWindow.close();
    };

  /* =====================================================
     MARK AS PAID
  ===================================================== */
const markAsPaid =
  async () => {

    try {

      setLoading(true);

      const totalAmount =

        Number(
          patient.total_amount || 0
        );

      const paidAmount =

        Number(
          amountPaid || 0
        );

const previousPaid =

  Number(
    patient.amount_paid || 0
  );

const newTotalPaid =

  previousPaid +
  paidAmount;

      if (
        paidAmount <= 0
      ) {

        alert(
          "Enter Amount Paid"
        );

        return;

      }

      const balance =

  totalAmount -
  newTotalPaid;

      const paymentStatus =

        balance <= 0

          ? "Paid"

          : "Part Payment";

      const {
        error,
      } = await supabase

        .from(
          "registrations"
        )

        .update({

  amount_paid:
    newTotalPaid,

  balance,

  payment_method:
    paymentMethod,

  payment_date:
    new Date(),

  received_by:
    currentUser?.full_name ||
    currentUser?.name ||
    "System User",

  payment_status:
    paymentStatus,

  status:
    paymentStatus,

})

        .eq(
          "lab_number",
          patient.lab_number
        );

      if (error) {

        alert(
          error.message
        );

        return;

      }

await supabase

  .from(
    "payment_transactions"
  )

  .insert([{

    lab_number:
      patient.lab_number,

    patient_name:
      patient.full_name,

    amount:
      paidAmount,

    payment_method:
      paymentMethod,

    received_by:

      currentUser?.full_name ||

      currentUser?.name ||

      "System User",

  }]);

      alert(
        `Payment Saved. Balance: ₦${balance.toLocaleString()}`
      );

const updatedPatient = {

  ...patient,

  amount_paid:
    newTotalPaid,

  balance,

  payment_method:
    paymentMethod,

  payment_status:
    paymentStatus,

  payment_date:
    new Date(),

  received_by:

    currentUser?.full_name ||

    currentUser?.name,

};

localStorage.setItem(

  "current_invoice",

  JSON.stringify(
    updatedPatient
  )

);

    } catch (error) {

      console.log(
        error
      );

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="dashboard-layout">

      <div className="dashboard-content">

        <div className="payment-header">

          <h1>
            Payment Portal
          </h1>

          <p>
            Enterprise Invoice & Receipt System
          </p>

        </div>

        <div
          className="invoice-card"
          id="invoice-print-area"
        >

          {/* TOP */}

          <div className="invoice-top">

            <div>

              <h2>
                PEFA MEDICAL
                DIAGNOSTIC SERVICES
              </h2>

              <p>
                Laboratory Invoice / Receipt
              </p>

            </div>

            <div className="paid-badge">

              {

  patient.balance > 0

    ? `BALANCE ₦${Number(
        patient.balance
      ).toLocaleString()}`

    : "FULLY PAID"

}

            </div>

          </div>

          {/* PATIENT GRID */}

          <div className="receipt-patient-grid">

            {/* LEFT */}

            <div className="receipt-column">

              <div className="receipt-item">
                <strong>Patient:</strong>
                <span>
                  {patient.full_name}
                </span>
              </div>

              <div className="receipt-item">
                <strong>Lab No:</strong>
                <span>
                  {patient.lab_number}
                </span>
              </div>

              <div className="receipt-item">
                <strong>Sex:</strong>
                <span>
                  {patient.sex}
                </span>
              </div>

              <div className="receipt-item">
                <strong>Age:</strong>
                <span>
                  {patient.age}
                </span>
              </div>

              <div className="receipt-item">
                <strong>Phone:</strong>
                <span>
                  {
                    patient.phone ||
                    "N/A"
                  }
                </span>
              </div>

            </div>

            {/* RIGHT */}

         <div className="receipt-column">

  <div className="receipt-item">
    <strong>Branch:</strong>
    <span>
      {patient.branch}
    </span>
  </div>

  <div className="receipt-item">
    <strong>Access:</strong>
    <span>
      {patient.access_code}
    </span>
  </div>

  <div className="receipt-item">
    <strong>Doctor:</strong>
    <span>
      {
        patient.referring_doctor ||
        "N/A"
      }
    </span>
  </div>

  <div className="receipt-item">
    <strong>Date:</strong>
    <span>
      {
        new Date()
          .toLocaleDateString()
      }
    </span>
  </div>

  <div className="receipt-item">
    <strong>Status:</strong>
    <span>
      {
        patient.payment_status ||
        "Pending"
      }
    </span>
  </div>

</div>  

          </div>

          {/* TESTS */}

          <div className="invoice-tests">

            <div className="invoice-table-header">

  <span>
    Investigation
  </span>

  <span>
    Department
  </span>

  <span>
    Amount
  </span>

</div>

            {
              patient.tests?.map(
                (
                  test,
                  index
                ) => (

                 <div
  key={index}
  className="invoice-row"
>

  <span>
    {test.test_name}
  </span>

  <span>
    {
      test.department ||
      "-"
    }
  </span>

  <span>

    ₦

    {

      Number(
        test.selected_price || 0
      ).toLocaleString()

    }

  </span>

</div>
                )
              )
            }

          </div>

          {/* TOTAL */}

<div className="invoice-row">

  <strong>
    TOTAL AMOUNT
  </strong>

  <span>
  </span>

  <strong>

    ₦

    {

      Number(
        patient.total_amount || 0
      ).toLocaleString()

    }

  </strong>

</div>
         {/* AMOUNT WORDS */}

<div className="amount-words">

  <div className="words-row">

    <strong>
      Amount in Words:
    </strong>

    <span>

      {
        numberToWords(

  Number(
    patient.total_amount || 0
  )

)
}

    </span>

  </div>

</div>

<div className="payment-entry">

  <input
    type="number"
    placeholder="Amount Paid"
    value={amountPaid}
    onChange={(e)=>
      setAmountPaid(
        e.target.value
      )
    }
  />

  <select
    value={paymentMethod}
    onChange={(e)=>
      setPaymentMethod(
        e.target.value
      )
    }
  >

    <option>
      Cash
    </option>

    <option>
      Transfer
    </option>

    <option>
      POS
    </option>

  </select>

</div>

{/* PAYMENT SUMMARY */}

<div className="payment-summary">

  <div className="words-row">

    <strong>
      Amount Paid:
    </strong>

    <span>

      ₦

      {

        Number(
          patient.amount_paid || 0
        ).toLocaleString()

      }

    </span>

  </div>

  <div className="words-row">

    <strong>
      Balance:
    </strong>

    <span>

      ₦

      {

        Number(
          patient.balance || 0
        ).toLocaleString()

      }

    </span>

  </div>

  <div className="words-row">

    <strong>
      Method:
    </strong>

    <span>

      {

        patient.payment_method ||

        "-"

      }

    </span>

  </div>

  <div className="words-row">

    <strong>
      Collected By:
    </strong>

    <span>

<div className="words-row">

  <strong>
    Payment Date:
  </strong>

  <span>

    {

      patient.payment_date

        ? new Date(
            patient.payment_date
          ).toLocaleString()

        : "-"

    }

  </span>

</div>

      {

        patient.received_by ||

        "-"

      }

    </span>

  </div>

</div>

          {/* NOTE */}

<div className="invoice-note">

  <p>

    <strong>
      NOTE:
    </strong>

    {" "}

    Money paid for Blood &
    processed test is not refundable.

  </p>

  <p>
    Thanks for your trust in us.
  </p>

</div>

         {/* ACTIONS */}



<div className="payment-actions no-print">

  <button
    type="button"
    className="print-btn"
    onClick={
      printDocument
    }
  >

    <Printer size={18} />

    Print Invoice

  </button>

  <button
    type="button"
    className="pay-btn"
    onClick={
      markAsPaid
    }
  >

    <BadgeCheck size={18} />

    {
      loading
        ? "Processing..."
        : "Mark as Paid"
    }

  </button>

  <button
    type="button"
    className="receipt-btn"
    onClick={
      printDocument
    }
  >

    <Receipt size={18} />

    Print Receipt

  </button>

</div>

        </div>

      </div>

    </div>
  );
}