import {

  FileText,
  Clock3,
  CheckCircle2,
  CalendarDays,
  AlertTriangle,

} from "lucide-react";

export default function UltrasoundStatsCards({

  records = [],

}) {

  const today =

    new Date()

      .toDateString();

  const totalScans =

    records.length;

  const pendingScans =

    records.filter(

      item =>

        item.release_status ===

        "Pending"

    ).length;

  const releasedScans =

    records.filter(

      item =>

        item.release_status ===

        "Released"

    ).length;

  const todayScans =

    records.filter(

      item =>

        new Date(

          item.created_at

        ).toDateString() ===

        today

    ).length;

  const urgentCases =

    records.filter(

      item =>

        item.priority ===

        "Urgent"

    ).length;

  const cards = [

    {

      title:

        "Total Scans",

      value:

        totalScans,

      icon:

        FileText,

      className:

        "card-blue",

    },

    {

      title:

        "Pending Reports",

      value:

        pendingScans,

      icon:

        Clock3,

      className:

        "card-orange",

    },

    {

      title:

        "Released Reports",

      value:

        releasedScans,

      icon:

        CheckCircle2,

      className:

        "card-green",

    },

    {

      title:

        "Today's Scans",

      value:

        todayScans,

      icon:

        CalendarDays,

      className:

        "card-purple",

    },

    {

      title:

        "Urgent Cases",

      value:

        urgentCases,

      icon:

        AlertTriangle,

      className:

        "card-red",

    },

  ];

  return (

    <div className="ultrasound-kpi-grid">

      {cards.map(

        (

          card,

          index

        ) => {

          const Icon =

            card.icon;

          return (

            <div

              key={index}

              className={`ultrasound-kpi-card ${card.className}`}

            >

              <div className="kpi-icon">

                <Icon size={28} />

              </div>

              <div className="kpi-content">

                <h2>

                  {card.value}

                </h2>

                <p>

                  {card.title}

                </p>

              </div>

            </div>

          );

        }

      )}

    </div>

  );

}