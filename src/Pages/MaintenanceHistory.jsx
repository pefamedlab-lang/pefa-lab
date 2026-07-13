
import {
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "../supabase";

export default function MaintenanceHistory() {

  const [
    records,
    setRecords,
  ] = useState([]);

  useEffect(() => {

    loadRecords();

  }, []);

  const loadRecords =
    async () => {

      const {
        data,
      } = await supabase

        .from(
          "equipment_maintenance"
        )

        .select("*")

        .order(
          "created_at",
          {
            ascending:false,
          }
        );

      setRecords(
        data || []
      );

    };

  return (

    <div className="page">

      <h1>
        Maintenance History
      </h1>

      <table
        className="equipment-table"
      >

        <thead>

          <tr>

            <th>
              Date
            </th>

            <th>
              Engineer
            </th>

            <th>
              Activity
            </th>

            <th>
              Remarks
            </th>

          </tr>

        </thead>

        <tbody>

          {

            records.map(
              (row) => (

                <tr
                  key={row.id}
                >

                  <td>
                    {
                      row.maintenance_date
                    }
                  </td>

                  <td>
                    {
                      row.engineer
                    }
                  </td>

                  <td>
                    {
                      row.activity
                    }
                  </td>

                  <td>
                    {
                      row.remarks ||
                      "-"
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