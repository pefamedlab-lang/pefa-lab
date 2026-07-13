import {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle,
  ShieldCheck,
  Clock3,
  Search,
} from "lucide-react";

import {
  supabase,
} from "../supabase";

import "../styles/authorization.css";

export default function AuthorizationPortal() {
  const [
    patients,
    setPatients,
  ] = useState([]);

  const [
    filteredPatients,
    setFilteredPatients,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    authorizer,
    setAuthorizer,
  ] = useState("");

  /* FETCH */

  useEffect(() => {
    fetchPendingResults();
  }, []);

  const fetchPendingResults =
    async () => {
      setLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from(
          "patient_results"
        )
        .select("*")
        .order(
          "id",
          {
            ascending:
              false,
          }
        );

      if (!error) {
        setPatients(data);

        setFilteredPatients(
          data
        );
      }

      setLoading(false);
    };

  /* SEARCH */

  useEffect(() => {
    const filtered =
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

    setFilteredPatients(
      filtered
    );
  }, [search, patients]);

  /* AUTHORIZE */

  const authorizeResult =
    async (id) => {
      if (!authorizer) {
        alert(
          "Enter authorizer name."
        );

        return;
      }

      const {
        error,
      } = await supabase
        .from(
          "patient_results"
        )
        .update({
          authorization_status:
            "Authorized",

          authorized_by:
            authorizer,

          authorization_date:
            new Date().toLocaleString(),
        })
        .eq("id", id);

      if (error) {
        console.error(
          error
        );

        alert(
          "Authorization failed."
        );

        return;
      }

      alert(
        "Result authorized successfully."
      );

      fetchPendingResults();
    };

  return (
    <div className="authorization-page">
      {/* HEADER */}

      <div className="authorization-header">
        <div>
          <h1>
            Result
            Authorization
          </h1>

          <p>
            Enterprise
            Laboratory
            Verification
            System
          </p>
        </div>

        <div className="secure-box">
          <ShieldCheck
            size={18}
          />

          Authorized LIS
        </div>
      </div>

      {/* AUTHORIZE NAME */}

      <div className="authorizer-card">
        <label>
          Authorizing
          Scientist /
          Pathologist
        </label>

        <input
          type="text"
          placeholder="Enter reviewer name"
          value={authorizer}
          onChange={(e) =>
            setAuthorizer(
              e.target.value
            )
          }
        />
      </div>

      {/* SEARCH */}

      <div className="search-card">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search by patient name or lab number"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />
      </div>

      {/* RESULTS */}

      <div className="authorization-grid">
        {loading ? (
          <div className="loading-box">
            Loading...
          </div>
        ) : filteredPatients.length ===
          0 ? (
          <div className="loading-box">
            No results found.
          </div>
        ) : (
          filteredPatients.map(
            (
              patient
            ) => (
              <div
                className="auth-card"
                key={
                  patient.id
                }
              >
                {/* TOP */}

                <div className="auth-top">
                  <div>
                    <h2>
                      {
                        patient.patient_name
                      }
                    </h2>

                    <p>
                      {
                        patient.lab_number
                      }
                    </p>
                  </div>

                  <div
                    className={`status ${
                      patient.authorization_status ===
                      "Authorized"
                        ? "authorized"
                        : "pending"
                    }`}
                  >
                    {patient.authorization_status ===
                    "Authorized" ? (
                      <>
                        <CheckCircle
                          size={15}
                        />
                        Authorized
                      </>
                    ) : (
                      <>
                        <Clock3
                          size={15}
                        />
                        Pending
                      </>
                    )}
                  </div>
                </div>

                {/* DETAILS */}

                <div className="auth-details">
                  <div>
                    <strong>
                      Sex
                    </strong>

                    <span>
                      {
                        patient.sex
                      }
                    </span>
                  </div>

                  <div>
                    <strong>
                      Age
                    </strong>

                    <span>
                      {
                        patient.age
                      }
                    </span>
                  </div>

                  <div>
                    <strong>
                      Branch
                    </strong>

                    <span>
                      {
                        patient.branch
                      }
                    </span>
                  </div>

                  <div>
                    <strong>
                      Report Date
                    </strong>

                    <span>
                      {
                        patient.report_date ||
                        "-"
                      }
                    </span>
                  </div>
                </div>

                {/* AUTHORIZED INFO */}

                {patient.authorization_status ===
                  "Authorized" && (
                  <div className="authorized-info">
                    <p>
                      Authorized
                      By:
                    </p>

                    <strong>
                      {
                        patient.authorized_by
                      }
                    </strong>

                    <span>
                      {
                        patient.authorization_date
                      }
                    </span>
                  </div>
                )}

                {/* BUTTON */}

                {patient.authorization_status !==
                  "Authorized" && (
                  <button
                    className="authorize-btn"
                    onClick={() =>
                      authorizeResult(
                        patient.id
                      )
                    }
                  >
                    <CheckCircle
                      size={18}
                    />

                    Authorize
                    Result
                  </button>
                )}
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}