import {

  FilePlus,
  Clock3,
  CheckCircle2,
  Printer,
  Download,
  BarChart3,

} from "lucide-react";

import {

  useNavigate,

} from "react-router-dom";

export default function UltrasoundQuickActions({

  pendingCount = 0,

  releasedCount = 0,

  onPrintSchedule,

  onExport,

}) {

  const navigate =

    useNavigate();

  const actions = [

    {

      title:

        "New Request",

      subtitle:

        "Create ultrasound request",

      icon:

        FilePlus,

      className:

        "quick-blue",

      onClick: () =>

        navigate(

          "/ultrasound-registration"

        ),

    },

    {

      title:

        "Pending Reports",

      subtitle:

        `${pendingCount} pending reports`,

      icon:

        Clock3,

      className:

        "quick-orange",

      onClick: () =>

        navigate(

          "/ultrasound-records"

        ),

    },

    {

      title:

        "Released Reports",

      subtitle:

        `${releasedCount} completed reports`,

      icon:

        CheckCircle2,

      className:

        "quick-green",

      onClick: () =>

        navigate(

          "/ultrasound-records"

        ),

    },

    {

      title:

        "Daily Schedule",

      subtitle:

        "Print today's schedule",

      icon:

        Printer,

      className:

        "quick-purple",

      onClick:

        onPrintSchedule,

    },

    {

      title:

        "Export Records",

      subtitle:

        "Download ultrasound data",

      icon:

        Download,

      className:

        "quick-cyan",

      onClick:

        onExport,

    },

    {

      title:

        "Analytics",

      subtitle:

        "Ultrasound statistics",

      icon:

        BarChart3,

      className:

        "quick-red",

      onClick: () =>

        navigate(

          "/ultrasound-analytics"

        ),

    },

  ];

  return (

    <div className="ultrasound-quick-actions">

      {actions.map(

        (

          action,

          index

        ) => {

          const Icon =

            action.icon;

          return (

            <button

              key={index}

              className={`quick-action-card ${action.className}`}

              onClick={action.onClick}

            >

              <div className="quick-action-icon">

                <Icon size={28} />

              </div>

              <div className="quick-action-content">

                <h3>

                  {action.title}

                </h3>

                <p>

                  {action.subtitle}

                </p>

              </div>

            </button>

          );

        }

      )}

    </div>

  );

}