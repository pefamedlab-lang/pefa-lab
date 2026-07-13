import {
  useState,
} from "react";

import {
  supabase,
} from "../supabase";

import "../styles/patientFinanceHistory.css";

export default function PatientFinanceHistory() {

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    patient,
    setPatient,
  ] = useState(null);

  const [
    payments,
    setPayments,
  ] = useState([]);

const [
  visits,
  setVisits,
] = useState([]);

const loadVisits =
  async (
    patientName
  ) => {

    const {
      data,
    } = await supabase

      .from(
        "registrations"
      )

      .select("*")

      .eq(
        "full_name",
        patientName
      )

      .order(
        "created_at",
        {
          ascending:false,
        }
      );

    setVisits(
      data || []
    );

  };

  const searchPatient =
    async () => {

      const {
        data,
      } = await supabase

        .from(
          "registrations"
        )

        .select("*")

       .or(
  `lab_number.ilike.%${search}%,full_name.ilike.%${search}%`
)

        .limit(1);

      if (
        data?.length
      ) {

        setPatient(
          data[0]
        );

loadVisits(
  data[0].full_name
);

        loadPayments(
          data[0].lab_number
        );

      } else {

        alert(
          "Patient Not Found"
        );

      }

    };

  const loadPayments =
    async (
      labNumber
    ) => {

      const {
        data,
      } = await supabase

        .from(
          "payment_transactions"
        )

        .select("*")

        .eq(
          "lab_number",
          labNumber
        )

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
        Patient Financial History
      </h1>

<h2>
  Visit History
</h2>

<table className="payment-table">

  <thead>

    <tr>

      <th>
        Lab Number
      </th>

      <th>
        Date
      </th>

      <th>
        Amount
      </th>

      <th>
        Status
      </th>

    </tr>

  </thead>

  <tbody>

    {

      visits.map(
        (visit) => (

          <tr
            key={visit.id}
          >

            <td>
              {visit.lab_number}
            </td>

            <td>

              {

                visit.created_at

                  ? new Date(
                      visit.created_at
                    )
                    .toLocaleDateString()

                  : "-"

              }

            </td>

            <td>

              ₦

              {

                Number(
                  visit.total_amount || 0
                )
                .toLocaleString()

              }

            </td>

            <td>

              {

                visit.payment_status ||

                "Pending"

              }

            </td>

          </tr>

        )
      )

    }

  </tbody>

</table>

      <div className="search-box">

        <input
          placeholder="Lab Number or Patient Name"
          value={search}
          onChange={(e)=>
            setSearch(
              e.target.value
            )
          }
        />

        <button
          onClick={
            searchPatient
          }
        >
          Search
        </button>

      </div>

      {

        patient && (

          <>

<div className="finance-profile">

  <h2>
    {patient.full_name}
  </h2>

  <div className="finance-grid">

    <div>

      <strong>
        Lab Number
      </strong>

      <p>
        {patient.lab_number}
      </p>

    </div>

    <div>

      <strong>
        Total Billed
      </strong>

      <p>

        ₦

        {

          Number(
            patient.total_amount || 0
          ).toLocaleString()

        }

      </p>

    </div>

    <div>

      <strong>
        Total Paid
      </strong>

      <p>

        ₦

        {

          Number(
            patient.amount_paid || 0
          ).toLocaleString()

        }

      </p>

    </div>

    <div>

      <strong>
        Outstanding
      </strong>

      <p>

        ₦

        {

         Number(

  patient.balance ??

  patient.total_amount ??

  0

).toLocaleString()

        }

      </p>

    </div>
</div>

</div>

<h2>
  Payment History
</h2>

<table className="payment-table">

  <thead>

    <tr>

      <th>
        Date
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

      payments.map(
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

          </>

        )

      }

    </div>

  );

}

  