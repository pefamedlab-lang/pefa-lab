import {
  useEffect,
  useState,
} from "react";

import {
  Search,
  Wallet,
} from "lucide-react";

import "../styles/billing.css";

import {
  supabase,
} from "../supabase";

export default function BillingDashboard() {
  /* =========================
     STATES
  ========================= */

  const [
    bills,
    setBills,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    paymentAmount,
    setPaymentAmount,
  ] = useState({});

  /* =========================
     USER
  ========================= */

  const currentUser =
    JSON.parse(
      localStorage.getItem(
        "pefa_user"
      )
    );

  /* =========================
     LOAD BILLS
  ========================= */

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills =
    async () => {
      try {
        const {
          data,
        } = await supabase
          .from("billing")
          .select("*")
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

        setBills(
          data || []
        );
      } catch (error) {
        console.log(
          error
        );
      }
    };

  /* =========================
     FILTER
  ========================= */

  const filteredBills =
    bills.filter(
      (bill) =>
        bill.patient_name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        bill.lab_number
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  /* =========================
     PROCESS PAYMENT
  ========================= */

  const processPayment =
    async (bill) => {
      try {
        const payment =
          Number(
            paymentAmount[
              bill.id
            ] || 0
          );

        if (
          payment <= 0
        ) {
          alert(
            "Enter payment amount"
          );

          return;
        }

        const newPaid =
          Number(
            bill.amount_paid
          ) + payment;

        const newBalance =
          Number(
            bill.total_amount
          ) - newPaid;

        const status =
          newBalance <= 0
            ? "Paid"
            : "Part Payment";

        const {
          error,
        } = await supabase
          .from("billing")
          .update({
            amount_paid:
              newPaid,

            balance:
              newBalance,

            payment_status:
              status,

            received_by:
              currentUser?.full_name,
          })
          .eq(
            "id",
            bill.id
          );

        if (error) {
          console.log(
            error
          );

          alert(
            "Payment failed"
          );

          return;
        }

        alert(
          "Payment successful"
        );

        loadBills();
      } catch (error) {
        console.log(
          error
        );
      }
    };

  return (
    <div className="billing-page">
      {/* HEADER */}

      <div className="billing-header">
        <h1>
          Billing
          Dashboard
        </h1>

        <p>
          Enterprise
          Payment Workflow
        </p>
      </div>

      {/* SEARCH */}

      <div className="billing-search">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search Patient or Lab Number"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />
      </div>

      {/* TABLE */}

      <div className="billing-table">
        <table>
          <thead>
            <tr>
              <th>
                Patient
              </th>

              <th>
                Lab Number
              </th>

              <th>
                Total
              </th>

              <th>
                Paid
              </th>

              <th>
                Balance
              </th>

              <th>
                Status
              </th>

              <th>
                Payment
              </th>

              <th>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredBills.map(
              (bill) => (
                <tr
                  key={bill.id}
                >
                  <td>
                    {
                      bill.patient_name
                    }
                  </td>

                  <td>
                    {
                      bill.lab_number
                    }
                  </td>

                  <td>
                    ₦
                    {Number(
                      bill.total_amount
                    ).toLocaleString()}
                  </td>

                  <td>
                    ₦
                    {Number(
                      bill.amount_paid
                    ).toLocaleString()}
                  </td>

                  <td>
                    ₦
                    {Number(
                      bill.balance
                    ).toLocaleString()}
                  </td>

                  <td>
                    <span
                      className={`billing-status ${
                        bill.payment_status ===
                        "Paid"
                          ? "paid-status"
                          : "unpaid-status"
                      }`}
                    >
                      {
                        bill.payment_status
                      }
                    </span>
                  </td>

                  <td>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={
                        paymentAmount[
                          bill.id
                        ] || ""
                      }
                      onChange={(
                        e
                      ) =>
                        setPaymentAmount(
                          {
                            ...paymentAmount,

                            [bill.id]:
                              e
                                .target
                                .value,
                          }
                        )
                      }
                    />
                  </td>

                  <td>
                    <button
                      className="pay-btn"
                      onClick={() =>
                        processPayment(
                          bill
                        )
                      }
                    >
                      <Wallet
                        size={16}
                      />

                      Pay
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}