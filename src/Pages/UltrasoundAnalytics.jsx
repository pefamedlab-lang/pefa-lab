import "../styles/ultrasoundAnalytics.css";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  CheckCircle,
  Clock3,
  Wallet,
  ScanLine,
  Users,
  BarChart3,
} from "lucide-react";

import {
  supabase,
} from "../supabase";

export default function UltrasoundAnalytics() {

  /* =========================
     STATES
  ========================= */

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    scans,
    setScans,
  ] = useState([]);

  const [
    results,
    setResults,
  ] = useState([]);

  /* =========================
     LOAD DATA
  ========================= */

  useEffect(() => {

    loadAnalytics();

  }, []);

  const loadAnalytics =
    async () => {

      try {

        setLoading(true);

        /* =========================
           REGISTRATIONS
        ========================= */

        const {
          data: scanData,
        } = await supabase
          .from(
            "ultrasound_registrations"
          )
          .select("*")
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

        /* =========================
           RESULTS
        ========================= */

        const {
          data: resultData,
        } = await supabase
          .from(
            "ultrasound_results"
          )
          .select("*");

        setScans(
          scanData || []
        );

        setResults(
          resultData || []
        );

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);
      }
    };

  /* =========================
     TODAY
  ========================= */

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  /* =========================
     DAILY SCANS
  ========================= */

  const todayScans =
    scans.filter(
      (scan) =>
        scan.created_at
          ?.split("T")[0] === today
    );

  /* =========================
     STATUS COUNTS
  ========================= */

  const pendingReports =
    results.filter(
      (item) =>
        item.release_status ===
        "Pending"
    );

  const validatedReports =
    results.filter(
      (item) =>
        item.release_status ===
        "Validated"
    );

  const releasedReports =
    results.filter(
      (item) =>
        item.release_status ===
        "Released"
    );

  /* =========================
     SCAN TYPES
  ========================= */

  const scanCategories =
    useMemo(() => {

      const categories = {};

      scans.forEach((scan) => {

        const type =
          scan.scan_type ||
          "Others";

        categories[type] =
          (
            categories[type] || 0
          ) + 1;
      });

      return Object.entries(
        categories
      );

    }, [scans]);

  /* =========================
     SONOGRAPHER STATS
  ========================= */

  const sonographerStats =
    useMemo(() => {

      const stats = {};

      scans.forEach((scan) => {

        const sonographer =
          scan.sonographer ||
          "Unassigned";

        stats[sonographer] =
          (
            stats[
              sonographer
            ] || 0
          ) + 1;
      });

      return Object.entries(
        stats
      );

    }, [scans]);

  /* =========================
     REVENUE ESTIMATION
  ========================= */

  const estimatedRevenue =
    scans.length * 15000;

  /* =========================
     RECENT SCANS
  ========================= */

  const recentScans =
    scans.slice(0, 10);

  return (

    <div className="dashboard-layout">

      
      <div className="dashboard-content">

        {/* =========================
            HEADER
        ========================= */}

        <div className="analytics-header">

          <div>

            <h1>
              Ultrasound Analytics
            </h1>

            <p>
              Enterprise Radiology Intelligence Dashboard
            </p>

          </div>

        </div>

        {/* =========================
            LOADING
        ========================= */}

        {loading && (

          <div className="analytics-loading">

            Loading analytics...

          </div>
        )}

        {/* =========================
            STATS
        ========================= */}

        {!loading && (

          <>

            <div className="analytics-stats-grid">

              {/* TODAY */}

              <div className="analytics-stat-card">

                <div className="stat-icon blue">

                  <ScanLine size={26} />

                </div>

                <div>

                  <h2>
                    {
                      todayScans.length
                    }
                  </h2>

                  <p>
                    Today's Scans
                  </p>

                </div>

              </div>

              {/* PENDING */}

              <div className="analytics-stat-card">

                <div className="stat-icon orange">

                  <Clock3 size={26} />

                </div>

                <div>

                  <h2>
                    {
                      pendingReports.length
                    }
                  </h2>

                  <p>
                    Pending Reports
                  </p>

                </div>

              </div>

              {/* RELEASED */}

              <div className="analytics-stat-card">

                <div className="stat-icon green">

                  <CheckCircle size={26} />

                </div>

                <div>

                  <h2>
                    {
                      releasedReports.length
                    }
                  </h2>

                  <p>
                    Released Reports
                  </p>

                </div>

              </div>

              {/* REVENUE */}

              <div className="analytics-stat-card">

                <div className="stat-icon purple">

                  <Wallet size={26} />

                </div>

                <div>

                  <h2>
                    ₦
                    {
                      estimatedRevenue
                        .toLocaleString()
                    }
                  </h2>

                  <p>
                    Estimated Revenue
                  </p>

                </div>

              </div>

            </div>

            {/* =========================
                ANALYTICS GRID
            ========================= */}

            <div className="analytics-main-grid">

              {/* SCAN CATEGORIES */}

              <div className="analytics-card">

                <div className="analytics-card-title">

                  <BarChart3 size={22} />

                  <h2>
                    Scan Categories
                  </h2>

                </div>

                <div className="analytics-list">

                  {scanCategories.map(
                    (
                      item,
                      index
                    ) => (

                      <div
                        key={index}
                        className="analytics-list-item"
                      >

                        <span>
                          {
                            item[0]
                          }
                        </span>

                        <strong>
                          {
                            item[1]
                          }
                        </strong>

                      </div>
                    )
                  )}

                </div>

              </div>

              {/* SONOGRAPHERS */}

              <div className="analytics-card">

                <div className="analytics-card-title">

                  <Users size={22} />

                  <h2>
                    Sonographer Productivity
                  </h2>

                </div>

                <div className="analytics-list">

                  {sonographerStats.map(
                    (
                      item,
                      index
                    ) => (

                      <div
                        key={index}
                        className="analytics-list-item"
                      >

                        <span>
                          {
                            item[0]
                          }
                        </span>

                        <strong>
                          {
                            item[1]
                          }
                        </strong>

                      </div>
                    )
                  )}

                </div>

              </div>

            </div>

            {/* =========================
                RECENT SCANS
            ========================= */}

            <div className="analytics-card">

              <div className="analytics-card-title">

                <Activity size={22} />

                <h2>
                  Recent Scans
                </h2>

              </div>

              <div className="analytics-table-wrapper">

                <table className="analytics-table">

                  <thead>

                    <tr>

                      <th>
                        Scan Number
                      </th>

                      <th>
                        Patient
                      </th>

                      <th>
                        Scan Type
                      </th>

                      <th>
                        Sonographer
                      </th>

                      <th>
                        Date
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {recentScans.map(
                      (
                        scan,
                        index
                      ) => (

                        <tr
                          key={index}
                        >

                          <td>
                            {
                              scan.scan_number
                            }
                          </td>

                          <td>
                            {
                              scan.full_name
                            }
                          </td>

                          <td>
                            {
                              scan.scan_type
                            }
                          </td>

                          <td>
                            {
                              scan.sonographer ||
                              "-"
                            }
                          </td>

                          <td>
                            {
                              new Date(
                                scan.created_at
                              )
                              .toLocaleDateString()
                            }
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* =========================
                VALIDATED SUMMARY
            ========================= */}

            <div className="analytics-footer-card">

              <div>

                <h3>
                  Validated Reports
                </h3>

                <p>
                  {
                    validatedReports.length
                  }
                </p>

              </div>

              <div>

                <h3>
                  Total Ultrasound Scans
                </h3>

                <p>
                  {
                    scans.length
                  }
                </p>

              </div>

              <div>

                <h3>
                  Total Reports
                </h3>

                <p>
                  {
                    results.length
                  }
                </p>

              </div>

            </div>

          </>
        )}

      </div>

    </div>
  );
}