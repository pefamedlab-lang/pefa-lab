import "../styles/registrationRecords.css";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Search,
  Eye,
  Printer,
  Receipt,
  CreditCard,
  CheckCircle,
  Clock3,
} from "lucide-react";

import {
  supabase,
} from "../supabase";

export default function RegistrationRecords() {

  /* =====================================================
     STATES
  ===================================================== */

  const navigate =
    useNavigate();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    records,
    setRecords,
  ] = useState([]);

  /* =====================================================
     LOAD REGISTRATIONS
  ===================================================== */

  const loadRegistrations =
    async () => {

      try {

        setLoading(true);

        const {
          data,
          error,
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

        if (error) {

          console.log(
            error
          );

          return;
        }

        setRecords(
          data || []
        );

      } catch (error) {

        console.log(
          error
        );

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    loadRegistrations();

  }, []);

  /* =====================================================
     FILTER RECORDS
  ===================================================== */

  const filteredRecords =
    records.filter(
      (item) => {

        const keyword =
          search.toLowerCase();

        return (

          item.full_name
            ?.toLowerCase()
            .includes(
              keyword
            ) ||

          item.lab_number
            ?.toLowerCase()
            .includes(
              keyword
            ) ||

          item.branch
            ?.toLowerCase()
            .includes(
              keyword
            ) ||

          item.payment_type
            ?.toLowerCase()
            .includes(
              keyword
            )
        );
      }
    );

  /* =====================================================
     CONTINUE PAYMENT
  ===================================================== */

  const continuePayment =
    (patient) => {

      navigate(
        "/payment-portal",
        {
          state:{
            patient,
          },
        }
      );
    };

  return (

    <div className="dashboard-layout">

      
      <div className="dashboard-content">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="registration-records-header">

          <div>

            <h1>
              Registration Records
            </h1>

            <p>
              Enterprise Reception
              Registration Archive
            </p>

          </div>

        </div>

        {/* =====================================================
            SEARCH
        ===================================================== */}

        <div className="registration-records-card">

          <div className="registration-search">

            <Search
              size={18}
            />

            <input
              type="text"
              placeholder="Search Lab Number, Patient, Branch..."
              value={
                search
              }
              onChange={(e) =>
                setSearch(
                  e.target
                    .value
                )
              }
            />

          </div>

        </div>

        {/* =====================================================
            TABLE
        ===================================================== */}

        <div className="registration-records-card">

          <div className="registration-table">

            {/* TABLE HEADER */}

            <div className="registration-table-header">

              <span>
                Lab Number
              </span>

              <span>
                Patient
              </span>

              <span>
                Branch
              </span>

              <span>
                Payment
              </span>

              <span>
                Amount
              </span>

              <span>
                Status
              </span>

              <span>
                Actions
              </span>

            </div>

            {/* BODY */}

            {
              loading ? (

                <div className="empty-state">

                  Loading Registrations...

                </div>

              ) :

              filteredRecords.length === 0 ? (

                <div className="empty-state">

                  No Registration Found

                </div>

              ) :

              filteredRecords.map(
                (
                  item,
                  index
                ) => (

                  <div
                    key={index}
                    className="registration-row"
                  >

                    {/* LAB NUMBER */}

                    <span className="lab-id">

                      {
                        item.lab_number
                      }

                    </span>

                    {/* PATIENT */}

                    <span>

                      {
                        item.full_name
                      }

                    </span>

                    {/* BRANCH */}

                    <span>

                      {
                        item.branch ||
                        "-"
                      }

                    </span>

                    {/* PAYMENT */}

                    <span>

                      {
                        item.payment_type ||
                        "Patient"
                      }

                    </span>

                    {/* AMOUNT */}

                    <span className="amount">

                      ₦

                      {
                        Number(
                          item.total_amount || 0
                        ).toLocaleString()
                      }

                    </span>

                    {/* STATUS */}

                    <div
                      className={`payment-status ${item.payment_status}`}
                    >

                      {
                        item.payment_status ===
                        "Paid" ? (

                          <CheckCircle
                            size={15}
                          />

                        ) : (

                          <Clock3
                            size={15}
                          />

                        )}

                      {
                        item.payment_status ||
                        "Pending"
                      }

                    </div>

                    {/* ACTIONS */}

                    <div className="registration-actions">

                      {/* VIEW */}

                      <button
                        className="view-btn"
                      >

                        <Eye
                          size={16}
                        />

                      </button>

                      {/* CONTINUE PAYMENT */}

                      <button
                        className="payment-btn"
                        onClick={() =>
                          continuePayment(
                            item
                          )
                        }
                      >

                        <CreditCard
                          size={16}
                        />

                      </button>

                      {/* PRINT INVOICE */}

                      <button
                        className="invoice-btn"
                      >

                        <Printer
                          size={16}
                        />

                      </button>

                      {/* PRINT RECEIPT */}

                      <button
                        className="receipt-btn"
                      >

                        <Receipt
                          size={16}
                        />

                      </button>

                    </div>

                  </div>
                )
              )
            }

          </div>

        </div>

      </div>

    </div>
  );
}