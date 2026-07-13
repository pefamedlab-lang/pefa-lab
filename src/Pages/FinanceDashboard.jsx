import {
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "../supabase";

import "../styles/finance.css";

export default function FinanceDashboard() {

  const [
    records,
    setRecords,
  ] = useState([]);

  const [
    expenses,
    setExpenses,
  ] = useState(0);

  const [
    netProfit,
    setNetProfit,
  ] = useState(0);

  const [
    stats,
    setStats,
  ] = useState({

    revenue: 0,

    outstanding: 0,

    paid: 0,

    unpaid: 0,

    cash: 0,

    transfer: 0,

  });

  useEffect(() => {

    loadFinance();

  }, []);

  const loadFinance =
    async () => {

      /* ==========================
         INCOME
      ========================== */

      const {
        data: incomeData,
      } = await supabase

        .from("registrations")

        .select(
          "id, lab_number, full_name, amount_paid, balance, payment_method"
        );

      let revenue = 0;

      let outstanding = 0;

      let paid = 0;

      let unpaid = 0;

      let cash = 0;

      let transfer = 0;

      incomeData?.forEach(
        (item) => {

          revenue +=
            Number(
              item.amount_paid || 0
            );

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

          if (
            Number(
              item.balance || 0
            ) <= 0
          ) {

            paid++;

          } else {

            unpaid++;

          }

        }
      );

      /* ==========================
         EXPENSES
      ========================== */

      const {
        data: expenseData,
      } = await supabase

        .from("expenses")

        .select("amount");

      let totalExpenses = 0;

      expenseData?.forEach(
        (item) => {

          totalExpenses +=
            Number(
              item.amount || 0
            );

        }
      );

      const profit =
        revenue -
        totalExpenses;

      setExpenses(
        totalExpenses
      );

      setNetProfit(
        profit
      );

      setRecords(

        incomeData?.filter(
          (item) =>
            Number(
              item.balance || 0
            ) > 0
        ) || []

      );

      setStats({

        revenue,

        outstanding,

        paid,

        unpaid,

        cash,

        transfer,

      });

    };

  return (

    <div className="page">

      <h1>
        Finance Dashboard
      </h1>

      <div className="finance-summary">

        <div className="finance-card">

          <h3>
            Revenue
          </h3>

          <p>

            ₦

            {stats.revenue.toLocaleString()}

          </p>

        </div>

        <div className="finance-card">

          <h3>
            Total Expenses
          </h3>

          <p>

            ₦

            {expenses.toLocaleString()}

          </p>

        </div>

        <div className="finance-card">

          <h3>
            Net Profit
          </h3>

          <p>

            ₦

            {netProfit.toLocaleString()}

          </p>

        </div>

        <div className="finance-card">

          <h3>
            Cash Collections
          </h3>

          <p>

            ₦

            {stats.cash.toLocaleString()}

          </p>

        </div>

        <div className="finance-card">

          <h3>
            Transfer Collections
          </h3>

          <p>

            ₦

            {stats.transfer.toLocaleString()}

          </p>

        </div>

        <div className="finance-card">

          <h3>
            Outstanding
          </h3>

          <p>

            ₦

            {stats.outstanding.toLocaleString()}

          </p>

        </div>

        <div className="finance-card">

          <h3>
            Paid Results
          </h3>

          <p>

            {stats.paid}

          </p>

        </div>

        <div className="finance-card">

          <h3>
            Unpaid Results
          </h3>

          <p>

            {stats.unpaid}

          </p>

        </div>

      </div>

      <h2>
        Outstanding Accounts
      </h2>

      <table className="finance-table">

        <thead>

          <tr>

            <th>
              Lab No
            </th>

            <th>
              Patient
            </th>

            <th>
              Balance
            </th>

          </tr>

        </thead>

        <tbody>

          {records.map(
            (item) => (

              <tr
                key={item.id}
              >

                <td>
                  {item.lab_number}
                </td>

                <td>
                  {item.full_name}
                </td>

                <td>

                  ₦

                  {Number(
                    item.balance || 0
                  ).toLocaleString()}

                </td>

              </tr>

            )
          )}

        </tbody>

      </table>

    </div>

  );

}