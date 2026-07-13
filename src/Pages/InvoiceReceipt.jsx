import "../styles/dashboard.css";

import {
  useState,
} from "react";

import { supabase } from "../supabase";

import {
  Search,
  Printer,
  Save,
  Receipt,
} from "lucide-react";

export default function InvoiceReceipt() {
  // STATES

  const [labNumber,
    setLabNumber] =
    useState("");

  const [patient,
    setPatient] =
    useState(null);

  const [amountPaid,
    setAmountPaid] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  // FETCH PATIENT

  const fetchPatient =
    async () => {
      if (!labNumber)
        return;

      setLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from("patients")
        .select("*")
        .eq(
          "lab_number",
          labNumber
        )
        .single();

      setLoading(false);

      if (error) {
        alert(
          "Patient not found"
        );

        return;
      }

      setPatient(data);

      setAmountPaid(
        data.amount_paid ||
          ""
      );
    };

  // CALCULATE TOTAL

  const totalAmount =
    patient?.tests
      ? patient.tests
          .split(",")
          .length * 3000
      : 0;

  const balance =
    totalAmount -
    Number(
      amountPaid || 0
    );

  // SAVE PAYMENT

  const savePayment =
    async () => {
      if (!patient) {
        alert(
          "Load patient first"
        );

        return;
      }

      const paymentStatus =
        balance <= 0
          ? "Paid"
          : "Part Payment";

      const {
        error,
      } = await supabase
        .from("patients")
        .update({
          amount_paid:
            amountPaid,

          balance,

          payment_status:
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

      // AUDIT LOG

      await supabase
        .from(
          "audit_logs"
        )
        .insert([
          {
            user_name:
              "Billing",

            action:
              "Invoice Payment Updated",

            department:
              "Billing",
          },
        ]);

      alert(
        "Payment Saved Successfully"
      );
    };

  return (
    <div className="dashboard-page">
      {/* HEADER */}

      <div className="dashboard-header">
        <div>
          <h1>
            PEFA MEDICAL
            DIAGNOSTIC
            SERVICES
          </h1>

          <p>
            Smart Billing
            & Invoice
            System
          </p>
        </div>
      </div>

      {/* SEARCH */}

      <div className="welcome-card">
        <h2>
          Search Patient
        </h2>

        <div
          style={{
            display: "flex",
            gap: "15px",
            marginTop:
              "20px",
          }}
        >
          <input
            type="text"
            placeholder="Enter Lab Number"
            value={
              labNumber
            }
            onChange={(e) =>
              setLabNumber(
                e.target.value
              )
            }
          />

          <button
            className="logout-btn"
            onClick={
              fetchPatient
            }
          >
            <Search
              size={18}
            />

            Search
          </button>
        </div>
      </div>

      {/* LOADING */}

      {loading && (
        <div className="welcome-card">
          Loading patient
          invoice...
        </div>
      )}

      {/* INVOICE */}

      {patient && (
        <>
          <div className="welcome-card">
            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "10px",
                marginBottom:
                  "20px",
              }}
            >
              <Receipt
                size={28}
              />

              <h2>
                Patient
                Invoice
              </h2>
            </div>

            {/* DETAILS */}

            <div className="dashboard-grid">
              <div>
                <strong>
                  Full Name
                </strong>

                <br />

                {
                  patient.full_name
                }
              </div>

              <div>
                <strong>
                  Lab Number
                </strong>

                <br />

                {
                  patient.lab_number
                }
              </div>

              <div>
                <strong>
                  Phone
                </strong>

                <br />

                {
                  patient.phone
                }
              </div>

              <div>
                <strong>
                  Request Date
                </strong>

                <br />

                {
                  patient.request_date
                }
              </div>
            </div>

            {/* TESTS */}

            <div
              style={{
                marginTop:
                  "30px",
              }}
            >
              <h3>
                Requested
                Tests
              </h3>

              <table className="hema-table">
                <thead>
                  <tr>
                    <th>
                      Test
                    </th>

                    <th>
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {patient.tests
                    ?.split(",")
                    .map(
                      (
                        test,
                        index
                      ) => (
                        <tr
                          key={index}
                        >
                          <td>
                            {
                              test
                            }
                          </td>

                          <td>
                            ₦3,000
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>

            {/* TOTAL */}

            <div
              style={{
                marginTop:
                  "30px",
              }}
            >
              <h3>
                TOTAL:
                ₦
                {
                  totalAmount
                }
              </h3>

              <div
                style={{
                  marginTop:
                    "20px",
                }}
              >
                <label>
                  Amount
                  Paid
                </label>

                <input
                  type="number"
                  value={
                    amountPaid
                  }
                  onChange={(e) =>
                    setAmountPaid(
                      e.target
                        .value
                    )
                  }
                />
              </div>

              <div
                style={{
                  marginTop:
                    "20px",
                }}
              >
                <h3>
                  Balance:
                  ₦
                  {balance}
                </h3>

                <h3>
                  Status:
                  {balance <=
                  0
                    ? " Paid"
                    : " Part Payment"}
                </h3>
              </div>
            </div>

            {/* BUTTONS */}

            <div
              className="hema-buttons"
            >
              <button
                className="save-btn"
                onClick={
                  savePayment
                }
              >
                <Save
                  size={18}
                />

                Save Payment
              </button>

              <button
                className="print-btn"
                onClick={() =>
                  window.print()
                }
              >
                <Printer
                  size={18}
                />

                Print Invoice
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}