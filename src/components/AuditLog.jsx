import "../styles/dashboard.css";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../supabase";

import {
  ShieldCheck,
  Search,
} from "lucide-react";

export default function AuditLog() {
  // STATES

  const [logs,
    setLogs] =
    useState([]);

  const [search,
    setSearch] =
    useState("");

  // FETCH LOGS

  const fetchLogs =
    async () => {
      const {
        data,
        error,
      } = await supabase
        .from("audit_logs")
        .select("*")
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        );

      if (error) {
        console.log(
          error.message
        );

        return;
      }

      setLogs(data || []);
    };

  // LOAD

  useEffect(() => {
    fetchLogs();
  }, []);

  // FILTER

  const filteredLogs =
    logs.filter((log) =>
      log.action
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

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
            Smart Audit
            Log System
          </p>
        </div>
      </div>

      {/* SEARCH */}

      <div className="welcome-card">
        <h2>
          Audit Log
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
            placeholder="Search Action"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

          <button className="logout-btn">
            <Search
              size={18}
            />

            Search
          </button>
        </div>
      </div>

      {/* LOG TABLE */}

      <div className="welcome-card">
        <table className="hema-table">
          <thead>
            <tr>
              <th>
                User
              </th>

              <th>
                Action
              </th>

              <th>
                Department
              </th>

              <th>
                Date
              </th>

              <th>
                Time
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredLogs.map(
              (
                log,
                index
              ) => {
                const date =
                  new Date(
                    log.created_at
                  );

                return (
                  <tr
                    key={index}
                  >
                    <td>
                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "10px",
                        }}
                      >
                        <ShieldCheck
                          size={18}
                        />

                        {
                          log.user_name
                        }
                      </div>
                    </td>

                    <td>
                      {
                        log.action
                      }
                    </td>

                    <td>
                      {
                        log.department
                      }
                    </td>

                    <td>
                      {date.toLocaleDateString()}
                    </td>

                    <td>
                      {date.toLocaleTimeString()}
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>

        {/* EMPTY */}

        {filteredLogs.length ===
          0 && (
          <div
            style={{
              marginTop:
                "20px",
              textAlign:
                "center",
            }}
          >
            No audit logs
            found.
          </div>
        )}
      </div>
    </div>
  );
}