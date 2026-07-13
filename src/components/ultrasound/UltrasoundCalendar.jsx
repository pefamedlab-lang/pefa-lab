import {

  CalendarDays,
  Clock3,
  AlertTriangle,
  CheckCircle2,

} from "lucide-react";

export default function UltrasoundCalendar({

  records = [],

}) {

  const today =

    new Date()

      .toDateString();

  const todayScans =

    records.filter(

      item =>

        new Date(

          item.created_at

        ).toDateString() ===

        today

    );

  return (

    <div className="ultrasound-calendar-card">

      {/* ==========================
          HEADER
      ========================== */}

      <div className="calendar-header">

        <div>

          <h2>

            Today's Schedule

          </h2>

          <p>

            Radiology appointments and reporting queue

          </p>

        </div>

        <CalendarDays size={32} />

      </div>

      {/* ==========================
          EMPTY
      ========================== */}

      {todayScans.length === 0 && (

        <div className="calendar-empty">

          No ultrasound appointments for today.

        </div>

      )}

      {/* ==========================
          SCHEDULE
      ========================== */}

      {todayScans.map(

        (item, index) => (

          <div

            key={index}

            className="calendar-item"

          >

            <div className="calendar-time">

              <Clock3 size={16} />

              {new Date(

                item.created_at

              ).toLocaleTimeString(

                [],

                {

                  hour:

                    "2-digit",

                  minute:

                    "2-digit",

                }

              )}

            </div>

            <div className="calendar-body">

              <h4>

                {item.patient_name}

              </h4>

              <p>

                {item.test_type}

              </p>

              <span>

                Lab No:

                {item.lab_number}

              </span>

            </div>

            <div className="calendar-status">

              {item.priority ===

              "Urgent" ? (

                <div className="urgent-tag">

                  <AlertTriangle

                    size={14}

                  />

                  Urgent

                </div>

              ) : item.release_status ===

                "Released" ? (

                <div className="completed-tag">

                  <CheckCircle2

                    size={14}

                  />

                  Completed

                </div>

              ) : (

                <div className="pending-tag">

                  <Clock3

                    size={14}

                  />

                  Pending

                </div>

              )}

            </div>

          </div>

        )

      )}

    </div>

  );

}