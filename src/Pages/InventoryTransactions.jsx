import {
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "../supabase";

export default function InventoryTransactions() {

  const [
    transactions,
    setTransactions,
  ] = useState([]);

  useEffect(() => {

    loadTransactions();

  }, []);

  const loadTransactions =
    async () => {

      const {
        data,
        error,
      } = await supabase

        .from(
          "inventory_transactions"
        )

        .select("*")

        .order(
          "created_at",
          {
            ascending:false,
          }
        );

      if (!error) {

        setTransactions(
          data || []
        );

      }

    };

  return (

    <div className="page">

      <h1>
        Inventory Transactions
      </h1>

      <table
        className="result-table"
      >

        <thead>

          <tr>

            <th>
              Date
            </th>

            <th>
              Type
            </th>

            <th>
              Quantity
            </th>

            <th>
              Reason
            </th>

            <th>
              Performed By
            </th>

          </tr>

        </thead>

        <tbody>

          {
            transactions.map(
              (row) => (

                <tr
                  key={row.id}
                >

                  <td>

                    {
                      new Date(
                        row.created_at
                      ).toLocaleString()
                    }

                  </td>

                  <td>
                    {
                      row.transaction_type
                    }
                  </td>

                  <td>
                    {
                      row.quantity
                    }
                  </td>

                  <td>
                    {
                      row.reason
                    }
                  </td>

                  <td>
                    {
                      row.performed_by
                    }
                  </td>

                </tr>

              )
            )
          }

        </tbody>

      </table>

    </div>

  );

}