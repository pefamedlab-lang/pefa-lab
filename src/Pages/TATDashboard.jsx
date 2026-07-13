import {
  useEffect,
  useState,
} from "react";

import {
  Clock3,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import "../styles/tat.css";

import {
  supabase,
} from "../supabase";

export default function TATDashboard() {
  /* =========================
     STATES
  ========================= */

  const [
    results,
    setResults,
  ] = useState([]);

  /* =========================
     LOAD RESULTS
  ========================= */

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults =
    async () => {
      try {
        const {
          data,
        } = await supabase
          .from(
            "patient_results"
          )
          .select("*")
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

        setResults(
          data || []
        );
      } catch (error) {
        console.log(
          error
        );
      }
    };

  /* =========================
     COUNTS
  ========================= */

  const completed =
    results.filter(
      (item) =>
        item.tat_status ===
        "Completed"
    ).length;

  const pending =
    results.filter(
      (item) =>
        item.tat_status ===
        "Pending"
    ).length;

  const overdue =
    results.filter(
      (item) =>
        item.tat_hours >
        48
    ).length;

  return (
    <div className="tat-page">
      {/* HEADER */}

      <div className="tat-header">
        <h1>
          TAT Dashboard
        </h1>

        <p>
          Enterprise
          Turnaround Time
          Monitoring
        </p>
      </div>

      {/* STATS */}

      <div className="tat-stats">
        <div className="tat-card">
          <CheckCircle2
            size={32}
          />

          <h2>
            {
              completed
            }
          </h2>

          <p>
            Completed
          </p>
        </div>

        <div className="tat-card">
          <Clock3
            size={32}
          />

          <h2>
            {pending}
          </h2>

          <p>
            Pending
          </p>
        </div>

        <div className="tat-card">
          <AlertTriangle
            size={32}
          />

          <h2>
            {overdue}
          </h2>

          <p>
            Overdue
          </p>
        </div>
      </div>

      {/* TABLE */}

      <div className="tat-table">
        <table>
          <thead>
            <tr>
              <th>
                Patient
              </th>

              <th>
                Test
              </th>

              <th>
                TAT Hours
              </th>

              <th>
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {results.map(
              (item) => (
                <tr
                  key={
                    item.id
                  }
                >
                  <td>
                    {
                      item.patient_name
                    }
                  </td>

                  <td>
                    {
                      item.test_name
                    }
                  </td>

                  <td>
                    {
                      item.tat_hours
                    }
                  </td>

                  <td>
                    <span
                      className={`tat-status ${
                        item.tat_status ===
                        "Completed"
                          ? "tat-completed"
                          : "tat-pending"
                      }`}
                    >
                      {
                        item.tat_status
                      }
                    </span>
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