import {
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "../supabase";

import "../styles/paymentHistory.css";

export default function PaymentHistory() {

const [
  search,
  setSearch,
] = useState("");

  const [
    payments,
    setPayments,
  ] = useState([]);

  useEffect(() => {

    loadPayments();

  }, []);

  const loadPayments =
    async () => {

      const {
        data,
      } = await supabase

        .from(
          "payment_transactions"
        )

        .select("*")

        .order(
          "created_at",
          {
            ascending:false,
          }
        );

      setPayments(
        data || []
      );

    };

  return (

    <div className="page">

      <h1>
        Payment History
      </h1>

<input
  placeholder="Search Patient or Lab No"
  value={search}
  onChange={(e)=>
    setSearch(
      e.target.value
    )
  }
/>

      <table className="payment-table">

        <thead>

          <tr>

            <th>
              Date
            </th>

            <th>
              Lab No
            </th>

            <th>
              Patient
            </th>

            <th>
              Amount
            </th>

            <th>
              Method
            </th>

            <th>
              Cashier
            </th>

          </tr>

        </thead>

        <tbody>

          {

            payments

.filter(
  item =>

    item.patient_name
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
)

.map(
              (item) => (

                <tr
                  key={item.id}
                >

                  <td>

                    {

                      new Date(
                        item.created_at
                      )
                      .toLocaleString()

                    }

                  </td>

                  <td>
                    {item.lab_number}
                  </td>

                  <td>
                    {item.patient_name}
                  </td>

                  <td>

                    ₦

                    {

                      Number(
                        item.amount || 0
                      )
                      .toLocaleString()

                    }

                  </td>

                  <td>
                    {item.payment_method}
                  </td>

                  <td>
                    {item.received_by}
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