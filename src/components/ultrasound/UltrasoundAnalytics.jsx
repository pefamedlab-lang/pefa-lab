import {

  useEffect,
  useState,

} from "react";

import {

  supabase,

} from "../supabase";

import {

  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,

  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,

} from "recharts";

import "../styles/ultrasoundAnalytics.css";

export default function UltrasoundAnalytics() {

  const [

    records,

    setRecords,

  ] = useState([]);

  useEffect(() => {

    loadAnalytics();

  }, []);

  const loadAnalytics =

    async () => {

      const {

        data,

      } = await supabase

        .from(

          "ultrasound_results"

        )

        .select("*");

      setRecords(

        data || []

      );

    };

  /* ==========================
     MONTHLY TREND
  ========================== */

  const monthlyTrend =

    Object.values(

      records.reduce(

        (

          acc,

          item

        ) => {

          const month =

            new Date(

              item.created_at

            )

              .toLocaleString(

                "default",

                {

                  month:

                    "short",

                }

              );

          if (

            !acc[month]

          ) {

            acc[month] = {

              month,

              scans: 0,

            };

          }

          acc[month].scans += 1;

          return acc;

        },

        {}

      )

    );

  /* ==========================
     SCAN TYPES
  ========================== */

  const scanDistribution =

    Object.values(

      records.reduce(

        (

          acc,

          item

        ) => {

          const key =

            item.test_type ||

            "Others";

          if (

            !acc[key]

          ) {

            acc[key] = {

              name: key,

              value: 0,

            };

          }

          acc[key].value++;

          return acc;

        },

        {}

      )

    );

  /* ==========================
     STATUS
  ========================== */

  const statusData = [

    {

      name:

        "Released",

      value:

        records.filter(

          r =>

            r.release_status ===

            "Released"

        ).length,

    },

    {

      name:

        "Pending",

      value:

        records.filter(

          r =>

            r.release_status ===

            "Pending"

        ).length,

    },

  ];

  /* ==========================
     RADIOLOGIST
  ========================== */

  const radiologistLoad =

    Object.values(

      records.reduce(

        (

          acc,

          item

        ) => {

          const key =

            item.radiologist ||

            "Unassigned";

          if (

            !acc[key]

          ) {

            acc[key] = {

              name: key,

              scans: 0,

            };

          }

          acc[key].scans++;

          return acc;

        },

        {}

      )

    );

  const COLORS = [

    "#0284c7",
    "#22c55e",
    "#f59e0b",
    "#dc2626",
    "#8b5cf6",
    "#14b8a6",

  ];

  return (

    <div className="ultrasound-analytics">

      <div className="analytics-header">

        <h1>

          Ultrasound Analytics

        </h1>

        <p>

          Enterprise Radiology Statistics Dashboard

        </p>

      </div>

      {/* ======================
          MONTHLY TREND
      ====================== */}

      <div className="analytics-card">

        <h2>

          Monthly Scan Trend

        </h2>

        <ResponsiveContainer

          width="100%"

          height={350}

        >

          <BarChart

            data={monthlyTrend}

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

              dataKey="scans"

              fill="#0284c7"

            />

          </BarChart>

        </ResponsiveContainer>

      </div>

      {/* ======================
          TWO COLUMNS
      ====================== */}

      <div className="analytics-grid">

        {/* SCAN TYPES */}

        <div className="analytics-card">

          <h2>

            Scan Distribution

          </h2>

          <ResponsiveContainer

            width="100%"

            height={300}

          >

            <PieChart>

              <Pie

                data={scanDistribution}

                dataKey="value"

                nameKey="name"

                outerRadius={110}

              >

                {scanDistribution.map(

                  (

                    entry,

                    index

                  ) => (

                    <Cell

                      key={index}

                      fill={

                        COLORS[

                          index %

                          COLORS.length

                        ]

                      }

                    />

                  )

                )}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

        {/* STATUS */}

        <div className="analytics-card">

          <h2>

            Pending vs Released

          </h2>

          <ResponsiveContainer

            width="100%"

            height={300}

          >

            <PieChart>

              <Pie

                data={statusData}

                dataKey="value"

                outerRadius={110}

              >

                <Cell fill="#22c55e" />

                <Cell fill="#f59e0b" />

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* ======================
          RADIOLOGISTS
      ====================== */}

      <div className="analytics-card">

        <h2>

          Radiologist Workload

        </h2>

        <ResponsiveContainer

          width="100%"

          height={350}

        >

          <BarChart

            data={radiologistLoad}

          >

            <CartesianGrid

              strokeDasharray="3 3"

            />

            <XAxis

              dataKey="name"

            />

            <YAxis />

            <Tooltip />

            <Bar

              dataKey="scans"

              fill="#8b5cf6"

            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

}