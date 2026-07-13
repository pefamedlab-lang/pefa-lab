import {

  Eye,
  Pencil,
  CheckCircle,

} from "lucide-react";

import {

  useNavigate,

} from "react-router-dom";

export default function RecentUltrasoundTable({

  records = [],

  onRelease,

}) {

  const navigate =

    useNavigate();

  const recentRecords =

    [...records]

      .sort(

        (a, b) =>

          new Date(

            b.created_at

          ) -

          new Date(

            a.created_at

          )

      )

      .slice(0, 10);

  return (

    <div className="recent-ultrasound-card">

      {/* ==========================
          HEADER
      ========================== */}

      <div className="recent-header">

        <div>

          <h2>

            Recent Ultrasound Reports

          </h2>

          <p>

            Last 10 ultrasound requests

          </p>

        </div>

      </div>

      {/* ==========================
          TABLE
      ========================== */}

      <div className="recent-table-wrapper">

        <table className="recent-table">

          <thead>

            <tr>

              <th>

                Patient

              </th>

              <th>

                Scan Type

              </th>

              <th>

                Radiologist

              </th>

              <th>

                Priority

              </th>

              <th>

                Status

              </th>

              <th>

                Actions

              </th>

            </tr>

          </thead>

          <tbody>

            {recentRecords.map(

              (item) => (

                <tr

                  key={item.id}

                >

                  <td>

                    <div className="patient-cell">

                      <strong>

                        {

                          item.patient_name

                        }

                      </strong>

                      <span>

                        {

                          item.lab_number

                        }

                      </span>

                    </div>

                  </td>

                  <td>

                    {

                      item.test_type

                    }

                  </td>

                  <td>

                    {

                      item.radiologist ||

                      "-"

                    }

                  </td>

                  <td>

                    <span

                      className={`priority-badge ${

                        item.priority

                      }`}

                    >

                      {

                        item.priority ||

                        "Routine"

                      }

                    </span>

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

                    <div className="recent-actions">

                      <button

                        onClick={() =>

                          navigate(

                            `/ultrasound-results?id=${item.id}`

                          )

                        }

                      >

                        <Eye size={16} />

                      </button>

                      <button

                        onClick={() =>

                          navigate(

                            `/ultrasound-results?id=${item.id}`

                          )

                        }

                      >

                        <Pencil size={16} />

                      </button>

                      {item.release_status !==

                        "Released" && (

                        <button

                          onClick={() =>

                            onRelease?.(

                              item.id

                            )

                          }

                        >

                          <CheckCircle

                            size={16}

                          />

                        </button>

                      )}

                    </div>

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