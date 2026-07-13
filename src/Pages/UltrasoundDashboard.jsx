import {

  FilePlus,

  ClipboardList,

  FileText,

  Printer,

  ScanLine,

} from "lucide-react";

import {

  useNavigate,

} from "react-router-dom";

import "../styles/ultrasoundDashboard.css";

import UltrasoundStatsCards
from "../components/ultrasound/UltrasoundStatsCards";
import UltrasoundCalendar
from "../components/ultrasound/UltrasoundCalendar";
import RecentUltrasoundTable
from "../components/ultrasound/RecentUltrasoundTable";


export default function UltrasoundDashboard() {

  const navigate =

    useNavigate();

  const cards = [

    {

      title:

        "Patient Registration",

      icon:

        <FilePlus size={32} />,

      path:

        "/ultrasound-registration",

      color:

        "blue",

    },

    {

      title:

        "Scan Results",

      icon:

        <ScanLine size={32} />,

      path:

        "/ultrasound-results",

      color:

        "green",

    },

    {

      title:

        "Scan Records",

      icon:

        <ClipboardList size={32} />,

      path:

        "/ultrasound-records",

      color:

        "orange",

    },

<UltrasoundStatsCards

  records={records}

/>

<UltrasoundCalendar

  records={records}

/>

<RecentUltrasoundTable

  records={records}

  onRelease={releaseReport}

/>

<UltrasoundQuickActions

  pendingCount={

    records.filter(

      r =>

        r.release_status ===

        "Pending"

    ).length

  }

  releasedCount={

    records.filter(

      r =>

        r.release_status ===

        "Released"

    ).length

  }

  onPrintSchedule={() =>

    window.print()

  }

  onExport={() =>

    console.log(

      "Export Ultrasound Records"

    )

  }

/>

    {

      title:

        "Patient Portal",

      icon:

        <FileText size={32} />,

      path:

        "/ultrasound-patient-portal",

      color:

        "purple",

    },

    {

      title:

        "Print Center",

      icon:

        <Printer size={32} />,

      path:

        "/ultrasound-printing",

      color:

        "red",

    },

  ];

  return (

    <div className="dashboard-layout">

      <div className="dashboard-content">

        <div className="ultrasound-header">

          <h1>

            Ultrasound Dashboard

          </h1>

          <p>

            Enterprise Radiology &

            Ultrasound Information System

          </p>

        </div>

        <div className="ultrasound-grid">

          {

            cards.map(

              (card) => (

                <div

                  key={card.title}

                  className={`ultrasound-card ${card.color}`}

                  onClick={() =>

                    navigate(

                      card.path

                    )

                  }

                >

                  <div className="card-icon">

                    {card.icon}

                  </div>

                  <h3>

                    {card.title}

                  </h3>

                </div>

              )

            )

          }

        </div>

      </div>

    </div>

  );

}