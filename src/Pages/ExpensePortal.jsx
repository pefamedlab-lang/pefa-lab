import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "../styles/expensePortal.css";

export default function ExpensePortal() {

  const user =
    JSON.parse(
      localStorage.getItem("pefa_user")
    ) || {};

  const [form, setForm] = useState({

    expense_date:
      new Date()
        .toISOString()
        .split("T")[0],

    category: "",

    item_name: "",

    vendor: "",

    amount: "",

    description: "",

  });

  const [expenses, setExpenses] =
    useState([]);

  useEffect(() => {

    loadExpenses();

  }, []);

  const loadExpenses =
    async () => {

      const { data } =
        await supabase

          .from("expenses")

          .select("*")

          .order(
            "created_at",
            { ascending: false }
          );

      setExpenses(
        data || []
      );

    };

  const saveExpense =
    async (e) => {

      e.preventDefault();

      const { error } =
        await supabase

          .from("expenses")

          .insert([

            {

              ...form,

              amount:
                Number(
                  form.amount
                ),

              recorded_by:
                user.full_name ||

                user.username ||

                "Unknown",

            },

          ]);

      if (error) {

        alert(
          error.message
        );

        return;

      }

      alert(
        "Expense Saved Successfully"
      );

      setForm({

        expense_date:
          new Date()
            .toISOString()
            .split("T")[0],

        category: "",

        item_name: "",

        vendor: "",

        amount: "",

        description: "",

      });

      loadExpenses();

    };

  const deleteExpense =
    async (id) => {

      if (
        !window.confirm(
          "Delete this expense?"
        )
      )
        return;

      await supabase

        .from("expenses")

        .delete()

        .eq(
          "id",
          id
        );

      loadExpenses();

    };

  return (

    <div className="page">

      <h1>
        Expense Portal
      </h1>

      <form
        className="expense-form"
        onSubmit={saveExpense}
      >

        <input
          type="date"
          value={
            form.expense_date
          }
          onChange={(e) =>
            setForm({

              ...form,

              expense_date:
                e.target.value,

            })
          }
        />

        <select
          value={
            form.category
          }
          onChange={(e) =>
            setForm({

              ...form,

              category:
                e.target.value,

            })
          }
          required
        >

          <option value="">
            Select Category
          </option>

          <option>
            Reagents
          </option>

          <option>
            Consumables
          </option>

          <option>
            Equipment
          </option>

          <option>
            Fuel
          </option>

          <option>
            Utilities
          </option>

          <option>
            Salary
          </option>

          <option>
            Maintenance
          </option>

          <option>
            Transportation
          </option>

          <option>
            Internet
          </option>

          <option>
            Others
          </option>

        </select>

        <input
          placeholder="Item Name"
          value={
            form.item_name
          }
          onChange={(e) =>
            setForm({

              ...form,

              item_name:
                e.target.value,

            })
          }
          required
        />

        <input
          placeholder="Vendor"
          value={
            form.vendor
          }
          onChange={(e) =>
            setForm({

              ...form,

              vendor:
                e.target.value,

            })
          }
        />

        <input
          type="number"
          placeholder="Amount"
          value={
            form.amount
          }
          onChange={(e) =>
            setForm({

              ...form,

              amount:
                e.target.value,

            })
          }
          required
        />

        <textarea
          placeholder="Description"
          value={
            form.description
          }
          onChange={(e) =>
            setForm({

              ...form,

              description:
                e.target.value,

            })
          }
        />

        <button
          type="submit"
        >
          Save Expense
        </button>

      </form>

      <h2>
        Expense History
      </h2>

      <table className="expense-table">

        <thead>

          <tr>

            <th>Date</th>

            <th>Category</th>

            <th>Item</th>

            <th>Vendor</th>

            <th>Amount</th>

            <th>Recorded By</th>

            <th>Action</th>

          </tr>

        </thead>

        <tbody>

          {expenses.map(
            (item) => (

              <tr
                key={item.id}
              >

                <td>
                  {
                    item.expense_date
                  }
                </td>

                <td>
                  {
                    item.category
                  }
                </td>

                <td>
                  {
                    item.item_name
                  }
                </td>

                <td>
                  {
                    item.vendor
                  }
                </td>

                <td>

                  ₦

                  {Number(
                    item.amount
                  ).toLocaleString()}

                </td>

                <td>
                  {
                    item.recorded_by
                  }
                </td>

                <td>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      deleteExpense(
                        item.id
                      )
                    }
                  >

                    Delete

                  </button>

                </td>

              </tr>

            )
          )}

        </tbody>

      </table>

    </div>

  );

}