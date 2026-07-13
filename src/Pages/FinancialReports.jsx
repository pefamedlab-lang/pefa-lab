import {
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "../supabase";

import "../styles/finance.css";

export default function FinancialReports() {

  const [
    period,
    setPeriod,
  ] = useState("all");

  const [
    report,
    setReport,
  ] = useState({

    income: 0,

    expenses: 0,

    profit: 0,

    outstanding: 0,

  });

  useEffect(() => {

    loadReport();

  }, [period]);

  const loadReport =
    async () => {

      const {
        data: registrations,
      } = await supabase

        .from("registrations")

        .select(
          "amount_paid,balance"
        );

      const {
        data: expensesData,
      } = await supabase

        .from("expenses")

        .select(
          "amount"
        );

      let income = 0;

      let outstanding = 0;

      let expenses = 0;

      registrations?.forEach(
        (item) => {

          income +=
            Number(
              item.amount_paid || 0
            );

          outstanding +=
            Number(
              item.balance || 0
            );

        }
      );

      expensesData?.forEach(
        (item) => {

          expenses +=
            Number(
              item.amount || 0
            );

        }
      );

      setReport({

        income,

        expenses,

        outstanding,

        profit:
          income -
          expenses,

      });

    };

  return (

    <div className="page">

      <h1>
        Financial Reports
      </h1>

      <select
        value={period}
        onChange={(e) =>
          setPeriod(
            e.target.value
          )
        }
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

      <div className="finance-summary">

        <div className="finance-card">

          <h3>
            Income
          </h3>

          <p>
            ₦{report.income.toLocaleString()}
          </p>

        </div>

        <div className="finance-card">

          <h3>
            Expenses
          </h3>

          <p>
            ₦{report.expenses.toLocaleString()}
          </p>

        </div>

        <div className="finance-card">

          <h3>
            Profit
          </h3>

          <p>
            ₦{report.profit.toLocaleString()}
          </p>

        </div>

        <div className="finance-card">

          <h3>
            Outstanding
          </h3>

          <p>
            ₦{report.outstanding.toLocaleString()}
          </p>

        </div>

      </div>

    </div>

  );

}