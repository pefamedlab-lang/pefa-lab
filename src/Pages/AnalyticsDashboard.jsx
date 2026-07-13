import "../styles/analytics.css";

import {
  useEffect,
  useState,
} from "react";

import DashboardNavbar from "../components/DashboardNavbar";

import {
  DollarSign,
  Users,
  FlaskConical,
  CheckCircle,
  Building2,
  Activity,
} from "lucide-react";

import {
  supabase,
} from "../supabase";

export default function Analytics() {

  /* =====================================================
     STATES
  ===================================================== */

  const [
    registrations,
    setRegistrations,
  ] = useState([]);

  const [
    results,
    setResults,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* =====================================================
     LOAD DATA
  ===================================================== */

  const loadAnalytics =
    async () => {

      try {

        setLoading(true);

        /* REGISTRATIONS */

        const {
          data:
            registrationData,
        } = await supabase
          .from(
            "registrations"
          )
          .select("*");

        /* RESULTS */

        const {
          data:
            resultData,
        } = await supabase
          .from(
            "patient_results"
          )
          .select("*");

        setRegistrations(
          registrationData ||
          []
        );

        setResults(
          resultData ||
          []
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

    loadAnalytics();

  }, []);

  /* =====================================================
     SUMMARY
  ===================================================== */

  const totalRevenue =
    registrations.reduce(
      (
        acc,
        item
      ) =>
        acc +
        Number(
          item.total_amount ||
          0
        ),
      0
    );

  const totalPatients =
    registrations.length;

  const releasedResults =
    results.filter(
      (item) =>
        item.release_status ===
        "Released"
    ).length;

  const pendingPayments =
    registrations.filter(
      (item) =>
        item.payment_status !==
        "Paid"
    ).length;

  /* =====================================================
     BRANCH ANALYTICS
  ===================================================== */

  const branches = [
    "Pakuro",
    "Mowe",
    "Orimerunmu",
    "Private",
  ];

  const branchStats =
    branches.map(
      (branch) => {

        const patients =
          registrations.filter(
            (item) =>
              item.branch ===
              branch
          );

        const income =
          patients.reduce(
            (
              acc,
              item
            ) =>
              acc +
              Number(
                item.total_amount ||
                0
              ),
            0
          );

        return {

          branch,

          patients:
            patients.length,

          income,
        };
      }
    );

  /* =====================================================
     PAYMENT TYPES
  ===================================================== */

  const paymentStats = [

    {
      name:
        "Patient",

      count:
        registrations.filter(
          (item) =>
            item.payment_type ===
            "Patient"
        ).length,
    },

    {
      name:
        "Referral",

      count:
        registrations.filter(
          (item) =>
            item.payment_type ===
            "Referral"
        ).length,
    },

    {
      name:
        "HMO",

      count:
        registrations.filter(
          (item) =>
            item.payment_type ===
            "HMO"
        ).length,
    },
  ];

  /* =====================================================
     TOP TESTS
  ===================================================== */

  const testCounter = {};

  registrations.forEach(
    (registration) => {

      (
        registration.tests ||
        []
      ).forEach(
        (test) => {

          if (
            !testCounter[
              test.test_name
            ]
          ) {

            testCounter[
              test.test_name
            ] = 0;
          }

          testCounter[
            test.test_name
          ] += 1;
        }
      );
    }
  );

  const topTests =
    Object.entries(
      testCounter
    )

      .map(
        ([
          name,
          count,
        ]) => ({
          name,
          count,
        })
      )

      .sort(
        (
          a,
          b
        ) =>
          b.count -
          a.count
      )

      .slice(0, 6);

  /* =====================================================
     CHART DATA
  ===================================================== */

  const monthlyData = [
    {
      month:
        "Jan",
      revenue:
        120000,
    },

    {
      month:
        "Feb",
      revenue:
        95000,
    },

    {
      month:
        "Mar",
      revenue:
        180000,
    },

    {
      month:
        "Apr",
      revenue:
        140000,
    },

    {
      month:
        "May",
      revenue:
        220000,
    },
  ];

  return (

    <div className="dashboard-layout">

      <DashboardNavbar />

      <div className="dashboard-content">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="analytics-header">

          <h1>
            Analytics Dashboard
          </h1>

          <p>
            PEFA Enterprise
            Performance Overview
          </p>

        </div>

        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}

        <div className="analytics-summary-grid">

          {/* REVENUE */}

          <div className="analytics-card">

            <div className="analytics-card-top">

              <h3>
                Total Revenue
              </h3>

              <div className="analytics-icon green">

                <DollarSign
                  size={22}
                />

              </div>

            </div>

            <h2 className="analytics-value">

              ₦

              {
                totalRevenue.toLocaleString()
              }

            </h2>

            <p className="analytics-subtext">

              Total generated income

            </p>

          </div>

          {/* PATIENTS */}

          <div className="analytics-card">

            <div className="analytics-card-top">

              <h3>
                Registrations
              </h3>

              <div className="analytics-icon blue">

                <Users
                  size={22}
                />

              </div>

            </div>

            <h2 className="analytics-value">

              {
                totalPatients
              }

            </h2>

            <p className="analytics-subtext">

              Total registered patients

            </p>

          </div>

          {/* RESULTS */}

          <div className="analytics-card">

            <div className="analytics-card-top">

              <h3>
                Released Results
              </h3>

              <div className="analytics-icon purple">

                <CheckCircle
                  size={22}
                />

              </div>

            </div>

            <h2 className="analytics-value">

              {
                releasedResults
              }

            </h2>

            <p className="analytics-subtext">

              Released laboratory reports

            </p>

          </div>

          {/* PAYMENTS */}

          <div className="analytics-card">

            <div className="analytics-card-top">

              <h3>
                Pending Payments
              </h3>

              <div className="analytics-icon orange">

                <Activity
                  size={22}
                />

              </div>

            </div>

            <h2 className="analytics-value">

              {
                pendingPayments
              }

            </h2>

            <p className="analytics-subtext">

              Awaiting payment confirmation

            </p>

          </div>

        </div>

        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <div className="analytics-main-grid">

          {/* =====================================================
              LEFT PANEL
          ===================================================== */}

          <div>

            {/* =====================================================
                CHART
            ===================================================== */}

            <div className="analytics-panel">

              <div className="panel-header">

                <div>

                  <h2>
                    Monthly Revenue
                  </h2>

                  <p>
                    Laboratory revenue trend
                  </p>

                </div>

              </div>

              <div className="chart-container">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={
                      monthlyData
                    }
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="month"
                    />

                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="revenue"
                      radius={[
                        8,
                        8,
                        0,
                        0,
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </div>

            {/* =====================================================
                BRANCH PERFORMANCE
            ===================================================== */}

            <div
              className="analytics-panel"
              style={{
                marginTop:
                  "24px",
              }}
            >

              <div className="panel-header">

                <div>

                  <h2>
                    Branch Performance
                  </h2>

                  <p>
                    Revenue &
                    patient statistics
                  </p>

                </div>

              </div>

              <div className="branch-list">

                {
                  branchStats.map(
                    (
                      branch,
                      index
                    ) => (

                      <div
                        key={index}
                        className="branch-item"
                      >

                        <div className="branch-left">

                          <div className="branch-badge">

                            <Building2
                              size={18}
                            />

                          </div>

                          <div>

                            <h4 className="branch-name">

                              {
                                branch.branch
                              }

                            </h4>

                            <p className="branch-sub">

                              {
                                branch.patients
                              }

                              {" "}

                              patients

                            </p>

                          </div>

                        </div>

                        <div className="branch-income">

                          ₦

                          {
                            branch.income.toLocaleString()
                          }

                        </div>

                      </div>
                    )
                  )
                }

              </div>

            </div>

          </div>

          {/* =====================================================
              RIGHT PANEL
          ===================================================== */}

          <div>

            {/* =====================================================
                TOP TESTS
            ===================================================== */}

            <div className="analytics-panel">

              <div className="panel-header">

                <div>

                  <h2>
                    Top Tests
                  </h2>

                  <p>
                    Most requested tests
                  </p>

                </div>

              </div>

              <div className="test-list">

                {
                  topTests.map(
                    (
                      test,
                      index
                    ) => (

                      <div
                        key={index}
                        className="test-item"
                      >

                        <span className="test-name">

                          {
                            test.name
                          }

                        </span>

                        <span className="test-count">

                          {
                            test.count
                          }

                        </span>

                      </div>
                    )
                  )
                }

              </div>

            </div>

            {/* =====================================================
                PAYMENT TYPES
            ===================================================== */}

            <div
              className="analytics-panel"
              style={{
                marginTop:
                  "24px",
              }}
            >

              <div className="panel-header">

                <div>

                  <h2>
                    Payment Types
                  </h2>

                  <p>
                    Patient payment analysis
                  </p>

                </div>

              </div>

              <div className="referral-list">

                {
                  paymentStats.map(
                    (
                      payment,
                      index
                    ) => (

                      <div
                        key={index}
                        className="referral-item"
                      >

                        <span className="referral-name">

                          {
                            payment.name
                          }

                        </span>

                        <span className="referral-value">

                          {
                            payment.count
                          }

                        </span>

                      </div>
                    )
                  )
                }

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}