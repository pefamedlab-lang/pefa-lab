import {
  useEffect,
  useState,
} from "react";

import {
  Search,
  CheckCircle2,
} from "lucide-react";

import "../styles/sample.css";

import {
  supabase,
} from "../supabase";

export default function SampleCollection() {
  const [
    patients,
    setPatients,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  /* =========================
     LOAD PATIENTS
  ========================= */

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients =
    async () => {
      try {
        const {
          data,
        } = await supabase
          .from(
            "registrations"
          )
          .select("*")
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

        setPatients(
          data || []
        );
      } catch (error) {
        console.log(
          error
        );
      }
    };

  /* =========================
     FILTER
  ========================= */

  const filteredPatients =
    patients.filter(
      (patient) =>
        patient.patient_name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        patient.lab_number
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  return (
    <div className="sample-page">
      {/* HEADER */}

      <div className="sample-header">
        <h1>
          Sample
          Collection
        </h1>

        <p>
          Enterprise
          Phlebotomy
          Workflow
        </p>
      </div>

      {/* SEARCH */}

      <div className="sample-search">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search patient or lab number"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />
      </div>

      {/* TABLE */}

      <div className="sample-table">
        <table>
          <thead>
            <tr>
              <th>
                Patient
              </th>

              <th>
                Lab Number
              </th>

              <th>
                Gender
              </th>

              <th>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredPatients.map(
              (patient) => (
                <tr
                  key={
                    patient.id
                  }
                >
                  <td>
                    {
                      patient.patient_name
                    }
                  </td>

                  <td>
                    {
                      patient.lab_number
                    }
                  </td>

                  <td>
                    {
                      patient.gender
                    }
                  </td>

                  <td>
                    <button className="collect-btn">
                      <CheckCircle2
                        size={16}
                      />

                      Collect
                    </button>
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