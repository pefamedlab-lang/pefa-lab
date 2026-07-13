import "../styles/ultrasoundRecords.css";

import UltrasoundActionMenu
from "../components/ultrasound/UltrasoundActionMenu";

import {

  useEffect,
  useState,

} from "react";

import {

  Eye,
  Pencil,
  Printer,
  CheckCircle,
  Trash2,

} from "lucide-react";

import {

  supabase,

} from "../supabase";

import {

  useNavigate,

} from "react-router-dom";

import "../styles/ultrasoundRecords.css";

export default function UltrasoundRecords() {

  const navigate =

    useNavigate();

  const [

    records,

    setRecords,

  ] = useState([]);

  const [

    filtered,

    setFiltered,

  ] = useState([]);

  const [

    search,

    setSearch,

  ] = useState("");

  const [

    status,

    setStatus,

  ] = useState("All");

  const [

    scanType,

    setScanType,

  ] = useState("All");

  /* ==========================
     LOAD RECORDS
  ========================== */

  useEffect(() => {

    loadRecords();

  }, []);

  const loadRecords =

    async () => {

      const {

        data,

      } = await supabase

        .from(

          "ultrasound_results"

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

      setFiltered(

        data || []

      );

    };

  /* ==========================
     FILTER
  ========================== */

  useEffect(() => {

    let data =

      [...records];

    if (

      search

    ) {

      data = data.filter(

        item =>

          item.patient_name

            ?.toLowerCase()

            .includes(

              search

                .toLowerCase()

            ) ||

          item.lab_number

            ?.toLowerCase()

            .includes(

              search

                .toLowerCase()

            )

      );

    }

    if (

      status !== "All"

    ) {

      data = data.filter(

        item =>

          item.release_status ===

          status

      );

    }

    if (

      scanType !== "All"

    ) {

      data = data.filter(

        item =>

          item.template_type ===

          scanType

      );

    }

    setFiltered(

      data

    );

  }, [

    search,

    status,

    scanType,

    records,

  ]);

  /* ==========================
     RELEASE REPORT
  ========================== */

  const releaseReport =

    async (id) => {

      await supabase

        .from(

          "ultrasound_results"

        )

        .update({

          release_status:

            "Released",

        })

        .eq(

          "id",

          id

        );

      loadRecords();

    };

  /* ==========================
     DELETE
  ========================== */

  const deleteReport =

    async (id) => {

      const ok =

        window.confirm(

          "Delete report?"

        );

      if (!ok) return;

      await supabase

        .from(

          "ultrasound_results"

        )

        .delete()

        .eq(

          "id",

          id

        );

      loadRecords();

    };

  return (

    <div className="ultrasound-records">

      {/* =====================
          HEADER
      ===================== */}

      <div className="records-header">

        <h1>

          Ultrasound Records

        </h1>

        <p>

          Enterprise Radiology Records

        </p>

      </div>

      {/* =====================
          FILTERS
      ===================== */}

      <div className="records-filters">

        <input

          placeholder="Search Patient or Lab Number"

          value={search}

          onChange={(e)=>

            setSearch(

              e.target.value

            )

          }

        />

        <select

          value={status}

          onChange={(e)=>

            setStatus(

              e.target.value

            )

          }

        >

          <option>

            All

          </option>

          <option>

            Pending

          </option>

          <option>

            Released

          </option>

        </select>

        <select

          value={scanType}

          onChange={(e)=>

            setScanType(

              e.target.value

            )

          }

        >

          <option value="All">

            All Scans

          </option>

          <option value="obs_scan">

            OBS Scan

          </option>

          <option value="pelvic_scan">

            Pelvic Scan

          </option>

          <option value="abdominal_scan">

            Abdominal Scan

          </option>

          <option value="abdomino_pelvic_scan">

            Abdomino Pelvic

          </option>

          <option value="breast_scan">

            Breast Scan

          </option>

          <option value="scrotal_scan">

            Scrotal Scan

          </option>

          <option value="kidney_scan">

            Kidney Scan

          </option>

          <option value="liver_scan">

            Liver Scan

          </option>

          <option value="thyroid_scan">

            Thyroid Scan

          </option>

          <option value="prostate_scan">

            Prostate Scan

          </option>

          <option value="soft_tissue_scan">

            Soft Tissue Scan

          </option>

        </select>

      </div>

      {/* =====================
          TABLE
      ===================== */}

      <div className="records-table-wrapper">

        <table className="records-table">

          <thead>

            <tr>

              <th>

                Lab No

              </th>

              <th>

                Patient

              </th>

              <th>

                Scan Type

              </th>

              <th>

                Status

              </th>

              <th>

                Date

              </th>

              <th>

                Actions

              </th>

            </tr>

          </thead>

          <tbody>

            {

              filtered.map(

                item => (

                  <tr

                    key={

                      item.id

                    }

                  >

                    <td>

                      {

                        item.lab_number

                      }

                    </td>

                    <td>

                      {

                        item.patient_name

                      }

                    </td>

                    <td>

                      {

                        item.test_type

                      }

                    </td>

                    <td>

                      <span

                        className={`status-badge ${

                          item.release_status

                        }`}

                      >

                        {

                          item.release_status

                        }

                      </span>

                    </td>

                    <td>

                      {

                        new Date(

                          item.created_at

                        ).toLocaleDateString()

                      }

                    </td>

                    <td>

  <UltrasoundActionMenu

    onView={() =>

      navigate(

        `/ultrasound-results?id=${item.id}`

      )

    }

    onEdit={() =>

      navigate(

        `/ultrasound-results?id=${item.id}`

      )

    }

    onPrint={() =>

      console.log(

        "Print",

        item.id

      )

    }

    onDownload={() =>

      console.log(

        "Download",

        item.id

      )

    }

    onRelease={() =>

      releaseReport(

        item.id

      )

    }

    onDelete={() =>

      deleteReport(

        item.id

      )

    }

    canDelete={true}

  />

</td>

                  </tr>

                )

              )

            }

          </tbody>

        </table>

      </div>

    </div>

  );

}