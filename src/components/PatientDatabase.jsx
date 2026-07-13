import "../styles/dashboard.css";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../supabase";

import {
  Search,
  Users,
  Printer,
  Trash2,
} from "lucide-react";

export default function PatientDatabase() {
  // STATES

  const [patients,
    setPatients] =
    useState([]);

  const [search,
    setSearch] =
    useState("");

  // FETCH PATIENTS

  const fetchPatients =
    async () => {
      const {
        data,
        error,
      } = await supabase
        .from("patients")
        .select("*")
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        );

      if (error) {
        alert(
          error.message
        );

        return;
      }

      setPatients(data || []);
    };

  // LOAD

  useEffect(() => {
    fetchPatients();
  }, []);

  // SEARCH FILTER

  const filteredPatients =
    patients.filter(
      (patient) =>
        patient.full_name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        patient.lab_number
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        patient.phone
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  // DELETE PATIENT

  const deletePatient =
    async (id) => {
      const confirmDelete =
        window.confirm(
          "Delete this patient?"
        );

      if (
        !confirmDelete
      )
        return;

      const {
        error,
      } = await supabase
        .from("patients")
        .delete()
        .eq("id", id);

      if (error) {
        alert(
          error.message
        );

        return;
      }

      fetchPatients();
    };

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
            Smart Patient
            Database
          </p>
        </div>
      </div>

      {/* SEARCH */}

      <div className="welcome-card">
        <h2>
          Patient Search
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
            placeholder="Search Name, Lab Number or Phone"
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

      {/* TABLE */}

      <div className="welcome-card">
        <h2>
          Registered
          Patients
        </h2>

        <table className="hema-table">
          <thead>
            <tr>
              <th>
                Lab Number
              </th>

              <th>
                Patient
              </th>

              <th>
                Sex
              </th>

              <th>
                Age
              </th>

              <th>
                Phone
              </th>

              <th>
                Status
              </th>

              <th>
                Date
              </th>

              <th>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredPatients.map(
              (
                patient,
                index
              ) => (
                <tr
                  key={index}
                >
                  <td>
                    {
                      patient.lab_number
                    }
                  </td>

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
                      <Users
                        size={18}
                      />

                      {
                        patient.full_name
                      }
                    </div>
                  </td>

                  <td>
                    {
                      patient.sex
                    }
                  </td>

                  <td>
                    {
                      patient.age
                    }
                  </td>

                  <td>
                    {
                      patient.phone
                    }
                  </td>

                  <td>
                    {
                      patient.status
                    }
                  </td>

                  <td>
                    {new Date(
                      patient.created_at
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    <div
                      style={{
                        display:
                          "flex",
                        gap: "10px",
                      }}
                    >
                      <button
                        className="save-btn"
                        onClick={() =>
                          window.print()
                        }
                      >
                        <Printer
                          size={16}
                        />

                        Print
                      </button>

                      <button
                        className="print-btn"
                        onClick={() =>
                          deletePatient(
                            patient.id
                          )
                        }
                      >
                        <Trash2
                          size={16}
                        />

                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

        {/* EMPTY */}

        {filteredPatients.length ===
          0 && (
          <div
            style={{
              marginTop:
                "20px",
              textAlign:
                "center",
            }}
          >
            No patient
            found.
          </div>
        )}
      </div>
    </div>
  );
}